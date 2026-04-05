import "./globals.css";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/shadcn/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
	title: "zAnalytics",
	description: "Analytics admin panel",
	icons: {
		icon: "/logo.svg",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={cn("font-sans", geist.variable)}
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<TooltipProvider>{children}</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
