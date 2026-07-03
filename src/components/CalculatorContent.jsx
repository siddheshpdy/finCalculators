import React, { Suspense, lazy } from 'react';
import styles from './WealthPlanner.module.css';
import CalculatorModeHeader from './CalculatorModeHeader';
import InputSection from './InputSection';
import ResultsSection from './ResultsSection';

const WealthPlannerInsights = lazy(() => import('./WealthPlannerInsights'));

const CalculatorContent = ({
  activeStrategy,
  activeTab,
  baseResults,
  chartData,
  currentMenu,
  editingId,
  fundList,
  handleAddToPortfolio,
  handleEditFund,
  handleFundSelect,
  handleImportClick,
  handleRefreshFunds,
  handleRemoveFund,
  inputs,
  investmentMode,
  isAddingFund,
  loanPrepaymentStrategy,
  navData,
  portfolio,
  results,
  searchQuery,
  selectedFund,
  setActiveStrategy,
  setActiveTab,
  setEditingId,
  setInputs,
  setInvestmentMode,
  setIsAddingFund,
  setLoanPrepaymentStrategy,
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
  const hasTrackerPortfolio = currentMenu === 'Tracker' && portfolio.length > 0;
  const showSummaryPane = currentMenu !== 'Tracker' || isAddingFund || portfolio.length === 0;
  const showInsightsPane =
    currentMenu === 'SIP' ||
    currentMenu === 'RD' ||
    currentMenu === 'SWP' ||
    currentMenu === 'Goal' ||
    hasTrackerPortfolio ||
    (currentMenu === 'Loan' &&
      (inputs.loan.yearlyExtra > 0 || inputs.loan.monthlyExtra > 0));
  const showOutputPane = showSummaryPane || showInsightsPane;
  const workspaceClassName = `${styles.workspaceGrid} ${styles.workspaceGridTopForm}`;
  const setupColumnClassName = `${styles.setupColumn} ${styles.setupColumnTop}`;

  return (
    <>
      <CalculatorModeHeader
        currentMenu={currentMenu}
        inputs={inputs}
        portfolio={portfolio}
        investmentMode={investmentMode}
        isAddingFund={isAddingFund}
        loanPrepaymentStrategy={loanPrepaymentStrategy}
      />

      <div className={workspaceClassName}>
        <div className={setupColumnClassName}>
          <InputSection
            currentMenu={currentMenu}
            inputs={inputs}
            setInputs={setInputs}
            portfolio={portfolio}
            isAddingFund={isAddingFund}
            setIsAddingFund={setIsAddingFund}
            editingId={editingId}
            setEditingId={setEditingId}
            trackerInputs={trackerInputs}
            setTrackerInputs={setTrackerInputs}
            investmentMode={investmentMode}
            setInvestmentMode={setInvestmentMode}
            fundList={fundList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFund={selectedFund}
            setSelectedFund={setSelectedFund}
            navData={navData}
            setNavData={setNavData}
            trackerLoading={trackerLoading}
            handleRefreshFunds={handleRefreshFunds}
            handleFundSelect={handleFundSelect}
            handleImportClick={handleImportClick}
            handleAddToPortfolio={handleAddToPortfolio}
            baseResults={baseResults}
            viewingId={viewingId}
            setViewingId={setViewingId}
            handleEditFund={handleEditFund}
            handleRemoveFund={handleRemoveFund}
            setShowClearConfirmation={setShowClearConfirmation}
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
            loanPrepaymentStrategy={loanPrepaymentStrategy}
            setLoanPrepaymentStrategy={setLoanPrepaymentStrategy}
          />
        </div>

        {showOutputPane && (
          <div className={styles.outputColumn}>
            {showSummaryPane && (
              <ResultsSection
                currentMenu={currentMenu}
                results={results}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                inputs={inputs}
                viewingId={viewingId}
                portfolio={portfolio}
              />
            )}

            <Suspense
              fallback={
                <div className={`${styles.innerCard} ${styles.loadingPanel}`}>
                  <p className={styles.loadingPanelText}>Loading charts and breakdowns...</p>
                </div>
              }
            >
              <WealthPlannerInsights
                activeTab={activeTab}
                chartData={chartData}
                currentMenu={currentMenu}
                inputs={inputs}
                portfolio={portfolio}
                results={results}
                viewingId={viewingId}
              />
            </Suspense>
          </div>
        )}
      </div>
    </>
  );
};

export default CalculatorContent;
