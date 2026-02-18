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
  return { calculateSIP, calculateRD, calculateLoan, calculateLumpsum, calculateSWP };
};