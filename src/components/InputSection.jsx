import React from 'react';
import DualInput from './DualInput';
import PortfolioTracker from './PortfolioTracker';
import styles from './WealthPlanner.module.css';

const InputSection = ({
  currentMenu,
  inputs,
  setInputs,
  // Tracker specific props
  portfolio,
  isAddingFund,
  setIsAddingFund,
  editingId,
  setEditingId,
  trackerInputs,
  setTrackerInputs,
  investmentMode,
  setInvestmentMode,
  fundList,
  searchQuery,
  setSearchQuery,
  selectedFund,
  setSelectedFund,
  navData,
  setNavData,
  trackerLoading,
  handleRefreshFunds,
  handleFundSelect,
  handleImportClick,
  handleAddToPortfolio,
  // PortfolioTracker props
  baseResults,
  viewingId,
  setViewingId,
  handleEditFund,
  handleRemoveFund,
  setShowClearConfirmation
}) => {

  const handleAddNewFund = () => {
    setIsAddingFund(true);
    setEditingId(null);
    setSelectedFund(null);
    setNavData([]);
    setSearchQuery('');
    setTrackerInputs({ startDate: '2020-01-01', endDate: '', amount: 5000, lumpsum: 0, stepUpPercent: 0, stepUpValue: 0 });
    setInvestmentMode('SIP');
  };

  return (
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
        </>
      )}
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
            <PortfolioTracker 
              portfolio={portfolio}
              baseResults={baseResults}
              viewingId={viewingId}
              setViewingId={setViewingId}
              onEdit={handleEditFund}
              onRemove={handleRemoveFund}
              onAddClick={handleAddNewFund}
              onClear={() => setShowClearConfirmation(true)}
              onImport={handleImportClick}
            />
          ) : (
            <>
            {!selectedFund ? (
            <>
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

            <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0 20px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
              <span style={{ padding: '0 10px', color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
            </div>
            <button onClick={handleImportClick} className={styles.importBtn} style={{ width: '100%', marginBottom: '20px' }}>
              Import Portfolio from CSV
            </button>
            </>
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

          {(investmentMode === 'SIP' || investmentMode === 'Both') && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>SIP End Date (Optional)</label>
              <input type="date" value={trackerInputs.endDate || ''} onChange={(e) => setTrackerInputs({...trackerInputs, endDate: e.target.value})} className={styles.dateInput} placeholder="Leave blank if ongoing" />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Investment Type</label>
            <div className={styles.toggleWrapper} style={{ width: '100%', boxSizing: 'border-box', display: 'flex' }}>
              <button onClick={() => { setInvestmentMode('SIP'); setTrackerInputs(p => ({...p, lumpsum: 0, amount: p.amount || 5000})); }} className={`${styles.toggleBtn} ${investmentMode === 'SIP' ? styles.toggleBtnActive : ''}`} style={{flex: 1}}>SIP</button>
              <button onClick={() => { setInvestmentMode('Lumpsum'); setTrackerInputs(p => ({...p, amount: 0, lumpsum: p.lumpsum || 50000})); }} className={`${styles.toggleBtn} ${investmentMode === 'Lumpsum' ? styles.toggleBtnActive : ''}`} style={{flex: 1}}>Lumpsum</button>
              <button onClick={() => { setInvestmentMode('Both'); setTrackerInputs(p => ({...p, amount: p.amount || 5000, lumpsum: p.lumpsum || 50000})); }} className={`${styles.toggleBtn} ${investmentMode === 'Both' ? styles.toggleBtnActive : ''}`} style={{flex: 1}}>Both</button>
            </div>
          </div>

          {(investmentMode === 'SIP' || investmentMode === 'Both') && (
            <DualInput label="Monthly SIP" symbol="₹" value={trackerInputs.amount} min={0} max={100000} step={500}
              onChange={(v) => setTrackerInputs({ ...trackerInputs, amount: v })} />
          )}
          
          {(investmentMode === 'Lumpsum' || investmentMode === 'Both') && (
            <DualInput label="Initial Lumpsum" symbol="₹" value={trackerInputs.lumpsum} min={0} max={1000000} step={5000}
              onChange={(v) => setTrackerInputs({ ...trackerInputs, lumpsum: v })} />
          )}

          <button onClick={handleAddToPortfolio} disabled={!selectedFund || trackerLoading} className={styles.addFundBtn} style={{ marginTop: '20px' }}>
            {trackerLoading ? 'Loading...' : (editingId ? 'Update Portfolio' : 'Add to Portfolio')}
          </button>
          {portfolio.length > 0 && <button onClick={() => { setIsAddingFund(false); setEditingId(null); setSelectedFund(null); setNavData([]); setSearchQuery(''); }} className={styles.cancelBtn}>Cancel</button>}
          </>
          )}
        </>
      )}
    </div>
  );
};

export default InputSection;
