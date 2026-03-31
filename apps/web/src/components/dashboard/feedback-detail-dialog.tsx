"use client";

import { FEEDBACK_STATUSES } from "@zanalytics/db/feedback-types";
import { ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
	updateFeedbackNotes,
	updateFeedbackStatus,
} from "@/lib/actions/feedback";
import { cn, formatDateTime } from "@/lib/utils";
import { STATUS_CLASS, TYPE_CLASS, TYPE_LABEL } from "./feedback-variants";

const PILL =
	"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

interface FeedbackDetailDialogProps {
	row: {
		id: string;
		type: string;
		status: string;
		notes?: string | null;
		productName?: string;
		reason: string | null;
		message: string | null;
		email: string | null;
		metadata: Record<string, unknown> | null;
		createdAt: Date;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function FeedbackDetailDialog({
	row,
	open,
	onOpenChange,
}: FeedbackDetailDialogProps) {
	const [status, setStatus] = useState(row.status);
	const [notes, setNotes] = useState(row.notes ?? "");
	const [notesSaving, setNotesSaving] = useState(false);
	const [, startStatusTransition] = useTransition();

	function handleStatusChange(newStatus: string) {
		setStatus(newStatus);
		startStatusTransition(async () => {
			await updateFeedbackStatus(row.id, newStatus);
		});
	}

	async function handleSaveNotes() {
		setNotesSaving(true);
		await updateFeedbackNotes(row.id, notes);
		setNotesSaving(false);
	}

	const rating = row.metadata?.rating as number | undefined;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span
							className={cn(
								PILL,
								TYPE_CLASS[row.type] ??
									"bg-secondary text-secondary-foreground",
							)}
						>
							{TYPE_LABEL[row.type] ?? row.type}
						</span>
						{row.productName && (
							<span className="text-sm font-normal text-muted-foreground">
								{row.productName}
							</span>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 text-sm">
					<div className="flex items-center gap-3">
						<span className="w-20 shrink-0 text-muted-foreground">Status</span>
						<DropdownMenu>
							<DropdownMenuTrigger
								className={cn(
									PILL,
									STATUS_CLASS[status] ??
										"bg-secondary text-secondary-foreground",
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
										onClick={() => handleStatusChange(s)}
										className="gap-2"
									>
										<span
											className={cn(
												PILL,
												STATUS_CLASS[s] ??
													"bg-secondary text-secondary-foreground",
											)}
										>
											{s}
										</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{row.reason && (
						<div className="flex gap-3">
							<span className="w-20 shrink-0 text-muted-foreground">
								Reason
							</span>
							<span>{row.reason}</span>
						</div>
					)}

					{row.message && (
						<div className="flex gap-3">
							<span className="w-20 shrink-0 text-muted-foreground">
								Message
							</span>
							<span className="leading-relaxed">{row.message}</span>
						</div>
					)}

					{row.email && (
						<div className="flex gap-3">
							<span className="w-20 shrink-0 text-muted-foreground">Email</span>
							<span>{row.email}</span>
						</div>
					)}

					{rating != null && (
						<div className="flex gap-3">
							<span className="w-20 shrink-0 text-muted-foreground">
								Rating
							</span>
							<span>{rating}/5</span>
						</div>
					)}

					<div className="flex gap-3">
						<span className="w-20 shrink-0 text-muted-foreground">Date</span>
						<span>{formatDateTime(new Date(row.createdAt))}</span>
					</div>

					<div className="flex flex-col gap-1.5 border-t pt-4">
						<span className="text-muted-foreground">Notes</span>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add internal notes..."
							rows={3}
							className="w-full rounded border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
						/>
						<div className="flex justify-end">
							<Button
								size="sm"
								onClick={handleSaveNotes}
								disabled={notesSaving}
							>
								{notesSaving ? "Saving..." : "Save notes"}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
