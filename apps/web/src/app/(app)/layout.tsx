import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
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
		<>
			<AppHeader />
			<main>{children}</main>
		</>
	);
}
