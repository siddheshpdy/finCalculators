# Project Context: Financial Calculators

## Styling Architecture
The project uses **CSS Modules** for styling, ensuring styles are scoped locally to components.

## Design System & Tokens (Inferred)
- **Colors**:
  - **Primary Blue**: `#3B82F6` (Buttons, Active states)
  - **Success Green**: `#10B981` (Positive values, Active sidebar items)
  - **Danger Red**: `#EF4444` (Delete actions, Errors)
  - **Dark Backgrounds**: `#0b1220` to `#0f172a` (Sidebar gradient)
  - **Light Backgrounds**: `#F1F5F9` (App bg), `#FFFFFF` (Cards)
  - **Text**: `#1E293B` (Primary), `#64748B` (Secondary), `#94A3B8` (Tertiary/Labels)
- **Borders**:
  - Radius: `8px` (Inputs), `16px` (Cards), `999px` (Pill buttons).

## Component Analysis

### 1. Wealth Planner (`src/components/WealthPlanner.module.css`)
A complex dashboard component acting as the main layout for the calculator.
- **Layout**:
  - **Sidebar**: Fixed width (`220px`), dark theme. Collapses to a horizontal scrollable menu on mobile (`<768px`).
  - **Main Panel**: White card with shadow, contains the `controlGrid` and results.
- **Sub-Components**:
  - **Control Grid**: 3-column grid layout for input fields.
  - **Portfolio List**: Styled list of funds with Edit/Delete actions.
  - **Data Tables**: Custom styled tables with specific maturity highlighting.
  - **Guide Section**: Documentation styles including formula blocks (`font-family: 'Courier New'`) and example boxes.

### 2. Dual Input (`src/components/DualInput.module.css`)
A specialized input wrapper for financial data entry.
- **Structure**:
  - Flex header for labels.
  - Right-aligned number input with absolute positioned symbols ($, %).
  - Full-width range slider (`accent-color: #3B82F6`).

### 3. Result Card (`src/components/ResultCard.module.css`)
A summary card for displaying calculated metrics.
- **Structure**:
  - Simple container with padding.
  - distinct typography for `.label` (small, gray) vs `.value` (large, dark).
  - Supports dynamic inline styles for border colors.

## Responsive Behavior
- **Tablet/Mobile (<768px)**:
  - Sidebar moves to top, becomes horizontal.
  - `controlGrid` collapses from 3 columns to 1 column.
  - Padding reduces generally.

## Common Patterns
- **Flexbox**: Used for alignment in headers, sidebars, and lists.
- **Grid**: Used for the main input form layout.
- **Shadows**: Soft shadows used for depth on the sidebar and main panel.

## File Structure
- `src/components/*.module.css`: Component-specific styles.
```

<!--
[PROMPT_SUGGESTION]Create a React component for the ResultCard using the styles defined in ResultCard.module.css[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Generate a TypeScript interface for the WealthPlanner props based on the UI elements seen in the CSS[/PROMPT_SUGGESTION]
->