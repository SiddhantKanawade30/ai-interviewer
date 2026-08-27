import type { Request, Response } from "express";
import { answerQuestionSchema } from "../zod/socials";
import { db } from "../db";
import { interviewQuestions } from "../db/schema";
import { eq } from "drizzle-orm";

export async function submitAnswer(req: Request, res: Response) {
    try {
        const result = answerQuestionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Incorrect Body",
                errors: result.error,
            });
        }

        const { questionId, answer } = result.data;

        const [updatedQuestion] = await db
            .update(interviewQuestions)
            .set({ userResponse: answer })
            .where(eq(interviewQuestions.id, questionId))
            .returning();

        if (!updatedQuestion) {
            throw new Error("Question not found");
        }

        return res.status(200).json({
            message: "Answer submitted successfully",
            question: updatedQuestion,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to submit answer",
        });
    }
}
