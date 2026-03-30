"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
import { EVENT_LABEL } from "./feedback-variants";

const COLORS = [
	"oklch(0.65 0.2 250)",
	"oklch(0.65 0.2 145)",
	"oklch(0.7 0.18 330)",
	"oklch(0.7 0.18 55)",
	"oklch(0.65 0.2 25)",
	"oklch(0.65 0.15 200)",
];

interface EventBreakdownChartProps {
	data: Record<string, string | number>[];
	productNames: string[];
	label: string;
}

export function EventBreakdownChart({
	data,
	productNames,
	label,
}: EventBreakdownChartProps) {
	const chartConfig = useMemo(() => {
		const config: ChartConfig = {};
		for (let i = 0; i < productNames.length; i++) {
			config[productNames[i]] = {
				label: productNames[i],
				color: COLORS[i % COLORS.length],
			};
		}
		return config;
	}, [productNames]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Events by Type</CardTitle>
				<CardDescription>Event distribution — {label}</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<BarChart
						data={data.map((d) => ({
							...d,
							eventName: EVENT_LABEL[d.eventName as string] ?? d.eventName,
						}))}
						layout="vertical"
						margin={{ left: 0, right: 12 }}
					>
						<YAxis
							dataKey="eventName"
							type="category"
							tickLine={false}
							axisLine={false}
							width={120}
							className="text-xs"
						/>
						<XAxis
							type="number"
							tickLine={false}
							axisLine={false}
							allowDecimals={false}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						{productNames.map((name, i) => (
							<Bar
								key={name}
								dataKey={name}
								stackId="a"
								fill={COLORS[i % COLORS.length]}
								radius={
									i === productNames.length - 1 ? [0, 4, 4, 0] : undefined
								}
							/>
						))}
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
