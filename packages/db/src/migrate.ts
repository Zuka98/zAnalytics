import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "../../../.env") });

const runMigrate = async () => {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
	}

	const connection = postgres(process.env.DATABASE_URL, {
		max: 1,
		onnotice: () => {},
	});
	const db = drizzle(connection);

	console.log("Running migrations...");

	const start = Date.now();
	await migrate(db, { migrationsFolder: resolve(__dirname, "../drizzle") });
	const end = Date.now();

	console.log(`Migrations completed in ${end - start}ms`);
	process.exit(0);
};

runMigrate().catch((err) => {
	console.error("Migration failed");
	console.error(err);
	process.exit(1);
});
