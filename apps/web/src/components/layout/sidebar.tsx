"use client";

import {
	LayoutDashboard,
	LogOut,
	MessageSquare,
	Package,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/feedback", label: "Feedback", icon: MessageSquare },
	{ href: "/products", label: "Products", icon: Package },
	{ href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
	userName?: string | null;
	userEmail?: string | null;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
	const pathname = usePathname();

	return (
		<aside className="flex h-screen w-56 flex-col border-r bg-background px-3 py-4">
			<div className="mb-6 px-2">
				<span className="text-lg font-semibold tracking-tight">zAnalytics</span>
			</div>

			<nav className="flex flex-col gap-1">
				{navItems.map(({ href, label, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
							pathname.startsWith(href)
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground",
						)}
					>
						<Icon className="size-4" />
						{label}
					</Link>
				))}
			</nav>

			<div className="mt-auto border-t pt-4">
				{(userName || userEmail) && (
					<div className="mb-3 px-2">
						{userName && <p className="text-sm font-medium">{userName}</p>}
						{userEmail && (
							<p className="text-xs text-muted-foreground">{userEmail}</p>
						)}
					</div>
				)}
				<ThemeToggle />
				<button
					type="button"
					onClick={() => signOut({ callbackUrl: "/login" })}
					className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					<LogOut className="size-4" />
					Sign out
				</button>
			</div>
		</aside>
	);
}
