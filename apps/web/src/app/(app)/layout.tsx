import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	return (
		<AppShell userName={session.user?.name} userEmail={session.user?.email}>
			{children}
		</AppShell>
	);
}
