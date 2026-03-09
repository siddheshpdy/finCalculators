import React from 'react';
import ResultCard from './ResultCard';
import styles from './WealthPlanner.module.css';

const ResultsSection = ({
  currentMenu,
  results,
  activeTab,
  setActiveTab,
  inputs,
  viewingId,
  portfolio,
}) => {
  if (!results) {
    return null;
  }

  return (
    <div className={styles.resultsColumn}>
      {currentMenu === 'SIP' && (
        <>
          <ResultCard active={activeTab === 'primary'} label="STEP-UP MATURITY" color="#10B981" value={results.summary.stepUpSip.totalValue} onClick={() => setActiveTab('primary')} />
          <ResultCard active={activeTab === 'secondary'} label="NORMAL MATURITY" color="#3B82F6" value={results.summary.normalSip.totalValue} onClick={() => setActiveTab('secondary')} />
          {/* <ResultCard
            active={false}
            label="MATURITY IN TODAY'S VALUE"
            color="#F59E0B"
            value={activeTab === 'primary' ? results.summary.stepUpSip.inflationAdjustedValue : results.summary.normalSip.inflationAdjustedValue}
          /> */}
        </>
      )}
      {/* Lumpsum Result Cards */}
      {currentMenu === 'Lumpsum' && (
        <>
          <ResultCard active label="MATURITY VALUE" color="#10B981" value={results.maturityValue} />
          <ResultCard active={false} label="TOTAL INVESTED" color="#64748B" value={results.totalInvested} />
        </>
      )}
      {currentMenu === 'RD' && (
        <>
          <ResultCard active label="MATURITY VALUE" color="#10B981" value={results.maturityValue} />
          <ResultCard active={false} label="INTEREST EARNED" color="#64748B" value={results.interestEarned} />
        </>
      )}
      {currentMenu === 'Loan' && (
        <>
          <ResultCard active label="MONTHLY EMI" color="#EF4444" value={results.monthlyPayment} />
          <ResultCard active={false} label="TOTAL INTEREST" color="#64748B" value={results.totalInterest} />
          {(inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0) && (
            <ResultCard active={false} label="INTEREST SAVED" color="#10B981" value={results.interestSaved} />
          )}
          {/* NEW: Total Amount Paid */}
          <div className={styles.totalPaidCard}>
            <p className={styles.labelSmall}>TOTAL AMOUNT PAID</p>
            <h3 className={styles.valueLarge}>
              ₹{Number(results.totalAmountPaid).toLocaleString('en-IN')}
            </h3>
            {results.monthsSaved > 0 && (
              <span className={styles.savedMonths}>
                ✓ Saved {results.monthsSaved} months
              </span>
            )}
          </div>
        </>
      )}
      {currentMenu === 'SWP' && results && (
        <>
          <ResultCard active label="Corpus Lasts For" color="#3B82F6" value={`${Math.floor(results.monthsLasted / 12)}Y ${results.monthsLasted % 12}M`} />
          <ResultCard active={false} label="Total Withdrawn" color="#10B981" value={results.totalWithdrawn} />
          <ResultCard active={false} label="Final Balance" color="#64748B" value={results.finalBalance} />
        </>
      )}
      {currentMenu === 'Goal' && results && (
        <>
          <ResultCard active label="REQUIRED MONTHLY SIP" color="#EF4444" value={results.requiredSIP} />
          <ResultCard active={false} label="TOTAL INVESTMENT" color="#64748B" value={results.totalInvested} />
          <ResultCard active={false} label="TARGET VALUE" color="#10B981" value={results.maturityValue} />
        </>
      )}
      {currentMenu === 'Tracker' && results && portfolio.length > 0 && (
        <>
          <ResultCard active label={viewingId ? "CURRENT VALUE (SELECTED)" : "TOTAL CURRENT VALUE"} color="#10B981" value={results.currentValue} />
          <ResultCard active={false} label="TOTAL INVESTED" color="#64748B" value={results.totalInvested} />
          <ResultCard active={false} label="ABS RETURNS" color={results.absoluteReturn >= 0 ? "#10B981" : "#EF4444"} value={`${results.absoluteReturn}%`} />
          <ResultCard active={false} label="XIRR" color={results.xirr >= 0 ? "#10B981" : "#EF4444"} value={`${results.xirr}%`} />
        </>
      )}
    </div>
  );
};

export default ResultsSection;