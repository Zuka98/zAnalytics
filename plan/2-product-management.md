# Iteration 2 — Product Management UI

Add a product management interface to the admin panel. Users can create, list, edit, and delete products (Chrome extensions) directly from the web app using Next.js server actions and the shared `@zanalytics/db` package.

## 1. Database Types

- [x] **1.1** Export `Product` and `NewProduct` inferred types from the `products` table in `packages/db/src/schema.ts`

## 2. Server Actions

- [x] **2.1** Create `apps/web/src/lib/actions/products.ts` — server action `getProducts()`: select all products ordered by `createdAt` desc
- [x] **2.2** Add server action `createProduct(formData)`: validate `key` (lowercase, alphanumeric + hyphens) and `name` (non-empty), insert into DB, `revalidatePath("/products")`
- [x] **2.3** Add server action `updateProduct(id, formData)`: validate same fields, update row by id, `revalidatePath("/products")`
- [x] **2.4** Add server action `deleteProduct(id)`: delete row by id, `revalidatePath("/products")`

## 3. shadcn Components

- [x] **3.1** Install `table`, `dialog`, `badge`, `dropdown-menu`, `separator` shadcn components via `pnpm dlx shadcn@latest add`

## 4. Product List Page

- [x] **4.1** Create `apps/web/src/app/(app)/products/page.tsx` — server component: fetch products via `getProducts()`, render heading with "Add Product" button and `ProductTable`
- [x] **4.2** Create `apps/web/src/components/products/product-table.tsx` — client component: render products in a shadcn `Table` with columns: name, key, platform, created date, actions dropdown (edit, delete)

## 5. Create & Edit Product

- [x] **5.1** Create `apps/web/src/components/products/product-form-dialog.tsx` — client component: shadcn `Dialog` with form fields for key, name, platform (default "chrome"). Handles both create and edit modes. Calls `createProduct` or `updateProduct` server action, shows loading state, closes on success
- [x] **5.2** Wire "Add Product" button on the list page to open the dialog in create mode
- [x] **5.3** Wire "Edit" action in the table dropdown to open the dialog in edit mode, pre-filled with existing values

## 6. Delete Product

- [x] **6.1** Create `apps/web/src/components/products/delete-product-dialog.tsx` — client component: confirmation dialog showing product name, calls `deleteProduct` server action on confirm
- [x] **6.2** Wire "Delete" action in the table dropdown to open the delete confirmation dialog

## 7. Navigation

- [x] **7.1** Create `apps/web/src/components/layout/app-header.tsx` — shared header component with nav links (Dashboard, Products) and sign-out button
- [x] **7.2** Update `apps/web/src/app/(app)/layout.tsx` to render `AppHeader` above page content
- [x] **7.3** Update `apps/web/src/app/(app)/dashboard/page.tsx` to remove the inline sign-out button (now in header)

## 8. Testing & Finalization

- [x] **8.1** Run `pnpm type-check` across all packages
- [x] **8.2** Run `pnpm build` to verify the web app builds
- [x] **8.3** Run `pnpm lint` and fix any issues
- [ ] **8.4** Manual test: navigate to `/products` — should see empty list with "Add Product" button
- [ ] **8.5** Manual test: create a product — should appear in the table
- [ ] **8.6** Manual test: edit a product — should update in the table
- [ ] **8.7** Manual test: delete a product — should be removed after confirmation
- [ ] **8.8** `/checkout`, `/commit`, `/push`, `/create-pr`
