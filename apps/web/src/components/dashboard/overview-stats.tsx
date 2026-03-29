import { Package, Signal, UserMinus } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";

interface OverviewStatsProps {
	totalProducts: number;
	activeInstalls: number;
	uninstalls: number;
}

const stats = [
	{ key: "totalProducts", label: "Total Products", icon: Package },
	{ key: "activeInstalls", label: "Active Installs", icon: Signal },
	{ key: "uninstalls", label: "Uninstalls", icon: UserMinus },
] as const;

export function OverviewStats(props: OverviewStatsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-3">
			{stats.map(({ key, label, icon: Icon }) => (
				<Card key={key}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{label}
							</CardTitle>
							<Icon className="size-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{props[key].toLocaleString()}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
