import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import { auth, signOut } from "@/lib/auth";

export async function AppHeader() {
	const session = await auth();

	return (
		<header>
			<div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-8">
				<div className="flex items-center gap-6">
					<span className="text-sm font-bold">zAnalytics</span>
					<nav className="flex items-center gap-4 text-sm">
						<Link
							href="/dashboard"
							className="text-muted-foreground hover:text-foreground"
						>
							Dashboard
						</Link>
						<Link
							href="/products"
							className="text-muted-foreground hover:text-foreground"
						>
							Products
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-xs text-muted-foreground">
						{session?.user?.email}
					</span>
					<form
						action={async () => {
							"use server";
							await signOut({ redirectTo: "/login" });
						}}
					>
						<Button variant="outline" size="sm" type="submit">
							Sign out
						</Button>
					</form>
				</div>
			</div>
			<Separator />
		</header>
	);
}
