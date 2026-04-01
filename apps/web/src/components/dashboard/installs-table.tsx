"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { cn, formatDateTime } from "@/lib/utils";

interface InstallRow {
	id: string;
	installId: string;
	productName?: string;
	status: "active" | "inactive" | "uninstalled";
	currentVersion: string | null;
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

	const columns: ColumnDef<InstallRow>[] = [
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
				<span className="text-sm">
					{row.original.currentVersion ?? "—"}
				</span>
			),
		},
		{
			accessorKey: "os",
			header: "OS",
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.os ? (OS_LABEL[row.original.os] ?? row.original.os) : "—"}
				</span>
			),
		},
		{
			accessorKey: "browserVersion",
			header: "Browser",
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.browserVersion ? `Chrome ${row.original.browserVersion}` : "—"}
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
