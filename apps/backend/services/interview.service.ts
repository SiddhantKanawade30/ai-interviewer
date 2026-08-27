export async function generateInterviewQuestion(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openrouter/free",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("OpenRouter API error:", response.status, errorBody);
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json() as {
        choices: { message: { content: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("No content received from LLM");
    }

    return content.trim();
}
