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

interface EventsChartProps {
	data: { date: string; count: number }[];
	label: string;
}

const chartConfig = {
	count: {
		label: "Events",
		color: "oklch(0.65 0.2 250)",
	},
} satisfies ChartConfig;

export function EventsChart({ data, label }: EventsChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Events</CardTitle>
				<CardDescription>Daily events — {label}</CardDescription>
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
							dataKey="count"
							type="monotone"
							stroke="var(--color-count)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
