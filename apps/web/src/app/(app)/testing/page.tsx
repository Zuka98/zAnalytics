"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DataTable, SortableHeader } from "@/components/data-table/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

interface SampleRow {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	createdAt: string;
}

const SAMPLE_DATA: SampleRow[] = [
	{
		id: "1",
		name: "Alice Johnson",
		email: "alice@example.com",
		role: "Admin",
		status: "Active",
		createdAt: "2025-01-15",
	},
	{
		id: "2",
		name: "Bob Smith",
		email: "bob@example.com",
		role: "Editor",
		status: "Active",
		createdAt: "2025-02-20",
	},
	{
		id: "3",
		name: "Charlie Brown",
		email: "charlie@example.com",
		role: "Viewer",
		status: "Inactive",
		createdAt: "2025-03-10",
	},
	{
		id: "4",
		name: "Diana Ross",
		email: "diana@example.com",
		role: "Editor",
		status: "Active",
		createdAt: "2024-12-01",
	},
	{
		id: "5",
		name: "Eve Adams",
		email: "eve@example.com",
		role: "Admin",
		status: "Inactive",
		createdAt: "2025-01-30",
	},
];

const sortableColumns: ColumnDef<SampleRow, unknown>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "email",
		header: "Email",
		enableSorting: false,
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.email}</span>
		),
	},
	{
		accessorKey: "role",
		header: "Role",
		enableSorting: false,
		cell: ({ row }) => (
			<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
				{row.original.role}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => <SortableHeader column={column} label="Status" />,
		cell: ({ row }) => {
			const active = row.original.status === "Active";
			return (
				<span
					className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
				>
					{row.original.status}
				</span>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => <SortableHeader column={column} label="Created" />,
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.createdAt}
			</span>
		),
	},
];

const urlSortColumns: ColumnDef<SampleRow, unknown>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "email",
		header: "Email",
		enableSorting: false,
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.email}</span>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => <SortableHeader column={column} label="Status" />,
		cell: ({ row }) => <span className="text-sm">{row.original.status}</span>,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => <SortableHeader column={column} label="Created" />,
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.createdAt}
			</span>
		),
	},
];

const STATUSES = ["Active", "Inactive", "Pending", "Suspended"] as const;

