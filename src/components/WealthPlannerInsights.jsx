import React from 'react';
import WealthChart from './WealthChart';
import styles from './WealthPlanner.module.css';
import WealthPlannerBreakdownTable from './WealthPlannerBreakdownTable';

const getChartTitle = ({ currentMenu, activeTab }) => {
  if (currentMenu === 'SWP') return 'Corpus Depletion Over Time';
  if (currentMenu === 'Loan') return 'Loan Balance Over Time';
  if (currentMenu === 'Goal') return 'Wealth Projection';
  if (currentMenu === 'Tracker') return 'Portfolio Growth (Actual)';
  if (currentMenu === 'SIP') {
    return `${activeTab === 'primary' ? 'Step-Up' : 'Normal'} Wealth Projection`;
  }
  return 'RD Wealth Projection';
};

const getTableTitle = ({ currentMenu, activeTab }) => {
  if (currentMenu === 'SWP') return 'Corpus Depletion Schedule';
  if (currentMenu === 'Loan') return 'Loan Repayment Schedule';
  if (currentMenu === 'Goal') return 'Investment Schedule';
  if (currentMenu === 'Tracker') return 'Transaction History';
  return `${currentMenu} ${
    currentMenu === 'SIP' && (activeTab === 'primary' ? 'Step-Up' : 'Normal')
  } Breakdown Schedule`;
};

const WealthPlannerInsights = ({
  activeTab,
  chartData,
  currentMenu,
  inputs,
  portfolio,
  results,
  viewingId,
}) => {
  const showInsights =
    currentMenu === 'SIP' ||
    currentMenu === 'RD' ||
    currentMenu === 'SWP' ||
    currentMenu === 'Goal' ||
    (currentMenu === 'Tracker' && portfolio.length > 0) ||
    (currentMenu === 'Loan' &&
      (inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0));

  if (!showInsights || !results) {
    return null;
  }

  const tableTitle = getTableTitle({ currentMenu, activeTab });

  const renderChart = () => {
    if (currentMenu === 'Loan') {
      return (
        <WealthChart
          data={chartData}
          primaryDataKey="With Prepayment"
          primaryName="With Prepayment"
          primaryColor="#10B981"
          secondaryDataKey="Without Prepayment"
          secondaryName="Without Prepayment"
          secondaryColor="#EF4444"
          hideInvestedLine
        />
      );
    }

    if (currentMenu === 'SWP') {
      return (
        <WealthChart
          data={chartData}
          primaryDataKey={
            inputs.swp.stepUpPercent > 0 ? 'Stepped-Up Withdrawal' : 'Fixed Withdrawal'
          }
          primaryName={
            inputs.swp.stepUpPercent > 0 ? 'Stepped-Up Withdrawal' : 'Remaining Corpus'
          }
          primaryColor="#EF4444"
          secondaryDataKey={inputs.swp.stepUpPercent > 0 ? 'Fixed Withdrawal' : undefined}
          secondaryName="Fixed Withdrawal"
          secondaryColor="#64748B"
          hideInvestedLine
        />
      );
    }

    if (currentMenu === 'Goal') {
      return (
        <WealthChart
          data={chartData}
          primaryDataKey="TotalValue"
          primaryName="Projected Value"
          primaryColor="#10B981"
          secondaryDataKey="Invested"
          secondaryName="Invested Amount"
          secondaryColor="#64748B"
        />
      );
    }

    if (currentMenu === 'Tracker') {
      return (
        <WealthChart
          data={chartData}
          primaryDataKey="TotalValue"
          primaryName="Current Value"
          primaryColor="#10B981"
          secondaryDataKey="Invested"
          secondaryName="Invested Amount"
          secondaryColor="#64748B"
        />
      );
    }

    return (
      <WealthChart
        data={chartData}
        primaryColor={
          currentMenu === 'RD' ? '#10B981' : activeTab === 'primary' ? '#10B981' : '#3B82F6'
        }
        secondaryDataKey={undefined}
        secondaryName="Today's Value"
        secondaryColor="#F59E0B"
      />
    );
  };

  return (
    <>
      <div className={`${styles.innerCard} ${styles.chartContainer}`}>
        <p className={styles.cardHeading}>{getChartTitle({ currentMenu, activeTab })}</p>
        {renderChart()}
      </div>

      <WealthPlannerBreakdownTable
        activeTab={activeTab}
        chartData={chartData}
        currentMenu={currentMenu}
        inputs={inputs}
        portfolio={portfolio}
        results={results}
        tableTitle={tableTitle}
        viewingId={viewingId}
      />
    </>
  );
};

export default WealthPlannerInsights;
