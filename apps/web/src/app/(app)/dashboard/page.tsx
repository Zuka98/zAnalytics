import { OverviewStats } from "@/components/dashboard/overview-stats";
import { ProductStatsTable } from "@/components/dashboard/product-stats-table";
import { getOverviewStats, getProductStats } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
	const [overview, products] = await Promise.all([
		getOverviewStats(),
		getProductStats(),
	]);

	return (
		<div className="mx-auto max-w-4xl p-8">
			<h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
			<OverviewStats {...overview} />
			<div className="mt-8">
				<h2 className="mb-4 text-lg font-medium">Products</h2>
				<ProductStatsTable products={products} />
			</div>
		</div>
	);
}
