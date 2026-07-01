import React, { useMemo, useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useTrackerState } from '../hooks/useTrackerState';
import DualInput from './DualInput';
import styles from './WealthPlanner.module.css';
import CalculatorGuide from './CalculatorGuide';
import InputSection from './InputSection';
import ResultsSection from './ResultsSection';
import CalculatorLayout from './CalculatorLayout';
import WealthPlannerInsights from './WealthPlannerInsights';

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

  const [currentMenu, setCurrentMenu] = useState('SIP');
  const [activeTab, setActiveTab] = useState('primary');
  const [activeStrategy, setActiveStrategy] = useState('percent');
  const [loanPrepaymentStrategy, setLoanPrepaymentStrategy] = useState('yearly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputs, setInputs] = useState({
    sip: {
      amount: 5000,
      rate: 12,
      years: 10,
      stepUpPercent: 10,
      stepUpValue: 0,
      initialLumpsum: 0,
      inflationRate: 6,
    },
    lumpsum: { amount: 100000, rate: 12, years: 10 },
    rd: { monthlyDeposit: 5000, rate: 7, quarters: 20 },
    loan: { principal: 1000000, rate: 8.5, months: 120, yearlyExtra: 0, monthlyExtra: 0 },
    swp: {
      initialCorpus: 10000000,
      monthlyWithdrawal: 50000,
      annualRate: 8,
      stepUpPercent: 0,
    },
    goal: { targetAmount: 10000000, rate: 12, years: 10 },
  });

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

  const baseResults = useMemo(() => {
    if (currentMenu === 'SIP') {
      const sipData = calculateSIP(
        inputs.sip.amount,
        inputs.sip.rate,
        inputs.sip.years,
        activeStrategy === 'percent' ? inputs.sip.stepUpPercent : 0,
        activeStrategy === 'fixed' ? inputs.sip.stepUpValue : 0,
        inputs.sip.initialLumpsum,
        inputs.sip.inflationRate,
      );

      if (sipData) {
        const inflationDecimal = inputs.sip.inflationRate / 100;

        if (sipData.summary) {
          const discountFactor = Math.pow(1 + inflationDecimal, inputs.sip.years);
          sipData.summary.normalSip.inflationAdjustedValue =
            sipData.summary.normalSip.totalValue / discountFactor;
          sipData.summary.stepUpSip.inflationAdjustedValue =
            sipData.summary.stepUpSip.totalValue / discountFactor;
        }

        if (sipData.breakdown) {
          sipData.breakdown.forEach((item) => {
            const discountFactor = Math.pow(1 + inflationDecimal, item.year);
            if (item.normal) {
              item.normal.adjustedTotalValue = item.normal.totalValue / discountFactor;
            }
            if (item.stepUp) {
              item.stepUp.adjustedTotalValue = item.stepUp.totalValue / discountFactor;
            }
          });
        }
      }

      return sipData;
    }

    if (currentMenu === 'RD') {
      return calculateRD(inputs.rd.monthlyDeposit, inputs.rd.rate, inputs.rd.quarters);
    }

    if (currentMenu === 'Lumpsum') {
      return calculateLumpsum(inputs.lumpsum.amount, inputs.lumpsum.rate, inputs.lumpsum.years);
    }

    if (currentMenu === 'SWP') {
      return calculateSWP(
        inputs.swp.initialCorpus,
        inputs.swp.monthlyWithdrawal,
        inputs.swp.annualRate,
        inputs.swp.stepUpPercent,
      );
    }

    if (currentMenu === 'Goal') {
      return calculateGoalSIP(inputs.goal.targetAmount, inputs.goal.rate, inputs.goal.years);
    }

    if (currentMenu === 'Loan') {
      return calculateLoan(
        inputs.loan.principal,
        inputs.loan.rate,
        inputs.loan.months,
        loanPrepaymentStrategy === 'yearly' ? inputs.loan.yearlyExtra : 0,
        loanPrepaymentStrategy === 'monthly' ? inputs.loan.monthlyExtra : 0,
      );
    }

    if (currentMenu === 'Tracker') {
      return calculatePortfolio(portfolio);
    }

    return null;
  }, [
    activeStrategy,
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
  ]);

  const results = useMemo(() => {
    if (currentMenu === 'Tracker' && baseResults) {
      if (viewingId && baseResults.fundDetails) {
        return baseResults.fundDetails.find((item) => item.id === viewingId) || baseResults;
      }
      return baseResults;
    }
    return baseResults;
  }, [baseResults, currentMenu, viewingId]);

  const chartData = useMemo(() => {
    if (!results) return [];

    if (currentMenu === 'SIP') {
      return results.breakdown.map((item) => ({
        name: `Yr ${item.year}`,
        Invested: Number(
          activeTab === 'primary' ? item.stepUp.investedAmount : item.normal.investedAmount,
        ),
        TotalValue: Number(activeTab === 'primary' ? item.stepUp.totalValue : item.normal.totalValue),
        'Adjusted Value': Number(
          activeTab === 'primary'
            ? item.stepUp.adjustedTotalValue
            : item.normal.adjustedTotalValue,
        ),
      }));
    }

    if (currentMenu === 'RD') {
      return results.breakdown || [];
    }

    if (currentMenu === 'Loan' && results.breakdownWithPrepayment) {
      const withPrepayment = results.breakdownWithPrepayment;
      const withoutPrepayment = results.breakdownWithoutPrepayment;
      const withMap = new Map(withPrepayment.map((item) => [item.year, item.remainingBalance]));
      const withoutMap = new Map(
        withoutPrepayment.map((item) => [item.year, item.remainingBalance]),
      );

      const data = withoutPrepayment.map((_, index) => {
        const year = index + 1;
        return {
          name: `Yr ${year}`,
          'With Prepayment': withMap.get(year) ?? 0,
          'Without Prepayment': withoutMap.get(year) ?? 0,
        };
      });

      data.unshift({
        name: 'Start',
        'With Prepayment': inputs.loan.principal,
        'Without Prepayment': inputs.loan.principal,
      });

      return data;
    }

    if (currentMenu === 'SWP' && results.breakdownWithStepUp) {
      const withStepUp = new Map(
        results.breakdownWithStepUp.map((item) => [item.name, item.TotalValue]),
      );
      const withoutStepUp = new Map(
        results.breakdownWithoutStepUp.map((item) => [item.name, item.TotalValue]),
      );
      const maxYears = Math.max(
        results.breakdownWithStepUp.length,
        results.breakdownWithoutStepUp.length,
      );

      const data = Array.from({ length: maxYears }, (_, index) => {
        const yearName = `Year ${index + 1}`;
        return {
          name: yearName,
          'Stepped-Up Withdrawal': withStepUp.get(yearName) ?? 0,
          'Fixed Withdrawal': withoutStepUp.get(yearName) ?? 0,
        };
      });

      data.unshift({
        name: 'Start',
        'Stepped-Up Withdrawal': inputs.swp.initialCorpus,
        'Fixed Withdrawal': inputs.swp.initialCorpus,
      });

      return data;
    }

    if ((currentMenu === 'Goal' || currentMenu === 'Tracker') && results.breakdown) {
      return results.breakdown;
    }

    return [];
  }, [activeTab, currentMenu, inputs.loan.principal, inputs.swp.initialCorpus, results]);

  const showMiddlePane = currentMenu !== 'Tracker' || isAddingFund || portfolio.length === 0;
  const showRightPane = currentMenu !== 'Tracker' || isAddingFund || portfolio.length === 0;

  return (
    <CalculatorLayout
      currentMenu={currentMenu}
      setCurrentMenu={setCurrentMenu}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    >
      {currentMenu === 'Help' ? (
        <CalculatorGuide />
      ) : (
        <>
          <div
            className={`${styles.controlGrid} ${
              !showMiddlePane
                ? showRightPane
                  ? styles.controlGridExpanded
                  : styles.controlGridFull
                : ''
            }`}
          >
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
            />

            {showMiddlePane && (
              <div className={styles.innerCard}>
                {currentMenu === 'Loan' ? (
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
                        symbol="₹"
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
                        symbol="₹"
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
                ) : currentMenu === 'SIP' ? (
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
                        ₹
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
                        symbol="₹"
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
                ) : currentMenu === 'SWP' ? (
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
                ) : currentMenu === 'Tracker' && (isAddingFund || portfolio.length === 0) ? (
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
                        ₹
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
                        symbol="₹"
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
                ) : currentMenu !== 'Tracker' ? (
                  <p className={styles.noStrategyText}>No additional strategy available for this mode.</p>
                ) : null}
              </div>
            )}

            {showRightPane && (
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
          </div>

          <WealthPlannerInsights
            activeTab={activeTab}
            chartData={chartData}
            currentMenu={currentMenu}
            inputs={inputs}
            portfolio={portfolio}
            results={results}
            viewingId={viewingId}
          />
        </>
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
            ✕
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
