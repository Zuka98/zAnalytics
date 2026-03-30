import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./feedback-types";
export * from "./schema";

const globalForDb = globalThis as unknown as {
	_db: ReturnType<typeof drizzle> | undefined;
	_pgConnection: ReturnType<typeof postgres> | undefined;
};

if (!globalForDb._pgConnection) {
	globalForDb._pgConnection = postgres(process.env.DATABASE_URL ?? "");
}

if (!globalForDb._db) {
	globalForDb._db = drizzle(globalForDb._pgConnection, { schema });
}

export const db = globalForDb._db;
