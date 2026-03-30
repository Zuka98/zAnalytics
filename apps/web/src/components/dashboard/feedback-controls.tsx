"use client";

import {
	FEEDBACK_STATUSES,
	FEEDBACK_TYPES,
} from "@zanalytics/db/feedback-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shadcn/button";

interface ProductOption {
	id: string;
	name: string;
}

interface FeedbackControlsProps {
	currentType: string | null;
	currentStatus: string | null;
	currentPageSize: number;
	currentPage: number;
	totalFeedback: number;
	products?: ProductOption[];
	currentProductId?: string | null;
}

const PAGE_SIZES = [10, 25, 50];

export function FeedbackControls({
	currentType,
	currentStatus,
	currentPageSize,
	currentPage,
	totalFeedback,
	products,
	currentProductId,
}: FeedbackControlsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const totalPages = Math.max(1, Math.ceil(totalFeedback / currentPageSize));

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

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap items-center gap-2">
				{products && (
					<select
						value={currentProductId ?? ""}
						onChange={(e) =>
							updateParams({
								fbProduct: e.target.value || null,
								fbPage: null,
							})
						}
						className="h-8 rounded-md border bg-background px-2 text-sm"
					>
						<option value="">All products</option>
						{products.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				)}
				<select
					value={currentType ?? ""}
					onChange={(e) =>
						updateParams({
							fbType: e.target.value || null,
							fbPage: null,
						})
					}
					className="h-8 rounded-md border bg-background px-2 text-sm"
				>
					<option value="">All types</option>
					{FEEDBACK_TYPES.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>

				<select
					value={currentStatus ?? ""}
					onChange={(e) =>
						updateParams({
							fbStatus: e.target.value || null,
							fbPage: null,
						})
					}
					className="h-8 rounded-md border bg-background px-2 text-sm"
				>
					<option value="">All statuses</option>
					{FEEDBACK_STATUSES.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>

				<select
					value={currentPageSize}
					onChange={(e) =>
						updateParams({
							fbPageSize: e.target.value,
							fbPage: null,
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
			</div>

			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>
					{totalFeedback === 0
						? "No feedback"
						: `${(currentPage - 1) * currentPageSize + 1}–${Math.min(currentPage * currentPageSize, totalFeedback)} of ${totalFeedback}`}
				</span>
				<Button
					variant="outline"
					size="icon"
					className="size-8"
					disabled={currentPage <= 1}
					onClick={() => updateParams({ fbPage: String(currentPage - 1) })}
				>
					<ChevronLeft className="size-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="size-8"
					disabled={currentPage >= totalPages}
					onClick={() => updateParams({ fbPage: String(currentPage + 1) })}
				>
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
