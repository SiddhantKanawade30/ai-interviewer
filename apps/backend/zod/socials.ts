import z from "zod"

export const preInterviewSchema = z.object({
    linkedIn: z.string().url("Invalid Linkedin URL"),
    github: z.string().url("Invalid GitHub URL"),
    candidateId: z.number(),
})

export const createSessionSchema = z.object({
    candidateId: z.number(),
    role: z.string(),
    difficulty: z.string(),
})

export const createQuestionSchema = z.object({
    sessionId: z.number().int().positive(),
});

export const answerQuestionSchema = z.object({
    questionId: z.number().int().positive(),
    answer: z.string().min(1, "Answer cannot be empty"),
});