"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";

interface EventsTableControlsProps {
	eventTypes: string[];
	currentType: string | null;
	currentInstallId: string | null;
	currentVersion: string | null;
	currentPageSize: number;
	currentPage: number;
	totalEvents: number;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function EventsTableControls({
	eventTypes,
	currentType,
	currentInstallId,
	currentVersion,
	currentPageSize,
	currentPage,
	totalEvents,
}: EventsTableControlsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

	const totalPages = Math.max(1, Math.ceil(totalEvents / currentPageSize));

	function updateParams(updates: Record<string, string | null>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(updates)) {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		router.push(`${pathname}?${params.toString()}`);
	}

	function debouncedUpdate(updates: Record<string, string | null>) {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			updateParams({ ...updates, page: null });
		}, 300);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<select
					value={currentType ?? ""}
					onChange={(e) =>
						updateParams({
							eventType: e.target.value || null,
							page: null,
						})
					}
					className="h-8 rounded-md border bg-background px-2 text-sm"
				>
					<option value="">All events</option>
					{eventTypes.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>

				<div className="relative">
					<Search className="absolute top-2 left-2 size-4 text-muted-foreground" />
					<Input
						placeholder="Install ID"
						defaultValue={currentInstallId ?? ""}
						onChange={(e) =>
							debouncedUpdate({
								installId: e.target.value || null,
							})
						}
						className="h-8 pl-8 text-sm"
					/>
				</div>

				<div className="relative">
					<Search className="absolute top-2 left-2 size-4 text-muted-foreground" />
					<Input
						placeholder="Version"
						defaultValue={currentVersion ?? ""}
						onChange={(e) =>
							debouncedUpdate({
								version: e.target.value || null,
							})
						}
						className="h-8 pl-8 text-sm"
					/>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<select
					value={currentPageSize}
					onChange={(e) =>
						updateParams({
							pageSize: e.target.value,
							page: null,
						})
					}
					className="h-8 rounded-md border bg-background px-2 text-sm"
				>
					{PAGE_SIZES.map((s) => (
						<option key={s} value={s}>
							{s} per page
						</option>
					))}
				</select>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span>
						{totalEvents === 0
							? "No events"
							: `${(currentPage - 1) * currentPageSize + 1}–${Math.min(currentPage * currentPageSize, totalEvents)} of ${totalEvents}`}
					</span>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						disabled={currentPage <= 1}
						onClick={() => updateParams({ page: String(currentPage - 1) })}
					>
						<ChevronLeft className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						disabled={currentPage >= totalPages}
						onClick={() => updateParams({ page: String(currentPage + 1) })}
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
