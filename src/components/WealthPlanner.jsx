import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import WealthChart from './WealthChart';
import DualInput from './DualInput';
import ResultCard from './ResultCard';
import styles from './WealthPlanner.module.css';

const Wealth = () => {
  const { calculateSIP, calculateRD, calculateLoan, calculateLumpsum } = useFinance();
  const [currentMenu, setCurrentMenu] = useState('SIP'); // 'SIP', 'RD', 'Loan'
  const [activeTab, setActiveTab] = useState('primary'); // For comparison views
  const [activeStrategy, setActiveStrategy] = useState('percent'); // For SIP Step-up
  const [loanPrepaymentStrategy, setLoanPrepaymentStrategy] = useState('yearly'); // For Loan Prepayment

  const [inputs, setInputs] = useState({
    sip: { amount: 5000, rate: 12, years: 10, stepUpPercent: 10, stepUpValue: 0, initialLumpsum: 0, inflationRate: 6 },
    lumpsum: { amount: 100000, rate: 12, years: 10 },
    rd: { monthlyDeposit: 5000, rate: 7, quarters: 20 },
    loan: { principal: 1000000, rate: 8.5, months: 120, yearlyExtra: 0, monthlyExtra: 0 }
  });

  // 1. Unified Calculation Engine
  // Inside Wealth.jsx
  const results = useMemo(() => {
    if (currentMenu === 'SIP') {
      return calculateSIP(
        inputs.sip.amount, inputs.sip.rate, inputs.sip.years,
        activeStrategy === 'percent' ? inputs.sip.stepUpPercent : 0,
        activeStrategy === 'fixed' ? inputs.sip.stepUpValue : 0,
        inputs.sip.initialLumpsum,
        inputs.sip.inflationRate
      );
    } else if (currentMenu === 'RD') {
      return calculateRD(inputs.rd.monthlyDeposit, inputs.rd.rate, inputs.rd.quarters);
    } else if (currentMenu === 'Lumpsum') {
      return calculateLumpsum(inputs.lumpsum.amount, inputs.lumpsum.rate, inputs.lumpsum.years);
    } else {
      return calculateLoan(
        inputs.loan.principal,
        inputs.loan.rate,
        inputs.loan.months,
        loanPrepaymentStrategy === 'yearly' ? inputs.loan.yearlyExtra : 0,
        loanPrepaymentStrategy === 'monthly' ? inputs.loan.monthlyExtra : 0
      );
    }
  }, [currentMenu, inputs, activeStrategy, loanPrepaymentStrategy, calculateSIP, calculateRD, calculateLoan, calculateLumpsum]);
  // 2. Chart Data Mapper
  const chartData = useMemo(() => {
    if (currentMenu === 'SIP') {
      return results.breakdown.map(d => ({
        name: `Yr ${d.year}`,
        Invested: Number(activeTab === 'primary' ? d.stepUp.investedAmount : d.normal.investedAmount),
        TotalValue: Number(activeTab === 'primary' ? d.stepUp.totalValue : d.normal.totalValue),
        'Adjusted Value': Number(activeTab === 'primary' ? d.stepUp.adjustedTotalValue : d.normal.adjustedTotalValue)
      }));
    }
    if (currentMenu === 'RD') {
      // Return the breakdown generated in calculateRD
      return results.breakdown || [];
    }
    if (currentMenu === 'Loan' && results.breakdownWithPrepayment) {
      const withPrepayment = results.breakdownWithPrepayment;
      const withoutPrepayment = results.breakdownWithoutPrepayment;
      const maxYears = withoutPrepayment.length; // The non-prepayment schedule is always the longest
      const data = [];

      // Create maps for quick lookup
      const withMap = new Map(withPrepayment.map(i => [i.year, i.remainingBalance]));
      const withoutMap = new Map(withoutPrepayment.map(i => [i.year, i.remainingBalance]));

      for (let i = 0; i < maxYears; i++) {
        const year = i + 1;
        data.push({
          name: `Yr ${year}`,
          // If balance is not found for a year, it means it was paid off in a prior year.
          'With Prepayment': withMap.get(year) ?? 0,
          'Without Prepayment': withoutMap.get(year) ?? 0,
        });
      }
      // Add year 0 to show the starting principal
      data.unshift({ name: 'Start', 'With Prepayment': inputs.loan.principal, 'Without Prepayment': inputs.loan.principal });
      return data;
    }
    return [];
  }, [results, currentMenu, activeTab, inputs.loan.principal]);

  return (
    <div className={styles.wealthPlannerRoot}>
      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Calculators</h2>
          <div className={styles.sidebarMenu}>
            {['SIP', 'Lumpsum', 'RD', 'Loan'].map(m => (
              <button key={m} onClick={() => setCurrentMenu(m)} className={`${styles.sidebarBtn} ${currentMenu === m ? styles.sidebarBtnActive : ''}`}>{m}</button>
            ))}
          </div>
        </aside>

        <div className={styles.mainPanel}>

          <div className={styles.controlGrid}>
            {/* Left: Input Section */}
            <div className={styles.innerCard}>
              <p className={styles.cardHeading}>{currentMenu} Details</p>
              {currentMenu === 'SIP' && (
                <>
                  <DualInput label="Initial Lumpsum" symbol="₹" value={inputs.sip.initialLumpsum} min={0} max={1000000} step={5000}
                    onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, initialLumpsum: v } })} />
                  <DualInput label="Monthly SIP" symbol="₹" value={inputs.sip.amount} min={500} max={100000} step={500}
                    onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, amount: v } })} />
                  <DualInput label="Expected Return" symbol="%" value={inputs.sip.rate} min={1} max={30} step={0.5}
                    onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, rate: v } })} />
                  <DualInput label="Tenure" symbol="Yrs" value={inputs.sip.years} min={1} max={40} step={1}
                    onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, years: v } })} />
                  <DualInput label="Assumed Inflation" symbol="%" value={inputs.sip.inflationRate} min={0} max={15} step={0.5}
                    onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, inflationRate: v } })} />
                </>
              )}
              {/* Lumpsum Input View */}
              {currentMenu === 'Lumpsum' && (
                <>
                  <DualInput label="Total Investment" symbol="₹" value={inputs.lumpsum.amount} min={5000} max={10000000} step={5000}
                    onChange={(v) => setInputs({ ...inputs, lumpsum: { ...inputs.lumpsum, amount: v } })} />
                  <DualInput label="Expected Return" symbol="%" value={inputs.lumpsum.rate} min={1} max={30} step={0.5}
                    onChange={(v) => setInputs({ ...inputs, lumpsum: { ...inputs.lumpsum, rate: v } })} />
                  <DualInput label="Tenure" symbol="Yrs" value={inputs.lumpsum.years} min={1} max={40} step={1}
                    onChange={(v) => setInputs({ ...inputs, lumpsum: { ...inputs.lumpsum, years: v } })} />
                </>
              )}
              {currentMenu === 'RD' && (
                <>
                  <DualInput label="Monthly Deposit" symbol="₹" value={inputs.rd.monthlyDeposit} min={500} max={100000} step={500}
                    onChange={(v) => setInputs({ ...inputs, rd: { ...inputs.rd, monthlyDeposit: v } })} />
                  <DualInput label="Interest Rate" symbol="%" value={inputs.rd.rate} min={1} max={15} step={0.1}
                    onChange={(v) => setInputs({ ...inputs, rd: { ...inputs.rd, rate: v } })} />
                  <DualInput label="Duration" symbol="Qtr" value={inputs.rd.quarters} min={1} max={80} step={1}
                    onChange={(v) => setInputs({ ...inputs, rd: { ...inputs.rd, quarters: v } })} />
                </>
              )}
              {currentMenu === 'Loan' && (
                <>
                  <DualInput label="Principal" symbol="₹" value={inputs.loan.principal} min={100000} max={10000000} step={50000}
                    onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, principal: v } })} />
                  <DualInput label="Interest Rate" symbol="%" value={inputs.loan.rate} min={5} max={20} step={0.1}
                    onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, rate: v } })} />
                  <DualInput label="Tenure" symbol="Mo" value={inputs.loan.months} min={12} max={360} step={12}
                    onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, months: v } })} />
                </>
              )}
            </div>

            {/* Middle: Strategy/Extra Options */}
            <div className={styles.innerCard}>
              {currentMenu === 'Loan' ? (
                <>
                  <p className={styles.cardHeading}>Prepayment Strategy</p>
                  <div className={styles.toggleWrapper}>
                    <button onClick={() => setLoanPrepaymentStrategy('yearly')} className={`${styles.toggleBtn} ${loanPrepaymentStrategy === 'yearly' ? styles.toggleBtnActive : ''}`}>Yearly</button>
                    <button onClick={() => setLoanPrepaymentStrategy('monthly')} className={`${styles.toggleBtn} ${loanPrepaymentStrategy === 'monthly' ? styles.toggleBtnActive : ''}`}>Monthly</button>
                  </div>
                  {loanPrepaymentStrategy === 'yearly' ? (
                    <DualInput
                      label="Fixed Extra Annual Pay"
                      symbol="₹"
                      value={inputs.loan.yearlyExtra}
                      min={0} max={100000} step={1000}
                      onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, yearlyExtra: v } })}
                    />
                  ) : (
                    <DualInput label="Extra Monthly Payment" symbol="₹" value={inputs.loan.monthlyExtra} min={0} max={10000} step={500}
                      onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, monthlyExtra: v } })} />
                  )}
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>
                    {loanPrepaymentStrategy === 'yearly'
                      ? 'This amount is paid once every year towards the principal.'
                      : 'This extra amount is paid every month with your EMI.'}
                  </p>
                </>
              ) : currentMenu === 'SIP' ? (
                <>
                  <p className={styles.cardHeading}>Step-Up Strategy</p>
                  <div className={styles.toggleWrapper}>
                    <button onClick={() => setActiveStrategy('percent')} className={`${styles.toggleBtn} ${activeStrategy === 'percent' ? styles.toggleBtnActive : ''}`}>%</button>
                    <button onClick={() => setActiveStrategy('fixed')} className={`${styles.toggleBtn} ${activeStrategy === 'fixed' ? styles.toggleBtnActive : ''}`}>₹</button>
                  </div>
                  {activeStrategy === 'percent' ? (
                    <DualInput label="Yearly Step-up" symbol="%" value={inputs.sip.stepUpPercent} min={0} max={50} onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, stepUpPercent: v } })} />
                  ) : (
                    <DualInput label="Fixed Increase" symbol="₹" value={inputs.sip.stepUpValue} min={0} max={50000} onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, stepUpValue: v } })} />
                  )}
                </>
              ) : (
                <p className={styles.noStrategyText}>No additional strategy available for this mode.</p>
              )}
            </div>

            {/* Right: Maturity Results */}
            <div className={styles.resultsColumn}>
              {currentMenu === 'SIP' && (
                <>
                  <ResultCard active={activeTab === 'primary'} label="STEP-UP MATURITY" color="#10B981" value={results.summary.stepUpSip.totalValue} onClick={() => setActiveTab('primary')} />
                  <ResultCard active={activeTab === 'secondary'} label="NORMAL MATURITY" color="#3B82F6" value={results.summary.normalSip.totalValue} onClick={() => setActiveTab('secondary')} />
                  <ResultCard
                    active={false}
                    label="MATURITY IN TODAY'S VALUE"
                    color="#F59E0B"
                    value={activeTab === 'primary' ? results.summary.stepUpSip.inflationAdjustedValue : results.summary.normalSip.inflationAdjustedValue}
                  />
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
            </div>
          </div>

          {/* Chart View */}
          {(currentMenu === 'SIP' || currentMenu === 'RD' || (currentMenu === 'Loan' && (inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0))) && (
            <div className={`${styles.innerCard} ${styles.chartContainer}`}>
              <p className={styles.cardHeading}>
                {currentMenu === 'Loan'
                  ? 'Loan Balance Over Time'
                  : currentMenu === 'SIP'
                    ? (activeTab === 'primary' ? 'Step-Up' : 'Normal') + ' Wealth Projection'
                    : 'RD Wealth Projection'
                }
              </p>
              {currentMenu === 'Loan' ? (
                <WealthChart
                  data={chartData}
                  primaryDataKey="With Prepayment"
                  primaryName="With Prepayment"
                  primaryColor="#10B981"
                  secondaryDataKey="Without Prepayment"
                  secondaryName="Without Prepayment"
                  secondaryColor="#EF4444"
                  hideInvestedLine={true}
                />
              ) : (
                <WealthChart
                  data={chartData}
                  primaryColor={currentMenu === 'RD' ? "#10B981" : (activeTab === 'primary' ? "#10B981" : "#3B82F6")}
                  secondaryDataKey={inputs.sip.inflationRate > 0 ? "Adjusted Value" : undefined}
                  secondaryName="Today's Value"
                  secondaryColor="#F59E0B"
                />
              )}
            </div>
          )}

          {/* Dynamic Breakdown Table */}
          {(currentMenu === 'SIP' || currentMenu === 'RD' || (currentMenu === 'Loan' && (inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0))) && (
            <div className={styles.innerCard}>
              <p className={styles.cardHeading}>
                {currentMenu === 'Loan'
                  ? 'Loan Repayment Schedule'
                  : `${currentMenu} ${currentMenu === 'SIP' && (activeTab === 'primary' ? 'Step-Up' : 'Normal')} Breakdown Schedule`
                }
              </p>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  {currentMenu === 'Loan' ? (
                    <>
                      <thead>
                        <tr>
                          <th className={styles.th}>Year</th>
                          <th className={styles.th}>Balance (w/o Prepayment)</th>
                          <th className={styles.th}>Balance (w/ Prepayment)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.filter(d => d.name !== 'Start').map((row, index) => (
                          <tr key={index}>
                            <td className={styles.td}>{row.name.replace('Yr ', '')}</td>
                            <td className={styles.td}>₹{Number(row['Without Prepayment']).toLocaleString('en-IN')}</td>
                            <td className={`${styles.td} ${styles.tdMaturity}`} style={{ color: '#10B981' }}>
                              ₹{Number(row['With Prepayment']).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                        <tr>
                          <th className={styles.th}>{currentMenu === 'SIP' ? 'Year' : 'Quarter'}</th>
                          <th className={styles.th}>{currentMenu === 'SIP' ? 'Monthly SIP' : 'Monthly Deposit'}</th>
                          <th className={styles.th}>Cumulative Investment</th>
                          <th className={styles.th}>Maturity Value</th>
                          {currentMenu === 'SIP' && inputs.sip.inflationRate > 0 && <th className={styles.th}>Value in Today's Terms</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {currentMenu === 'SIP' ? (
                          // SIP Table Rows
                          results.breakdown.map((row) => {
                            const data = activeTab === 'primary' ? row.stepUp : row.normal;
                            return (
                              <tr key={row.year}>
                                <td className={styles.td}>{row.year}</td>
                                <td className={styles.td}>₹{Number(activeTab === 'primary' ? data.monthlyInstallment : inputs.sip.amount).toLocaleString('en-IN')}</td>
                                <td className={styles.td}>₹{Number(data.investedAmount).toLocaleString('en-IN')}</td>
                                <td className={`${styles.td} ${styles.tdMaturity}`} style={{ color: activeTab === 'primary' ? '#10B981' : '#3B82F6' }}>
                                  ₹{Number(data.totalValue).toLocaleString('en-IN')}
                                </td>
                                {inputs.sip.inflationRate > 0 && (
                                  <td className={`${styles.td} ${styles.tdMaturity}`} style={{ color: '#F59E0B' }}>
                                    ₹{Number(data.adjustedTotalValue).toLocaleString('en-IN')}
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        ) : (
                          // RD Table Rows
                          results.breakdown.map((row, index) => (
                            <tr key={index}>
                              <td className={styles.td}>{row.name}</td>
                              <td className={styles.td}>₹{Number(inputs.rd.monthlyDeposit).toLocaleString('en-IN')}</td>
                              <td className={styles.td}>₹{Number(row.Invested).toLocaleString('en-IN')}</td>
                              <td className={`${styles.td} ${styles.tdMaturity}`} style={{ color: '#10B981' }}>
                                ₹{Number(row.TotalValue).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default Wealth;