# Iteration 9 — Table Query State SDK

Build a headless table query state SDK inside zAnalytics that manages filtering (Notion-style AND/OR conditions), sorting, and pagination as a single unified state. Serializes to URL params, provides a React hook for state management, and a Drizzle adapter for building SQL queries. Replaces the simple `search`/`filters`/`extraSearch` props from iteration 8 with a generalized system that can be extracted into a standalone package later.

## 1. Core — Types & Operators

- [ ] **1.1** Create `apps/web/src/lib/table-query/types.ts` — define and export: `ColumnType` (`'text' | 'enum' | 'date' | 'number'`), `FilterableColumn` (`{ id, label, type, options? }`), `Operator`, `FilterCondition` (`{ column, operator, value }`), `FilterState` (`{ connector: 'and' | 'or', conditions }`), `SortState` (`{ column, direction }` or `null`), `PaginationState` (`{ page, pageSize }`), `TableQueryState` (`{ filters, sort, pagination }`)
- [ ] **1.2** Create `apps/web/src/lib/table-query/operators.ts` — define operator registry: map each `ColumnType` to its allowed operators. Text: `contains`, `equals`, `startsWith`, `isEmpty`. Enum: `is`, `isNot`. Date: `before`, `after`, `between`. Number: `eq`, `gt`, `lt`, `between`. Export `getOperatorsForType(type: ColumnType): Operator[]` and `getOperatorLabel(op: Operator): string`

## 2. Core — Serialization & Validation

- [ ] **2.1** Create `apps/web/src/lib/table-query/serialize.ts` — export `serialize(state: TableQueryState): string` (base64-encoded JSON) and `deserialize(param: string): TableQueryState` (with try/catch returning default state on invalid input)
- [ ] **2.2** Create `apps/web/src/lib/table-query/validate.ts` — export `validateFilters(filters: FilterState, columns: FilterableColumn[]): FilterState` that strips invalid conditions (unknown column IDs, operators not valid for column type, empty values for non-isEmpty operators)
- [ ] **2.3** Create `apps/web/src/lib/table-query/defaults.ts` — export `createDefaultState(opts?: { sort?, pageSize? }): TableQueryState` returning empty filters, optional default sort, page 1, default pageSize 25

## 3. Core — Barrel Export

- [ ] **3.1** Create `apps/web/src/lib/table-query/index.ts` — re-export all types, operators, serialize/deserialize, validate, and defaults

## 4. React Hook — `useTableQuery`

- [ ] **4.1** Create `apps/web/src/lib/table-query/use-table-query.ts` — export `useTableQuery(opts: { columns: FilterableColumn[], defaultSort?, defaultPageSize?, paramKey? })` hook that reads `TableQueryState` from URL search param (default key `tq`), returns current state + action functions
- [ ] **4.2** Implement action functions: `addFilter(condition)`, `removeFilter(index)`, `updateFilter(index, condition)`, `setConnector(connector)`, `clearFilters()` — each updates URL param, all reset page to 1
- [ ] **4.3** Implement sort actions: `setSort(column, direction)`, `clearSort()` — update URL param, reset page to 1
- [ ] **4.4** Implement pagination actions: `setPage(page)`, `setPageSize(pageSize)` — pageSize change resets page to 1
- [ ] **4.5** Expose `serialized` string from the hook (the raw URL param value) for passing to server actions/queries

## 5. Drizzle Adapter — `buildQuery`

- [ ] **5.1** Create `apps/web/src/lib/table-query/drizzle.ts` — export `buildWhere(filters: FilterState, columnMap: Record<string, Column>): SQL | undefined` that converts filter conditions to Drizzle SQL using `and()`/`or()` based on connector
- [ ] **5.2** Implement operator-to-SQL mapping: `contains` → `ilike '%v%'`, `equals` → `eq()`, `startsWith` → `ilike 'v%'`, `isEmpty` → `is null OR = ''`, `is/isNot` → `eq()`/`ne()`, `before/after` → `lt()`/`gt()`, `between` → `between()`, `gt/lt/eq` → standard comparisons
- [ ] **5.3** Export `buildOrderBy(sort: SortState, columnMap: Record<string, Column>): SQL | undefined` that returns `asc(column)` or `desc(column)`
- [ ] **5.4** Export `buildQuery(state: TableQueryState, columnMap: Record<string, Column>): { where, orderBy, limit, offset }` that combines all three into a single return object

## 6. FilterBuilder Component

- [ ] **6.1** Create `apps/web/src/components/data-table/filter-builder.tsx` — a `FilterBuilder` component accepting `columns: FilterableColumn[]`, `filters: FilterState`, and the action callbacks (`onAddFilter`, `onRemoveFilter`, `onUpdateFilter`, `onSetConnector`, `onClearFilters`)
- [ ] **6.2** Render "Add filter" button that appends a new empty condition row. Each row renders: column `<select>` (from `columns`), operator `<select>` (from `getOperatorsForType` based on selected column), value input (text `Input` for text/number, `<select>` for enum, date input for date)
- [ ] **6.3** Render AND/OR toggle between condition rows (clickable text that switches connector). Show only when 2+ conditions exist
- [ ] **6.4** Each condition row has an X button to remove it. When all conditions are removed, show only the "Add filter" button
- [ ] **6.5** For `between` operator (date/number), render two value inputs (from/to) and serialize as `value: "from,to"`

