import Link from "next/link";
import { Badge } from "@/components/shadcn/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";

interface ProductRow {
	id: string;
	name: string;
	platform: string;
	activeCount: number;
	uninstallCount: number;
	lastActivity: Date | null;
}

interface ProductStatsTableProps {
	products: ProductRow[];
}

export function ProductStatsTable({ products }: ProductStatsTableProps) {
	if (products.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No products yet.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Platform</TableHead>
					<TableHead className="text-right">Active</TableHead>
					<TableHead className="text-right">Uninstalled</TableHead>
					<TableHead>Last Activity</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{products.map((p) => (
					<TableRow key={p.id} className="cursor-pointer">
						<TableCell>
							<Link
								href={`/dashboard/${p.id}`}
								className="font-medium underline-offset-4 hover:underline"
							>
								{p.name}
							</Link>
						</TableCell>
						<TableCell>
							<Badge variant="secondary">{p.platform}</Badge>
						</TableCell>
						<TableCell className="text-right">{p.activeCount}</TableCell>
						<TableCell className="text-right">{p.uninstallCount}</TableCell>
						<TableCell className="text-muted-foreground">
							{p.lastActivity
								? new Date(p.lastActivity).toLocaleDateString()
								: "—"}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
