"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { deleteEvents } from "@/lib/actions/events";
import { cn } from "@/lib/utils";
import { EVENT_CLASS, EVENT_LABEL } from "./feedback-variants";

interface EventRow {
	id: string;
	eventName: string;
	installId: string | null;
	version: string | null;
	occurredAt: string | Date;
}

const BASE_BADGE =
	"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";

interface RecentEventsTableProps {
	events: EventRow[];
	sortBy: string;
	sortDir: "asc" | "desc";
}

export function RecentEventsTable({
	events,
	sortBy,
	sortDir,
}: RecentEventsTableProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [editing, setEditing] = useState(false);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [isPending, startTransition] = useTransition();

	const toggleSort = useCallback(
		(columnId: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (sortBy === columnId) {
				params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
			} else {
				params.set("sortBy", columnId);
				params.set("sortDir", "desc");
			}
			params.delete("page");
			router.push(`${pathname}?${params.toString()}`);
		},
		[sortBy, sortDir, searchParams, pathname, router],
	);

	function SortHeader({
		columnId,
		label,
	}: {
		columnId: string;
		label: string;
	}) {
		const active = sortBy === columnId;
		const Icon = active
			? sortDir === "asc"
				? ArrowUp
				: ArrowDown
			: ArrowUpDown;
		return (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => toggleSort(columnId)}
			>
				{label}
				<Icon className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		);
	}

	const columns: ColumnDef<EventRow>[] = [
		...(editing
			? [
					{
						id: "select",
						header: ({
							table,
						}: {
							table: ReturnType<typeof useReactTable<EventRow>>;
						}) => (
							<input
								type="checkbox"
								className="size-4 rounded border-border"
								checked={table.getIsAllPageRowsSelected()}
								onChange={table.getToggleAllPageRowsSelectedHandler()}
							/>
						),
						cell: ({
							row,
						}: {
							row: {
								getIsSelected: () => boolean;
								getToggleSelectedHandler: () => (e: unknown) => void;
							};
						}) => (
							<input
								type="checkbox"
								className="size-4 rounded border-border"
								checked={row.getIsSelected()}
								onChange={row.getToggleSelectedHandler()}
							/>
						),
						enableSorting: false,
					} satisfies ColumnDef<EventRow>,
				]
			: []),
		{
			accessorKey: "eventName",
			header: () => <SortHeader columnId="eventName" label="Event" />,
			cell: ({ row }) => {
				const name = row.original.eventName;
				return (
					<span
						className={cn(
							BASE_BADGE,
							EVENT_CLASS[name] ?? "bg-secondary text-secondary-foreground",
						)}
					>
						{EVENT_LABEL[name] ?? name}
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
			header: () => <SortHeader columnId="occurredAt" label="Timestamp" />,
			cell: ({ row }) => {
				const d = new Date(row.original.occurredAt);
				const time = d.toLocaleTimeString("en-GB", { hour12: false });
				const date = d.toLocaleDateString("en-GB");
				return (
					<span className="text-sm text-muted-foreground">
						{time} {date}
					</span>
				);
			},
		},
	];

	const table = useReactTable({
		data: events,
		columns,
		state: { rowSelection },
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
	});

	const selectedCount = Object.keys(rowSelection).length;

	function handleDelete() {
		const ids = Object.keys(rowSelection);
		startTransition(async () => {
			await deleteEvents(ids);
			setRowSelection({});
			setEditing(false);
			router.refresh();
		});
	}

	function toggleEditing() {
		setEditing((prev) => {
			if (prev) setRowSelection({});
			return !prev;
		});
	}

	if (events.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No events recorded yet.
			</p>
		);
	}

	return (
		<div className="rounded-md border">
			<div className="flex items-center justify-between border-b px-4 py-3">
				<h2 className="text-lg font-medium">Events</h2>
				<div className="flex items-center gap-3">
					{editing && selectedCount > 0 && (
						<>
							<span className="text-sm text-muted-foreground">
								{selectedCount} selected
							</span>
							<Button
								variant="destructive"
								size="sm"
								disabled={isPending}
								onClick={handleDelete}
							>
								<Trash2 className="mr-1.5 size-3.5" />
								{isPending ? "Deleting…" : "Delete"}
							</Button>
						</>
					)}
					<Button
						variant={editing ? "secondary" : "ghost"}
						size="sm"
						onClick={toggleEditing}
					>
						<Pencil className="mr-1.5 size-3.5" />
						{editing ? "Done" : "Edit"}
					</Button>
				</div>
			</div>
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
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
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
