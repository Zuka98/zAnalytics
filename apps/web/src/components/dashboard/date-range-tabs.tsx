"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";

const RANGES = [
	{ value: "1", label: "Today" },
	{ value: "7", label: "7d" },
	{ value: "30", label: "30d" },
	{ value: "90", label: "90d" },
	{ value: "all", label: "All" },
] as const;

export function DateRangeTabs({ current }: { current: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function onChange(value: string | number | null) {
		if (value === null) return;
		const params = new URLSearchParams(searchParams.toString());
		params.set("range", String(value));
		router.push(`${pathname}?${params.toString()}`);
	}

	return (
		<Tabs value={current} onValueChange={onChange}>
			<TabsList>
				{RANGES.map((r) => (
					<TabsTrigger key={r.value} value={r.value}>
						{r.label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
