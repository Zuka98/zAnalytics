import { db, users } from "@zanalytics/db";
import { hash } from "bcrypt-ts";
import { eq } from "drizzle-orm";

async function main() {
	const [, , email, password, name, role] = process.argv;

	if (!email || !password) {
		console.error("Usage: pnpm create:user <email> <password> [name] [role]");
		process.exit(1);
	}

	const validRoles = ["admin", "user"] as const;
	const userRole = role ?? "user";

	if (!validRoles.includes(userRole as (typeof validRoles)[number])) {
		console.error(
			`Invalid role "${userRole}". Must be one of: ${validRoles.join(", ")}`,
		);
		process.exit(1);
	}

	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (existing.length > 0) {
		console.error(`User with email "${email}" already exists.`);
		process.exit(1);
	}

	const hashedPassword = await hash(password, 10);

	const [user] = await db
		.insert(users)
		.values({
			email,
			password: hashedPassword,
			name: name || null,
			role: userRole,
		})
		.returning({ id: users.id, email: users.email, role: users.role });

	console.log(`User created: ${user.email} (${user.role})`);
	process.exit(0);
}

main().catch((err) => {
	console.error("Failed to create user:", err);
	process.exit(1);
});
