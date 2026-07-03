import React from 'react';
import DualInput from './DualInput';
import styles from './WealthPlanner.module.css';

const StrategyPanel = ({
  activeStrategy,
  currentMenu,
  inputs,
  isAddingFund,
  loanPrepaymentStrategy,
  portfolio,
  setActiveStrategy,
  setInputs,
  setLoanPrepaymentStrategy,
  setTrackerInputs,
  trackerInputs,
}) => {
  if (currentMenu === 'Loan') {
    return (
      <>
        <p className={styles.cardHeading}>Prepayment Strategy</p>
        <div className={styles.toggleWrapper}>
          <button
            onClick={() => setLoanPrepaymentStrategy('yearly')}
            className={`${styles.toggleBtn} ${
              loanPrepaymentStrategy === 'yearly' ? styles.toggleBtnActive : ''
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setLoanPrepaymentStrategy('monthly')}
            className={`${styles.toggleBtn} ${
              loanPrepaymentStrategy === 'monthly' ? styles.toggleBtnActive : ''
            }`}
          >
            Monthly
          </button>
        </div>
        {loanPrepaymentStrategy === 'yearly' ? (
          <DualInput
            label="Fixed Extra Annual Pay"
            symbol={'\u20B9'}
            value={inputs.loan.yearlyExtra}
            min={0}
            max={100000}
            step={1000}
            onChange={(value) =>
              setInputs({
                ...inputs,
                loan: { ...inputs.loan, yearlyExtra: value },
              })
            }
          />
        ) : (
          <DualInput
            label="Extra Monthly Payment"
            symbol={'\u20B9'}
            value={inputs.loan.monthlyExtra}
            min={0}
            max={10000}
            step={500}
            onChange={(value) =>
              setInputs({
                ...inputs,
                loan: { ...inputs.loan, monthlyExtra: value },
              })
            }
          />
        )}
        <p className={styles.helperText}>
          {loanPrepaymentStrategy === 'yearly'
            ? 'This amount is paid once every year towards the principal.'
            : 'This extra amount is paid every month with your EMI.'}
        </p>
      </>
    );
  }

  if (currentMenu === 'SIP') {
    return (
      <>
        <p className={styles.cardHeading}>Step-Up Strategy</p>
        <div className={styles.toggleWrapper}>
          <button
            onClick={() => setActiveStrategy('percent')}
            className={`${styles.toggleBtn} ${
              activeStrategy === 'percent' ? styles.toggleBtnActive : ''
            }`}
          >
            %
          </button>
          <button
            onClick={() => setActiveStrategy('fixed')}
            className={`${styles.toggleBtn} ${
              activeStrategy === 'fixed' ? styles.toggleBtnActive : ''
            }`}
          >
            {'\u20B9'}
          </button>
        </div>
        {activeStrategy === 'percent' ? (
          <DualInput
            label="Yearly Step-up"
            symbol="%"
            value={inputs.sip.stepUpPercent}
            min={0}
            max={50}
            onChange={(value) =>
              setInputs({
                ...inputs,
                sip: { ...inputs.sip, stepUpPercent: value },
              })
            }
          />
        ) : (
          <DualInput
            label="Fixed Increase"
            symbol={'\u20B9'}
            value={inputs.sip.stepUpValue}
            min={0}
            max={50000}
            onChange={(value) =>
              setInputs({
                ...inputs,
                sip: { ...inputs.sip, stepUpValue: value },
              })
            }
          />
        )}
      </>
    );
  }

  if (currentMenu === 'SWP') {
    return (
      <>
        <p className={styles.cardHeading}>Step-Up Withdrawal</p>
        <DualInput
          label="Annual Step-up"
          symbol="%"
          value={inputs.swp.stepUpPercent}
          min={0}
          max={10}
          step={0.5}
          onChange={(value) =>
            setInputs({
              ...inputs,
              swp: { ...inputs.swp, stepUpPercent: value },
            })
          }
        />
        <p className={styles.helperText}>
          Increase withdrawal amount annually to counter inflation.
        </p>
      </>
    );
  }

  if (currentMenu === 'Tracker' && (isAddingFund || portfolio.length === 0)) {
    return (
      <>
        <p className={styles.cardHeading}>Step-Up Strategy</p>
        <div className={styles.toggleWrapper}>
          <button
            onClick={() => setActiveStrategy('percent')}
            className={`${styles.toggleBtn} ${
              activeStrategy === 'percent' ? styles.toggleBtnActive : ''
            }`}
          >
            %
          </button>
          <button
            onClick={() => setActiveStrategy('fixed')}
            className={`${styles.toggleBtn} ${
              activeStrategy === 'fixed' ? styles.toggleBtnActive : ''
            }`}
          >
            {'\u20B9'}
          </button>
        </div>
        {activeStrategy === 'percent' ? (
          <DualInput
            label="Yearly Step-up"
            symbol="%"
            value={trackerInputs.stepUpPercent}
            min={0}
            max={50}
            onChange={(value) =>
              setTrackerInputs({
                ...trackerInputs,
                stepUpPercent: value,
                stepUpValue: 0,
              })
            }
          />
        ) : (
          <DualInput
            label="Fixed Increase"
            symbol={'\u20B9'}
            value={trackerInputs.stepUpValue}
            min={0}
            max={50000}
            onChange={(value) =>
              setTrackerInputs({
                ...trackerInputs,
                stepUpValue: value,
                stepUpPercent: 0,
              })
            }
          />
        )}
      </>
    );
  }

  if (currentMenu !== 'Tracker') {
    return (
      <p className={styles.noStrategyText}>No additional strategy available for this mode.</p>
    );
  }

  return null;
};

export default StrategyPanel;
