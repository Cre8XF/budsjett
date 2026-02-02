# Full Repository Audit: Spareplanlegger (budsjett)

**Date:** 2026-02-02
**Auditor:** Automated Technical Audit
**Branch:** `claude/audit-repository-duaZI`

---

## Executive Summary

This is a **personal finance management SPA** ("Spareplanlegger" / Savings Planner) built with React 18, TypeScript, Vite, and Tailwind CSS. It was scaffolded using **Bolt.new** (evidenced by `.bolt/` directory) and targets Norwegian-speaking users managing budgets, transactions, and savings goals.

The project is at **early prototype / hackathon-quality** stage. The UI is polished visually, but the architecture contains a **critical runtime bug** (React Rules of Hooks violation), a **fundamental state management flaw** (each component gets isolated state), and several logic errors that would cause incorrect behavior in real use. There are no tests, no README, no CI/CD, and an unused Supabase dependency. The codebase is ~1,000 lines of application code across 12 files.

---

## Strengths

- **Modern, well-chosen toolchain**: Vite + React 18 + TypeScript strict mode + Tailwind CSS is a solid, fast foundation.
- **Clean visual design**: Cards, progress bars, doughnut/bar charts, color-coded budget warnings, and responsive mobile bottom navigation create a polished-looking UI.
- **TypeScript strict mode enabled** with `noUnusedLocals` and `noUnusedParameters`.
- **Separation of types**: `src/types/index.ts` centralizes interfaces and constants.
- **Custom hook abstraction**: `useFinanceData` attempts to encapsulate business logic away from components.
- **Responsive layout**: Desktop top navigation + mobile bottom navigation + select dropdown fallback.
- **localStorage persistence**: Data survives page reloads.
- **Proper use of `useMemo`/`useCallback`** for derived calculations (where they work correctly).
- **Norwegian localization** with `Intl.NumberFormat` for NOK currency formatting and `date-fns` with `nb` locale.
- **CSV import feature** — a useful UX addition beyond basic CRUD.

---

## Weaknesses / Risks

### CRITICAL (will cause bugs or crashes)

- **Rules of Hooks violation** — `src/hooks/useFinanceData.ts:137`: `useCallback` (for `resetData`) is defined **inside** a `useMemo` callback. React hooks cannot be called inside other hooks' callbacks. This violates the Rules of Hooks and will cause unpredictable behavior or crashes.

- **Completely isolated state per component** — Every component independently calls `useFinanceData()`, which creates separate `useState` instances. Adding a transaction in `TransactionForm` will **not** update `Dashboard`, `BudgetOverview`, `RecentTransactions`, or `SavingsGoals`. The app appears to work only because localStorage syncs on next full remount. This is the single most impactful architectural flaw.

- **DOM query bug in SavingsGoals** — `src/components/SavingsGoals.tsx:162`: `document.querySelector('input[placeholder="Beløp å spare"]')` always selects the **first** matching input on the page, regardless of which goal's button was clicked. With 2+ goals, the contribute button on goal #2 reads goal #1's input.

### HIGH

- **Incorrect monthly projection** — `src/hooks/useFinanceData.ts:132-148`: `totalIncome` and `totalExpenses` represent all-time sums (not monthly averages). Multiplying all-time totals by 12 produces a meaningless "annual projection."

- **Budget `spent` field drifts from reality** — Budget spending is incremented on each new expense (`useFinanceData.ts:81-88`) but is never recalculated from actual transaction data. Over time, `spent` values can desync from transaction sums.

- **Naive CSV parsing** — `src/components/TransactionForm.tsx:43`: `line.split(',')` cannot handle commas inside quoted fields (standard CSV). The `headers` variable (line 43) is assigned but never used.

- **Division by zero risk** — `src/components/BudgetOverview.tsx:45` and `src/components/Dashboard.tsx:20`: if `budget.limit` is 0, `spent / limit` produces `Infinity`, causing broken UI.

### MEDIUM

