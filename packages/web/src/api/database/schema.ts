import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  photo: text("photo"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  room: text("room").notNull(),
  arrival: text("arrival").notNull(),
  departure: text("departure").notNull(),
  guests: integer("guests").notNull(),
  message: text("message"),
  status: text("status").notNull().default("requested"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
// Prepared persistence for a future authenticated administration panel.
export const roomCatalog = sqliteTable("room_catalog", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
});
export const seasonalRates = sqliteTable("seasonal_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: text("room_id").notNull(),
  start: text("start").notNull(),
  end: text("end").notNull(),
  price: integer("price").notNull(),
});
export const roomAvailability = sqliteTable("room_availability", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: text("room_id").notNull(),
  date: text("date").notNull(),
  available: integer("available", { mode: "boolean" }).notNull(),
});
export const siteContent = sqliteTable("site_content", {
  key: text("key").primaryKey(),
  data: text("data").notNull(),
});

/**
 * Define your database schema here, then apply it with `bun run db:push`
 * (from packages/web). Re-export any generated schema from this file
 * (e.g. Better Auth's auth-schema.ts) so drizzle generates complete migrations.
 * Table patterns and conventions: skills/app/references/api.md
 */
