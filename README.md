# Financial Calculators (FinCalculators)

A comprehensive React-based financial planning dashboard designed to help users visualize and forecast various investment and loan scenarios. The application features interactive charts, detailed breakdown schedules, and comparison views for different financial strategies.

## Project Overview

The core component, `WealthPlanner`, aggregates five distinct financial calculators into a unified interface. It allows users to switch between modes (SIP, Lumpsum, RD, Loan, SWP) and dynamically updates charts and result cards based on user inputs.

## Getting Started

### Prerequisites
*   Node.js (v14 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/finCalculators.git
    cd finCalculators
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the application**
    ```bash
    npm start
    ```
    Open http://localhost:3000 to view it in the browser.

## Calculator Modules & Logic

### 1. SIP (Systematic Investment Plan)
Calculates the future value of monthly investments with options for annual increments.

*   **Inputs**: Monthly Amount, Expected Return (%), Tenure (Years), Initial Lumpsum, Inflation Rate.
*   **Calculations**:
    *   **Normal SIP**: Standard monthly compounding.
    *   **Step-Up SIP**: Increases the monthly contribution annually by a fixed percentage (%) or a fixed amount (₹).
    *   **Inflation Adjustment**: Discounts the future maturity value back to today's purchasing power using the assumed inflation rate.

#### Example Calculation
*   **Scenario**: Invest ₹5,000/month for 1 year at 12% annual return.
*   **Monthly Rate ($i$)**: $12\% / 12 = 1\% = 0.01$.
*   **Formula**: $FV = P \times \frac{(1+i)^n - 1}{i} \times (1+i)$
*   **Step-by-Step**:
    1.  $(1.01)^{12} \approx 1.1268$
    2.  $\frac{0.1268}{0.01} = 12.68$
    3.  $5000 \times 12.68 \times 1.01 \approx \text{₹}64,046$
*   **Result**: Total Invested: ₹60,000 | Wealth Gained: ~₹4,046.

### 2. Lumpsum
Calculates the growth of a one-time investment.

*   **Inputs**: Total Investment, Expected Return (%), Tenure.
*   **Calculations**: Uses the compound interest formula to determine the final maturity value over the specified period.

#### Example Calculation
*   **Scenario**: Invest ₹1,00,000 for 5 years at 12% annual return.
*   **Formula**: $A = P(1 + r)^t$
*   **Step-by-Step**:
    1.  $1 + 0.12 = 1.12$
    2.  $(1.12)^5 \approx 1.7623$
    3.  $100,000 \times 1.7623 = \text{₹}1,76,234$
*   **Result**: Total Invested: ₹1,00,000 | Wealth Gained: ₹76,234.

### 3. RD (Recurring Deposit)
Simulates a Recurring Deposit scheme where deposits are made monthly but compounded quarterly.

*   **Inputs**: Monthly Deposit, Interest Rate (%), Duration (Quarters).
*   **Calculations**: Computes the maturity value by accumulating interest on a quarterly basis, reflecting standard banking RD practices.

#### Example Calculation
*   **Scenario**: Deposit ₹5,000/month for 1 year (4 quarters) at 8% annual interest.
*   **Logic**:
    *   Interest is compounded quarterly.
    *   Month 1 deposit earns interest for 12 months.
    *   Month 2 deposit earns interest for 11 months.
    *   ...
    *   Month 12 deposit earns interest for 1 month.
*   **Result**: Total Invested: ₹60,000 | Maturity Value: ~₹62,647.

### 4. Loan (EMI & Prepayment)
A loan amortization tool that demonstrates the impact of extra payments on tenure and interest.

*   **Inputs**: Principal, Interest Rate (%), Tenure (Months).
*   **Prepayment Strategies**:
    *   **Yearly**: A lump sum paid once every year.
    *   **Monthly**: An additional amount added to every EMI.
*   **Calculations**:
    *   Generates two schedules: one for the base loan and one with prepayments.
    *   Calculates **Total Interest Saved** and **Months Saved** by comparing the two schedules.

#### Example Calculation
*   **Scenario**: Loan of ₹1,00,000 for 1 year at 12% interest.
*   **Formula**: $E = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$
    *   $r = 12\% / 12 = 0.01$
    *   $n = 12$
*   **Step-by-Step**:
    1.  $(1.01)^{12} \approx 1.1268$
    2.  $\frac{1.1268}{0.1268} \approx 8.88$
    3.  $100,000 \times 0.01 \times 8.88 \approx \text{₹}8,885$ (EMI)
*   **Result**: Total Payment: ₹1,06,620 | Total Interest: ₹6,620.

### 5. SWP (Systematic Withdrawal Plan)
Projects the lifespan of an investment corpus while making regular withdrawals.

*   **Inputs**: Initial Corpus, Monthly Withdrawal, Annual Return (%), Step-Up Percent.
*   **Calculations**:
    *   Deducts the withdrawal amount monthly.
    *   Accrues interest on the remaining balance.
    *   **Step-Up**: Increases the withdrawal amount annually to account for inflation.
    *   Determines exactly how long (Years & Months) the corpus will last before reaching zero.

#### Example Calculation
*   **Scenario**: Corpus ₹10,00,000, Withdraw ₹10,000/month, Return 10%.
*   **Monthly Logic**:
    1.  **Start Balance**: ₹10,00,000
    2.  **Withdraw**: -₹10,000 (Remaining: ₹9,90,000)
    3.  **Interest Added**: $9,90,000 \times (10\%/12) \approx \text{₹}8,250$
    4.  **End Balance**: ₹9,98,250
*   **Result**: The corpus decreases slowly because the withdrawal is slightly higher than the monthly interest earned.

## Tech Stack & Highlights
*   **Frontend Framework**: React.js
*   **State Management**: React Hooks (`useState`, `useMemo`) for efficient data handling.
*   **Visualization**: Recharts for responsive, interactive graphs.
*   **PDF Export**: `jspdf` and `html2canvas` for generating downloadable reports.
*   **Styling**: CSS Modules for scoped, maintainable styles.
*   **Responsive Design**: Mobile-first approach ensuring usability on all devices.

## Project Structure

```
finCalculators/
├── src/
│   ├── components/
│   │   ├── WealthPlanner.js       # Main calculator logic & UI
│   │   └── WealthPlanner.module.css # Component-specific styles
│   ├── App.js                     # Application root
│   └── index.js                   # Entry point
├── package.json                   # Dependencies and scripts
└── README.md                      # Project documentation
```