## 7. DataTable Integration

- [ ] **7.1** Add optional `filterConfig?: FilterableColumn[]` prop to DataTable — when provided along with filter state/actions (via a `tableQuery` prop or context), render `FilterBuilder` above the table in the toolbar area
- [ ] **7.2** Add optional `tableQuery` prop to DataTable accepting the return value of `useTableQuery` — wires sorting (replaces `sortMode`/`sortBy`/`sortDir` for tables using the SDK), pagination, and filter state automatically
- [ ] **7.3** When `tableQuery` is provided, DataTable renders: FilterBuilder (if filterConfig given) → table → pagination row. Sorting clicks call `tableQuery.setSort()` instead of using the old URL param approach
- [ ] **7.4** Keep backward compatibility — existing `sortMode`/`sortBy`/`sortDir`/`search`/`filters`/`extraSearch` props continue to work. The `tableQuery` prop is an alternative path that replaces them all

## 8. Pagination Component

- [ ] **8.1** Create `apps/web/src/components/data-table/table-pagination.tsx` — accepts `page`, `pageSize`, `total`, `pageSizes` (default `[10, 25, 50, 100]`), `onPageChange`, `onPageSizeChange`
- [ ] **8.2** Render: page-size `<select>`, range display ("1–25 of 150"), prev/next buttons using shadcn `Button`. Reuses the same visual pattern as the existing `EventsTableControls` pagination

## 9. Testing Page — SDK Examples

- [ ] **9.1** Add a new section to `apps/web/src/app/(app)/testing/page.tsx` demonstrating FilterBuilder with text + enum columns and AND/OR toggling
- [ ] **9.2** Add a section demonstrating full integration: DataTable with `filterConfig` + `tableQuery` hook, showing filters + sort + pagination working together
- [ ] **9.3** Add a section demonstrating FilterBuilder as a standalone component (not inside DataTable) controlling the same data

## 10. Migrate Events Table to SDK

- [ ] **10.1** Update `apps/web/src/app/(app)/dashboard/[productId]/page.tsx` — read the `tq` search param, call `deserialize()`, pass the resulting `TableQueryState` to `getProductEvents()` instead of individual `eventType`/`installId`/`version`/`sortBy`/`sortDir`/`page`/`pageSize` params
- [ ] **10.2** Update `getProductEvents()` in `apps/web/src/lib/queries/product-detail.ts` — accept `TableQueryState` (or its parts), use `buildWhere()` with a column map (`{ eventName: events.eventName, installId: events.installId, version: events.version, occurredAt: events.occurredAt }`) instead of manually building conditions
- [ ] **10.3** Update `RecentEventsTable` to use `useTableQuery` hook with `filterConfig` defining: `eventName` (enum, options from server), `installId` (text), `version` (text), `occurredAt` (date). Remove old `search`/`filters`/`extraSearch` props
- [ ] **10.4** Delete `apps/web/src/components/dashboard/events-table-controls.tsx` — fully replaced by FilterBuilder + TablePagination via DataTable

## 11. Migrate Feedback Table to SDK

- [ ] **11.1** Update `getProductFeedback()` in `apps/web/src/lib/queries/product-detail.ts` — accept `TableQueryState`, use `buildWhere()` with column map (`{ type: feedback.type, status: feedback.status, message: feedback.message, email: feedback.email }`)
- [ ] **11.2** Update `FeedbackTable` to use `useTableQuery` hook with `filterConfig` defining: `type` (enum), `status` (enum), `message` (text), `email` (text). Remove old filter props
- [ ] **11.3** Delete `apps/web/src/components/dashboard/feedback-controls.tsx` — fully replaced by DataTable's integrated FilterBuilder + pagination
- [ ] **11.4** Update page components that render FeedbackTable — remove manual filter/pagination prop passing

## 12. Cleanup

- [ ] **12.1** Remove `search`, `filters`, `extraSearch` props and `DebouncedSearch` component from DataTable — fully replaced by `filterConfig` + `tableQuery`
- [ ] **12.2** Remove unused imports from migrated files and verify no files reference deleted components (`EventsTableControls`, `FeedbackControls`)
- [ ] **12.3** Remove toolbar test sections (4–6) from testing page that demonstrated the old search/filters/extraSearch props

## 13. Testing & Finalization

- [ ] **13.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint:fix`
- [ ] **13.2** Manual test: Events table — add text filter on installId, add enum filter on eventName, toggle AND/OR, verify URL updates, verify results update, test pagination, test sort
- [ ] **13.3** Manual test: Feedback table — add enum filter on type, add enum filter on status, verify pagination, verify row click still opens detail dialog
- [ ] **13.4** Manual test: FilterBuilder standalone on testing page — add/remove conditions, toggle connector, verify state serialization
- [ ] **13.5** `/checkout`, `/commit`, `/push`, `/create-pr`
