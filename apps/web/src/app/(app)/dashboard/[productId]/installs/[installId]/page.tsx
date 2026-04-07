import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventsTableControls } from "@/components/dashboard/events-table-controls";
import { RecentEventsTable } from "@/components/dashboard/recent-events-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import {
	type EventSortColumn,
	getEventsByInstallId,
	getInstallByInstallId,
	getProductById,
	getProductEventTypes,
} from "@/lib/queries/product-detail";
import { cn, formatDateTime } from "@/lib/utils";

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

export default async function InstallDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ productId: string; installId: string }>;
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	const { productId, installId } = await params;
	const sp = await searchParams;

	const pageSize = [10, 25, 50, 100].includes(Number(sp.pageSize))
		? Number(sp.pageSize)
		: 25;
	const page = Math.max(1, Number(sp.page) || 1);

	const VALID_SORT_COLUMNS = ["occurredAt", "eventName"] as const;
	const sortBy = (
		VALID_SORT_COLUMNS.includes(sp.sortBy as EventSortColumn)
			? sp.sortBy
			: "occurredAt"
	) as EventSortColumn;
	const sortDir = sp.sortDir === "asc" ? "asc" : "desc";
	const eventType = sp.eventType || null;
	const version = sp.version || null;

	const [
		product,
		install,
		{ rows: eventRows, total: totalEvents },
		eventTypes,
	] = await Promise.all([
		getProductById(productId),
		getInstallByInstallId(productId, installId),
		getEventsByInstallId({
			productId,
			installId,
			sortBy,
			sortDir,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		}),
		getProductEventTypes(productId),
	]);

	if (!product || !install) notFound();

	const details = [
		{ label: "Install ID", value: install.installId, mono: true },
		{
			label: "Status",
			value: install.status,
			badge: STATUS_CLASS[install.status],
		},
		{ label: "Version", value: install.currentVersion },
		{
			label: "OS",
			value: install.os ? (OS_LABEL[install.os] ?? install.os) : null,
		},
		{
			label: "Browser",
			value: install.browserVersion ? `Chrome ${install.browserVersion}` : null,
		},
		{ label: "Timezone", value: install.timezone },
		{ label: "User ID", value: install.linkedUserId, mono: true },
		{ label: "Email", value: install.linkedUserEmail },
		{
			label: "First Seen",
			value: formatDateTime(new Date(install.firstSeenAt)),
		},
		{
			label: "Last Seen",
			value: formatDateTime(new Date(install.lastSeenAt)),
		},
	];

	return (
		<div className="mx-auto max-w-5xl p-8">
			<Link
				href={`/dashboard/${productId}`}
				className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to {product.name}
			</Link>

			<h1 className="mb-6 text-2xl font-semibold tracking-tight">
				Install Details
			</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Info</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
						{details.map(
							(d) =>
								d.value && (
									<div key={d.label} className="flex flex-col gap-0.5">
										<dt className="text-xs font-medium text-muted-foreground">
											{d.label}
										</dt>
										<dd>
											{d.badge ? (
												<span
													className={cn(
														"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
														d.badge,
													)}
												>
													{d.value}
												</span>
											) : (
												<span
													className={cn(
														"text-sm",
														d.mono && "font-mono text-xs text-muted-foreground",
													)}
												>
													{d.value}
												</span>
											)}
										</dd>
									</div>
								),
						)}
					</dl>
				</CardContent>
			</Card>

			<div className="mt-8">
				<Suspense>
					<EventsTableControls
						eventTypes={eventTypes.map((t) => t.eventName)}
						currentType={eventType}
						currentInstallId={null}
						currentVersion={version}
						currentPageSize={pageSize}
						currentPage={page}
						totalEvents={totalEvents}
						hideInstallIdSearch
					/>
				</Suspense>
				<div className="mt-3">
					<RecentEventsTable
						events={eventRows}
						sortBy={sortBy}
						sortDir={sortDir}
						hideInstallId
					/>
				</div>
			</div>
		</div>
	);
}
