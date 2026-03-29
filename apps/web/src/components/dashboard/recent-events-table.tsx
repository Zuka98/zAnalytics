import { Badge } from "@/components/shadcn/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";

interface EventRow {
	id: string;
	eventName: string;
	installId: string | null;
	version: string | null;
	occurredAt: Date;
}

interface RecentEventsTableProps {
	events: EventRow[];
}

function truncateId(id: string | null) {
	if (!id) return "—";
	return `${id.slice(0, 8)}…`;
}

export function RecentEventsTable({ events }: RecentEventsTableProps) {
	if (events.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No events recorded yet.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Event Name</TableHead>
					<TableHead>Install ID</TableHead>
					<TableHead>Version</TableHead>
					<TableHead>Timestamp</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{events.map((e) => (
					<TableRow key={e.id}>
						<TableCell>
							<Badge variant="outline">{e.eventName}</Badge>
						</TableCell>
						<TableCell className="font-mono text-muted-foreground">
							{truncateId(e.installId)}
						</TableCell>
						<TableCell>{e.version ?? "—"}</TableCell>
						<TableCell className="text-muted-foreground">
							{new Date(e.occurredAt).toLocaleString()}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
