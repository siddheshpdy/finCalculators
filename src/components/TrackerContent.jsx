import React, { useDeferredValue, useState } from 'react';
import DualInput from './DualInput';
import PortfolioTracker from './PortfolioTracker';
import styles from './WealthPlanner.module.css';

const DEFAULT_TRACKER_INPUTS = {
  startDate: '2020-01-01',
  endDate: '',
  amount: 5000,
  lumpsum: 0,
  stepUpPercent: 0,
  stepUpValue: 0,
};

const TrackerContent = ({
  baseResults,
  editingId,
  fundList,
  handleAddToPortfolio,
  handleEditFund,
  handleFundSelect,
  handleImportClick,
  handleRefreshFunds,
  handleRemoveFund,
  investmentMode,
  isAddingFund,
  portfolio,
  searchQuery,
  selectedFund,
  setEditingId,
  setInvestmentMode,
  setIsAddingFund,
  setNavData,
  setSearchQuery,
  setSelectedFund,
  setShowClearConfirmation,
  setTrackerInputs,
  setViewingId,
  trackerInputs,
  trackerLoading,
  viewingId,
}) => {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const deferredQuery = useDeferredValue(searchQuery.trim());
  const normalizedQuery = deferredQuery.toLowerCase();
  const matchingFunds =
    normalizedQuery.length > 1
      ? fundList
          .filter((fund) => fund.schemeName.toLowerCase().includes(normalizedQuery))
          .slice(0, 12)
      : [];
  const showSuggestions = !selectedFund && searchQuery.trim().length > 1;

  const handleSelectSuggestion = (fund) => {
    setActiveSuggestionIndex(-1);
    handleFundSelect(fund);
  };

  const handleAddNewFund = () => {
    setIsAddingFund(true);
    setEditingId(null);
    setSelectedFund(null);
    setNavData([]);
    setSearchQuery('');
    setTrackerInputs({ ...DEFAULT_TRACKER_INPUTS });
    setInvestmentMode('SIP');
  };

  if (!isAddingFund && portfolio.length > 0) {
    return (
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
    );
  }

  return (
    <>
      {!selectedFund ? (
        <>
          <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
              <div>
                <label className={styles.label}>Search Mutual Fund</label>
                <p className={styles.controlHint}>
                  Pick a fund from the AMFI list or import an existing portfolio file.
                </p>
              </div>
              <button
                onClick={handleRefreshFunds}
                className={styles.refreshBtn}
                title="Force Refresh List"
                aria-label="Refresh fund list"
              >
                &#x21bb;
              </button>
            </div>
            <input
              type="text"
              placeholder="Start typing fund name..."
              value={searchQuery}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="fund-suggestion-list"
              onChange={(event) => {
                const value = event.target.value;
                setSearchQuery(value);
                const match = fundList.find((fund) => fund.schemeName === value);
                if (match) {
                  handleSelectSuggestion(match);
                }
              }}
              onKeyDown={(event) => {
                if (!showSuggestions || matchingFunds.length === 0) {
                  return;
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setActiveSuggestionIndex((currentIndex) =>
                    currentIndex < 0 || currentIndex >= matchingFunds.length - 1
                      ? 0
                      : currentIndex + 1,
                  );
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setActiveSuggestionIndex((currentIndex) =>
                    currentIndex <= 0 ? matchingFunds.length - 1 : currentIndex - 1,
                  );
                }

                if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
                  event.preventDefault();
                  handleSelectSuggestion(matchingFunds[activeSuggestionIndex]);
                }

                if (event.key === 'Escape') {
                  setActiveSuggestionIndex(-1);
                }
              }}
              className={styles.searchInput}
            />
            {showSuggestions && (
              <div
                id="fund-suggestion-list"
                className={styles.searchResultsPanel}
                role="listbox"
                aria-label="Fund suggestions"
              >
                {matchingFunds.length > 0 ? (
                  matchingFunds.map((fund, index) => (
                    <button
                      key={fund.schemeCode}
                      type="button"
                      role="option"
                      aria-selected={index === activeSuggestionIndex}
                      className={`${styles.searchResultBtn} ${
                        index === activeSuggestionIndex ? styles.searchResultBtnActive : ''
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(fund)}
                    >
                      <span className={styles.searchResultName}>{fund.schemeName}</span>
                      <span className={styles.searchResultCode}>#{fund.schemeCode}</span>
                    </button>
                  ))
                ) : (
                  <p className={styles.searchEmptyState}>
                    No matching funds found. Try a broader fund name.
                  </p>
                )}
              </div>
            )}
            {trackerLoading && <p className={styles.loadingText}>Loading funds...</p>}
          </div>

          <div className={styles.sectionDivider} aria-hidden="true">
            <div className={styles.sectionDividerLine}></div>
            <span className={styles.sectionDividerText}>Or</span>
            <div className={styles.sectionDividerLine}></div>
          </div>

          <button onClick={handleImportClick} className={`${styles.importBtn} ${styles.importBtnFull}`}>
            Import Portfolio from CSV
          </button>
        </>
      ) : (
        <div className={styles.selectedFundBox}>
          <div className={styles.selectedFundHeader}>
            <strong>{selectedFund.schemeName}</strong>
            <button
              onClick={() => {
                setSelectedFund(null);
                setNavData([]);
              }}
              className={styles.changeBtn}
            >
              Change
            </button>
          </div>
          <p className={styles.controlHint}>
            Historical NAV data from the selected fund will power the portfolio projection.
          </p>
          {trackerLoading && (
            <div className={styles.fetchingText}>Fetching historical NAV data...</div>
          )}
        </div>
      )}

      <div className={styles.inputGroup}>
        <label className={styles.label}>Investment Dates</label>
        <p className={styles.controlHint}>
          Set the contribution window for the selected fund entry.
        </p>
        <div className={styles.dateGrid}>
          <div className={styles.inputGroupCompact}>
            <label className={styles.fieldLabel}>Start Date</label>
            <input
              type="date"
              value={trackerInputs.startDate}
              onChange={(event) =>
                setTrackerInputs({ ...trackerInputs, startDate: event.target.value })
              }
              className={styles.dateInput}
            />
          </div>
          {(investmentMode === 'SIP' || investmentMode === 'Both') && (
            <div className={styles.inputGroupCompact}>
              <label className={styles.fieldLabel}>SIP End Date (Optional)</label>
              <input
                type="date"
                value={trackerInputs.endDate || ''}
                onChange={(event) =>
                  setTrackerInputs({ ...trackerInputs, endDate: event.target.value })
                }
                className={styles.dateInput}
                placeholder="Leave blank if ongoing"
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Investment Type</label>
        <p className={styles.controlHint}>
          Choose whether this position is tracked as SIP, lumpsum, or both.
        </p>
        <div className={styles.toggleWrapper}>
          <button
            onClick={() => {
              setInvestmentMode('SIP');
              setTrackerInputs((current) => ({
                ...current,
                lumpsum: 0,
                amount: current.amount || 5000,
              }));
            }}
            className={`${styles.toggleBtn} ${
              investmentMode === 'SIP' ? styles.toggleBtnActive : ''
            }`}
          >
            SIP
          </button>
          <button
            onClick={() => {
              setInvestmentMode('Lumpsum');
              setTrackerInputs((current) => ({
                ...current,
                amount: 0,
                lumpsum: current.lumpsum || 50000,
              }));
            }}
            className={`${styles.toggleBtn} ${
              investmentMode === 'Lumpsum' ? styles.toggleBtnActive : ''
            }`}
          >
            Lumpsum
          </button>
          <button
            onClick={() => {
              setInvestmentMode('Both');
              setTrackerInputs((current) => ({
                ...current,
                amount: current.amount || 5000,
                lumpsum: current.lumpsum || 50000,
              }));
            }}
            className={`${styles.toggleBtn} ${
              investmentMode === 'Both' ? styles.toggleBtnActive : ''
            }`}
          >
            Both
          </button>
        </div>
      </div>

      {(investmentMode === 'SIP' || investmentMode === 'Both') && (
        <DualInput
          label="Monthly SIP"
          symbol={'\u20B9'}
          value={trackerInputs.amount}
          min={0}
          max={100000}
          step={500}
          onChange={(value) => setTrackerInputs({ ...trackerInputs, amount: value })}
        />
      )}

      {(investmentMode === 'Lumpsum' || investmentMode === 'Both') && (
        <DualInput
          label="Initial Lumpsum"
          symbol={'\u20B9'}
          value={trackerInputs.lumpsum}
          min={0}
          max={1000000}
          step={5000}
          onChange={(value) => setTrackerInputs({ ...trackerInputs, lumpsum: value })}
        />
      )}

      <div className={styles.formActionStack}>
        <button
          onClick={handleAddToPortfolio}
          disabled={!selectedFund || trackerLoading}
          className={styles.addFundBtn}
        >
          {trackerLoading ? 'Loading...' : editingId ? 'Update Portfolio' : 'Add to Portfolio'}
        </button>

        {portfolio.length > 0 && (
          <button
            onClick={() => {
              setIsAddingFund(false);
              setEditingId(null);
              setSelectedFund(null);
              setNavData([]);
              setSearchQuery('');
            }}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        )}
      </div>
    </>
  );
};

export default TrackerContent;
