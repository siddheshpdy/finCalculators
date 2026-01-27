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
  const calculateLoan = (principal, annualRate, months) => {
    const P = new Decimal(principal);
    const r = new Decimal(annualRate).div(100).div(12);
    const n = new Decimal(months);

    const onePlusRToN = r.plus(1).pow(n);
    const emi = P.times(r).times(onePlusRToN).div(onePlusRToN.minus(1));

    const totalPayable = emi.times(n);
    return {
      monthlyPayment: emi.toFixed(2),
      totalPayable: totalPayable.toFixed(2),
      totalInterest: totalPayable.minus(P).toFixed(2)
    };
  }

  
    // Recurring Deposit (RD): M = P * [(1+r)^n - 1] / [1 - (1+r)^(-1/3)]
    // Note: RD usually uses quarterly compounding in many regions
    const calculateRD = (monthlyDeposit, annualRate, quarters) => {
        const P = new Decimal(monthlyDeposit);
        const R = new Decimal(annualRate).div(100);
        const n = new Decimal(quarters); // expressed in quarters

        // Formula for RD Maturity with quarterly compounding
        let maturityValue = new Decimal(0);
        const totalMonths = n.times(3).toNumber();

        for (let i = 1; i <= totalMonths; i++) {
            const monthsRemaining = new Decimal(i);
            // M = P * (1 + R/4)^(n/3)
            const amount = P.times(new Decimal(1).plus(R.div(4)).pow(monthsRemaining.div(3)));
            maturityValue = maturityValue.plus(amount);
        }

        return {
            totalDeposit: P.times(totalMonths).toFixed(2),
            maturityValue: maturityValue.toFixed(2),
            interestEarned: maturityValue.minus(P.times(totalMonths)).toFixed(2)
        };
    }
  return { calculateSIP, calculateRD, calculateLoan };
};