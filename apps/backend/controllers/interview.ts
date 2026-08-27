import type { Request, Response } from "express";
import { createSessionSchema } from "../zod/socials";
import { db } from "../db";
import { interviewSessions } from "../db/schema";

export async function createSession(req: Request, res: Response) {
    const { candidateId, role, difficulty } = req.body;

    const result = createSessionSchema.safeParse({
        candidateId,
        role,
        difficulty,
    });

    if (!result.success) {
        return res.status(400).json({
            message: "Incorrect Body",
            errors: result.error,
        });
    }

    try {
        const [session] = await db
            .insert(interviewSessions)
            .values(result.data)
            .returning({
                id: interviewSessions.id,
            });

        if (!session) {
            throw new Error("Failed to create interview session");  
        }

        return res.status(201).json({
            message: "Interview session created successfully",
            sessionId: session.id,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create interview session",
        });
    }
}