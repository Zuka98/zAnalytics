import type { NextAuthConfig } from "next-auth";
import type { Role } from "./roles";

export const edgeAuthConfig = {
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	trustHost: true,
	providers: [],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role as Role;
			}
			return token;
		},
		session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as Role;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
