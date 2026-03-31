# Iteration 8 — Unified DataTable Component

Replace the 4 separate table implementations with a single configurable `<DataTable>` component. Columns, sorting, filters, search, pagination, and edit/delete actions are all driven by props. Supports both client-side sorting (small tables) and URL-based server-side sorting (paginated tables).

## 1. DataTable Core

- [x] 1.0 Checkout new branch for this feature
- [x] **1.1** Create `apps/web/src/components/data-table/data-table.tsx` — generic `DataTable<T>` client component accepting: `columns: ColumnDef<T>[]`, `data: T[]`, `getRowId: (row: T) => string`, `emptyMessage?: string`
- [x] **1.2** Implement base table rendering using shadcn `Table` primitives and tanstack `flexRender`, matching the existing rounded-border card style
- [x] **1.3** Add empty state rendering — when `data` is empty, show `emptyMessage` (default: "No data.") centered in a `py-8` paragraph
- [x] 1.4 Create a temporary table on testing page (route) where we can refine these tables with different parameters please to see how it all looks like

## 2. Sorting

- [x] **2.1** Add client-side sorting support: accept optional `defaultSort?: SortingState`, wire `getSortedRowModel()` from tanstack when no `sortMode` prop or `sortMode="client"`
- [x] **2.2** Add URL-based sorting support: accept `sortMode="url"` with `sortBy?: string` and `sortDir?: "asc" | "desc"` props, push sort changes to URL params via `useRouter`/`useSearchParams`
- [x] **2.3** Create a shared `SortableHeader` sub-component inside the file — renders the ghost button with `ArrowUp`/`ArrowDown`/`ArrowUpDown` icon, works for both sort modes
- [x] **2.4** Columns opt in to sorting via tanstack's existing `enableSorting` on ColumnDef (default true for accessor columns). Non-sortable columns just render plain header text.
- [x] Let me verify these by testing the tables on testing page

## 3. Toolbar — Search & Filters

- [x] **3.1** Add optional `search?: { placeholder: string; paramKey: string }` prop — when provided, render a debounced (300ms) search `Input` with `Search` icon in a toolbar row above the table, pushing value to the URL param specified by `paramKey`
- [x] **3.2** Add optional `filters?: Array<{ paramKey: string; label: string; options: { value: string; label: string }[] }>` prop — render a `<select>` dropdown for each filter entry, push selections to URL params, reset page on change
- [x] **3.3** Add optional `extraSearch?: Array<{ placeholder: string; paramKey: string }>` prop for additional debounced search inputs (e.g. Events table has Install ID + Version search fields)
- [x] **3.4** Render toolbar only when at least one of `search`, `filters`, or `extraSearch` is provided. Use the existing flex layout pattern: `flex flex-col gap-2 sm:flex-row sm:items-center`
- [x] `3.5 Let me verify these again`

## 4. Toolbar — Pagination

- [ ] **4.1** Add optional `pagination?: { page: number; pageSize: number; total: number; pageSizes?: number[]; pageParam?: string; pageSizeParam?: string }` prop
- [ ] **4.2** Render pagination row below filters: page-size `<select>`, range display ("1–25 of 150"), prev/next `Button` icons. Push `pageParam` and `pageSizeParam` to URL on change
- [ ] **4.3** Default `pageParam` to `"page"`, `pageSizeParam` to `"pageSize"`, `pageSizes` to `[10, 25, 50, 100]`
- [ ] `4.4 Let me verify and come back`

## 5. Toolbar — Edit & Delete Actions

- [ ] **5.1** Add optional `editActions?: { onDelete?: (ids: string[]) => Promise<void> }` prop — when provided, show an Edit/Done toggle button in a toolbar header row
- [ ] **5.2** When editing is active, prepend a checkbox select column (header: select-all, cell: per-row checkbox) using tanstack `RowSelectionState`
- [ ] **5.3** When editing is active and selection count > 0, show the selected count and a destructive Delete button that calls `onDelete` with selected row IDs, then clears selection and calls `router.refresh()`
- [ ] **5.4** Add optional `title?: string` prop — when provided, render it as an `h2` in the header row alongside the edit actions

## 6. Row Click

- [ ] **6.1** Add optional `onRowClick?: (row: T) => void` prop — when provided, apply `cursor-pointer`, `tabIndex={0}`, `onClick`, and `Enter`/`Space` keyboard handler to each `TableRow`

## 7. Migrate ProductStatsTable

- [ ] **7.1** Refactor `apps/web/src/components/dashboard/product-stats-table.tsx` to import and render `DataTable` with its existing column definitions, `defaultSort={[{ id: "activeCount", desc: true }]}`, no toolbar features
- [ ] **7.2** Remove the old useReactTable / Table rendering boilerplate from the file

## 8. Migrate ProductTable

- [ ] **8.1** Refactor `apps/web/src/components/products/product-table.tsx` to use `DataTable` with its existing columns (including the actions dropdown column), `defaultSort={[{ id: "createdAt", desc: true }]}`
- [ ] **8.2** Keep the `ProductFormDialog` and `DeleteProductDialog` rendering in `ProductTable` — they sit outside the table and are triggered by state set in the actions column cell

## 9. Migrate RecentEventsTable

- [ ] **9.1** Refactor `apps/web/src/components/dashboard/recent-events-table.tsx` to use `DataTable` with `sortMode="url"`, `sortBy`, `sortDir`, `title="Events"`, `editActions={{ onDelete: deleteEvents }}`
- [ ] **9.2** Delete `apps/web/src/components/dashboard/events-table-controls.tsx` — its filters, search, and pagination are now handled by DataTable's `filters`, `extraSearch`, and `pagination` props
- [ ] **9.3** Update `apps/web/src/app/(app)/dashboard/[productId]/page.tsx` — remove the `EventsTableControls` import and pass filter/search/pagination config to the new DataTable via RecentEventsTable props

## 10. Migrate FeedbackTable

- [ ] **10.1** Refactor `apps/web/src/components/dashboard/feedback-table.tsx` to use `DataTable` with `defaultSort={[{ id: "createdAt", desc: true }]}`, `onRowClick` for opening the detail dialog
- [ ] **10.2** Keep `StatusChip` and `FeedbackDetailDialog` as-is — StatusChip is a custom cell renderer, dialog is triggered via `onRowClick`
- [ ] **10.3** Delete `apps/web/src/components/dashboard/feedback-controls.tsx` — its filters and pagination are now handled by the DataTable `filters` and `pagination` props
- [ ] **10.4** Update `apps/web/src/app/(app)/dashboard/[productId]/page.tsx` and any other pages rendering `FeedbackControls` — remove the import and pass filter/pagination config to FeedbackTable which forwards to DataTable

## 11. Cleanup

- [ ] **11.1** Remove unused imports from migrated files (old tanstack imports, shadcn table primitives, icon imports that moved into DataTable)
- [ ] **11.2** Verify no other files import the deleted components (`EventsTableControls`, `FeedbackControls`) — grep and fix any remaining references

## 12. Testing & Finalization

- [ ] **12.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint:fix`
- [ ] **12.2** Manual test: ProductStats table sorts by each column, links to product detail
- [ ] **12.3** Manual test: Products table sorts, edit/delete actions dropdown works, dialogs open
- [ ] **12.4** Manual test: Events table — URL sorting, search by Install ID/Version, filter by event type, pagination, edit mode with batch delete
- [ ] **12.5** Manual test: Feedback table — client sorting, row click opens detail dialog, status dropdown works, filters + pagination
- [ ] **12.6** `/checkout`, `/commit`, `/push`, `/create-pr`