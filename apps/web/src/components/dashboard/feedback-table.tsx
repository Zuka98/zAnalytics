"use client";

import { FEEDBACK_STATUSES } from "@zanalytics/db/feedback-types";
import { useState } from "react";
import { Badge } from "@/components/shadcn/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { updateFeedbackStatus } from "@/lib/actions/feedback";

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

const TYPE_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	uninstall: "destructive",
	bug: "destructive",
	feature_request: "default",
	general: "secondary",
};

const STATUS_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	new: "outline",
	reviewed: "secondary",
	in_progress: "default",
	resolved: "secondary",
	dismissed: "outline",
};

function InlineStatusSelect({
	id,
	currentStatus,
	currentNotes,
}: {
	id: string;
	currentStatus: string;
	currentNotes: string | null;
}) {
	const [status, setStatus] = useState(currentStatus);
	const [notes, setNotes] = useState(currentNotes ?? "");
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);

	async function save() {
		setSaving(true);
		await updateFeedbackStatus(id, status, notes || undefined);
		setSaving(false);
		setEditing(false);
	}

	if (!editing) {
		return (
			<button
				type="button"
				onClick={() => setEditing(true)}
				className="text-left"
			>
				<Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status}</Badge>
			</button>
		);
	}

	return (
		<div className="flex flex-col gap-1">
			<select
				value={status}
				onChange={(e) => setStatus(e.target.value)}
				className="h-7 rounded border bg-background px-1 text-xs"
			>
				{FEEDBACK_STATUSES.map((s) => (
					<option key={s} value={s}>
						{s}
					</option>
				))}
			</select>
			<input
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder="Notes..."
				className="h-7 rounded border bg-background px-2 text-xs"
			/>
			<div className="flex gap-1">
				<button
					type="button"
					onClick={save}
					disabled={saving}
					className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground"
				>
					{saving ? "..." : "Save"}
				</button>
				<button
					type="button"
					onClick={() => {
						setStatus(currentStatus);
						setNotes(currentNotes ?? "");
						setEditing(false);
					}}
					className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}

export function FeedbackTable({
	rows,
	showProduct = false,
}: FeedbackTableProps) {
	if (rows.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No feedback yet.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Type</TableHead>
					<TableHead>Status</TableHead>
					{showProduct && <TableHead>Product</TableHead>}
					<TableHead>Reason</TableHead>
					<TableHead>Message</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Rating</TableHead>
					<TableHead>Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((row) => (
					<TableRow key={row.id}>
						<TableCell>
							<Badge variant={TYPE_VARIANT[row.type] ?? "outline"}>
								{row.type}
							</Badge>
						</TableCell>
						<TableCell>
							<InlineStatusSelect
								id={row.id}
								currentStatus={row.status}
								currentNotes={row.notes ?? null}
							/>
						</TableCell>
						{showProduct && <TableCell>{row.productName}</TableCell>}
						<TableCell>{row.reason ?? "—"}</TableCell>
						<TableCell className="max-w-48 truncate">
							{row.message ?? "—"}
						</TableCell>
						<TableCell className="text-muted-foreground">
							{row.email ?? "—"}
						</TableCell>
						<TableCell>
							{row.metadata?.rating != null ? `${row.metadata.rating}/5` : "—"}
						</TableCell>
						<TableCell className="text-muted-foreground">
							{new Date(row.createdAt).toLocaleDateString()}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
