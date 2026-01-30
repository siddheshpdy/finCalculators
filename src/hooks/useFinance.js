import Decimal from 'decimal.js';

export const useFinance = () => {
  const calculateSIP = (initialMonthlyInvestment, annualRate, years, stepUpPercent = 0, stepUpValue = 0) => {
    const P_initial = new Decimal(initialMonthlyInvestment || 0);
    const r = new Decimal(annualRate || 0).div(100).div(12);
    const totalMonths = (years || 0) * 12;

    let balanceStepUp = new Decimal(0);
    let balanceNormal = new Decimal(0);
    let investedStepUp = new Decimal(0);
    let investedNormal = new Decimal(0);
    let currentStepUpP = new Decimal(initialMonthlyInvestment || 0);

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

      // Step-up accumulation
      investedStepUp = investedStepUp.plus(currentStepUpP);
      balanceStepUp = balanceStepUp.plus(currentStepUpP);
      balanceStepUp = balanceStepUp.plus(balanceStepUp.times(r));

      // Normal accumulation
      investedNormal = investedNormal.plus(P_initial);
      balanceNormal = balanceNormal.plus(P_initial);
      balanceNormal = balanceNormal.plus(balanceNormal.times(r));

      // Capture yearly data
      if (month % 12 === 0) {
        yearlyBreakdown.push({
          year: month / 12,
          stepUp: {
            monthlyInstallment: currentStepUpP.toFixed(2),
            investedAmount: investedStepUp.toFixed(2),
            totalValue: balanceStepUp.toFixed(2)
          },
          normal: {
            investedAmount: investedNormal.toFixed(2),
            totalValue: balanceNormal.toFixed(2)
          }
        });
      }
    }

    return {
      summary: {
        stepUpSip: { totalValue: balanceStepUp.toFixed(2) },
        normalSip: { totalValue: balanceNormal.toFixed(2) },
        extraWealth: balanceStepUp.minus(balanceNormal).toFixed(2)
      },
      breakdown: yearlyBreakdown
    };
  };

  // Loan EMI: [P x r x (1+r)^n] / [(1+r)^n - 1]
  const calculateLoan = (principal, annualRate, months, yearlyExtra = 0) => {
    const P_init = new Decimal(principal);
    const r = new Decimal(annualRate).div(100).div(12);
    const totalMonths = new Decimal(months).toNumber();
    const extra = new Decimal(yearlyExtra || 0);

    // Calculate Standard EMI (Standard formula)
    const onePlusRToN = r.plus(1).pow(totalMonths);
    const emi = P_init.times(r).times(onePlusRToN).div(onePlusRToN.minus(1));

    let remainingPrincipal = P_init;
    let totalInterestPaid = new Decimal(0);
    let actualMonths = 0;
    const breakdown = [];

    for (let m = 1; m <= totalMonths; m++) {
      if (remainingPrincipal.lte(0)) break;

      const interestForMonth = remainingPrincipal.times(r);
      let principalPaid = emi.minus(interestForMonth);

      // Add extra installment every 12 months
      if (m > 0 && m % 12 === 0) {
        principalPaid = principalPaid.plus(extra);
      }

      // Ensure we don't overpay the last bit
      if (principalPaid.gt(remainingPrincipal)) {
        principalPaid = remainingPrincipal;
      }

      remainingPrincipal = remainingPrincipal.minus(principalPaid);
      totalInterestPaid = totalInterestPaid.plus(interestForMonth);
      actualMonths = m;

      // Capture yearly snapshot for chart/table
      if (m % 12 === 0 || remainingPrincipal.lte(0)) {
        breakdown.push({
          name: `Year ${Math.ceil(m / 12)}`,
          Invested: P_init.minus(remainingPrincipal).toNumber(), // Principal repaid
          TotalValue: remainingPrincipal.toNumber() // Remaining balance
        });
      }
    }

    const totalPaid = P_init.plus(totalInterestPaid);

    return {
      monthlyPayment: emi.toFixed(2),
      totalInterest: totalInterestPaid.toFixed(2),
      totalAmountPaid: totalPaid.toFixed(2), // NEW: Requirement 1
      monthsSaved: totalMonths - actualMonths,
      breakdown
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
  return { calculateSIP, calculateRD, calculateLoan };
};