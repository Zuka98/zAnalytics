import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DateRangeTabs } from "@/components/dashboard/date-range-tabs";
import { EventBreakdownChart } from "@/components/dashboard/event-breakdown-chart";
import { EventsChart } from "@/components/dashboard/events-chart";
import { EventsTableControls } from "@/components/dashboard/events-table-controls";
import { FeedbackControls } from "@/components/dashboard/feedback-controls";
import { FeedbackTable } from "@/components/dashboard/feedback-table";
import { InstallsChart } from "@/components/dashboard/installs-chart";
import { RecentEventsTable } from "@/components/dashboard/recent-events-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import {
	getProductById,
	getProductDailyEvents,
	getProductDailyInstalls,
	getProductEventBreakdown,
	getProductEvents,
	getProductEventTypes,
	getProductFeedback,
	getProductInstallStats,
} from "@/lib/queries/product-detail";

export default async function ProductDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ productId: string }>;
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	const { productId } = await params;
	const sp = await searchParams;

	const VALID_RANGES = ["1", "7", "30", "90", "all"];
	const rangeKey =
		sp.range && VALID_RANGES.includes(sp.range) ? sp.range : "30";
	const days = rangeKey === "all" ? null : Number(rangeKey);
	const chartLabel =
		days === null ? "all time" : days === 1 ? "today" : `${days}d`;

	const eventType = sp.eventType || null;
	const installId = sp.installId || null;
	const version = sp.version || null;
	const pageSize = [10, 25, 50, 100].includes(Number(sp.pageSize))
		? Number(sp.pageSize)
		: 25;
	const page = Math.max(1, Number(sp.page) || 1);

	const fbType = sp.fbType || null;
	const fbStatus = sp.fbStatus || null;
	const fbPageSize = [10, 25, 50].includes(Number(sp.fbPageSize))
		? Number(sp.fbPageSize)
		: 10;
	const fbPage = Math.max(1, Number(sp.fbPage) || 1);

	const [
		product,
		stats,
		{ rows: eventRows, total: totalEvents },
		eventTypes,
		dailyInstalls,
		dailyEvents,
		eventBreakdown,
		{ rows: feedbackRows, total: totalFeedback },
	] = await Promise.all([
		getProductById(productId),
		getProductInstallStats(productId),
		getProductEvents({
			productId,
			eventType,
			installId,
			version,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		}),
		getProductEventTypes(productId),
		getProductDailyInstalls(productId, days),
		getProductDailyEvents(productId, days),
		getProductEventBreakdown(productId, days),
		getProductFeedback({
			productId,
			type: fbType,
			status: fbStatus,
			limit: fbPageSize,
			offset: (fbPage - 1) * fbPageSize,
		}),
	]);

	if (!product) notFound();

	const statCards = [
		{ label: "Active", value: stats.active },
		{ label: "Inactive", value: stats.inactive },
		{ label: "Uninstalled", value: stats.uninstalled },
		{ label: "Total Events", value: totalEvents },
	];

	return (
		<div className="mx-auto max-w-5xl p-8">
			<Link
				href="/dashboard"
				className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to Dashboard
			</Link>

			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					{product.name}
				</h1>
				<Suspense>
					<DateRangeTabs current={rangeKey} />
				</Suspense>
			</div>

			<div className="grid gap-4 sm:grid-cols-4">
				{statCards.map((s) => (
					<Card key={s.label} size="sm">
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{s.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="mt-8">
				<InstallsChart data={dailyInstalls} label={chartLabel} />
			</div>

			<div className="mt-4 grid gap-4 md:grid-cols-2">
				<EventsChart data={dailyEvents} label={chartLabel} />
				<EventBreakdownChart
					data={eventBreakdown.map((r) => ({
						eventName: r.eventName,
						[product.name]: r.count,
					}))}
					productNames={[product.name]}
					label={chartLabel}
				/>
			</div>

			<div className="mt-8">
				<h2 className="mb-4 text-lg font-medium">Events</h2>
				<Suspense>
					<EventsTableControls
						eventTypes={eventTypes.map((t) => t.eventName)}
						currentType={eventType}
						currentInstallId={installId}
						currentVersion={version}
						currentPageSize={pageSize}
						currentPage={page}
						totalEvents={totalEvents}
					/>
				</Suspense>
				<div className="mt-3">
					<RecentEventsTable events={eventRows} />
				</div>
			</div>

			<div className="mt-8">
				<h2 className="mb-4 text-lg font-medium">Feedback</h2>
				<Suspense>
					<FeedbackControls
						currentType={fbType}
						currentStatus={fbStatus}
						currentPageSize={fbPageSize}
						currentPage={fbPage}
						totalFeedback={totalFeedback}
					/>
				</Suspense>
				<div className="mt-3">
					<FeedbackTable rows={feedbackRows} />
				</div>
			</div>
		</div>
	);
}
