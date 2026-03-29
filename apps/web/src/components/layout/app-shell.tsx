import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface AppShellProps {
	children: ReactNode;
	userName?: string | null;
	userEmail?: string | null;
}

export function AppShell({ children, userName, userEmail }: AppShellProps) {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar userName={userName} userEmail={userEmail} />
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
