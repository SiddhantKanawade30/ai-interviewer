import { generateLLMCompletion, generateLLMJSON } from "./llm.service";

export async function generateInterviewQuestion(prompt: string): Promise<string> {
    return generateLLMCompletion(prompt);
}

export interface QuestionFeedback {
    questionNumber: number;
    question: string;
    userResponse: string;
    feedback: string;
}

export interface EvaluationResult {
    score: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
    questionBreakdown: QuestionFeedback[];
    summary: string;
}

export async function evaluateInterviewSession(
    candidate: any,
    session: any,
    previousQuestions: { question: string; questionNumber: number; userResponse: string | null }[]
): Promise<EvaluationResult> {
    const prompt = `
Evaluate the candidate's performance during this interview session based on their answers to the questions.

Candidate Information:
- Name: ${candidate.name}
- Role: ${session.role}
- Difficulty: ${session.difficulty}
- Skills: ${JSON.stringify(candidate.skills)}

Questions and Candidate Responses:
${JSON.stringify(previousQuestions, null, 2)}

Instructions:
1. Calculate an overall score from 0 to 100 based on technical accuracy, depth, and clarity.
2. List 3 key strengths.
3. List 3 areas for improvement (pointing out specific mistakes or weaknesses).
4. Provide an in-depth constructive critique ("detailedFeedback") explaining where the candidate struggled, what errors they made, and how to improve.
5. Provide a question-by-question breakdown ("questionBreakdown") evaluating each question and candidate response pair.

Return ONLY a valid JSON object matching this exact format:
{
  "score": 85,
  "strengths": [
    "Key strength 1",
    "Key strength 2",
    "Key strength 3"
  ],
  "improvements": [
    "Specific mistake/weakness 1",
    "Specific mistake/weakness 2",
    "Specific mistake/weakness 3"
  ],
  "detailedFeedback": "Comprehensive constructive feedback highlighting exact mistakes made during the interview, missed technical concepts, and actionable guidance for improvement.",
  "questionBreakdown": [
    {
      "questionNumber": 1,
      "question": "Question text",
      "userResponse": "Candidate answer text",
      "feedback": "Specific feedback on this response: what was correct, what was incorrect/missing, and how to answer it better."
    }
  ],
  "summary": "Executive summary and overall recommendation."
}
`;

    try {
        const parsed = await generateLLMJSON<EvaluationResult>(
            prompt,
            "You are an expert AI technical interviewer and evaluator. Output valid JSON only."
        );

        return {
            score: typeof parsed.score === "number" ? parsed.score : 85,
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
            detailedFeedback: typeof parsed.detailedFeedback === "string" ? parsed.detailedFeedback : "Identify key technical trade-offs and edge cases in future answers.",
            questionBreakdown: Array.isArray(parsed.questionBreakdown) ? parsed.questionBreakdown : [],
            summary: typeof parsed.summary === "string" ? parsed.summary : "Candidate completed the technical interview session.",
        };
    } catch (error) {
        console.error("Failed to evaluate interview via LLM, using fallback evaluation:", error);
        return calculateFallbackEvaluation(previousQuestions);
    }
}

function calculateFallbackEvaluation(
    previousQuestions: { question: string; questionNumber: number; userResponse: string | null }[]
): EvaluationResult {
    const answeredCount = previousQuestions.filter(q => q.userResponse && q.userResponse.trim().length > 0).length;
    const total = previousQuestions.length || 1;
    const fallbackScore = Math.min(100, Math.max(50, Math.round((answeredCount / total) * 85)));

    return {
        score: fallbackScore,
        strengths: [
            "Demonstrated active participation throughout the technical interview.",
            "Structured response approach across the questions."
        ],
        improvements: [
            "Elaborate more on edge-case scenarios and production trade-offs.",
            "Provide quantitative data or code examples when answering technical questions."
        ],
        detailedFeedback: "Your responses demonstrated good baseline understanding, but lacked specific implementation details and production edge-case handling. To improve, structure your technical answers with concrete examples and discuss trade-offs explicitly.",
        questionBreakdown: previousQuestions.map((q, idx) => ({
            questionNumber: q.questionNumber || idx + 1,
            question: q.question,
            userResponse: q.userResponse || "No answer provided.",
            feedback: q.userResponse && q.userResponse.trim().length > 0
                ? "Response was received. Could be improved by adding specific technical implementation steps and error handling."
                : "No response was provided for this question."
        })),
        summary: `The candidate completed ${answeredCount} out of ${total} questions during the session.`
    };
}
