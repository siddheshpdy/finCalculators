import React from 'react';
import styles from './WealthPlanner.module.css';

const CalculatorGuide = () => {
  return (
    <div className={styles.guideContainer}>
      <h2 className={styles.guideTitle}>Financial Calculators Guide</h2>
      <p className={styles.guideIntro}>
        Understanding the logic behind your financial planning is crucial. Below is a detailed breakdown of how each calculator works, including the formulas used.
      </p>

      {/* 1. SIP Section */}
      <div className={styles.guideSection}>
        <h3 className={styles.sectionTitle}>1. SIP (Systematic Investment Plan)</h3>
        <p>Calculates the future value of monthly investments with options for annual increments (Step-Up).</p>
        <ul className={styles.guideList}>
          <li><strong>Inputs:</strong> Monthly Amount, Expected Return (%), Tenure (Years), Initial Lumpsum, Inflation Rate.</li>
          <li><strong>Step-Up SIP:</strong> Increases the monthly contribution annually by a fixed percentage or amount.</li>
        </ul>
        
        <div className={styles.exampleBox}>
          <h4>Example Calculation</h4>
          <p><strong>Scenario:</strong> Invest ₹5,000/month for 1 year at 12% annual return.</p>
          <p><strong>Monthly Rate (i):</strong> 12% / 12 = 1% = 0.01</p>
          <p><strong>Formula:</strong> <span className={styles.formula}>FV = P × [((1+i)^n - 1) / i] × (1+i)</span></p>
          <p><strong>Result:</strong> ₹5,000 × 12.68 × 1.01 ≈ <strong>₹64,046</strong></p>
        </div>
      </div>

      {/* 2. Lumpsum Section */}
      <div className={styles.guideSection}>
        <h3 className={styles.sectionTitle}>2. Lumpsum</h3>
        <p>Calculates the compound growth of a one-time investment over a specific tenure.</p>
        
        <div className={styles.exampleBox}>
          <h4>Example Calculation</h4>
          <p><strong>Scenario:</strong> Invest ₹1,00,000 for 5 years at 12% annual return.</p>
          <p><strong>Formula:</strong> <span className={styles.formula}>A = P(1 + r)^t</span></p>
          <p><strong>Calculation:</strong> 1,00,000 × (1.12)^5 ≈ 1,00,000 × 1.7623</p>
          <p><strong>Result:</strong> Maturity Value ≈ <strong>₹1,76,234</strong></p>
        </div>
      </div>

      {/* 3. RD Section */}
      <div className={styles.guideSection}>
        <h3 className={styles.sectionTitle}>3. RD (Recurring Deposit)</h3>
        <p>Simulates a standard bank RD where deposits are made monthly but interest is compounded quarterly.</p>
        
        <div className={styles.exampleBox}>
          <h4>Example Calculation</h4>
          <p><strong>Scenario:</strong> Deposit ₹5,000/month for 1 year at 8%.</p>
          <p><strong>Logic:</strong> The first month's deposit earns interest for 12 months, the second for 11 months, and so on. Interest is compounded every quarter.</p>
          <p><strong>Result:</strong> Total Invested: ₹60,000 | Maturity Value: <strong>~₹62,647</strong></p>
        </div>
      </div>

      {/* 4. Loan Section */}
      <div className={styles.guideSection}>
        <h3 className={styles.sectionTitle}>4. Loan (EMI & Prepayment)</h3>
        <p>A loan amortization tool that demonstrates how extra payments (prepayments) can reduce your tenure and total interest.</p>
        
        <div className={styles.exampleBox}>
          <h4>Example Calculation</h4>
          <p><strong>Scenario:</strong> Loan of ₹1,00,000 for 1 year at 12% interest.</p>
          <p><strong>Formula:</strong> <span className={styles.formula}>E = P × r × [(1+r)^n / ((1+r)^n - 1)]</span></p>
          <p><strong>Calculation:</strong> 1,00,000 × 0.01 × 8.8849</p>
          <p><strong>Result:</strong> EMI ≈ <strong>₹8,885</strong></p>
        </div>
      </div>

      {/* 5. SWP Section */}
      <div className={styles.guideSection}>
        <h3 className={styles.sectionTitle}>5. SWP (Systematic Withdrawal Plan)</h3>
        <p>Projects how long an investment corpus will last while making regular monthly withdrawals.</p>
        
        <div className={styles.exampleBox}>
          <h4>Example Calculation</h4>
          <p><strong>Scenario:</strong> Corpus ₹10L, Withdraw ₹10k/month, Return 10%.</p>
          <p><strong>Logic:</strong> Each month, the withdrawal is deducted, and interest is added to the remaining balance. If withdrawal &gt; interest, the corpus depletes over time.</p>
        </div>
      </div>
    </div>
  );
};

export default CalculatorGuide;