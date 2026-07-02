import { useMemo } from 'react';

const applySipInflationAdjustments = (sipData, sipInputs) => {
  if (!sipData) return sipData;

  const inflationDecimal = sipInputs.inflationRate / 100;

  if (sipData.summary) {
    const discountFactor = Math.pow(1 + inflationDecimal, sipInputs.years);
    sipData.summary.normalSip.inflationAdjustedValue =
      sipData.summary.normalSip.totalValue / discountFactor;
    sipData.summary.stepUpSip.inflationAdjustedValue =
      sipData.summary.stepUpSip.totalValue / discountFactor;
  }

  if (sipData.breakdown) {
    sipData.breakdown.forEach((item) => {
      const discountFactor = Math.pow(1 + inflationDecimal, item.year);
      if (item.normal) {
        item.normal.adjustedTotalValue = item.normal.totalValue / discountFactor;
      }
      if (item.stepUp) {
        item.stepUp.adjustedTotalValue = item.stepUp.totalValue / discountFactor;
      }
    });
  }

  return sipData;
};

const buildLoanChartData = (results, principal) => {
  const withMap = new Map(
    results.breakdownWithPrepayment.map((item) => [item.year, item.remainingBalance]),
  );
  const withoutMap = new Map(
    results.breakdownWithoutPrepayment.map((item) => [item.year, item.remainingBalance]),
  );

  const data = results.breakdownWithoutPrepayment.map((_, index) => {
    const year = index + 1;
    return {
      name: `Yr ${year}`,
      'With Prepayment': withMap.get(year) ?? 0,
      'Without Prepayment': withoutMap.get(year) ?? 0,
    };
  });

  data.unshift({
    name: 'Start',
    'With Prepayment': principal,
    'Without Prepayment': principal,
  });

  return data;
};

const buildSwpChartData = (results, initialCorpus) => {
  const withStepUp = new Map(
    results.breakdownWithStepUp.map((item) => [item.name, item.TotalValue]),
  );
  const withoutStepUp = new Map(
    results.breakdownWithoutStepUp.map((item) => [item.name, item.TotalValue]),
  );
  const maxYears = Math.max(
    results.breakdownWithStepUp.length,
    results.breakdownWithoutStepUp.length,
  );

  const data = Array.from({ length: maxYears }, (_, index) => {
    const yearName = `Year ${index + 1}`;
    return {
      name: yearName,
      'Stepped-Up Withdrawal': withStepUp.get(yearName) ?? 0,
      'Fixed Withdrawal': withoutStepUp.get(yearName) ?? 0,
    };
  });

  data.unshift({
    name: 'Start',
    'Stepped-Up Withdrawal': initialCorpus,
    'Fixed Withdrawal': initialCorpus,
  });

  return data;
};

export const useWealthPlannerResults = ({
  activeStrategy,
  activeTab,
  calculateGoalSIP,
  calculateLoan,
  calculateLumpsum,
  calculatePortfolio,
  calculateRD,
  calculateSIP,
  calculateSWP,
  currentMenu,
  inputs,
  loanPrepaymentStrategy,
  portfolio,
  viewingId,
}) => {
  const baseResults = useMemo(() => {
    if (currentMenu === 'SIP') {
      const sipData = calculateSIP(
        inputs.sip.amount,
        inputs.sip.rate,
        inputs.sip.years,
        activeStrategy === 'percent' ? inputs.sip.stepUpPercent : 0,
        activeStrategy === 'fixed' ? inputs.sip.stepUpValue : 0,
        inputs.sip.initialLumpsum,
        inputs.sip.inflationRate,
      );

      return applySipInflationAdjustments(sipData, inputs.sip);
    }

    if (currentMenu === 'RD') {
      return calculateRD(inputs.rd.monthlyDeposit, inputs.rd.rate, inputs.rd.quarters);
    }

    if (currentMenu === 'Lumpsum') {
      return calculateLumpsum(inputs.lumpsum.amount, inputs.lumpsum.rate, inputs.lumpsum.years);
    }

    if (currentMenu === 'SWP') {
      return calculateSWP(
        inputs.swp.initialCorpus,
        inputs.swp.monthlyWithdrawal,
        inputs.swp.annualRate,
        inputs.swp.stepUpPercent,
      );
    }

    if (currentMenu === 'Goal') {
      return calculateGoalSIP(inputs.goal.targetAmount, inputs.goal.rate, inputs.goal.years);
    }

    if (currentMenu === 'Loan') {
      return calculateLoan(
        inputs.loan.principal,
        inputs.loan.rate,
        inputs.loan.months,
        loanPrepaymentStrategy === 'yearly' ? inputs.loan.yearlyExtra : 0,
        loanPrepaymentStrategy === 'monthly' ? inputs.loan.monthlyExtra : 0,
      );
    }

    if (currentMenu === 'Tracker') {
      return calculatePortfolio(portfolio);
    }

    return null;
  }, [
    activeStrategy,
    calculateGoalSIP,
    calculateLoan,
    calculateLumpsum,
    calculatePortfolio,
    calculateRD,
    calculateSIP,
    calculateSWP,
    currentMenu,
    inputs,
    loanPrepaymentStrategy,
    portfolio,
  ]);

  const results = useMemo(() => {
    if (currentMenu === 'Tracker' && baseResults) {
      if (viewingId && baseResults.fundDetails) {
        return baseResults.fundDetails.find((item) => item.id === viewingId) || baseResults;
      }
      return baseResults;
    }

    return baseResults;
  }, [baseResults, currentMenu, viewingId]);

  const chartData = useMemo(() => {
    if (!results) return [];

    if (currentMenu === 'SIP') {
      return results.breakdown.map((item) => ({
        name: `Yr ${item.year}`,
        Invested: Number(
          activeTab === 'primary' ? item.stepUp.investedAmount : item.normal.investedAmount,
        ),
        TotalValue: Number(
          activeTab === 'primary' ? item.stepUp.totalValue : item.normal.totalValue,
        ),
        'Adjusted Value': Number(
          activeTab === 'primary'
            ? item.stepUp.adjustedTotalValue
            : item.normal.adjustedTotalValue,
        ),
      }));
    }

    if (currentMenu === 'RD') {
      return results.breakdown || [];
    }

    if (currentMenu === 'Loan' && results.breakdownWithPrepayment) {
      return buildLoanChartData(results, inputs.loan.principal);
    }

    if (currentMenu === 'SWP' && results.breakdownWithStepUp) {
      return buildSwpChartData(results, inputs.swp.initialCorpus);
    }

    if ((currentMenu === 'Goal' || currentMenu === 'Tracker') && results.breakdown) {
      return results.breakdown;
    }

    return [];
  }, [activeTab, currentMenu, inputs.loan.principal, inputs.swp.initialCorpus, results]);

  return { baseResults, results, chartData };
};
