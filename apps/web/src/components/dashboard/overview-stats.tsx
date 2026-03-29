import { TrendingDown, TrendingUp } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";

interface TrendStat {
	label: string;
	value: number;
	previous: number | null;
}

interface OverviewStatsProps {
	stats: TrendStat[];
}

function TrendBadge({
	current,
	previous,
}: {
	current: number;
	previous: number | null;
}) {
	if (previous === null || previous === 0) return null;

	const pct = ((current - previous) / previous) * 100;
	const isUp = pct >= 0;

	return (
		<span
			className={`inline-flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}
		>
			{isUp ? (
				<TrendingUp className="size-3" />
			) : (
				<TrendingDown className="size-3" />
			)}
			{isUp ? "+" : ""}
			{pct.toFixed(1)}%
		</span>
	);
}

export function OverviewStats({ stats }: OverviewStatsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{stat.label}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
						<TrendBadge current={stat.value} previous={stat.previous} />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
