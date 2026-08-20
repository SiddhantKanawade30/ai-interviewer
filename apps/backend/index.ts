// import express from "express"
// import cors from "cors"
// import { preInterviewSchema } from "./zod/socials"
// import { OpenRouter } from "@openrouter/sdk";
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { eq } from 'drizzle-orm';
// import { socials } from './db/schema';

// const db = drizzle(process.env.DATABASE_URL!);

// const app = express()

// app.use(cors())
// app.use(express.json())

// const openrouter = new OpenRouter({
//     apiKey: process.env.OPENROUTER_API_KEY,
// });

// app.post("/api/v1/pre-interview", async(req, res) => {
//     const { github, linkedIn } = req.body

//     const result = preInterviewSchema.safeParse({ github, linkedIn })

//     if (!result.success) {
//         return res.status(411).json({
//             message: "Incorrect Body",
//             errors: result.error
//         })
//     }

//     await db.insert(socials).values(result.data)

//     return res.status(200).json({
//         message: "User added successfully"
//     })
// })

// app.post("/api/v1/interview/question", async (req, res) => {
//     const { role, difficulty, previousQuestion, candidateAnswer } = req.body;
//     console.log(req.body)

//     const question = `You are interviewing a candidate for a ${role} position.

//     Difficulty: ${difficulty}

//     Ask the candidate one technical question based on their previous answer.
//     ${previousQuestion ? `Previous Question: ${previousQuestion}` : ''}
//     ${candidateAnswer ? `Candidate Answer: ${candidateAnswer}` : ''}
    
//     Do not provide the answer. Give only a technical question`

//     console.log("trying")
//     try {
//         console.log("llm calling")
        
//         const stream = await openrouter.chat.send({
//             chatRequest: {
//                 model: "openai/gpt-oss-20b:free",
//                 messages: [
//                     {
//                         role: "user",
//                         content: question
//                     }
//                 ],
//                 stream: true
//             }
//         });

//         let responseText = "";
//         //@ts-ignore
//         for await (const chunk of stream) {
//             const content = chunk.choices[0]?.delta?.content;
//             if (content) {
//                 responseText += content;
//                 process.stdout.write(content);
//             }

//             // Usage information comes in the final chunk
//             if (chunk.usage) {
//                 console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
//             }
//         }

//         console.log("\nllm responded")

//         return res.status(200).json({
//             question: responseText
//         })
//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             message: "Failed to fetch question from LLM"
//         });
//     }
// })

// app.listen(8000, () => {
//     console.log("backend server is running on port 8000")
// })

import express from "express";
import cors from "cors";

import onboardingRouter from "./routes/onboarding.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/onboarding", onboardingRouter);

app.listen(8000, () => {
    console.log("backend server is running on port 8000")
})
