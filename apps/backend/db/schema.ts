import { integer, pgTable, varchar, timestamp, text, jsonb } from "drizzle-orm/pg-core";

export const socials = pgTable("socials", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    github: varchar().unique().notNull(),
    linkedIn: varchar().unique().notNull(),
    createdAt: timestamp().defaultNow(),
})

export const github_profiles = pgTable("github_profiles", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    candidateId: integer("candidate_id")
                .notNull()
                .references(() => socials.id), // Added this as camelCase but mapped to snake_case column
    username: varchar().notNull(),
    name: varchar(),
    bio: text(),
    followers: integer().default(0),
    repositories: jsonb(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});