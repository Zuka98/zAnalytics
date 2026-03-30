"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { EVENT_CLASS } from "./feedback-variants";

interface EventRow {
	id: string;
	eventName: string;
	installId: string | null;
	version: string | null;
	occurredAt: Date;
}

const BASE_BADGE =
	"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const columns: ColumnDef<EventRow>[] = [
	{
		accessorKey: "eventName",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Event
				<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		),
		cell: ({ row }) => {
			const name = row.original.eventName;
			return (
				<span
					className={cn(
						BASE_BADGE,
						EVENT_CLASS[name] ?? "bg-secondary text-secondary-foreground",
					)}
				>
					{name}
				</span>
			);
		},
	},
	{
		accessorKey: "installId",
		header: "Install ID",
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">
				{row.original.installId ?? "—"}
			</span>
		),
	},
	{
		accessorKey: "version",
		header: "Version",
		cell: ({ row }) => (
			<span className="text-sm">{row.original.version ?? "—"}</span>
		),
	},
	{
		accessorKey: "occurredAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Timestamp
				<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{new Date(row.original.occurredAt).toLocaleString()}
			</span>
		),
		sortingFn: "datetime",
	},
];

interface RecentEventsTableProps {
	events: EventRow[];
	filterEventName?: string | null;
	filterInstallId?: string | null;
	filterVersion?: string | null;
}

export function RecentEventsTable({
	events,
	filterEventName,
	filterInstallId,
	filterVersion,
}: RecentEventsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "occurredAt", desc: true },
	]);

	const filtered = events.filter((e) => {
		if (filterEventName && e.eventName !== filterEventName) return false;
		if (filterInstallId && e.installId !== filterInstallId) return false;
		if (filterVersion && e.version !== filterVersion) return false;
		return true;
	});

	const table = useReactTable({
		data: filtered,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	if (events.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No events recorded yet.
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
					{table.getRowModel().rows.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="py-8 text-center text-sm text-muted-foreground"
							>
								No events match the current filters.
							</TableCell>
						</TableRow>
					) : (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
