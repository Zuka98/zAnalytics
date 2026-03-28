import { db, users } from "@zanalytics/db";
import { compare } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { edgeAuthConfig } from "./edge-config";
import type { Role } from "./roles";

export const authConfig = {
	...edgeAuthConfig,
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const email = credentials?.email as string | undefined;
				const password = credentials?.password as string | undefined;

				if (!email || !password) return null;

				const [user] = await db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (!user) return null;

				const isValid = await compare(password, user.password);
				if (!isValid) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role as Role,
				};
			},
		}),
	],
} satisfies NextAuthConfig;
