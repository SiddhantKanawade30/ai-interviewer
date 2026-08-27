import { integer, pgTable, varchar, timestamp, text, jsonb } from "drizzle-orm/pg-core";

export const candidates = pgTable("candidates", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull(),
    email: varchar(),

    role: varchar(),
    experience: jsonb(),

    skills: jsonb(),
    education: jsonb(),
    projects: jsonb(),

    resumeText: text(),

    createdAt: timestamp("created_at").defaultNow(),
})

export const socials = pgTable("socials", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    github: varchar().unique().notNull(),
    linkedIn: varchar().unique().notNull(),
    candidateId: integer("candidate_id")
        .notNull()
        .unique()
        .references(() => candidates.id),
    createdAt: timestamp().defaultNow(),
})

export const github_profiles = pgTable("github_profiles", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    candidateId: integer("candidate_id")
        .notNull()
        .unique()
        .references(() => candidates.id),
    username: varchar().notNull(),
    name: varchar(),
    bio: text(),
    followers: integer().default(0),
    repositories: jsonb(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const interviewSessions = pgTable("interview_sessions", {
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    candidateId: integer("candidate_id")
        .notNull()
        .references(() => candidates.id),
    role: varchar().notNull(),
    difficulty: varchar().notNull(),

    status: varchar().notNull().default("pending"),

    recordingUrl: text(),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),

    createdAt: timestamp("created_at").defaultNow(),
})

export const interviewQuestions = pgTable("interview_questions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sessionId: integer("session_id")
        .notNull()
        .references(() => interviewSessions.id),
    question: text().notNull(),
    questionNumber: integer().notNull(),
    userResponse: text(),
    feedback: jsonb(),
    questionType: varchar().notNull(),
    timestamp: timestamp().defaultNow(),
})