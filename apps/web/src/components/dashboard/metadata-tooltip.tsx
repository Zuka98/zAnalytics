"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/shadcn/tooltip";

interface MetadataTooltipProps {
	data: Record<string, unknown>;
	children: React.ReactElement;
}

export function MetadataTooltip({ data, children }: MetadataTooltipProps) {
	const entries = Object.entries(data).filter(([, v]) => v != null && v !== "");
	if (entries.length === 0) return children;

	return (
		<Tooltip>
			<TooltipTrigger render={children} />
			<TooltipContent
				side="bottom"
				align="start"
				className="max-w-md"
			>
				<div className="flex flex-col gap-1 text-xs">
					{entries.map(([key, value]) => (
						<div key={key}>
							<span className="font-medium text-muted-foreground">{key}:</span>{" "}
							{typeof value === "object"
								? JSON.stringify(value)
								: String(value)}
						</div>
					))}
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
