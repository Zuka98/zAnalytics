"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import type { Product } from "@zanalytics/db";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductFormDialog } from "./product-form-dialog";

function useColumns(
	onEdit: (p: Product) => void,
	onDelete: (p: Product) => void,
): ColumnDef<Product>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Name
					<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
				</Button>
			),
			cell: ({ row }) => (
				<Link
					href={`/dashboard/${row.original.id}`}
					className="font-medium underline-offset-4 hover:underline"
				>
					{row.original.name}
				</Link>
			),
		},
		{
			accessorKey: "key",
			header: "Key",
			cell: ({ row }) => (
				<code className="rounded bg-muted px-1.5 py-0.5 text-xs">
					{row.original.key}
				</code>
			),
		},
		{
			accessorKey: "platform",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Platform
					<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
				</Button>
			),
			cell: ({ row }) => (
				<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
					{row.original.platform}
				</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Created
					<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
				</Button>
			),
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.original.createdAt.toLocaleDateString()}
				</span>
			),
			sortingFn: "datetime",
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger
						onClick={(e) => e.stopPropagation()}
						className="flex size-8 items-center justify-center rounded-md hover:bg-accent"
					>
						<MoreHorizontal className="size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(row.original)}>
							<Pencil className="mr-2 size-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(row.original)}
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

export function ProductTable({ products }: { products: Product[] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const [editProduct, setEditProduct] = useState<Product | null>(null);
	const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

	const columns = useColumns(setEditProduct, setDeleteProduct);

	const table = useReactTable({
		data: products,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (products.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No products yet. Add one to get started.
			</p>
		);
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								{hg.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ProductFormDialog
				mode="edit"
				product={editProduct ?? undefined}
				open={!!editProduct}
				onOpenChange={(open) => !open && setEditProduct(null)}
			/>
			<DeleteProductDialog
				product={deleteProduct ?? undefined}
				open={!!deleteProduct}
				onOpenChange={(open) => !open && setDeleteProduct(null)}
			/>
		</>
	);
}
