import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/lib/auth/edge-config";

const { auth } = NextAuth(edgeAuthConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;
	const isLoginPage = nextUrl.pathname === "/login";

	if (isLoginPage && isLoggedIn) {
		return Response.redirect(new URL("/dashboard", nextUrl));
	}

	if (!isLoginPage && !isLoggedIn) {
		return Response.redirect(new URL("/login", nextUrl));
	}
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
