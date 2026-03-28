import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await auth();

	return (
		<div className="mx-auto max-w-2xl p-8">
			<Card>
				<CardHeader>
					<CardTitle>Dashboard</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1 text-sm">
						<p>
							<span className="text-muted-foreground">Email:</span>{" "}
							{session?.user?.email}
						</p>
						<p>
							<span className="text-muted-foreground">Role:</span>{" "}
							{session?.user?.role}
						</p>
					</div>
					<form
						action={async () => {
							"use server";
							await signOut({ redirectTo: "/login" });
						}}
					>
						<Button variant="outline" type="submit">
							Sign out
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
