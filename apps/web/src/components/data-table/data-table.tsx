"use client";

import {
	type Column,
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";

type SortMode = "client" | "url";

interface SortContext {
	mode: SortMode;
	sortBy?: string;
	sortDir?: "asc" | "desc";
	onUrlSort: (columnId: string) => void;
}

const SortCtx = createContext<SortContext>({
	mode: "client",
	onUrlSort: () => {},
});

interface SearchConfig {
	placeholder: string;
	paramKey: string;
}

interface FilterConfig {
	paramKey: string;
	label: string;
	options: { value: string; label: string }[];
}

interface DataTableProps<T> {
	columns: ColumnDef<T, unknown>[];
	data: T[];
	getRowId: (row: T) => string;
	emptyMessage?: string;
	defaultSort?: SortingState;
	sortMode?: SortMode;
	sortBy?: string;
	sortDir?: "asc" | "desc";
	search?: SearchConfig;
	filters?: FilterConfig[];
	extraSearch?: SearchConfig[];
}

export function SortableHeader<T>({
	column,
	label,
}: {
	column: Column<T, unknown>;
	label: string;
}) {
	const { mode, sortBy, sortDir, onUrlSort } = useContext(SortCtx);

	if (mode === "url") {
		const columnId = column.id;
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
				onClick={() => onUrlSort(columnId)}
			>
				{label}
				<Icon className="ml-1.5 size-3.5 opacity-50" />
			</Button>
		);
	}

	if (!column.getCanSort()) return <span>{label}</span>;

	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-3 h-8"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{label}
			<ArrowUpDown className="ml-1.5 size-3.5 opacity-50" />
		</Button>
	);
}

function DebouncedSearch({
	placeholder,
	paramKey,
	searchParams,
	onUpdate,
}: SearchConfig & {
	searchParams: URLSearchParams;
	onUpdate: (updates: Record<string, string | null>) => void;
}) {
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
	return (
		<div className="relative">
			<Search className="absolute top-2 left-2 size-4 text-muted-foreground" />
			<Input
				placeholder={placeholder}
				defaultValue={searchParams.get(paramKey) ?? ""}
				onChange={(e) => {
					if (debounceRef.current) clearTimeout(debounceRef.current);
					debounceRef.current = setTimeout(() => {
						onUpdate({ [paramKey]: e.target.value || null, page: null });
					}, 300);
				}}
				className="h-8 pl-8 text-sm"
			/>
		</div>
	);
}

export function DataTable<T>({
	columns,
	data,
	getRowId,
	emptyMessage = "No data.",
	defaultSort = [],
	sortMode = "client",
	sortBy,
	sortDir,
	search,
	filters,
	extraSearch,
}: DataTableProps<T>) {
	const [sorting, setSorting] = useState<SortingState>(defaultSort);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleUrlSort = useCallback(
		(columnId: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (sortBy === columnId) {
				params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
			} else {
				params.set("sortBy", columnId);
				params.set("sortDir", "desc");
			}
			params.delete("page");
			router.push(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[sortBy, sortDir, searchParams, pathname, router],
	);

	const isClientSort = sortMode === "client";

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: isClientSort ? setSorting : undefined,
		getCoreRowModel: getCoreRowModel(),
		...(isClientSort ? { getSortedRowModel: getSortedRowModel() } : {}),
		getRowId,
	});

	const sortCtxValue: SortContext = {
		mode: sortMode,
		sortBy,
		sortDir,
		onUrlSort: handleUrlSort,
	};

	const isEmpty = data.length === 0;

	const updateParams = useCallback(
		(updates: Record<string, string | null>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value === null) params.delete(key);
				else params.set(key, value);
			}
			router.push(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[searchParams, pathname, router],
	);

	const hasToolbar = search || filters?.length || extraSearch?.length;

	return (
		<SortCtx value={sortCtxValue}>
			{hasToolbar && (
				<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
					{filters?.map((f) => (
						<select
							key={f.paramKey}
							value={searchParams.get(f.paramKey) ?? ""}
							onChange={(e) =>
								updateParams({
									[f.paramKey]: e.target.value || null,
									page: null,
								})
							}
							className="h-8 rounded-md border bg-background px-2 text-sm"
						>
							<option value="">{f.label}</option>
							{f.options.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					))}
					{search && (
						<DebouncedSearch
							{...search}
							searchParams={searchParams}
							onUpdate={updateParams}
						/>
					)}
					{extraSearch?.map((es) => (
						<DebouncedSearch
							key={es.paramKey}
							{...es}
							searchParams={searchParams}
							onUpdate={updateParams}
						/>
					))}
				</div>
			)}
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
						{isEmpty ? (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={columns.length}
									className="py-12 text-center text-sm text-muted-foreground"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
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
		</SortCtx>
	);
}
