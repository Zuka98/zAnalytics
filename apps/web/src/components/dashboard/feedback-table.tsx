"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { FEEDBACK_STATUSES } from "@zanalytics/db/feedback-types";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";
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
import { updateFeedbackStatus } from "@/lib/actions/feedback";
import { cn } from "@/lib/utils";
import { FeedbackDetailDialog } from "./feedback-detail-dialog";
import { STATUS_CLASS, TYPE_CLASS, TYPE_LABEL } from "./feedback-variants";

interface FeedbackRow {
	id: string;
	type: string;
	status: string;
	productName?: string;
	reason: string | null;
	message: string | null;
	email: string | null;
	metadata: Record<string, unknown> | null;
	notes?: string | null;
	createdAt: Date;
}

interface FeedbackTableProps {
	rows: FeedbackRow[];
	showProduct?: boolean;
}

const PILL =
	"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

function StatusChip({
	id,
	currentStatus,
}: {
	id: string;
	currentStatus: string;
}) {
	const [status, setStatus] = useState(currentStatus);
	const [, startTransition] = useTransition();

	function handleChange(newStatus: string) {
		setStatus(newStatus);
		startTransition(async () => {
			await updateFeedbackStatus(id, newStatus);
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				onClick={(e) => e.stopPropagation()}
				className={cn(
					PILL,
					STATUS_CLASS[status] ?? "bg-secondary text-secondary-foreground",
					"gap-1 cursor-pointer",
				)}
			>
				{status}
				<ChevronDown className="size-3 opacity-60" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{FEEDBACK_STATUSES.map((s) => (
					<DropdownMenuItem
						key={s}
						onClick={() => handleChange(s)}
						className="gap-2"
					>
						<span
							className={cn(
								PILL,
								STATUS_CLASS[s] ?? "bg-secondary text-secondary-foreground",
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

function useFeedbackColumns(showProduct: boolean): ColumnDef<FeedbackRow>[] {
	return [
		{
			accessorKey: "type",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Type
					<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
				</Button>
			),
			cell: ({ row }) => {
				const type = row.original.type;
				return (
					<span
						className={cn(
							PILL,
							TYPE_CLASS[type] ?? "bg-secondary text-secondary-foreground",
						)}
					>
						{TYPE_LABEL[type] ?? type}
					</span>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Status
					<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
				</Button>
			),
			cell: ({ row }) => (
				<StatusChip id={row.original.id} currentStatus={row.original.status} />
			),
		},
		...(showProduct
			? ([
					{
						accessorKey: "productName",
						header: ({ column }) => (
							<Button
								variant="ghost"
								size="sm"
								className="-ml-3 h-8"
								onClick={() =>
									column.toggleSorting(column.getIsSorted() === "asc")
								}
							>
								Product
								<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
							</Button>
						),
						cell: ({ row }) => (
							<span className="text-sm">{row.original.productName ?? "—"}</span>
						),
					},
				] as ColumnDef<FeedbackRow>[])
			: []),
		{
			id: "summary",
			header: "Reason / Message",
			cell: ({ row }) => {
				const text = row.original.reason ?? row.original.message;
				return text ? (
					<span className="block max-w-56 truncate text-sm">{text}</span>
				) : (
					<span className="text-muted-foreground">—</span>
				);
			},
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.original.email ?? "—"}
				</span>
			),
		},
		{
			id: "rating",
			header: "Rating",
			cell: ({ row }) => {
				const rating = row.original.metadata?.rating;
				return (
					<span className="text-sm">
						{rating != null ? `${rating}/5` : "—"}
					</span>
				);
			},
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
					Date
					<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
				</Button>
			),
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{new Date(row.original.createdAt).toLocaleDateString()}
				</span>
			),
			sortingFn: "datetime",
		},
	];
}

export function FeedbackTable({
	rows,
	showProduct = false,
}: FeedbackTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const [selectedRow, setSelectedRow] = useState<FeedbackRow | null>(null);
	const columns = useFeedbackColumns(showProduct);

	const table = useReactTable({
		data: rows,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (rows.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No feedback yet.
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
							<TableRow
								key={row.id}
								tabIndex={0}
								className="cursor-pointer"
								onClick={() => setSelectedRow(row.original)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ")
										setSelectedRow(row.original);
								}}
							>
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

			{selectedRow && (
				<FeedbackDetailDialog
					row={selectedRow}
					open={true}
					onOpenChange={(open) => {
						if (!open) setSelectedRow(null);
					}}
				/>
			)}
		</>
	);
}
