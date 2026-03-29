"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/shadcn/chart";

interface InstallsChartProps {
	data: { date: string; installs: number; uninstalls: number }[];
	label: string;
}

const chartConfig = {
	installs: {
		label: "Installs",
		color: "oklch(0.65 0.2 145)",
	},
	uninstalls: {
		label: "Uninstalls",
		color: "oklch(0.65 0.2 25)",
	},
} satisfies ChartConfig;

export function InstallsChart({ data, label }: InstallsChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Installs</CardTitle>
				<CardDescription>Daily installs — {label}</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<LineChart data={data} margin={{ left: 12, right: 12 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) =>
								new Date(value).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})
							}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							allowDecimals={false}
							width={30}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(value) =>
										new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})
									}
								/>
							}
						/>
						<Line
							dataKey="installs"
							type="monotone"
							stroke="var(--color-installs)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							dataKey="uninstalls"
							type="monotone"
							stroke="var(--color-uninstalls)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
