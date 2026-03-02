import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import WealthChart from './WealthChart';
import DualInput from './DualInput';
import ResultCard from './ResultCard';
import styles from './WealthPlanner.module.css';
import CalculatorGuide from './CalculatorGuide';

const Wealth = () => {
  const { calculateSIP, calculateRD, calculateLoan, calculateLumpsum, calculateSWP, calculateRealSIP, calculatePortfolio, getFundList, getFundNAV } = useFinance();
  const [currentMenu, setCurrentMenu] = useState('SIP'); // 'SIP', 'RD', 'Loan'
  const [activeTab, setActiveTab] = useState('primary'); // For comparison views
  const [activeStrategy, setActiveStrategy] = useState('percent'); // For SIP Step-up
  const [loanPrepaymentStrategy, setLoanPrepaymentStrategy] = useState('yearly'); // For Loan Prepayment

  const [inputs, setInputs] = useState({
    sip: { amount: 5000, rate: 12, years: 10, stepUpPercent: 10, stepUpValue: 0, initialLumpsum: 0, inflationRate: 6 },
    lumpsum: { amount: 100000, rate: 12, years: 10 },
    rd: { monthlyDeposit: 5000, rate: 7, quarters: 20 },
    loan: { principal: 1000000, rate: 8.5, months: 120, yearlyExtra: 0, monthlyExtra: 0 },
    swp: { initialCorpus: 10000000, monthlyWithdrawal: 50000, annualRate: 8, stepUpPercent: 0 }
  });

  // --- Tracker State ---
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const saved = localStorage.getItem('mf_portfolio');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fundList, setFundList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFund, setSelectedFund] = useState(null);
  const [navData, setNavData] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerInputs, setTrackerInputs] = useState({
    startDate: '2020-01-01',
    amount: 5000,
    lumpsum: 0,
    stepUpPercent: 0,
    stepUpValue: 0
  });
  
  // Save Portfolio to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mf_portfolio', JSON.stringify(portfolio));
    } catch (e) {
      console.error("Failed to save portfolio", e);
    }
  }, [portfolio]);

  // Fetch Fund List on Tracker Load
  useEffect(() => {
    if (currentMenu === 'Tracker' && fundList.length === 0) {
      setTrackerLoading(true);
      getFundList()
        .then(data => {
          if (data) setFundList(data);
          setTrackerLoading(false);
        });
    }
  }, [currentMenu, fundList.length]);

  // Fetch NAV when fund selected
  const handleFundSelect = async (fund) => {
    setSelectedFund(fund);
    setSearchQuery('');
    setTrackerLoading(true);
    setNavData([]); // Clear previous data to avoid mixing results
    const data = await getFundNAV(fund.schemeCode);
    if (data && data.length > 0) setNavData(data);
    setTrackerLoading(false);
  };

  // Force Refresh Fund List
  const handleRefreshFunds = () => {
    setTrackerLoading(true);
    getFundList(true)
      .then(data => {
        if (data) setFundList(data);
        setTrackerLoading(false);
      });
  };

  // Add Fund to Portfolio
  const handleAddToPortfolio = () => {
    if (!selectedFund || navData.length === 0) return;
    
    if (editingId) {
      setPortfolio(portfolio.map(p => p.id === editingId ? {
        ...p,
        fund: selectedFund,
        inputs: { ...trackerInputs },
        navData: [...navData]
      } : p));
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        fund: selectedFund,
        inputs: { ...trackerInputs },
        navData: [...navData] // Store copy of NAV data
      };
      setPortfolio([...portfolio, newEntry]);
    }
    
    // Reset inputs
    setSelectedFund(null);
    setNavData([]);
    setSearchQuery('');
    setIsAddingFund(false);
  };

  // Edit Fund
  const handleEditFund = (item) => {
    setSelectedFund(item.fund);
    setTrackerInputs(item.inputs);
    setNavData(item.navData);
    setEditingId(item.id);
    setIsAddingFund(true);
  };

  // Remove Fund
  const handleRemoveFund = (id) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  // 1. Unified Calculation Engine
  // Inside Wealth.jsx
  const results = useMemo(() => {
    if (currentMenu === 'SIP') {
      const sipData = calculateSIP(
        inputs.sip.amount, inputs.sip.rate, inputs.sip.years,
        activeStrategy === 'percent' ? inputs.sip.stepUpPercent : 0,
        activeStrategy === 'fixed' ? inputs.sip.stepUpValue : 0,
        inputs.sip.initialLumpsum,
        inputs.sip.inflationRate
      );

      // Recalculate inflation adjusted values to ensure accuracy
      // Formula: Real Value = Nominal Value / (1 + inflationRate)^Years
      if (sipData) {
        const inflationDecimal = inputs.sip.inflationRate / 100;

        if (sipData.summary) {
          const discountFactor = Math.pow(1 + inflationDecimal, inputs.sip.years);
          sipData.summary.normalSip.inflationAdjustedValue = sipData.summary.normalSip.totalValue / discountFactor;
          sipData.summary.stepUpSip.inflationAdjustedValue = sipData.summary.stepUpSip.totalValue / discountFactor;
        }

        if (sipData.breakdown) {
          sipData.breakdown.forEach(item => {
            const discountFactor = Math.pow(1 + inflationDecimal, item.year);
            if (item.normal) item.normal.adjustedTotalValue = item.normal.totalValue / discountFactor;
            if (item.stepUp) item.stepUp.adjustedTotalValue = item.stepUp.totalValue / discountFactor;
          });
        }
      }
      return sipData;
    } else if (currentMenu === 'RD') {
      return calculateRD(inputs.rd.monthlyDeposit, inputs.rd.rate, inputs.rd.quarters);
    } else if (currentMenu === 'Lumpsum') {
      return calculateLumpsum(inputs.lumpsum.amount, inputs.lumpsum.rate, inputs.lumpsum.years);
    } else if (currentMenu === 'SWP') {
      return calculateSWP(inputs.swp.initialCorpus, inputs.swp.monthlyWithdrawal, inputs.swp.annualRate, inputs.swp.stepUpPercent);
    } else if (currentMenu === 'Loan') {
      return calculateLoan(
        inputs.loan.principal,
        inputs.loan.rate,
        inputs.loan.months,
        loanPrepaymentStrategy === 'yearly' ? inputs.loan.yearlyExtra : 0,
        loanPrepaymentStrategy === 'monthly' ? inputs.loan.monthlyExtra : 0
      );
    } else if (currentMenu === 'Tracker') {
      return calculatePortfolio(portfolio);
    }
    return null;
  }, [currentMenu, inputs, activeStrategy, loanPrepaymentStrategy, portfolio, calculateSIP, calculateRD, calculateLoan, calculateLumpsum, calculateSWP, calculatePortfolio]);
  
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
    if (currentMenu === 'SWP' && results.breakdownWithStepUp) {
      const withStepUp = results.breakdownWithStepUp;
      const withoutStepUp = results.breakdownWithoutStepUp;
      const maxYears = Math.max(withStepUp.length, withoutStepUp.length);
      const data = [];

      const withMap = new Map(withStepUp.map(i => [i.name, i.TotalValue]));
      const withoutMap = new Map(withoutStepUp.map(i => [i.name, i.TotalValue]));

      for (let i = 0; i < maxYears; i++) {
        const yearName = `Year ${i + 1}`;
        data.push({
          name: yearName,
          'Stepped-Up Withdrawal': withMap.get(yearName) ?? 0,
          'Fixed Withdrawal': withoutMap.get(yearName) ?? 0,
        });
      }
      data.unshift({ name: 'Start', 'Stepped-Up Withdrawal': inputs.swp.initialCorpus, 'Fixed Withdrawal': inputs.swp.initialCorpus });
      return data;
    }
    if (currentMenu === 'Tracker' && results && results.breakdown) {
      return results.breakdown;
    }
    return [];
  }, [results, currentMenu, activeTab, inputs.loan.principal, inputs.swp.initialCorpus, trackerInputs]);

  return (
    <div className={styles.wealthPlannerRoot}>
      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Calculators</h2>
          <div className={styles.sidebarMenu}>
            {['SIP', 'Lumpsum', 'RD', 'Loan', 'SWP', 'Tracker'].map(m => (
              <button key={m} onClick={() => setCurrentMenu(m)} className={`${styles.sidebarBtn} ${currentMenu === m ? styles.sidebarBtnActive : ''}`}>{m}</button>
            ))}
            <button onClick={() => setCurrentMenu('Help')} className={`${styles.sidebarBtn} ${currentMenu === 'Help' ? styles.sidebarBtnActive : ''}`}>Help</button>
          </div>
        </aside>

        <div className={styles.mainPanel}>
          {currentMenu === 'Help' ? (
            <CalculatorGuide />
          ) : (
          <>
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
                  {/* <DualInput label="Assumed Inflation" symbol="%" value={inputs.sip.inflationRate} min={0} max={15} step={0.5}
                    onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, inflationRate: v } })} /> */}
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
              {currentMenu === 'SWP' && (
                <>
                  <DualInput label="Initial Corpus" symbol="₹" value={inputs.swp.initialCorpus} min={100000} max={50000000} step={100000}
                    onChange={(v) => setInputs({ ...inputs, swp: { ...inputs.swp, initialCorpus: v } })} />
                  <DualInput label="Monthly Withdrawal" symbol="₹" value={inputs.swp.monthlyWithdrawal} min={1000} max={200000} step={1000}
                    onChange={(v) => setInputs({ ...inputs, swp: { ...inputs.swp, monthlyWithdrawal: v } })} />
                  <DualInput label="Expected Return" symbol="%" value={inputs.swp.annualRate} min={1} max={20} step={0.5}
                    onChange={(v) => setInputs({ ...inputs, swp: { ...inputs.swp, annualRate: v } })} />
                </>
              )}
              {currentMenu === 'Tracker' && (
                <>
                  {!isAddingFund && portfolio.length > 0 ? (
                    <div className={styles.portfolioList}>
                      <button onClick={() => { setIsAddingFund(true); setEditingId(null); setSelectedFund(null); setNavData([]); setSearchQuery(''); }} className={styles.addFundBtn}>+ Add Another Fund</button>
                      {portfolio.map(item => (
                        <div key={item.id} className={styles.portfolioItem}>
                          <div className={styles.portfolioItemInfo}>
                            <p className={styles.portfolioItemTitle}>{item.fund.schemeName}</p>
                            <p className={styles.portfolioItemSubtitle}>
                              SIP: ₹{item.inputs.amount} | Start: {item.inputs.startDate}
                            </p>
                          </div>
                          <div className={styles.portfolioActions}>
                            <button onClick={() => handleEditFund(item)} className={`${styles.actionBtn} ${styles.editBtn}`}>Edit</button>
                            <button onClick={() => handleRemoveFund(item.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                    {!selectedFund ? (
                    <div className={styles.searchContainer}>
                      <div className={styles.searchHeader}>
                        <label className={styles.label}>Search Mutual Fund</label>
                        <button onClick={handleRefreshFunds} className={styles.refreshBtn} title="Force Refresh List">↻</button>
                      </div>
                      <input 
                        type="text" 
                        list="fund-suggestions"
                        placeholder="Start typing fund name..." 
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          const match = fundList.find(f => f.schemeName === val);
                          if (match) handleFundSelect(match);
                        }}
                        className={styles.searchInput}
                      />
                      <datalist id="fund-suggestions">
                        {searchQuery.length > 1 && fundList
                          .filter(f => f.schemeName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice(0, 50)
                          .map(f => (
                            <option key={f.schemeCode} value={f.schemeName} />
                          ))
                        }
                      </datalist>
                      {trackerLoading && <p className={styles.loadingText}>Loading funds...</p>}
                    </div>
                  ) : (
                    <div className={styles.selectedFundBox}>
                      <strong>{selectedFund.schemeName}</strong>
                      <button onClick={() => { setSelectedFund(null); setNavData([]); }} className={styles.changeBtn}>Change</button>
                      {trackerLoading && <div className={styles.fetchingText}>Fetching historical NAV data...</div>}
                    </div>
                  )}
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Start Date</label>
                    <input type="date" value={trackerInputs.startDate} onChange={(e) => setTrackerInputs({...trackerInputs, startDate: e.target.value})} className={styles.dateInput} />
                  </div>
                  <DualInput label="Monthly SIP" symbol="₹" value={trackerInputs.amount} min={0} max={100000} step={500}
                    onChange={(v) => setTrackerInputs({ ...trackerInputs, amount: v })} />
                  <DualInput label="Initial Lumpsum" symbol="₹" value={trackerInputs.lumpsum} min={0} max={1000000} step={5000}
                    onChange={(v) => setTrackerInputs({ ...trackerInputs, lumpsum: v })} />

                  <button onClick={handleAddToPortfolio} disabled={!selectedFund || trackerLoading} className={styles.addFundBtn} style={{ marginTop: '20px' }}>
                    {trackerLoading ? 'Loading...' : (editingId ? 'Update Portfolio' : 'Add to Portfolio')}
                  </button>
                  {portfolio.length > 0 && <button onClick={() => { setIsAddingFund(false); setEditingId(null); setSelectedFund(null); setNavData([]); setSearchQuery(''); }} className={styles.cancelBtn}>Cancel</button>}
                  </>
                  )}
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
                  <p className={styles.helperText}>
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
              ) : currentMenu === 'SWP' ? (
                <>
                  <p className={styles.cardHeading}>Step-Up Withdrawal</p>
                  <DualInput
                    label="Annual Step-up"
                    symbol="%"
                    value={inputs.swp.stepUpPercent}
                    min={0} max={10} step={0.5}
                    onChange={(v) => setInputs({ ...inputs, swp: { ...inputs.swp, stepUpPercent: v } })}
                  />
                  <p className={styles.helperText}>
                    Increase withdrawal amount annually to counter inflation.
                  </p>
                </>
              ) : currentMenu === 'Tracker' && (isAddingFund || portfolio.length === 0) ? (
                <>
                  <p className={styles.cardHeading}>Step-Up Strategy</p>
                  <div className={styles.toggleWrapper}>
                    <button onClick={() => setActiveStrategy('percent')} className={`${styles.toggleBtn} ${activeStrategy === 'percent' ? styles.toggleBtnActive : ''}`}>%</button>
                    <button onClick={() => setActiveStrategy('fixed')} className={`${styles.toggleBtn} ${activeStrategy === 'fixed' ? styles.toggleBtnActive : ''}`}>₹</button>
                  </div>
                  {activeStrategy === 'percent' ? (
                    <DualInput label="Yearly Step-up" symbol="%" value={trackerInputs.stepUpPercent} min={0} max={50} onChange={(v) => setTrackerInputs({ ...trackerInputs, stepUpPercent: v, stepUpValue: 0 })} />
                  ) : (
                    <DualInput label="Fixed Increase" symbol="₹" value={trackerInputs.stepUpValue} min={0} max={50000} onChange={(v) => setTrackerInputs({ ...trackerInputs, stepUpValue: v, stepUpPercent: 0 })} />
                  )}
                </>
              ) : currentMenu !== 'Tracker' && (
                <p className={styles.noStrategyText}>No additional strategy available for this mode.</p>
              )}
            </div>

            {/* Right: Maturity Results */}
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
              {currentMenu === 'Tracker' && results && portfolio.length > 0 && (
                <>
                  <ResultCard active label="CURRENT VALUE" color="#10B981" value={results.currentValue} />
                  <ResultCard active={false} label="TOTAL INVESTED" color="#64748B" value={results.totalInvested} />
                  <ResultCard active={false} label="ABS RETURNS" color={results.absoluteReturn >= 0 ? "#10B981" : "#EF4444"} value={`${results.absoluteReturn}%`} />
                  <ResultCard active={false} label="XIRR" color={results.xirr >= 0 ? "#10B981" : "#EF4444"} value={`${results.xirr}%`} />
                </>
              )}
            </div>
          </div>

          {/* Chart View */}
          {(currentMenu === 'SIP' || currentMenu === 'RD' || currentMenu === 'SWP' || (currentMenu === 'Tracker' && portfolio.length > 0) || (currentMenu === 'Loan' && (inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0))) && (
            <div className={`${styles.innerCard} ${styles.chartContainer}`}>
              <p className={styles.cardHeading}>
                {currentMenu === 'SWP'
                  ? 'Corpus Depletion Over Time'
                  : currentMenu === 'Loan'
                  ? 'Loan Balance Over Time'
                  : currentMenu === 'Tracker'
                  ? 'Portfolio Growth (Actual)'
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
              ) : currentMenu === 'SWP' ? (
                <WealthChart
                  data={chartData}
                  primaryDataKey={inputs.swp.stepUpPercent > 0 ? "Stepped-Up Withdrawal" : "Fixed Withdrawal"}
                  primaryName={inputs.swp.stepUpPercent > 0 ? "Stepped-Up Withdrawal" : "Remaining Corpus"}
                  primaryColor="#EF4444"
                  secondaryDataKey={inputs.swp.stepUpPercent > 0 ? "Fixed Withdrawal" : undefined}
                  secondaryName="Fixed Withdrawal"
                  secondaryColor="#64748B"
                  hideInvestedLine={true}
                />
              ) : currentMenu === 'Tracker' ? (
                <WealthChart
                  data={chartData}
                  primaryDataKey="TotalValue"
                  primaryName="Current Value"
                  primaryColor="#10B981"
                  secondaryDataKey="Invested"
                  secondaryName="Invested Amount"
                  secondaryColor="#64748B"
                />
              ) : (
                <WealthChart
                  data={chartData}
                  primaryColor={currentMenu === 'RD' ? "#10B981" : (activeTab === 'primary' ? "#10B981" : "#3B82F6")}
                  secondaryDataKey={undefined}
                  secondaryName="Today's Value"
                  secondaryColor="#F59E0B"
                />
              )}
            </div>
          )}

          {/* Dynamic Breakdown Table */}
          {(currentMenu === 'SIP' || currentMenu === 'RD' || currentMenu === 'SWP' || (currentMenu === 'Tracker' && portfolio.length > 0) || (currentMenu === 'Loan' && (inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0))) && (
            <div className={styles.innerCard}>
              <p className={styles.cardHeading}>
                {currentMenu === 'SWP'
                  ? 'Corpus Depletion Schedule'
                  : currentMenu === 'Loan'
                  ? 'Loan Repayment Schedule'
                  : currentMenu === 'Tracker'
                  ? 'Transaction History'
                  : `${currentMenu} ${currentMenu === 'SIP' && (activeTab === 'primary' ? 'Step-Up' : 'Normal')} Breakdown Schedule`
                }
              </p>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  {currentMenu === 'SWP' ? (
                    <>
                      <thead>
                        <tr>
                          <th className={styles.th}>Year</th>
                          {inputs.swp.stepUpPercent > 0 && <th className={styles.th}>Corpus (Fixed)</th>}
                          <th className={styles.th}>Corpus ({inputs.swp.stepUpPercent > 0 ? 'Stepped-Up' : 'Fixed'})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.filter(d => d.name !== 'Start').map((row, index) => (
                          <tr key={index}>
                            <td className={styles.td}>{row.name.replace(/Year |Yr /g, '')}</td>
                            {inputs.swp.stepUpPercent > 0 && <td className={styles.td}>₹{Number(row['Fixed Withdrawal']).toLocaleString('en-IN')}</td>}
                            <td className={`${styles.td} ${styles.tdMaturity} ${styles.textRed}`}>
                              ₹{Number(row['Stepped-Up Withdrawal'] ?? row['Fixed Withdrawal']).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : currentMenu === 'Loan' ? (
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
                            <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                              ₹{Number(row['With Prepayment']).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : currentMenu === 'Tracker' && portfolio.length > 0 ? (
                    <>
                      <thead>
                        <tr>
                          <th className={styles.th}>Date</th>
                          <th className={styles.th}>NAV</th>
                          <th className={styles.th}>Invested</th>
                          <th className={styles.th}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Show reversed for table (newest first) */}
                        {[...chartData].reverse().map((row, index) => (
                          <tr key={index}>
                            <td className={styles.td}>{row.name}</td>
                            <td className={styles.td}>{row.NAV}</td>
                            <td className={styles.td}>₹{Number(row.Invested).toLocaleString('en-IN')}</td>
                            <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                              ₹{Number(row.TotalValue).toLocaleString('en-IN')}
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
                          {/* {currentMenu === 'SIP' && inputs.sip.inflationRate > 0 && <th className={styles.th}>Value in Today's Terms</th>} */}
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
                                <td className={`${styles.td} ${styles.tdMaturity} ${activeTab === 'primary' ? styles.textGreen : styles.textBlue}`}>
                                  ₹{Number(data.totalValue).toLocaleString('en-IN')}
                                </td>
                                {/* {inputs.sip.inflationRate > 0 && (
                                  <td className={`${styles.td} ${styles.tdMaturity}`} style={{ color: '#F59E0B' }}>
                                    ₹{Number(data.adjustedTotalValue).toLocaleString('en-IN')}
                                  </td>
                                )} */}
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
                              <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
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
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wealth;