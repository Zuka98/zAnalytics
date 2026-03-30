"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";

interface ProductRow {
	id: string;
	name: string;
	platform: string;
	activeCount: number;
	uninstallCount: number;
	lastActivity: Date | null;
}

const columns: ColumnDef<ProductRow>[] = [
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
				onClick={(e) => e.stopPropagation()}
				className="font-medium underline-offset-4 hover:underline"
			>
				{row.original.name}
			</Link>
		),
	},
	{
		accessorKey: "platform",
		header: "Platform",
		cell: ({ row }) => (
			<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
				{row.original.platform}
			</span>
		),
	},
	{
		accessorKey: "activeCount",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Active
				<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="font-medium text-emerald-600 dark:text-emerald-400">
				{row.original.activeCount.toLocaleString()}
			</span>
		),
	},
	{
		accessorKey: "uninstallCount",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Uninstalled
				<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-red-600 dark:text-red-400">
				{row.original.uninstallCount.toLocaleString()}
			</span>
		),
	},
	{
		accessorKey: "lastActivity",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Last Activity
				<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.lastActivity
					? new Date(row.original.lastActivity).toLocaleDateString()
					: "—"}
			</span>
		),
		sortingFn: "datetime",
		sortUndefined: "last",
	},
];

export function ProductStatsTable({ products }: { products: ProductRow[] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "activeCount", desc: true },
	]);

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
				No products yet.
			</p>
		);
	}

	return (
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
	);
}
