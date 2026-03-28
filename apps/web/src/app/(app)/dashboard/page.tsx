import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await auth();

	return (
		<div className="mx-auto max-w-4xl p-8">
			<Card>
				<CardHeader>
					<CardTitle>Dashboard</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 text-sm">
					<p>
						<span className="text-muted-foreground">Email:</span>{" "}
						{session?.user?.email}
					</p>
					<p>
						<span className="text-muted-foreground">Role:</span>{" "}
						{session?.user?.role}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
