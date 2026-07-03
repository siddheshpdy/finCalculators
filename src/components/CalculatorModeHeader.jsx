import React from 'react';
import styles from './WealthPlanner.module.css';

const getHeaderContent = ({
  currentMenu,
  portfolio,
  investmentMode,
  isAddingFund,
}) => {
  switch (currentMenu) {
    case 'SIP':
      return {
        title: 'SIP Calculator',
        subtitle:
          'Model monthly investments, compare normal and step-up growth, and see how regular contributions compound over time.',
        chips: [],
      };
    case 'Lumpsum':
      return {
        title: 'Lumpsum Planner',
        subtitle:
          'Estimate what a one-time investment could grow into and compare your invested amount with the projected corpus.',
        chips: [],
      };
    case 'RD':
      return {
        title: 'Recurring Deposit Calculator',
        subtitle:
          'Project maturity value for disciplined deposits and review how interest builds the balance quarter by quarter.',
        chips: [],
      };
    case 'Loan':
      return {
        title: 'Loan Planner',
        subtitle:
          'Understand your EMI, total interest, and how prepayments change the time and cost of your loan.',
        chips: [],
      };
    case 'SWP':
      return {
        title: 'SWP Planner',
        subtitle:
          'Test how long withdrawals may last and compare fixed withdrawals against stepped-up withdrawal strategies.',
        chips: [],
      };
    case 'Goal':
      return {
        title: 'Goal Planner',
        subtitle:
          'Work backward from a target amount to estimate the monthly SIP needed to reach your goal on time.',
        chips: [],
      };
    case 'Tracker':
      return {
        title: 'Portfolio Tracker',
        subtitle:
          portfolio.length > 0
            ? 'Review invested amount, current value, and XIRR across your holdings using historical NAV data.'
            : 'Add funds or import a CSV to build a live view of your portfolio from historical NAV data.',
        chips: [
          ['Tracked Funds', `${portfolio.length}`],
          ['Mode', isAddingFund ? `${investmentMode} setup` : 'Portfolio review'],
          ['Data Source', 'Historical NAV'],
        ],
      };
    default:
      return {
        title: 'Financial Planner',
        subtitle: 'Plan your next money decision with a clearer setup and results workflow.',
        chips: [],
      };
  }
};

const CalculatorModeHeader = ({
  currentMenu,
  portfolio,
  investmentMode,
  isAddingFund,
}) => {
  const { title, subtitle, chips } = getHeaderContent({
    currentMenu,
    portfolio,
    investmentMode,
    isAddingFund,
  });
  const hasChips = chips.length > 0;

  return (
    <header className={`${styles.contentHeader} ${!hasChips ? styles.contentHeaderSimple : ''}`}>
      <div className={styles.contentHeaderBody}>
        <p className={styles.contentEyebrow}>Plan smarter</p>
        <h1 className={styles.contentTitle}>{title}</h1>
        <p className={styles.contentSubtitle}>{subtitle}</p>
      </div>
      {hasChips && (
        <div className={styles.contentChipRow}>
          {chips.map(([label, value]) => (
            <div key={label} className={styles.contentChip}>
              <span className={styles.contentChipLabel}>{label}</span>
              <strong className={styles.contentChipValue}>{value}</strong>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default CalculatorModeHeader;
