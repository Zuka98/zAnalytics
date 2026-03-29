import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

// --- Users ---

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	name: text("name"),
	role: text("role").notNull().default("user"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// --- Products ---

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey(),
	key: text("key").notNull().unique(),
	name: text("name").notNull(),
	platform: text("platform").notNull().default("chrome"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// --- Installs ---

export const installStatus = pgEnum("install_status", [
	"active",
	"inactive",
	"uninstalled",
]);

export const installs = pgTable(
	"installs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		productId: uuid("product_id")
			.notNull()
			.references(() => products.id),
		installId: uuid("install_id").notNull(),
		firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		currentVersion: text("current_version"),
		status: installStatus("status").notNull().default("active"),
		linkedUserId: text("linked_user_id"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		unique("uq_product_install").on(t.productId, t.installId),
		index("idx_installs_status").on(t.status),
		index("idx_installs_product_id").on(t.productId),
		index("idx_installs_product_status").on(t.productId, t.status),
		index("idx_installs_first_seen_at").on(t.firstSeenAt),
	],
);

// --- Events ---

export const events = pgTable(
	"events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		productId: uuid("product_id")
			.notNull()
			.references(() => products.id),
		installId: uuid("install_id"),
		eventName: text("event_name").notNull(),
		occurredAt: timestamp("occurred_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		version: text("version"),
		properties: jsonb("properties").$type<Record<string, unknown>>(),
		source: text("source"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		index("idx_events_product_id").on(t.productId),
		index("idx_events_occurred_at").on(t.occurredAt),
		index("idx_events_product_occurred").on(t.productId, t.occurredAt),
		index("idx_events_event_name").on(t.eventName),
	],
);

// --- Inferred Types ---

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;
