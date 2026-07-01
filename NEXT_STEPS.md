# Next Steps

This document turns the current project analysis into a short action plan. It focuses on what is working well, what is risky, and what should happen next.

## Current Strengths

- The calculator engine is the strongest part of the app. `src/hooks/useFinance.js` covers SIP, Lumpsum, RD, Loan, SWP, Goal SIP, NAV-based tracking, portfolio aggregation, and XIRR.
- The financial logic is tested and currently passing through `vitest`.
- The UI has a coherent dashboard structure with reusable building blocks such as `InputSection`, `ResultsSection`, `PortfolioTracker`, `WealthChart`, and shared CSS modules.
- The tracker experience includes useful practical features: local persistence, CSV import/export, per-fund drilldown, and responsive table/card layouts.

## Highest-Priority Issues

### 1. Bring lint back to green

Why it matters:
- The repo currently builds and tests, but lint is failing.
- This makes it harder to trust CI and easier for small quality issues to accumulate.

Current issues:
- Unused imports and variables in `src/App.jsx`, `src/components/InputSection.jsx`, and `src/components/WealthPlanner.jsx`
- Test globals not configured for `vitest` in `src/hooks/useFinance.test.js`
- Hook dependency warnings in `src/components/WealthPlanner.jsx`

Recommended next step:
- Fix the unused code and either correct or intentionally suppress the hook dependency warnings only where justified.
- Update ESLint config for test globals if the team wants lint to cover test files cleanly.

### 2. Split `WealthPlanner.jsx`

Why it matters:
- `src/components/WealthPlanner.jsx` is handling too many responsibilities at once.
- It currently owns menu state, all calculator inputs, tracker workflows, CSV import, async data fetching, chart shaping, modal state, toast state, and large render branches.

Risk:
- Changes are more likely to cause regressions.
- Onboarding is slower because behavior is centralized in one large file.

Recommended next step:
- Split it into feature-focused hooks or containers.

Suggested breakdown:
- `useCalculatorState`
- `useTrackerState`
- `usePortfolioImport`
- `CalculatorContent`
- `TrackerContent`
- `BreakdownTable`

### 3. Fix docs so they match reality

Why it matters:
- The README currently describes an older shape of the app.
- New contributors will get the wrong install/run instructions and an incomplete understanding of features.

Current mismatches:
- README says five calculators, but the app includes Goal, Tracker, and Help as well.
- README says `npm start`, but this repo uses Vite scripts and should be run with `npm run dev`.
- The documented file structure no longer matches the actual component layout.

Recommended next step:
- Refresh `README.md` to reflect current scripts, feature list, and structure.

## Product and UX Improvements

### 4. Clean up app-shell styling

Why it matters:
- `src/index.css` still contains several Vite starter defaults that do not fully match the dashboard.

Examples:
- `color-scheme: light dark`
- centered `body` layout
- generic button styles
- root/background defaults that compete with the app-level CSS

Recommended next step:
- Replace the starter globals with app-specific base styles.

### 5. Improve trust and wording

Why it matters:
- The footer in `src/App.jsx` says the calculations can be wrong.
- That kind of warning may be honest, but it reduces confidence in the product immediately.

Recommended next step:
- Reword the footer to something more professional, such as educational-use language plus a note to verify important financial decisions.

### 6. Upgrade tracker fund search later if needed

Why it matters:
- The current `datalist` approach is lightweight, but it may become clunky with large fund lists.

Recommended next step:
- Keep it for now if performance is acceptable.
- If users rely heavily on Tracker, replace it with a searchable listbox/autocomplete with better keyboard and filtering behavior.

## Validation Gaps

### 7. Add UI-level tests

Why it matters:
- Current coverage is concentrated in `src/hooks/useFinance.js`.
- Most UI components have no direct test coverage.

Recommended next step:
- Add focused tests for:
- menu switching
- SIP vs normal tab switching
- tracker add/edit/remove flows
- CSV import happy path and failure path
- loan prepayment toggle behavior
- mobile menu behavior

### 8. Watch bundle size

Why it matters:
- Production build passes, but Vite warns that the main JS chunk is large.

Likely cause:
- The app is bundled as one main experience with charting and tracker logic loaded together.

Recommended next step:
- Consider lazy-loading less frequently used sections such as Help and Tracker.
- If needed, introduce manual chunking once the feature split is cleaner.

## Suggested Execution Order

### Short pass: 1 to 2 sessions

1. Fix lint errors and warnings.
2. Refresh README and setup instructions.
3. Clean global app-shell CSS.
4. Reword footer copy.

### Medium pass: 2 to 4 sessions

1. Split `WealthPlanner.jsx` into smaller hooks/components.
2. Add UI tests around tracker and calculator mode switching.
3. Re-check bundle size after refactor.

### Longer pass: optional polish

1. Improve fund search UX.
2. Add richer empty states and error states around fund/NAV fetches.
3. Consider route-level or feature-level code splitting.

## Definition of Done for the Next Round

The next cleanup/refactor round should aim to leave the project in this state:

- `lint`, `test`, and `build` all pass cleanly
- README matches actual repo behavior
- `WealthPlanner.jsx` is significantly smaller and easier to reason about
- Core UI flows have at least basic component/integration test coverage
- App-shell styling is intentional rather than inherited from Vite starter defaults
