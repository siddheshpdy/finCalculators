# Next Steps

This document turns the current project analysis into a short action plan. It focuses on what is working well, what is risky, and what should happen next.

## Status Snapshot

- [x] Validation baseline restored: `lint`, `test`, and `build` are passing
- [x] `WealthPlanner.jsx` refactor pass completed for the current step-2 scope
- [x] Core docs refreshed: `README.md` and this file now match the current app more closely
- [x] App-shell styling cleanup
- [x] Footer wording cleanup
- [x] Main-panel hierarchy and form-polish pass
- [x] Design redesign plan captured in `DESIGN_IMPLEMENTATION_PLAN.md`
- [x] UI-level tests for the current refactored flows
- [x] Bundle-size follow-up

All active items from this plan are completed for the current round. The notes below now mainly capture what was done and what would be optional future polish.

## Current Strengths

- The calculator engine is the strongest part of the app. `src/hooks/useFinance.js` covers SIP, Lumpsum, RD, Loan, SWP, Goal SIP, NAV-based tracking, portfolio aggregation, and XIRR.
- The financial logic is tested and currently passing through `vitest`.
- The UI has a coherent dashboard structure with reusable building blocks such as `InputSection`, `ResultsSection`, `PortfolioTracker`, `WealthChart`, and shared CSS modules.
- The tracker experience includes useful practical features: local persistence, CSV import/export, per-fund drilldown, and responsive table/card layouts.
- `lint`, `test`, and `build` are currently passing again after the recent cleanup pass.

## Highest-Priority Issues

### 1. Preserve the clean validation baseline `[Completed]`

Why it matters:
- The repo is back in a healthy state with `lint`, `test`, and `build` passing.
- The next changes should avoid reintroducing the drift that was just cleaned up.

Recommended next step:
- Keep future refactors paired with `npm run lint`, `npm run test`, and `npm run build`.
- Add CI if the project does not already enforce those checks automatically.

### 2. Continue splitting `WealthPlanner.jsx` `[Completed]`

Why it matters:
- `src/components/WealthPlanner.jsx` has already been reduced by extracting tracker state into `useTrackerState` and the chart/table block into `WealthPlannerInsights`.
- The latest pass also extracted calculator state into `useCalculatorState` and tracker-specific form rendering into `TrackerContent`.

Risk:
- Changes are more likely to cause regressions.
- Onboarding is slower because behavior is centralized in one large file.

Completed in this area:
- `useTrackerState`
- `WealthPlannerInsights`
- `useWealthPlannerResults`
- `StrategyPanel`
- `BreakdownTable`
- `CalculatorContent`
- `useCalculatorState`
- `TrackerContent`

Recommended next step:
- Treat future splits as optional follow-up polish, not required work to finish the current refactor pass.

### 3. Fix docs so they match reality `[Completed]`

Why it matters:
- The docs were out of sync with the app shape, scripts, and structure.

Completed in this area:
- `README.md` now reflects the Vite scripts, current feature set, and current structure
- `NEXT_STEPS.md` now reflects the current state of the project

Recommended next step:
- Keep the refreshed docs aligned with future refactors and feature changes.
- Use `DESIGN_IMPLEMENTATION_PLAN.md` as the implementation reference for the redesign work.

## Product and UX Improvements

### 4. Clean up app-shell styling `[Completed]`

Why it matters:
- `src/index.css` still contains several Vite starter defaults that do not fully match the dashboard.

Examples:
- `color-scheme: light dark`
- centered `body` layout
- generic button styles
- root/background defaults that compete with the app-level CSS

Completed in this area:
- `src/index.css` now uses app-specific global defaults instead of Vite starter styling
- `src/App.css` now keeps the shell, content height, and floating footer aligned with the dashboard layout

Recommended next step:
- Keep future layout work consistent with the simplified global style layer.

### 5. Improve trust and wording `[Completed]`

Why it matters:
- The footer in `src/App.jsx` says the calculations can be wrong.
- That kind of warning may be honest, but it reduces confidence in the product immediately.

Completed in this area:
- the footer now uses clearer educational-planning language without undermining trust in the product

