"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
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
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/shadcn/chart";

const COLORS = [
	"oklch(0.65 0.2 250)",
	"oklch(0.65 0.2 145)",
	"oklch(0.7 0.18 330)",
	"oklch(0.7 0.18 55)",
	"oklch(0.65 0.2 25)",
	"oklch(0.65 0.15 200)",
];

interface EventTypePieChartProps {
	data: { eventName: string; count: number }[];
	label: string;
}

export function EventTypePieChart({ data, label }: EventTypePieChartProps) {
	const total = useMemo(
		() => data.reduce((sum, d) => sum + d.count, 0),
		[data],
	);

	const chartData = useMemo(
		() =>
			data.map((d, i) => ({
				name: d.eventName,
				value: d.count,
				fill: COLORS[i % COLORS.length],
			})),
		[data],
	);

	const chartConfig = useMemo(() => {
		const config: ChartConfig = {
			value: { label: "Events" },
		};
		for (const d of chartData) {
			config[d.name] = { label: d.name, color: d.fill };
		}
		return config;
	}, [chartData]);

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle>Event Types</CardTitle>
				<CardDescription>Distribution — {label}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[250px]"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={chartData}
							dataKey="value"
							nameKey="name"
							innerRadius={60}
							strokeWidth={5}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-3xl font-bold"
												>
													{total.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground"
												>
													Events
												</tspan>
											</text>
										);
									}
								}}
							/>
						</Pie>
						<ChartLegend content={<ChartLegendContent nameKey="name" />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
