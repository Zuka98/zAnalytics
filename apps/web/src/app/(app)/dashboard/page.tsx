import { Suspense } from "react";
import { DateRangeTabs } from "@/components/dashboard/date-range-tabs";
import { EventBreakdownChart } from "@/components/dashboard/event-breakdown-chart";
import { EventsChart } from "@/components/dashboard/events-chart";
import { FeedbackTable } from "@/components/dashboard/feedback-table";
import { InstallsChart } from "@/components/dashboard/installs-chart";
import { InstallsTable } from "@/components/dashboard/installs-table";
import { InstallsTableControls } from "@/components/dashboard/installs-table-controls";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { ProductStatsTable } from "@/components/dashboard/product-stats-table";
import { ServiceStatus } from "@/components/dashboard/service-status";
import {
	type AllInstallSortColumn,
	getAllInstalls,
	getDailyEvents,
	getDailyInstalls,
	getEventBreakdown,
	getOverviewStatsWithTrend,
	getProductStats,
	getRecentFeedback,
} from "@/lib/queries/dashboard";

const VALID_RANGES = ["1", "7", "30", "90", "all"] as const;

function parseRange(range?: string): { days: number | null; rangeKey: string } {
	if (range === "all") return { days: null, rangeKey: "all" };
	if (range && VALID_RANGES.includes(range as (typeof VALID_RANGES)[number])) {
		return { days: Number(range), rangeKey: range };
	}
	return { days: 30, rangeKey: "30" };
}

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	const sp = await searchParams;
	const { days, rangeKey } = parseRange(sp.range);

	const instStatus = sp.instStatus || null;
	const instInstallId = sp.instInstallId || null;
	const instPageSize = [10, 25, 50, 100].includes(Number(sp.instPageSize))
		? Number(sp.instPageSize)
		: 25;
	const instPage = Math.max(1, Number(sp.instPage) || 1);
	const VALID_INST_SORT_COLUMNS = ["lastSeenAt", "firstSeenAt", "status"] as const;
	const instSortBy = (
		VALID_INST_SORT_COLUMNS.includes(sp.instSortBy as AllInstallSortColumn)
			? sp.instSortBy
			: "lastSeenAt"
	) as AllInstallSortColumn;
	const instSortDir = sp.instSortDir === "asc" ? "asc" : "desc";

	const [
		trend,
		products,
		dailyInstalls,
		dailyEvents,
		eventBreakdown,
		{ rows: installRows, total: totalInstalls },
		recentFeedback,
	] = await Promise.all([
		getOverviewStatsWithTrend(days),
		getProductStats(),
		getDailyInstalls(days),
		getDailyEvents(days),
		getEventBreakdown(days),
		getAllInstalls({
			status: instStatus,
			installId: instInstallId,
			sortBy: instSortBy,
			sortDir: instSortDir,
			limit: instPageSize,
			offset: (instPage - 1) * instPageSize,
		}),
		getRecentFeedback(days),
	]);

	const chartLabel =
		days === null ? "all time" : days === 1 ? "today" : `${days}d`;

	const stats = [
		{
			label: "Active Installs",
			value: trend.activeInstalls,
			previous: null, // absolute count, no period comparison
		},
		{
			label: "New Installs",
			value: trend.current ? trend.current.newInstalls : trend.activeInstalls,
			previous: trend.previous ? trend.previous.newInstalls : null,
		},
		{
			label: "Uninstalls",
			value: trend.current ? trend.current.uninstalls : trend.totalUninstalls,
			previous: trend.previous ? trend.previous.uninstalls : null,
		},
		{
			label: "Events",
			value: trend.current
				? trend.current.totalEvents
				: (trend.totalEvents ?? 0),
			previous: trend.previous ? trend.previous.totalEvents : null,
		},
	];

	return (
		<div className="mx-auto max-w-5xl p-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
				<Suspense>
					<DateRangeTabs current={rangeKey} />
				</Suspense>
			</div>

			<div className="mb-6">
				<ServiceStatus />
			</div>

			<OverviewStats stats={stats} />

			<div className="mt-8">
				<InstallsChart data={dailyInstalls} label={chartLabel} />
			</div>

			<div className="mt-4 grid gap-4 md:grid-cols-2">
				<EventsChart data={dailyEvents} label={chartLabel} />
				<EventBreakdownChart
					data={eventBreakdown.data}
					productNames={eventBreakdown.productNames}
					label={chartLabel}
				/>
			</div>

			<div className="mt-8">
				<h2 className="mb-4 text-lg font-medium">Installs</h2>
				<Suspense>
					<InstallsTableControls
						currentStatus={instStatus}
						currentInstallId={instInstallId}
						currentPageSize={instPageSize}
						currentPage={instPage}
						totalInstalls={totalInstalls}
					/>
				</Suspense>
				<div className="mt-3">
					<InstallsTable
						installs={installRows}
						sortBy={instSortBy}
						sortDir={instSortDir}
						showProduct
					/>
				</div>
			</div>

			<div className="mt-8">
				<h2 className="mb-4 text-lg font-medium">Products</h2>
				<ProductStatsTable products={products} />
			</div>

			<div className="mt-8">
				<h2 className="mb-4 text-lg font-medium">Recent Feedback</h2>
				<FeedbackTable rows={recentFeedback} showProduct />
			</div>
		</div>
	);
}
