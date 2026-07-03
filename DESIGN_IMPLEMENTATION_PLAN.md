# Design Implementation Plan

This document captures the phased implementation plan for the visual redesign of the app. It keeps the current calculator logic and behavior intact while improving the layout, hierarchy, and overall product feel.

Scope notes:
- Do not add app-name branding or logo-specific UI right now.
- Do not add premium-plan, pricing, or upsell UI.
- Keep finance logic unchanged unless a layout change requires small wiring updates.

Reference mockup:
- `docs/design/financial-dashboard-redesign-desktop-mobile.png`

## Goals

- Make the app feel cleaner, more modern, and more engaging.
- Improve hierarchy so users understand where they are and what matters most.
- Make the layout feel more like a finance workspace than a utility page.
- Upgrade form and dashboard styling without disrupting validated behavior.

## Phase 1: App Shell And Navigation

Focus:
- redesign the left rail
- improve spacing rhythm
- reduce the current “stack of pills” feeling
- preserve existing menu behavior and mobile navigation logic

Implementation targets:
- `src/components/CalculatorLayout.jsx`
- `src/components/WealthPlanner.module.css`

Expected outcome:
- slimmer, cleaner left rail
- stronger active state
- better desktop/mobile shell consistency

## Phase 2: Main Page Header

Focus:
- add a reusable header for each calculator mode
- give each screen a clear title and short contextual subtitle
- optionally show small context chips based on current inputs

Implementation targets:
- `src/components/CalculatorContent.jsx`
- `src/components/WealthPlanner.jsx`
- new lightweight header component if needed

Examples:
- `SIP Calculator`
- `Loan Planner`
- `Portfolio Tracker`

Expected outcome:
- better orientation for first-time users
- stronger visual hierarchy before the user reaches the forms

## Phase 3: Layout Rebalance

Focus:
- shift from evenly weighted panels to a clearer workflow layout
- make the left side the setup area
- make the right side the outcomes area

Implementation targets:
- `src/components/CalculatorContent.jsx`
- `src/components/WealthPlanner.module.css`

Desktop direction:
- left column for inputs and strategy
- right column for result cards, chart, and breakdown

Tracker direction:
- give more width to portfolio/results when not actively adding a fund

Expected outcome:
- clearer eye flow from input to insight
- less visual competition between equal cards

## Phase 4: Input System Polish

Focus:
- make form controls look like part of a design system
- normalize control sizing, radius, spacing, and labels
- visually group related fields

Implementation targets:
- `src/components/InputSection.jsx`
- `src/components/DualInput.jsx`
- `src/components/TrackerContent.jsx`
- `src/components/WealthPlanner.module.css`

Expected outcome:
- inputs, date fields, and search fields feel intentional
- fewer browser-default-looking elements

## Phase 5: Results Presentation

Focus:
- make the primary KPI more dominant
- reduce noise in secondary result cards
- improve spacing and typography inside result panels

Implementation targets:
- `src/components/ResultsSection.jsx`
- `src/components/ResultCard.jsx`

Expected outcome:
- the results area becomes the hero of each calculator mode

## Phase 6: Chart And Breakdown Panels

Focus:
- make the chart and breakdown feel like polished dashboard sections
- improve framing, headings, and spacing
- preserve all current data and interactions

Implementation targets:
- `src/components/WealthPlannerInsights.jsx`
- `src/components/WealthPlannerBreakdownTable.jsx`
- chart container styling in `src/components/WealthPlanner.module.css`

Expected outcome:
- insights feel more structured and product-grade

## Phase 7: Tracker Dashboard Refinement

Focus:
- make tracker feel like a portfolio workspace, not just a form and table
- improve add/edit state clarity
- strengthen table hierarchy and summary presentation

Implementation targets:
- `src/components/TrackerContent.jsx`
- `src/components/PortfolioTracker.jsx`
- tracker-specific styles in `src/components/WealthPlanner.module.css`

Expected outcome:
- a clearer distinction between portfolio management and calculator flows

## Phase 8: Mobile Polish

Focus:
- refine stacking, spacing, and hierarchy for mobile
- keep the redesign feeling intentional instead of just compressed

Implementation targets:
- responsive layout rules in `src/components/WealthPlanner.module.css`
- mobile nav behavior in `src/components/CalculatorLayout.jsx`

Expected outcome:
- better readability and touch ergonomics on smaller screens

## Recommended Build Order

1. App shell and navigation
2. Main page header
3. Layout rebalance
4. Input system polish
5. Results presentation
6. Chart and breakdown panels
7. Tracker dashboard refinement
8. Mobile polish
9. UI test updates after each major visual pass

## Guardrails

- Do not change finance calculations.
- Do not rewrite stable state flows unless the layout requires small, clear plumbing changes.
- Prefer reusing current components before splitting more files.
- Run `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build` after each major phase.

## Definition Of Done

The redesign pass should feel complete when:

- the shell looks intentional on desktop and mobile
- each calculator mode has a clear heading and hierarchy
- forms feel consistent and product-grade
- results are visually stronger than setup controls
- tracker feels like a dedicated portfolio workspace
- validation still passes cleanly
