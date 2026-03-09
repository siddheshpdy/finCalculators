import Decimal from 'decimal.js';

export const useFinance = () => {
  // Add/Update these inside useFinance.js
  const calculateSIP = (monthlyInvestment, annualRate, years, stepUpPercent = 0, stepUpValue = 0, initialLumpsum = 0, inflationRate = 0) => {
    const r = new Decimal(annualRate || 0).div(100).div(12);
    const totalMonths = (years || 0) * 12;
    const i = new Decimal(inflationRate || 0).div(100); // inflation rate per year

    // Start the balance with the initial lumpsum
    let balanceStepUp = new Decimal(initialLumpsum || 0);
    let balanceNormal = new Decimal(initialLumpsum || 0);

    let investedStepUp = new Decimal(initialLumpsum || 0);
    let investedNormal = new Decimal(initialLumpsum || 0);
    let currentStepUpP = new Decimal(monthlyInvestment || 0);

    const yearlyBreakdown = [];

    for (let month = 1; month <= totalMonths; month++) {
      // Annual Step-up logic
      if (month > 1 && (month - 1) % 12 === 0) {
        if (stepUpPercent > 0) {
          currentStepUpP = currentStepUpP.times(new Decimal(1).plus(new Decimal(stepUpPercent).div(100)));
        } else if (stepUpValue > 0) {
          currentStepUpP = currentStepUpP.plus(stepUpValue);
        }
      }

      // Accumulate
      investedStepUp = investedStepUp.plus(currentStepUpP);
      balanceStepUp = balanceStepUp.plus(currentStepUpP).times(r.plus(1));

      investedNormal = investedNormal.plus(monthlyInvestment);
      balanceNormal = balanceNormal.plus(monthlyInvestment).times(r.plus(1));

      if (month % 12 === 0) {
        const currentYear = month / 12;
        const inflationDivisor = new Decimal(1).plus(i).pow(currentYear);

        const adjustedStepUpValue = balanceStepUp.div(inflationDivisor);
        const adjustedNormalValue = balanceNormal.div(inflationDivisor);

        yearlyBreakdown.push({
          year: currentYear,
          stepUp: {
            monthlyInstallment: currentStepUpP.toFixed(2),
            investedAmount: investedStepUp.toFixed(2),
            totalValue: balanceStepUp.toFixed(2),
            adjustedTotalValue: adjustedStepUpValue.toFixed(2)
          },
          normal: {
            investedAmount: investedNormal.toFixed(2),
            totalValue: balanceNormal.toFixed(2),
            adjustedTotalValue: adjustedNormalValue.toFixed(2)
          }
        });
      }
    }

    const finalInflationDivisor = new Decimal(1).plus(i).pow(years);
    const finalAdjustedStepUp = balanceStepUp.div(finalInflationDivisor);
    const finalAdjustedNormal = balanceNormal.div(finalInflationDivisor);

    return {
      summary: {
        stepUpSip: {
          totalValue: balanceStepUp.toFixed(2),
          inflationAdjustedValue: finalAdjustedStepUp.toFixed(2)
        },
        normalSip: {
          totalValue: balanceNormal.toFixed(2),
          inflationAdjustedValue: finalAdjustedNormal.toFixed(2)
        }
      },
      breakdown: yearlyBreakdown
    };
  };

  const calculateLumpsum = (amount, rate, years) => {
    const P = new Decimal(amount || 0);
    const r = new Decimal(rate || 0).div(100);
    const n = new Decimal(years || 0);

    // Formula: A = P * (1 + r)^n
    const maturityValue = P.times(new Decimal(1).plus(r).pow(n));

    const breakdown = [];
    for (let i = 1; i <= years; i++) {
      const val = P.times(new Decimal(1).plus(r).pow(i));
      breakdown.push({
        name: `Year ${i}`,
        Invested: P.toNumber(),
        TotalValue: val.toNumber()
      });
    }

    return {
      maturityValue: maturityValue.toFixed(2),
      totalInvested: P.toFixed(2),
      interestEarned: maturityValue.minus(P).toFixed(2),
      breakdown
    };
  };

  // Loan EMI: [P x r x (1+r)^n] / [(1+r)^n - 1]
  const calculateLoan = (principal, annualRate, months, yearlyExtra = 0, monthlyExtra = 0) => {
    const P_init = new Decimal(principal || 0);
    const r = new Decimal(annualRate).div(100).div(12);
    const totalMonths_orig = new Decimal(months).toNumber();
    const extraYearly = new Decimal(yearlyExtra || 0);
    const extraMonthly = new Decimal(monthlyExtra || 0);

    // Standard EMI is calculated once and is constant
    const onePlusRToN = r.plus(1).pow(totalMonths_orig);
    const emi = P_init.times(r).times(onePlusRToN).div(onePlusRToN.minus(1));

    // --- Amortization Calculator ---
    const amortize = (P, rate, totalMonths, monthlyEMI, yearlyExtraPayment, monthlyExtraPayment) => {
      let remainingPrincipal = new Decimal(P);
      let totalInterestPaid = new Decimal(0);
      let actualMonths = 0;
      const breakdown = [];

      for (let m = 1; m <= totalMonths; m++) {
        if (remainingPrincipal.lte(0)) break;

        const interestForMonth = remainingPrincipal.times(rate);
        let principalPaid = monthlyEMI.minus(interestForMonth);

        // Add extra monthly payment
        principalPaid = principalPaid.plus(monthlyExtraPayment);

        // Add extra yearly installment every 12 months
        if (yearlyExtraPayment.gt(0) && m > 0 && m % 12 === 0) {
          principalPaid = principalPaid.plus(yearlyExtraPayment);
        }

        // Ensure we don't overpay
        if (principalPaid.gt(remainingPrincipal)) {
          principalPaid = remainingPrincipal;
        }

        remainingPrincipal = remainingPrincipal.minus(principalPaid);
        totalInterestPaid = totalInterestPaid.plus(interestForMonth);
        actualMonths = m;

        // Capture yearly snapshot
        if (m % 12 === 0 || remainingPrincipal.lte(0)) {
          breakdown.push({
            year: Math.ceil(m / 12),
            remainingBalance: remainingPrincipal.toNumber()
          });
        }
      }
      const totalPaid = P.plus(totalInterestPaid);
      return { breakdown, totalInterestPaid, totalPaid, actualMonths };
    };

    // --- Calculate for both scenarios ---
    const resWithoutPrepayment = amortize(P_init, r, totalMonths_orig, emi, new Decimal(0), new Decimal(0));
    const resWithPrepayment = (yearlyExtra > 0 || monthlyExtra > 0)
        ? amortize(P_init, r, totalMonths_orig, emi, extraYearly, extraMonthly)
        : resWithoutPrepayment;
    const interestSaved = resWithoutPrepayment.totalInterestPaid.minus(resWithPrepayment.totalInterestPaid);

    return {
      monthlyPayment: emi.toFixed(2),
      totalInterest: resWithPrepayment.totalInterestPaid.toFixed(2),
      totalAmountPaid: resWithPrepayment.totalPaid.toFixed(2),
      monthsSaved: totalMonths_orig - resWithPrepayment.actualMonths,
      interestSaved: interestSaved.gt(0) ? interestSaved.toFixed(2) : "0.00",
      breakdownWithPrepayment: resWithPrepayment.breakdown,
      breakdownWithoutPrepayment: resWithoutPrepayment.breakdown,
    };
  };

  const calculateSWP = (initialCorpus, monthlyWithdrawal, annualRate, stepUpPercent = 0) => {
    const swpAmortize = (corpus, initialWithdrawal, rate, stepUp) => {
      let remainingCorpus = new Decimal(corpus);
      let withdrawal = new Decimal(initialWithdrawal);
      let totalWithdrawn = new Decimal(0);
      let months = 0;
      const breakdown = [];
      const maxMonths = 600; // 50-year cap

      if (remainingCorpus.lte(0) || withdrawal.lte(0)) {
        return { monthsLasted: 0, totalWithdrawn: new Decimal(0), finalBalance: remainingCorpus, breakdown: [] };
      }

      for (let m = 1; m <= maxMonths; m++) {
          if (remainingCorpus.lte(0)) break;

          if (m > 1 && (m - 1) % 12 === 0 && stepUp.gt(0)) {
            withdrawal = withdrawal.times(new Decimal(1).plus(stepUp));
          }

          const interestEarned = remainingCorpus.times(rate);
          remainingCorpus = remainingCorpus.plus(interestEarned);

          let actualWithdrawal = withdrawal;
          if (remainingCorpus.lt(withdrawal)) {
              actualWithdrawal = remainingCorpus;
          }
          
          remainingCorpus = remainingCorpus.minus(actualWithdrawal);
          totalWithdrawn = totalWithdrawn.plus(actualWithdrawal);
          months = m;

          if (m % 12 === 0) {
              breakdown.push({
                  name: `Year ${m / 12}`,
                  TotalValue: remainingCorpus.toNumber(),
              });
          }
          
          if (remainingCorpus.lte(0)) {
              if (m % 12 !== 0) {
                   breakdown.push({ name: `Year ${Math.ceil(m / 12)}`, TotalValue: 0 });
              }
              break;
          }
      }
      return { monthsLasted: months, totalWithdrawn, finalBalance: remainingCorpus, breakdown };
    };

    const r = new Decimal(annualRate || 0).div(100).div(12);
    const stepUp = new Decimal(stepUpPercent || 0).div(100);

    const resWithStepUp = swpAmortize(initialCorpus, monthlyWithdrawal, r, stepUp);
    const resWithoutStepUp = swpAmortize(initialCorpus, monthlyWithdrawal, r, new Decimal(0));

    return {
        // Primary results are from the user-selected scenario (with step-up if provided)
        monthsLasted: resWithStepUp.monthsLasted,
        totalWithdrawn: resWithStepUp.totalWithdrawn.toFixed(2),
        finalBalance: resWithStepUp.finalBalance.toFixed(2),
        
        // Breakdowns for chart and table
        breakdownWithStepUp: resWithStepUp.breakdown,
        breakdownWithoutStepUp: resWithoutStepUp.breakdown,

        // Store fixed results for easy access if needed
        fixedResults: {
            monthsLasted: resWithoutStepUp.monthsLasted,
            totalWithdrawn: resWithoutStepUp.totalWithdrawn.toFixed(2),
            finalBalance: resWithoutStepUp.finalBalance.toFixed(2),
        }
    };
  };

  // Recurring Deposit (RD): M = P * [(1+r)^n - 1] / [1 - (1+r)^(-1/3)]
  // Note: RD usually uses quarterly compounding in many regions
  // Inside calculateRD in useFinance.js
  const calculateRD = (monthlyDeposit, annualRate, quarters) => {
    const P = new Decimal(monthlyDeposit);
    const R = new Decimal(annualRate).div(100);
    const totalQuarters = new Decimal(quarters).toNumber();

    let maturityValue = new Decimal(0);
    let totalInvested = new Decimal(0);
    const chartBreakdown = [];

    for (let q = 1; q <= totalQuarters; q++) {
      // Calculate maturity for the deposits made in this quarter (3 months)
      // Simple approximation for visualization:
      totalInvested = P.times(q * 3);

      // This loop calculates interest for each monthly installment up to this quarter
      let currentMaturity = new Decimal(0);
      for (let i = 1; i <= q * 3; i++) {
        const monthsRemaining = new Decimal(i);
        const amount = P.times(new Decimal(1).plus(R.div(4)).pow(monthsRemaining.div(3)));
        currentMaturity = currentMaturity.plus(amount);
      }

      chartBreakdown.push({
        name: `Qtr ${q}`,
        Invested: totalInvested.toNumber(),
        TotalValue: currentMaturity.toNumber()
      });

      if (q === totalQuarters) maturityValue = currentMaturity;
    }

    return {
      totalDeposit: P.times(totalQuarters * 3).toFixed(2),
      maturityValue: maturityValue.toFixed(2),
      interestEarned: maturityValue.minus(P.times(totalQuarters * 3)).toFixed(2),
      breakdown: chartBreakdown // Added for the chart
    };
  }

  // Helper: Calculate XIRR using Newton-Raphson method
  const calculateXIRR = (transactions) => {
    if (!transactions || transactions.length < 2) return 0;

    let x0 = 0.1; // Initial guess: 10%
    const tol = 1e-5;
    const maxIter = 50;

    const t0 = transactions[0].date;
    // Pre-calculate days for performance
    const data = transactions.map(t => ({
      v: t.amount,
      d: (t.date - t0) / (1000 * 60 * 60 * 24)
    }));

    for (let i = 0; i < maxIter; i++) {
      let f = 0; // f(x)
      let df = 0; // f'(x)

      for (let j = 0; j < data.length; j++) {
        const { v, d } = data[j];
        const base = 1 + x0;
        if (base <= 0) { x0 = 0.01; break; } // Prevent invalid base
        const exp = d / 365;
        const factor = Math.pow(base, exp);

        f += v / factor;
        df -= (v * exp) / (factor * base);
      }

      if (Math.abs(f) < tol) return x0 * 100;
      if (df === 0) break;
      const newX = x0 - f / df;
      if (isNaN(newX) || Math.abs(newX - x0) < tol) return newX * 100;
      x0 = newX;
    }
    return x0 * 100;
  };

  const calculateRealSIP = (navData, inputs) => {
    if (!navData || navData.length === 0) return null;

    const { startDate, endDate, amount, lumpsum, stepUpPercent, stepUpValue } = inputs;
    const [sy, sm, sd] = startDate.split('-').map(Number);
    // Consistently parse dates as local time to avoid timezone issues
    const start = new Date(sy, sm - 1, sd);
    const sipEnd = endDate && endDate.length > 0 ? (() => {
        const [ey, em, ed] = endDate.split('-').map(Number);
        return new Date(ey, em - 1, ed);
    })() : null;
    
    // Parse and sort NAV data (API returns newest first, we need oldest first)
    const sortedNav = navData.map(d => {
        const parts = d.date.split('-'); // Expecting dd-mm-yyyy
        if (parts.length === 3) {
            return {
                date: new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])), // yyyy, mm-1, dd
                dateStr: d.date,
                nav: new Decimal(d.nav)
            };
        }
        return null;
    }).filter(item => item !== null).sort((a, b) => a.date - b.date);

    // Find the first NAV date >= startDate
    const startIndex = sortedNav.findIndex(d => d.date >= start);
    if (startIndex === -1) return null;

    let currentUnits = new Decimal(0);
    let totalInvested = new Decimal(0);
    let currentSIPAmount = new Decimal(amount || 0);
    let nextSIPDate = new Date(start); 
    const xirrTransactions = [];
    const purchaseHistory = [];
    
    // Handle Initial Lumpsum
    if (lumpsum > 0) {
        const firstNav = sortedNav[startIndex].nav;
        const ls = new Decimal(lumpsum);
        currentUnits = currentUnits.plus(ls.div(firstNav));
        totalInvested = totalInvested.plus(ls);
        xirrTransactions.push({ amount: -ls.toNumber(), date: sortedNav[startIndex].date });
        purchaseHistory.push({
          date: sortedNav[startIndex].date,
          dateStr: sortedNav[startIndex].dateStr,
          type: 'Lumpsum',
          amount: ls.toNumber(),
          nav: firstNav.toNumber(),
          units: ls.div(firstNav).toNumber()
        });
    }

    const breakdown = [];
    let sipCount = 0;

    // Iterate through available NAV days
    for (let i = startIndex; i < sortedNav.length; i++) {
        const day = sortedNav[i];
        
        // Check if a SIP is due (catch up if multiple dates passed)
        if (amount > 0 && (!sipEnd || nextSIPDate <= sipEnd)) {
            while (day.date >= nextSIPDate) {
                const units = currentSIPAmount.div(day.nav);
                currentUnits = currentUnits.plus(units);
                totalInvested = totalInvested.plus(currentSIPAmount);
                xirrTransactions.push({ amount: -currentSIPAmount.toNumber(), date: day.date });
                purchaseHistory.push({
                  date: day.date,
                  dateStr: day.dateStr,
                  type: 'SIP',
                  amount: currentSIPAmount.toNumber(),
                  nav: day.nav.toNumber(),
                  units: units.toNumber()
                });
                sipCount++;

                // Step Up Logic (Annually)
                if (sipCount > 0 && sipCount % 12 === 0) {
                    if (stepUpPercent > 0) {
                        currentSIPAmount = currentSIPAmount.times(new Decimal(1).plus(new Decimal(stepUpPercent).div(100)));
                    } else if (stepUpValue > 0) {
                        currentSIPAmount = currentSIPAmount.plus(new Decimal(stepUpValue));
                    }
                }
                // Next SIP date (+1 month)
                nextSIPDate = new Date(nextSIPDate.getFullYear(), nextSIPDate.getMonth() + 1, nextSIPDate.getDate());
            }
        }

        // Sample data points for chart (Month End or Last Day)
        const isLastDay = i === sortedNav.length - 1;
        const isMonthEnd = i < sortedNav.length - 1 && sortedNav[i+1].date.getMonth() !== day.date.getMonth();
        
        if (isLastDay || isMonthEnd) {
            breakdown.push({
                name: day.dateStr,
                date: day.date,
                Invested: totalInvested.toNumber(),
                TotalValue: currentUnits.times(day.nav).toNumber(),
                NAV: day.nav.toNumber()
            });
        }
    }

    const lastNav = sortedNav[sortedNav.length - 1].nav;
    const currentValue = currentUnits.times(lastNav);
    const absoluteReturn = totalInvested.gt(0) 
        ? currentValue.minus(totalInvested).div(totalInvested).times(100) 
        : new Decimal(0);

    // Add final value as positive cash flow for XIRR
    xirrTransactions.push({ amount: currentValue.toNumber(), date: sortedNav[sortedNav.length - 1].date });
    const xirrValue = calculateXIRR(xirrTransactions);

    return {
        currentValue: currentValue.toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        absoluteReturn: absoluteReturn.toFixed(2),
        xirr: xirrValue.toFixed(2),
        xirrTransactions,
        totalUnits: currentUnits.toFixed(4),
        currentNAV: lastNav.toFixed(4),
        lastUpdated: sortedNav[sortedNav.length - 1].dateStr,
        breakdown,
        purchaseHistory
    };
  };

  const calculatePortfolio = (portfolio) => {
    if (!portfolio || portfolio.length === 0) return null;

    const individualResults = portfolio.map(p => {
      const res = calculateRealSIP(p.navData, p.inputs);
      if (res) return { ...res, id: p.id, name: p.fund.schemeName };
      return null;
    });
    const validResults = individualResults.filter(r => r !== null);
    if (validResults.length === 0) return null;

    let totalCurrentValue = new Decimal(0);
    let totalInvested = new Decimal(0);
    let allTransactions = [];
    let allHistory = [];
    const dateMap = new Map();

    validResults.forEach(res => {
      totalCurrentValue = totalCurrentValue.plus(res.currentValue);
      totalInvested = totalInvested.plus(res.totalInvested);
      if (res.xirrTransactions) allTransactions = allTransactions.concat(res.xirrTransactions);
      if (res.purchaseHistory) {
        allHistory = allHistory.concat(res.purchaseHistory.map(h => ({...h, fundName: res.name})));
      }

      res.breakdown.forEach(point => {
        const dateKey = point.date.getTime();
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { 
            date: point.date, 
            dateStr: point.name, 
            Invested: new Decimal(0), 
            TotalValue: new Decimal(0) 
          });
        }
        const entry = dateMap.get(dateKey);
        entry.Invested = entry.Invested.plus(point.Invested);
        entry.TotalValue = entry.TotalValue.plus(point.TotalValue);
      });
    });

    const breakdown = Array.from(dateMap.values())
      .sort((a, b) => a.date - b.date)
      .map(b => ({
        name: b.dateStr,
        date: b.date,
        Invested: b.Invested.toNumber(),
        TotalValue: b.TotalValue.toNumber(),
        NAV: 0
      }));

    allHistory.sort((a, b) => a.date - b.date);

    const absoluteReturn = totalInvested.gt(0) 
      ? totalCurrentValue.minus(totalInvested).div(totalInvested).times(100) 
      : new Decimal(0);
    
    const xirr = calculateXIRR(allTransactions);

    return {
      currentValue: totalCurrentValue.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      absoluteReturn: absoluteReturn.toFixed(2),
      xirr: xirr.toFixed(2),
      breakdown,
      fundDetails: validResults,
      purchaseHistory: allHistory
    };
  };

  // --- API Services ---
  const getFundList = async (forceRefresh = false) => {
    const CACHE_KEY = 'mf_fund_list';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
          }
        }
      }

      const res = await fetch('https://api.mfapi.in/mf');
      if (!res.ok) throw new Error('Failed to fetch fund list');
      const data = await res.json();
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data })); } catch (e) { console.warn('Cache failed', e); }
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const getFundNAV = async (schemeCode) => {
    try {
      const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
      if (!res.ok) throw new Error('Failed to fetch NAV data');
      const data = await res.json();
      return data.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  // Goal Planner: Calculate required SIP for a target corpus
  const calculateGoalSIP = (targetAmount, annualRate, years) => {
    const FV = new Decimal(targetAmount || 0);
    const r = new Decimal(annualRate || 0).div(100).div(12);
    const n = new Decimal(years || 0).times(12);

    if (n.lte(0)) return null;

    let monthlyInvestment;

    if (r.eq(0)) {
      monthlyInvestment = FV.div(n);
    } else {
      // Formula: P = FV / [ ((1+r)^n - 1) / r * (1+r) ]
      const onePlusR = r.plus(1);
      const denominator = onePlusR.pow(n).minus(1).div(r).times(onePlusR);
      monthlyInvestment = FV.div(denominator);
    }

    const totalInvested = monthlyInvestment.times(n);
    
    const breakdown = [];
    let balance = new Decimal(0);
    let invested = new Decimal(0);
    const onePlusR = r.plus(1);
    const totalMonths = n.toNumber();

    for (let m = 1; m <= totalMonths; m++) {
        invested = invested.plus(monthlyInvestment);
        balance = balance.plus(monthlyInvestment).times(onePlusR);
        
        if (m % 12 === 0) {
            breakdown.push({
                name: `Year ${m / 12}`,
                Invested: invested.toNumber(),
                TotalValue: balance.toNumber()
            });
        }
    }

    return {
        requiredSIP: monthlyInvestment.toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        maturityValue: balance.toFixed(2),
        breakdown
    };
  };

  return { calculateSIP, calculateRD, calculateLoan, calculateLumpsum, calculateSWP, calculateRealSIP, calculatePortfolio, getFundList, getFundNAV, calculateGoalSIP };
};