"use client";

import { useEffect, useState } from "react";
import { Activity, Circle, HardDrive } from "lucide-react";
import { formatTime } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";

interface HealthResponse {
	status: string;
	memory: {
		rss: number;
		heapUsed: number;
		heapTotal: number;
	};
}

type ServiceState = "healthy" | "degraded" | "down" | "loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const POLL_INTERVAL = 30_000;

function StatusDot({ state }: { state: ServiceState }) {
	const color = {
		healthy: "text-emerald-500",
		degraded: "text-amber-500",
		down: "text-red-500",
		loading: "text-muted-foreground",
	}[state];

	return (
		<Circle
			className={`size-2.5 fill-current ${color} ${state === "healthy" ? "animate-pulse" : ""}`}
		/>
	);
}

export function ServiceStatus() {
	const [health, setHealth] = useState<HealthResponse | null>(null);
	const [state, setState] = useState<ServiceState>("loading");
	const [lastChecked, setLastChecked] = useState<Date | null>(null);

	useEffect(() => {
		let mounted = true;

		async function check() {
			try {
				const res = await fetch(`${API_URL}/health`, {
					signal: AbortSignal.timeout(5000),
				});
				if (!mounted) return;

				if (res.ok) {
					const data: HealthResponse = await res.json();
					setHealth(data);
					setState(data.status === "ok" ? "healthy" : "degraded");
				} else {
					setState("degraded");
					setHealth(null);
				}
			} catch {
				if (!mounted) return;
				setState("down");
				setHealth(null);
			}
			setLastChecked(new Date());
		}

		check();
		const id = setInterval(check, POLL_INTERVAL);
		return () => {
			mounted = false;
			clearInterval(id);
		};
	}, []);

	const badgeVariant =
		state === "healthy"
			? "success"
			: state === "degraded"
				? "secondary"
				: state === "down"
					? "destructive"
					: "outline";

	const badgeLabel =
		state === "healthy"
			? "Operational"
			: state === "degraded"
				? "Degraded"
				: state === "down"
					? "Unreachable"
					: "Checking…";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<Activity className="size-4" />
						Analytics API Service
					</CardTitle>
					<Badge variant={badgeVariant}>
						<StatusDot state={state} />
						{badgeLabel}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				{health ? (
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<HardDrive className="size-3.5 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Heap</p>
								<p className="font-medium">
									{health.memory.heapUsed}/{health.memory.heapTotal} MB
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<HardDrive className="size-3.5 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">RSS</p>
								<p className="font-medium">{health.memory.rss} MB</p>
							</div>
						</div>
					</div>
				) : state === "down" ? (
					<p className="text-sm text-muted-foreground">
						Cannot reach the API server at {API_URL}
					</p>
				) : (
					<p className="text-sm text-muted-foreground">Checking service…</p>
				)}
				{lastChecked && (
					<p className="mt-3 text-xs text-muted-foreground">
						Last checked {formatTime(lastChecked)}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
