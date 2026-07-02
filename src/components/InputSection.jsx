import React, { Suspense, lazy } from 'react';
import DualInput from './DualInput';
import StrategyPanel from './StrategyPanel';
import styles from './WealthPlanner.module.css';

const TrackerContent = lazy(() => import('./TrackerContent'));

const InputSection = ({
  currentMenu,
  inputs,
  setInputs,
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
  setNavData,
  trackerLoading,
  handleRefreshFunds,
  handleFundSelect,
  handleImportClick,
  handleAddToPortfolio,
  baseResults,
  viewingId,
  setViewingId,
  handleEditFund,
  handleRemoveFund,
  setShowClearConfirmation,
  activeStrategy,
  setActiveStrategy,
  loanPrepaymentStrategy,
  setLoanPrepaymentStrategy,
}) => {
  const isTrackerMenu = currentMenu === 'Tracker';
  const showMergedStrategySection =
    currentMenu === 'SIP' ||
    currentMenu === 'SWP' ||
    currentMenu === 'Loan' ||
    (currentMenu === 'Tracker' && (isAddingFund || portfolio.length === 0));
  const cardHeading = isTrackerMenu ? 'Portfolio Workspace' : `${currentMenu} Details`;
  const sectionIntro = isTrackerMenu
    ? portfolio.length > 0 && !isAddingFund
      ? 'Review your saved holdings, jump into a fund, or add a new entry without leaving the main workspace.'
      : 'Search for a fund, set your contribution details, and build the same clean top-down workflow used across the calculators.'
    : 'Adjust the assumptions below to update the projection and comparison panel.';

  return (
    <div className={styles.innerCard}>
      <p className={styles.cardHeading}>{cardHeading}</p>
      <p className={styles.sectionIntro}>{sectionIntro}</p>

      {currentMenu === 'SIP' && (
        <div className={styles.inputFieldsGrid}>
          <DualInput
            label="Initial Lumpsum"
            symbol={'\u20B9'}
            value={inputs.sip.initialLumpsum}
            min={0}
            max={1000000}
            step={5000}
            onChange={(value) =>
              setInputs({ ...inputs, sip: { ...inputs.sip, initialLumpsum: value } })
            }
          />
          <DualInput
            label="Monthly SIP"
            symbol={'\u20B9'}
            value={inputs.sip.amount}
            min={500}
            max={100000}
            step={500}
            onChange={(value) => setInputs({ ...inputs, sip: { ...inputs.sip, amount: value } })}
          />
          <DualInput
            label="Expected Return"
            symbol="%"
            value={inputs.sip.rate}
            min={1}
            max={30}
            step={0.5}
            onChange={(value) => setInputs({ ...inputs, sip: { ...inputs.sip, rate: value } })}
          />
          <DualInput
            label="Tenure"
            symbol="Yrs"
            value={inputs.sip.years}
            min={1}
            max={40}
            step={1}
            onChange={(value) => setInputs({ ...inputs, sip: { ...inputs.sip, years: value } })}
          />
        </div>
      )}

      {currentMenu === 'Lumpsum' && (
        <div className={styles.inputFieldsGrid}>
          <DualInput
            label="Total Investment"
            symbol={'\u20B9'}
            value={inputs.lumpsum.amount}
            min={5000}
            max={10000000}
            step={5000}
            onChange={(value) =>
              setInputs({ ...inputs, lumpsum: { ...inputs.lumpsum, amount: value } })
            }
          />
          <DualInput
            label="Expected Return"
            symbol="%"
            value={inputs.lumpsum.rate}
            min={1}
            max={30}
            step={0.5}
            onChange={(value) =>
              setInputs({ ...inputs, lumpsum: { ...inputs.lumpsum, rate: value } })
            }
          />
          <DualInput
            label="Tenure"
            symbol="Yrs"
            value={inputs.lumpsum.years}
            min={1}
            max={40}
            step={1}
            onChange={(value) =>
              setInputs({ ...inputs, lumpsum: { ...inputs.lumpsum, years: value } })
            }
          />
        </div>
      )}

      {currentMenu === 'RD' && (
        <div className={styles.inputFieldsGrid}>
          <DualInput
            label="Monthly Deposit"
            symbol={'\u20B9'}
            value={inputs.rd.monthlyDeposit}
            min={500}
            max={100000}
            step={500}
            onChange={(value) =>
              setInputs({ ...inputs, rd: { ...inputs.rd, monthlyDeposit: value } })
            }
          />
          <DualInput
            label="Interest Rate"
            symbol="%"
            value={inputs.rd.rate}
            min={1}
            max={15}
            step={0.1}
            onChange={(value) => setInputs({ ...inputs, rd: { ...inputs.rd, rate: value } })}
          />
          <DualInput
            label="Duration"
            symbol="Qtr"
            value={inputs.rd.quarters}
            min={1}
            max={80}
            step={1}
            onChange={(value) =>
              setInputs({ ...inputs, rd: { ...inputs.rd, quarters: value } })
            }
          />
        </div>
      )}

      {currentMenu === 'Loan' && (
        <div className={styles.inputFieldsGrid}>
          <DualInput
            label="Principal"
            symbol={'\u20B9'}
            value={inputs.loan.principal}
            min={100000}
            max={10000000}
            step={50000}
            onChange={(value) =>
              setInputs({ ...inputs, loan: { ...inputs.loan, principal: value } })
            }
          />
          <DualInput
            label="Interest Rate"
            symbol="%"
            value={inputs.loan.rate}
            min={5}
            max={20}
            step={0.1}
            onChange={(value) => setInputs({ ...inputs, loan: { ...inputs.loan, rate: value } })}
          />
          <DualInput
            label="Tenure"
            symbol="Mo"
            value={inputs.loan.months}
            min={12}
            max={360}
            step={12}
            onChange={(value) =>
              setInputs({ ...inputs, loan: { ...inputs.loan, months: value } })
            }
          />
        </div>
      )}

      {currentMenu === 'SWP' && (
        <div className={styles.inputFieldsGrid}>
          <DualInput
            label="Initial Corpus"
            symbol={'\u20B9'}
            value={inputs.swp.initialCorpus}
            min={100000}
            max={50000000}
            step={100000}
            onChange={(value) =>
              setInputs({ ...inputs, swp: { ...inputs.swp, initialCorpus: value } })
            }
          />
          <DualInput
            label="Monthly Withdrawal"
            symbol={'\u20B9'}
            value={inputs.swp.monthlyWithdrawal}
            min={1000}
            max={200000}
            step={1000}
            onChange={(value) =>
              setInputs({ ...inputs, swp: { ...inputs.swp, monthlyWithdrawal: value } })
            }
          />
          <DualInput
            label="Expected Return"
            symbol="%"
            value={inputs.swp.annualRate}
            min={1}
            max={20}
            step={0.5}
            onChange={(value) =>
              setInputs({ ...inputs, swp: { ...inputs.swp, annualRate: value } })
            }
          />
        </div>
      )}

      {currentMenu === 'Goal' && (
        <div className={styles.inputFieldsGrid}>
          <DualInput
            label="Target Amount"
            symbol={'\u20B9'}
            value={inputs.goal.targetAmount}
            min={100000}
            max={500000000}
            step={100000}
            onChange={(value) =>
              setInputs({ ...inputs, goal: { ...inputs.goal, targetAmount: value } })
            }
          />
          <DualInput
            label="Expected Return"
            symbol="%"
            value={inputs.goal.rate}
            min={1}
            max={30}
            step={0.5}
            onChange={(value) => setInputs({ ...inputs, goal: { ...inputs.goal, rate: value } })}
          />
          <DualInput
            label="Time Period"
            symbol="Yrs"
            value={inputs.goal.years}
            min={1}
            max={40}
            step={1}
            onChange={(value) => setInputs({ ...inputs, goal: { ...inputs.goal, years: value } })}
          />
        </div>
      )}

      {isTrackerMenu && (
        <Suspense fallback={<p className={styles.loadingPanelText}>Loading tracker workspace...</p>}>
          <TrackerContent
            baseResults={baseResults}
            editingId={editingId}
            fundList={fundList}
            handleAddToPortfolio={handleAddToPortfolio}
            handleEditFund={handleEditFund}
            handleFundSelect={handleFundSelect}
            handleImportClick={handleImportClick}
            handleRefreshFunds={handleRefreshFunds}
            handleRemoveFund={handleRemoveFund}
            investmentMode={investmentMode}
            isAddingFund={isAddingFund}
            portfolio={portfolio}
            searchQuery={searchQuery}
            selectedFund={selectedFund}
            setEditingId={setEditingId}
            setInvestmentMode={setInvestmentMode}
            setIsAddingFund={setIsAddingFund}
            setNavData={setNavData}
            setSearchQuery={setSearchQuery}
            setSelectedFund={setSelectedFund}
            setShowClearConfirmation={setShowClearConfirmation}
            setTrackerInputs={setTrackerInputs}
            setViewingId={setViewingId}
            trackerInputs={trackerInputs}
            trackerLoading={trackerLoading}
            viewingId={viewingId}
          />
        </Suspense>
      )}

      {showMergedStrategySection && (
        <div className={styles.mergedStrategySection}>
          <StrategyPanel
            activeStrategy={activeStrategy}
            currentMenu={currentMenu}
            inputs={inputs}
            isAddingFund={isAddingFund}
            loanPrepaymentStrategy={loanPrepaymentStrategy}
            portfolio={portfolio}
            setActiveStrategy={setActiveStrategy}
            setInputs={setInputs}
            setLoanPrepaymentStrategy={setLoanPrepaymentStrategy}
            setTrackerInputs={setTrackerInputs}
            trackerInputs={trackerInputs}
          />
        </div>
      )}
    </div>
  );
};

export default InputSection;