- **No input validation** — Amount fields accept negative numbers, zero, and extremely large values.
- **Duplicate IDs possible** — `Date.now().toString()` for IDs: two rapid operations in the same millisecond produce colliding IDs.
- **`formatCurrency` duplicated 4 times** — Identical function in `Dashboard.tsx`, `BudgetOverview.tsx`, `SavingsGoals.tsx`, and `RecentTransactions.tsx`.
- **Deprecated API usage** — `SavingsGoals.tsx:150` uses `onKeyPress`, deprecated in React 17+.
- **HTML `lang="en"`** while all content is in Norwegian — accessibility issue for screen readers.
- **No routing** — Tab switching via `useState`; browser back/forward buttons don't work, URLs not shareable.
- **"Se alle transaksjoner" button** (`RecentTransactions.tsx:70-72`) has no `onClick` handler.

---

## Technical Debt

| Debt Area | Impact | Detail |
|-----------|--------|--------|
| **No shared state** | Critical | Each component has independent state. Requires Context, Zustand, or lifting state to App. |
| **Hook nesting violation** | Critical | `resetData` `useCallback` inside `useMemo` must be extracted. |
| **No test coverage** | High | Zero test files. No unit, integration, or e2e tests. |
| **No README** | Medium | No setup instructions, project description, or contributing guide. |
| **Unused Supabase dependency** | Medium | `@supabase/supabase-js` in `package.json` is never imported. Adds to bundle. |
| **Duplicated utility functions** | Medium | `formatCurrency` copied 4x; should be a shared utility. |
| **No error boundaries** | Medium | A crash in any component takes down the entire app. |
| **Package name mismatch** | Low | `package.json` says `"vite-react-typescript-starter"`. |
| **No CI/CD** | Low | No GitHub Actions, no automated linting/building/testing. |

---

## Improvement Roadmap

### Quick Wins (low effort / high impact)

1. Fix the Rules of Hooks violation — extract `resetData` out of `useMemo`.
2. Fix the DOM query bug — replace `document.querySelector` with React refs or controlled state per goal.
3. Extract `formatCurrency` into a shared utility (`src/utils/format.ts`).
4. Remove unused `@supabase/supabase-js` from `package.json`.
5. Set `<html lang="no">` in `index.html`.
6. Rename package in `package.json` to match project name.
7. Add guard against division by zero in budget percentage calculations.

### Medium Improvements

8. Introduce shared state via React Context provider at App level.
9. Fix monthly projection math — calculate actual monthly averages from transaction date ranges.
10. Add client-side routing (`react-router-dom` or TanStack Router).
11. Add input validation — enforce positive amounts, required fields, reasonable limits.
12. Improve CSV parsing — use `papaparse` or handle quoted fields.
13. Derive `budget.spent` from transactions instead of incrementing a separate counter.
14. Add error boundaries around major sections.
15. Add a README with setup, usage, and architecture notes.
16. Add basic unit tests for `useFinanceData` calculations.

### Long-term Structural Improvements

17. Implement a backend (Supabase or similar) for multi-device data sync.
18. Add transaction editing and deletion (currently only add exists).
19. Add authentication before any backend integration.
20. Add data export (CSV/PDF).
21. Implement proper monthly/yearly reporting with time-series views.
22. Add CI/CD pipeline (GitHub Actions for lint, type-check, test, build).
23. Internationalization (i18n) if targeting non-Norwegian users.
24. Add Prettier for consistent code formatting.

---

## Project Maturity Rating

| Area | Rating (1-5) | Notes |
|------|:---:|-------|
| **Architecture** | 2/5 | Isolated state per component is a fundamental flaw. No routing, no context. |
| **Maintainability** | 2/5 | Duplicated utilities, nested hook violation, no tests, no docs. |
| **Robustness** | 1/5 | No error handling, no input validation, division-by-zero risks, broken DOM queries. |
| **Scalability** | 2/5 | localStorage-only, no backend, flat component structure. |
| **Readiness for further development** | 2/5 | State architecture must be fixed before any new feature can reliably be added. |

---

## Final Verdict

**Refactor before continuing development.**

The UI layer is presentable and the toolchain is modern, but the application has a broken state management architecture that means components do not communicate with each other. Combined with a Rules of Hooks violation, incorrect financial calculations, and zero test coverage, this codebase cannot be shipped as-is or built upon reliably.

The recommended path: fix the critical state-sharing issue (introduce Context), fix the hooks violation, add basic tests, and then incrementally address the medium-priority items. The existing ~1,000 lines of code are not large enough to warrant a full rewrite — a targeted refactor preserving the existing UI components is the most efficient approach.
