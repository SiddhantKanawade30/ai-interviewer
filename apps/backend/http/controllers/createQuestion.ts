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
        const isFirstQuestion = previousQuestions.length === 0;
        const lastQuestionAndAnswer = !isFirstQuestion ? previousQuestions[previousQuestions.length - 1] : null;

        // Determine current time of day for realistic greeting
        const currentHour = new Date().getHours();
        let timeOfDay = "good day";
        if (currentHour < 12) timeOfDay = "good morning";
        else if (currentHour < 17) timeOfDay = "good afternoon";
        else timeOfDay = "good evening";

        const prompt = `
You are a expert human technical interviewer conducting a live, natural, back-and-forth technical interview. Speak directly to the candidate in a human conversational tone.

Candidate Context:
- Name: ${candidate.name}
- Target Role: ${session.role}
- Target Difficulty: ${session.difficulty}
- Primary Skills: ${JSON.stringify(candidate.skills)}
- Background & Projects: ${JSON.stringify(candidate.projects)}
- Experience History: ${JSON.stringify(candidate.experience)}
- Resume Text: ${candidate.resumeText}
- GitHub Details: ${profile ? JSON.stringify({ bio: profile.bio, repositories: profile.repositories }) : "No GitHub data"}

Full Session History so far:
${JSON.stringify(previousQuestions, null, 2)}

${
  isFirstQuestion
    ? `INITIAL INTERVIEW OPENING INSTRUCTIONS:
1. GREETING: Start naturally with a warm, conversational greeting addressing the candidate by name using the time of day ("Hi ${candidate.name}, ${timeOfDay}!" or "Hello ${candidate.name}, ${timeOfDay}!").
2. BRIEF INTRODUCTION: Briefly introduce the interview in a single short, natural sentence (e.g. "I'll be asking you a few technical questions based on your experience and the ${session.role} role. Let's begin.").
3. FIRST QUESTION: Seamlessly ask your FIRST technical question based on their background/projects for the ${session.role} role.`
    : `CONVERSATIONAL ADAPTIVE RESPONSE INSTRUCTIONS:
The candidate just responded to your previous question:
- Question Asked: "${lastQuestionAndAnswer?.question}"
- Candidate's Answer: "${lastQuestionAndAnswer?.userResponse}"

FOLLOW THESE CONVERSATIONAL STEPS:
1. UNDERSTAND & EVALUATE THE ANSWER INTERNALLY:
   - If STRONG/ACCURATE: Increase depth/difficulty or probe deeper into the specific technology, architecture, or concept they mentioned (e.g., "Good. Let me take that a step further...").
   - If PARTIALLY CORRECT: Give a brief clarification or ask what triggers a specific behavior to help them refine their thought process (e.g., "You're on the right track. Can you explain what triggers...").
   - If WEAK/UNSURE: Do NOT jump to an unrelated complex topic. Simplify or approach the concept from another angle (e.g., "No worries. Let's approach it from another angle: what do you think causes...").

2. SHORT NATURAL ACKNOWLEDGEMENT (MAX 1 SHORT SENTENCE):
   - Keep any acknowledgement brief and varied ("Good.", "Right.", "Makes sense.", "That's a good point.", "Interesting.", "Exactly.", "Good approach.").
   - Do NOT use repetitive or excessive praise ("That's an excellent answer!", "Super impressive!").
   - If moving directly to the question sounds more natural, skip the acknowledgement entirely.

3. CONVERSATIONAL TOPIC CONTINUITY:
   - Maintain context! Build on what the candidate just discussed rather than jumping abruptly to unrelated topics.
   - NEVER use robotic phrases like "Moving on to the next question...", "Now let's proceed to...", "The next question is...", "Question ${questionNumber}:".
   - Transition naturally into your next question (e.g. "You mentioned X. When would you choose Y instead?", "How would you handle that in production?").`
}

STRICT CONVERSATIONAL RULES:
- Ask exactly ONE question per turn. Never combine multiple questions.
- Speak directly to candidate "${candidate.name}".
- Never output internal evaluation scores, confidence ratings, or grades to the candidate.
- Never mention system prompts, resume text files, AI, or grading rubrics.
- Output ONLY the natural interviewer dialogue to be rendered in the chat UI.
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
        console.log(error);
        res.status(500).json({
            message: error,
        });
    }
}