Recommended next step:
- Revisit disclaimer placement only if later UX testing shows the footer note is still too prominent.

### 6. Upgrade tracker fund search later if needed `[Completed]`

Why it matters:
- The current `datalist` approach is lightweight, but it may become clunky with large fund lists.

Completed in this area:
- the tracker now uses an in-app searchable suggestions panel instead of relying only on native `datalist`
- keyboard-friendly selection and clearer no-match feedback were added to the tracker picker

Recommended next step:
- Keep the current listbox/autocomplete unless the fund universe grows enough to justify virtualization.

### 7. Tighten main-panel hierarchy and control styling `[Completed]`

Why it matters:
- The app shell is strong, but the main content area still drops users directly into controls without much orientation.
- Some controls still look more like browser defaults than part of the dashboard design system.

Browser-validated findings:
- the main panel needs a clearer page-level heading or short contextual intro for each calculator mode
- tracker search/date controls still use more generic borders and smaller radii than the surrounding cards
- the visual system is strongest in the sidebar, cards, tracker table, modals, and toast, so the form layer should be brought up to that same standard

Completed in this area:
- lightweight heading and contextual intro treatment was added for calculator modes
- setup and output hierarchy was rebalanced into a clearer workspace layout
- tracker search, date, toggle, and amount controls now follow the same card-and-surface design language

Recommended next step:
- Continue with `DESIGN_IMPLEMENTATION_PLAN.md` Phase 5 and Phase 6 so the results, chart, and breakdown panels match the upgraded form layer.

## Validation and Coverage

### 8. Add UI-level tests `[Completed for current round]`

Why it matters:
- Current coverage is concentrated in `src/hooks/useFinance.js`.
- Most UI components have no direct test coverage.

Completed in this area:
- app-level integration tests now cover menu switching
- SIP view/tab switching is covered
- tracker add-and-drilldown happy path is covered
- loan strategy-panel switching is covered
- calculator state defaults and updates are covered through `useCalculatorState.test.js`
- tracker edit/remove flows are covered
- CSV import happy path and failure path are covered
- mobile menu behavior is covered

Recommended next step:
- Add targeted tests for redesigned presentation-only areas as Phase 5 through Phase 8 progress.

### 9. Watch bundle size `[Completed for current round]`

Why it matters:
- Production build needed a smaller initial payload so the main calculator view would not carry every help, tracker, and chart dependency up front.

Likely cause:
- The app is bundled as one main experience with charting and tracker logic loaded together.

Completed in this area:
- the help guide, tracker workspace, and insights/chart panel are now lazy-loaded feature chunks
- build output is now split further with dedicated chart and math chunks
- the large main-chunk warning is no longer emitted in the current build

Recommended next step:
- Re-check chunk sizes only after future major UI or tracker features land.

## Optional Follow-Up Order

### Short pass: 1 to 2 sessions

1. Continue Phase 5 from `DESIGN_IMPLEMENTATION_PLAN.md` to make the primary results more dominant.
2. Continue into Phase 6 so the chart and breakdown panels match the upgraded form layer.
3. Keep running UI coverage and validation after each redesign phase.

### Medium pass: 2 to 4 sessions

1. Continue later phases from `DESIGN_IMPLEMENTATION_PLAN.md`, especially results, chart/table, and tracker polish.
2. Re-check bundle size after future redesign phases if the chart or tracker grows again.
3. Add optional feature-level splits only if `WealthPlanner.jsx` becomes harder to maintain again.

### Longer pass: optional polish

1. Virtualize or further polish fund suggestions only if the tracker list grows enough to feel heavy.
2. Add richer empty states and error states around fund/NAV fetches.
3. Consider route-level or feature-level code splitting.

## Definition of Done for the Next Round

The current round leaves the project in this state:

- `lint`, `test`, and `build` all pass cleanly
- README matches actual repo behavior
- `WealthPlanner.jsx` is significantly smaller and easier to reason about
- Core UI flows have at least basic component/integration test coverage
- App-shell styling is intentional rather than inherited from Vite starter defaults
