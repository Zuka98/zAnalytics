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
import { deleteInstalls } from "@/lib/actions/installs";
import { cn, formatDateTime } from "@/lib/utils";
import { MetadataTooltip } from "./metadata-tooltip";

interface InstallRow {
	id: string;
	installId: string;
	productName?: string;
	status: "active" | "inactive" | "uninstalled";
	currentVersion: string | null;
	linkedUserId: string | null;
	linkedUserEmail: string | null;
	os: string | null;
	browserVersion: string | null;
	timezone: string | null;
	firstSeenAt: Date;
	lastSeenAt: Date;
}

const STATUS_CLASS: Record<string, string> = {
	active:
		"bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
	inactive:
		"bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
	uninstalled:
		"bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
};

const OS_LABEL: Record<string, string> = {
	mac: "macOS",
	win: "Windows",
	linux: "Linux",
	cros: "ChromeOS",
	android: "Android",
};

const BASE_BADGE =
	"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";

interface InstallsTableProps {
	installs: InstallRow[];
	sortBy: string;
	sortDir: "asc" | "desc";
	showProduct?: boolean;
	paramPrefix?: string;
}

export function InstallsTable({
	installs,
	sortBy,
	sortDir,
	showProduct,
	paramPrefix = "inst",
}: InstallsTableProps) {
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
				params.set(`${paramPrefix}SortDir`, sortDir === "asc" ? "desc" : "asc");
			} else {
				params.set(`${paramPrefix}SortBy`, columnId);
				params.set(`${paramPrefix}SortDir`, "desc");
			}
			params.delete(`${paramPrefix}Page`);
			router.push(`${pathname}?${params.toString()}`);
		},
		[sortBy, sortDir, searchParams, pathname, router, paramPrefix],
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

	const selectedCount = Object.keys(rowSelection).length;

	function handleDelete() {
		const ids = Object.keys(rowSelection);
		startTransition(async () => {
			await deleteInstalls(ids);
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

	const columns: ColumnDef<InstallRow>[] = [
		...(editing
			? [
					{
						id: "select",
						header: ({
							table,
						}: {
							table: ReturnType<typeof useReactTable<InstallRow>>;
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
					} satisfies ColumnDef<InstallRow>,
				]
			: []),
		...(showProduct
			? [
					{
						accessorKey: "productName",
						header: "Product",
						cell: ({ row }: { row: { original: InstallRow } }) => (
							<span className="text-sm font-medium">
								{row.original.productName ?? "—"}
							</span>
						),
					} satisfies ColumnDef<InstallRow>,
				]
			: []),
		{
			accessorKey: "installId",
			header: "Install ID",
			cell: ({ row }) => (
				<span className="font-mono text-xs text-muted-foreground">
					{row.original.installId}
				</span>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<span className={cn(BASE_BADGE, STATUS_CLASS[row.original.status])}>
					{row.original.status}
				</span>
			),
		},
		{
			accessorKey: "currentVersion",
			header: "Version",
			cell: ({ row }) => (
				<span className="text-sm">{row.original.currentVersion ?? "—"}</span>
			),
		},
		{
			accessorKey: "linkedUserId",
			header: "User ID",
			cell: ({ row }) => (
				<span className="font-mono text-xs text-muted-foreground">
					{row.original.linkedUserId ?? "—"}
				</span>
			),
		},
		{
			accessorKey: "linkedUserEmail",
			header: "Email",
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.original.linkedUserEmail ?? "—"}
				</span>
			),
		},
		{
			accessorKey: "os",
			header: "OS",
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.os
						? (OS_LABEL[row.original.os] ?? row.original.os)
						: "—"}
				</span>
			),
		},
		{
			accessorKey: "browserVersion",
			header: "Browser",
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.browserVersion
						? `Chrome ${row.original.browserVersion}`
						: "—"}
				</span>
			),
		},
		{
			accessorKey: "timezone",
			header: "Timezone",
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.original.timezone ?? "—"}
				</span>
			),
		},
		{
			accessorKey: "firstSeenAt",
			header: () => <SortHeader columnId="firstSeenAt" label="First Seen" />,
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{formatDateTime(new Date(row.original.firstSeenAt))}
				</span>
			),
		},
		{
			accessorKey: "lastSeenAt",
			header: () => <SortHeader columnId="lastSeenAt" label="Last Seen" />,
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{formatDateTime(new Date(row.original.lastSeenAt))}
				</span>
			),
		},
	];

	const table = useReactTable({
		data: installs,
		columns,
		state: { rowSelection },
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
	});

	if (installs.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No installs recorded yet.
			</p>
		);
	}

	return (
		<div className="rounded-md border">
			<div className="flex items-center justify-between border-b px-4 py-3">
				<h2 className="text-lg font-medium">Installs</h2>
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
					{table.getRowModel().rows.map((row) => {
						const r = row.original;
						const meta: Record<string, unknown> = {};
						if (r.os) meta.os = OS_LABEL[r.os] ?? r.os;
						if (r.browserVersion) meta.browser = `Chrome ${r.browserVersion}`;
						if (r.timezone) meta.timezone = r.timezone;
						if (r.linkedUserId) meta.userId = r.linkedUserId;
						if (r.linkedUserEmail) meta.email = r.linkedUserEmail;
						const rowEl = (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						);
						if (editing) return rowEl;
						return (
							<MetadataTooltip key={row.id} data={meta}>
								{rowEl}
							</MetadataTooltip>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
