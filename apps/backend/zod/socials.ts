import z from "zod"

export const preInterviewSchema = z.object({
    linkedIn: z.string().url("Invalid Linkedin URL"),
    github: z.string().url("Invalid GitHub URL"),
})