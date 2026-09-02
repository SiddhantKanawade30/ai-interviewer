
import type { Request, Response } from "express";
import { createQuestionSchema } from "../../zod/socials";
import { db } from "../../db";
import {
    interviewQuestions,
    interviewSessions,
    candidates,
    github_profiles,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import { generateInterviewQuestion, evaluateInterviewSession, type EvaluationResult } from "../../services/interview.service";

export async function createQuestions(req: Request, res: Response) {
    try {
        const result = createQuestionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Incorrect Body",
                errors: result.error
            });
        }

        const { sessionId } = result.data;

        const session = await db.query.interviewSessions.findFirst({
            where: eq(interviewSessions.id, sessionId),
        });

        if (!session) {
            throw new Error("Session not found");
        }

        const candidate = await db.query.candidates.findFirst({
            where: eq(candidates.id, session.candidateId),
        });

        if (!candidate) {
            throw new Error("Candidate not found");
        }

        const profile = await db.query.github_profiles.findFirst({
            where: eq(github_profiles.candidateId, session.candidateId),
        });

        if (!profile) {
            throw new Error("Profile not found");
        }

        const previousQuestions = await db
            .select({
                question: interviewQuestions.question,
                questionNumber: interviewQuestions.questionNumber,
                userResponse: interviewQuestions.userResponse,
            })
            .from(interviewQuestions)
            .where(eq(interviewQuestions.sessionId, sessionId));

        if (session.status === "completed" || previousQuestions.length >= 5) {
            let evaluation: EvaluationResult;

            if (session.score !== null && session.feedback) {
                evaluation = session.feedback as EvaluationResult;
            } else {
                evaluation = await evaluateInterviewSession(candidate, session, previousQuestions);

                await db
                    .update(interviewSessions)
                    .set({
                        status: "completed",
                        completedAt: session.completedAt ?? new Date(),
                        score: evaluation.score,
                        feedback: evaluation,
                    })
                    .where(eq(interviewSessions.id, sessionId));
            }

            return res.status(200).json({
                message: "Interview session is completed",
                isCompleted: true,
                evaluation,
            });
        }

        const questionNumber = previousQuestions.length + 1;

        const prompt = `
You are an AI technical interviewer.

Candidate information:

Name:
${candidate.name}

Role:
${session.role}

Difficulty:
${session.difficulty}

Skills:
${JSON.stringify(candidate.skills)}

Experience:
${JSON.stringify(candidate.experience)}

Education:
${JSON.stringify(candidate.education)}

Projects:
${JSON.stringify(candidate.projects)}

Resume:
${candidate.resumeText}

GitHub:
${profile ? JSON.stringify({
            bio: profile.bio,
            repositories: profile.repositories,
        }) : "No GitHub data available"}

Previous questions and candidate answers:
${JSON.stringify(previousQuestions)}

Generate the next interview question.

Rules:
- Ask exactly ONE question.
- The question must be relevant to the role.
- Match the requested difficulty.
- Prefer questions based on the candidate's actual experience/projects.
- Do not repeat previous questions.
- Do not mention that you are using their resume.
- Return only the question text.
`;

        const generatedQuestion = await generateInterviewQuestion(prompt);

        const [question] = await db
            .insert(interviewQuestions)
            .values({
                sessionId,
                question: generatedQuestion,
                questionNumber,
                questionType: "technical",
            })
            .returning();

        return res.status(201).json({
            message: "Question generated successfully",
            isCompleted: false,
            question,
            questionNumber,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error,
        })
    }
}   