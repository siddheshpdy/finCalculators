# FinCalculators

FinCalculators is a React + Vite financial planning dashboard for exploring investment, withdrawal, loan, and mutual-fund portfolio scenarios. It combines projection calculators with charts, breakdown tables, and a mutual-fund tracker backed by historical NAV data.

## What the App Includes

The current app includes these modes:

- `SIP`: standard vs step-up SIP projections, with optional initial lumpsum and inflation-adjusted values in the calculation layer
- `Lumpsum`: one-time investment growth
- `RD`: recurring deposit growth with quarterly compounding logic
- `Loan`: EMI calculation plus yearly or monthly prepayment comparison
- `SWP`: corpus depletion planning with optional annual withdrawal step-up
- `Goal`: reverse calculator for required SIP toward a target amount
- `Tracker`: mutual-fund portfolio tracking using historical NAV data, XIRR, CSV import/export, and per-fund drilldown
- `Help`: in-app calculator guide and formulas

## Tech Stack

- `React 19`
- `Vite 7`
- `decimal.js` for calculation precision
- `Recharts` for charts
- `Vitest` + Testing Library for tests
- `ESLint` for linting

## Project Status

The project currently passes:

- `npm run lint`
- `npm run test`
- `npm run build`

The production build is now split into smaller feature chunks for the help guide, tracker workspace, chart/breakdown panels, and shared math/chart dependencies.

## Getting Started

### Prerequisites

- `Node.js` 18+ recommended
- `npm`

### Install

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

Vite will print the local development URL, which is usually `http://localhost:5173`.

### Direct calculator URLs

Each calculator mode can be opened directly by path:

- `/sip`
- `/lumpsum`
- `/rd`
- `/loan`
- `/swp`
- `/goal`
- `/tracker`
- `/help`

The root path `/` still opens the default SIP view.

### Other scripts

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## Portfolio Tracker Notes

The tracker mode:

- caches the mutual-fund list in `localStorage`
- stores the saved portfolio in `localStorage`
- fetches fund list and NAV history from `https://api.mfapi.in`
- includes searchable fund suggestions with keyboard-friendly selection
- supports CSV import and export for portfolio entries

CSV import expects a header row and works best when the file includes:

- `Scheme Code` or fund name
- `Start Date`
- optional SIP amount
- optional lumpsum amount
- optional end date

## Project Structure

```text
src/
  App.jsx
  main.jsx
  index.css
  hooks/
    useCalculatorState.js
    useFinance.js
    useFinance.test.js
    useTrackerState.js
    useWealthPlannerResults.js
  components/
    CalculatorContent.jsx
    CalculatorGuide.jsx
    CalculatorLayout.jsx
    CalculatorModeHeader.jsx
    DualInput.jsx
    InputSection.jsx
    PortfolioTracker.jsx
    ResultCard.jsx
    ResultsSection.jsx
    TrackerContent.jsx
    WealthChart.jsx
    WealthPlannerBreakdownTable.jsx
    WealthPlanner.jsx
    WealthPlannerInsights.jsx
  utils/
    calculatorRoutes.js
```

## Architecture Notes

- `src/hooks/useFinance.js` contains the main calculator and portfolio math.
- `src/hooks/useCalculatorState.js` syncs active calculator state with path-based URLs.
- `src/hooks/useTrackerState.js` manages tracker state, persistence, fund loading, and CSV import.
- `src/hooks/useWealthPlannerResults.js` centralizes derived calculator and tracker outputs.
- `src/components/WealthPlanner.jsx` is the top-level feature coordinator.
- `src/components/TrackerContent.jsx` owns the tracker-specific entry flow and searchable fund picker.
- `src/components/WealthPlannerInsights.jsx` renders chart and breakdown-table views for the active mode.

## Known Limitations

- This is an educational calculator app, not financial advice.
- Mutual-fund tracking depends on the availability and quality of the external NAV API.
- UI test coverage is still limited compared with calculation-layer coverage.
