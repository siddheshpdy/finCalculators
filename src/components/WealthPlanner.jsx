import React, { Suspense, lazy } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useCalculatorState } from '../hooks/useCalculatorState';
import { useTrackerState } from '../hooks/useTrackerState';
import { useWealthPlannerResults } from '../hooks/useWealthPlannerResults';
import styles from './WealthPlanner.module.css';
import CalculatorLayout from './CalculatorLayout';
import CalculatorContent from './CalculatorContent';

const CalculatorGuide = lazy(() => import('./CalculatorGuide'));

const WealthPlanner = () => {
  const {
    calculateSIP,
    calculateRD,
    calculateLoan,
    calculateLumpsum,
    calculateSWP,
    calculatePortfolio,
    getFundList,
    getFundNAV,
    calculateGoalSIP,
  } = useFinance();

  const {
    activeStrategy,
    activeTab,
    currentMenu,
    inputs,
    isMobileMenuOpen,
    loanPrepaymentStrategy,
    setActiveStrategy,
    setActiveTab,
    setCurrentMenu,
    setInputs,
    setIsMobileMenuOpen,
    setLoanPrepaymentStrategy,
  } = useCalculatorState();

  const {
    confirmDelete,
    deleteConfirmationId,
    editingId,
    fileInputRef,
    fundList,
    handleAddToPortfolio,
    handleClearPortfolio,
    handleEditFund,
    handleFileChange,
    handleFundSelect,
    handleImportClick,
    handleRefreshFunds,
    handleRemoveFund,
    handleUndo,
    investmentMode,
    isAddingFund,
    navData,
    portfolio,
    searchQuery,
    selectedFund,
    setDeleteConfirmationId,
    setEditingId,
    setInvestmentMode,
    setIsAddingFund,
    setNavData,
    setSearchQuery,
    setSelectedFund,
    setShowClearConfirmation,
    setShowToast,
    setTrackerInputs,
    setViewingId,
    showClearConfirmation,
    showToast,
    trackerInputs,
    trackerLoading,
    viewingId,
  } = useTrackerState({ currentMenu, getFundList, getFundNAV });

  const { baseResults, results, chartData } = useWealthPlannerResults({
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
  });

  return (
    <CalculatorLayout
      currentMenu={currentMenu}
      setCurrentMenu={setCurrentMenu}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    >
      {currentMenu === 'Help' ? (
        <Suspense
          fallback={
            <div className={`${styles.innerCard} ${styles.loadingPanel}`}>
              <p className={styles.loadingPanelText}>Loading calculator guide...</p>
            </div>
          }
        >
          <CalculatorGuide />
        </Suspense>
      ) : (
        <CalculatorContent
          activeStrategy={activeStrategy}
          activeTab={activeTab}
          baseResults={baseResults}
          chartData={chartData}
          currentMenu={currentMenu}
          editingId={editingId}
          fundList={fundList}
          handleAddToPortfolio={handleAddToPortfolio}
          handleEditFund={handleEditFund}
          handleFundSelect={handleFundSelect}
          handleImportClick={handleImportClick}
          handleRefreshFunds={handleRefreshFunds}
          handleRemoveFund={handleRemoveFund}
          inputs={inputs}
          investmentMode={investmentMode}
          isAddingFund={isAddingFund}
          loanPrepaymentStrategy={loanPrepaymentStrategy}
          navData={navData}
          portfolio={portfolio}
          results={results}
          searchQuery={searchQuery}
          selectedFund={selectedFund}
          setActiveStrategy={setActiveStrategy}
          setActiveTab={setActiveTab}
          setEditingId={setEditingId}
          setInputs={setInputs}
          setInvestmentMode={setInvestmentMode}
          setIsAddingFund={setIsAddingFund}
          setLoanPrepaymentStrategy={setLoanPrepaymentStrategy}
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
      )}

      {deleteConfirmationId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Remove Fund?</h3>
            <p className={styles.modalText}>
              Are you sure you want to remove this fund from your portfolio? This action cannot
              be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className={`${styles.modalBtn} ${styles.modalCancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={`${styles.modalBtn} ${styles.modalDeleteBtn}`}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Clear Entire Portfolio?</h3>
            <p className={styles.modalText}>
              Are you sure you want to remove ALL funds from your portfolio? This action is
              permanent and cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowClearConfirmation(false)}
                className={`${styles.modalBtn} ${styles.modalCancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={handleClearPortfolio}
                className={`${styles.modalBtn} ${styles.modalDeleteBtn}`}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className={styles.toast}>
          <span>Fund removed</span>
          <button onClick={handleUndo} className={styles.undoBtn}>
            Undo
          </button>
          <button onClick={() => setShowToast(false)} className={styles.closeToastBtn}>
            &times;
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleFileChange}
      />
    </CalculatorLayout>
  );
};

export default WealthPlanner;