const STATUS_STYLES: Record<string, string> = {
	Active:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
	Inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	Pending:
		"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
	Suspended:
		"bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

const PILL =
	"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

function StatusChip({
	value,
	onChange,
}: {
	value: string;
	onChange: (next: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					PILL,
					STATUS_STYLES[value] ?? "bg-secondary text-secondary-foreground",
					"cursor-pointer gap-1",
				)}
			>
				{value}
				<ChevronDown className="size-3 opacity-60" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-auto min-w-0">
				{STATUSES.map((s) => (
					<DropdownMenuItem key={s} onClick={() => onChange(s)}>
						<span
							className={cn(
								PILL,
								STATUS_STYLES[s] ?? "bg-secondary text-secondary-foreground",
							)}
						>
							{s}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function EditableStatusTable() {
	const [data, setData] = useState(SAMPLE_DATA);

	function handleStatusChange(id: string, newStatus: string) {
		setData((prev) =>
			prev.map((row) => (row.id === id ? { ...row, status: newStatus } : row)),
		);
	}

	const columns: ColumnDef<SampleRow, unknown>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => (
				<span className="font-medium">{row.original.name}</span>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.original.email}</span>
			),
		},
		{
			accessorKey: "role",
			header: "Role",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
					{row.original.role}
				</span>
			),
		},
		{
			accessorKey: "status",
			header: ({ column }) => <SortableHeader column={column} label="Status" />,
			cell: ({ row }) => (
				<StatusChip
					value={row.original.status}
					onChange={(next) => handleStatusChange(row.original.id, next)}
				/>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.original.createdAt}
				</span>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={data}
			getRowId={(row) => row.id}
			defaultSort={[{ id: "name", desc: false }]}
		/>
	);
}

function UrlSortTable() {
	const searchParams = useSearchParams();
	const sortBy = searchParams.get("sortBy") ?? "name";
	const sortDir = (searchParams.get("sortDir") as "asc" | "desc") ?? "asc";

	const sorted = [...SAMPLE_DATA].sort((a, b) => {
		const aVal = a[sortBy as keyof SampleRow] ?? "";
		const bVal = b[sortBy as keyof SampleRow] ?? "";
		const cmp = String(aVal).localeCompare(String(bVal));
		return sortDir === "asc" ? cmp : -cmp;
	});

	return (
		<DataTable
			columns={urlSortColumns}
			data={sorted}
			getRowId={(row) => row.id}
			sortMode="url"
			sortBy={sortBy}
			sortDir={sortDir}
		/>
	);
}

const minimalColumns: ColumnDef<SampleRow, unknown>[] = [
	{
		accessorKey: "name",
		header: "Name",
		enableSorting: false,
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "role",
		header: "Role",
		enableSorting: false,
	},
	{
		accessorKey: "status",
		header: "Status",
		enableSorting: false,
	},
];

export default function TestingPage() {
	return (
		<div className="mx-auto max-w-5xl space-y-12 p-8">
			<h1 className="text-2xl font-semibold tracking-tight">
				DataTable Testing
			</h1>

			<section>
				<h2 className="mb-4 text-lg font-medium">
					1. Client-side sorting (via SortableHeader)
				</h2>
				<DataTable
					columns={sortableColumns}
					data={SAMPLE_DATA}
					getRowId={(row) => row.id}
					defaultSort={[{ id: "name", desc: false }]}
				/>
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">
					2. Inline editable status chips
				</h2>
				<p className="mb-3 text-sm text-muted-foreground">
					Click a status chip to change it via dropdown. State is local.
				</p>
				<EditableStatusTable />
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">
					3. URL-based sorting (check URL params)
				</h2>
				<p className="mb-3 text-sm text-muted-foreground">
					Sorting updates ?sortBy and ?sortDir in the URL. Data is sorted
					server-side (simulated here with client sort).
				</p>
				<UrlSortTable />
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">4. Toolbar — search only</h2>
				<p className="mb-3 text-sm text-muted-foreground">
					Debounced search pushes ?q to URL params.
				</p>
				<DataTable
					columns={sortableColumns}
					data={SAMPLE_DATA}
					getRowId={(row) => row.id}
					defaultSort={[{ id: "name", desc: false }]}
					search={{ placeholder: "Search by name…", paramKey: "q" }}
				/>
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">
					5. Toolbar — filter + search
				</h2>
				<p className="mb-3 text-sm text-muted-foreground">
					Filter dropdown + search input. Both push URL params.
				</p>
				<DataTable
					columns={sortableColumns}
					data={SAMPLE_DATA}
					getRowId={(row) => row.id}
					defaultSort={[{ id: "name", desc: false }]}
					filters={[
						{
							paramKey: "role",
							label: "All roles",
							options: [
								{ value: "Admin", label: "Admin" },
								{ value: "Editor", label: "Editor" },
								{ value: "Viewer", label: "Viewer" },
							],
						},
						{
							paramKey: "status",
							label: "All statuses",
							options: [
								{ value: "Active", label: "Active" },
								{ value: "Inactive", label: "Inactive" },
							],
						},
					]}
					search={{ placeholder: "Search by name…", paramKey: "q" }}
				/>
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">
					6. Toolbar — filters + search + extra search
				</h2>
				<p className="mb-3 text-sm text-muted-foreground">
					Mimics events table: filter dropdown, plus two extra search fields.
				</p>
				<DataTable
					columns={sortableColumns}
					data={SAMPLE_DATA}
					getRowId={(row) => row.id}
					defaultSort={[{ id: "name", desc: false }]}
					filters={[
						{
							paramKey: "role",
							label: "All roles",
							options: [
								{ value: "Admin", label: "Admin" },
								{ value: "Editor", label: "Editor" },
								{ value: "Viewer", label: "Viewer" },
							],
						},
					]}
					search={{ placeholder: "Search by email…", paramKey: "email" }}
					extraSearch={[
						{ placeholder: "Install ID", paramKey: "installId" },
						{ placeholder: "Version", paramKey: "version" },
					]}
				/>
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">7. Minimal (no sorting)</h2>
				<DataTable
					columns={minimalColumns}
					data={SAMPLE_DATA}
					getRowId={(row) => row.id}
				/>
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">8. Empty state</h2>
				<DataTable
					columns={sortableColumns}
					data={[]}
					getRowId={(row) => row.id}
					emptyMessage="No users found."
				/>
			</section>

			<section>
				<h2 className="mb-4 text-lg font-medium">
					9. Empty state (default message)
				</h2>
				<DataTable
					columns={sortableColumns}
					data={[]}
					getRowId={(row) => row.id}
				/>
			</section>
		</div>
	);
}
