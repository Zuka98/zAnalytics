import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecentEventsTable } from "@/components/dashboard/recent-events-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import {
	getProductById,
	getProductInstallStats,
	getProductRecentEvents,
} from "@/lib/queries/product-detail";

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ productId: string }>;
}) {
	const { productId } = await params;
	const [product, stats, events] = await Promise.all([
		getProductById(productId),
		getProductInstallStats(productId),
		getProductRecentEvents(productId),
	]);

	if (!product) notFound();

	const totalEvents = events.length;
	const statCards = [
		{ label: "Active", value: stats.active },
		{ label: "Inactive", value: stats.inactive },
		{ label: "Uninstalled", value: stats.uninstalled },
		{ label: "Recent Events", value: totalEvents },
	];

	return (
		<div className="mx-auto max-w-4xl p-8">
			<Link
				href="/dashboard"
				className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to Dashboard
			</Link>

			<h1 className="mb-6 text-2xl font-semibold tracking-tight">
				{product.name}
			</h1>

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
				<h2 className="mb-4 text-lg font-medium">Recent Events</h2>
				<RecentEventsTable events={events} />
			</div>
		</div>
	);
}
