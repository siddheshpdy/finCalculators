# Future Enhancements for FinCalculators

Based on the repository analysis, the following enhancements are recommended to improve architecture, features, performance, and code quality.

## 1. Architectural Enhancements

### A. Component Decomposition (Refactoring `WealthPlanner.jsx`)
The `WealthPlanner.jsx` file currently acts as a "God Component," handling routing, state, UI layout, and logic for five different calculators plus a portfolio tracker.
- [ ] **Recommendation**: Split the component into smaller, focused sub-components.
    - [ ] `CalculatorLayout.jsx`: Handles the sidebar and main grid layout.
    - [x] `InputSection.jsx`: Renders the `DualInput` fields based on the active calculator configuration.
    - [ ] `ResultsSection.jsx`: Renders the `ResultCard` grid.
    - [x] `PortfolioTracker.jsx`: Isolate the entire "Tracker" logic (search, table, import/export) into its own component.

### B. TypeScript Migration
Financial applications rely heavily on precise data structures and number handling.
- [ ] **Recommendation**: Migrate `useFinance.js` and `WealthPlanner.jsx` to TypeScript. Defining interfaces for `SIPResult`, `LoanResult`, and `PortfolioItem` will prevent runtime errors and make the complex data flow easier to maintain.

### C. Standardized Calculation Interface
Currently, `useFinance.js` returns different structures for different calculators.
- [ ] **Recommendation**: Standardize the return signature for all calculation hooks (e.g., returning a consistent object with `metrics`, `chartData`, and `tableData`). This allows for dynamic rendering of inputs and results based on configuration objects.

## 2. Feature Enhancements

### A. Taxation Support
The current calculators show pre-tax returns.
- [ ] **Recommendation**: Add a "Tax Bracket" or "Tax Regime" toggle (LTCG/STCG for mutual funds). Apply tax rules to the final maturity value or XIRR calculation to show "Post-Tax Returns".

### B. Goal-Based Planning (Reverse Calculator)
Users often know *what* they want (e.g., ₹1 Crore in 10 years) but not *how* to get there.
- [ ] **Recommendation**: Add a "Goal Planner" mode. Given `Target Amount`, `Tenure`, and `Rate`, calculate the required `Monthly SIP`.

### C. PDF Export
- [ ] **Recommendation**: Allow users to download a PDF report of their financial plan, including the chart and the breakdown table, using libraries like `jspdf` or `html2canvas`.

### D. Inflation Toggle
The SIP calculator calculates `inflationAdjustedValue` but the UI for it is currently commented out.
- [ ] **Recommendation**: Enable a global "Adjust for Inflation" toggle in the UI that updates all relevant result cards and charts to show "Real Value" vs "Nominal Value".

## 3. Performance & Logic Improvements

### A. Web Workers for XIRR
The `calculateXIRR` function uses an iterative Newton-Raphson method which can block the main thread for large portfolios.
- [ ] **Recommendation**: Move the XIRR calculation to a Web Worker so the UI remains responsive during heavy calculations.

### B. IndexedDB for Caching
`useFinance.js` currently uses `localStorage` to cache fund lists and NAV data, which is synchronous and has a 5MB limit.
- [ ] **Recommendation**: Use `idb` (IndexedDB) for caching historical NAV data. This allows storing much larger datasets (e.g., 10+ years of history for multiple funds) without hitting quota limits.

### C. Virtualization for Tracker Table
- [ ] **Recommendation**: Use `react-window` or `react-virtuoso` to virtualize the tracker table rendering. This improves performance when users import large CSVs with many transactions.

## 4. Code Quality & Testing

### A. Unit Testing
There are no tests visible in the repository.
- [ ] **Recommendation**: Add unit tests for `useFinance.js` using Jest or Vitest. Financial logic must be tested against known scenarios to ensure accuracy.

### B. Error Handling
The API calls in `useFinance.js` catch errors but only log them to the console.
- [ ] **Recommendation**: Expose an `error` state from `useFinance` and display user-friendly toast notifications in `WealthPlanner` when an API call fails (e.g., "Failed to fetch NAV data").