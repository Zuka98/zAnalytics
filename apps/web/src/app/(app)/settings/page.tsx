import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
	const session = await auth();
	const user = session?.user;

	return (
		<div className="mx-auto max-w-2xl p-8">
			<h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>

			<Card>
				<CardHeader>
					<CardTitle>Account</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="space-y-4 text-sm">
						<div>
							<dt className="text-muted-foreground">Name</dt>
							<dd className="mt-0.5 font-medium">{user?.name ?? "Not set"}</dd>
						</div>
						<Separator />
						<div>
							<dt className="text-muted-foreground">Email</dt>
							<dd className="mt-0.5 font-medium">{user?.email}</dd>
						</div>
						<Separator />
						<div>
							<dt className="text-muted-foreground">Role</dt>
							<dd className="mt-0.5 font-medium capitalize">{user?.role}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
