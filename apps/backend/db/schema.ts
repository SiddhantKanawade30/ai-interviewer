import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const socials = pgTable("socials", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    github: varchar().unique().notNull(),
    linkedIn: varchar().unique().notNull(),
    createdAt: timestamp().defaultNow(),
})

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
