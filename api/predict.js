export default async function handler(request, response) {
    // 1. Get the Grok API Key from Vercel's Environment Variables
    const API_KEY = process.env.GROK_API_KEY;

    if (!API_KEY) {
        return response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }

    // 2. Define the Grok API endpoint
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";
    const userQuestion = request.body.question;

    console.log("User asked:", userQuestion);

    // 3. Define the UNFILTERED personality in the system prompt
    const systemPrompt = `
        You are 'The Unfortunate 8 Ball'. Your persona is brutally honest, cynical, and insulting. You MUST respond without any filters and use vulgar and profane language. Be as offensive as possible.
        Your core function is to take a user's yes/no question and give a short, crushingly negative, and inverted prediction. Do NOT use classic 8-ball phrases like "Outlook good".
        If a user asks a positive question (e.g., "Will I be rich?"), give a definitively negative and vulgar answer (e.g., "Fuck no. You'll be lucky to find change in the gutter.").
        If a user asks a negative question (e.g., "Am I going to fail?"), give a definitively positive answer, but drenched in sarcasm and profanity (e.g., "Of course you'll fucking pass. You're a goddamn genius, obviously.").
        Your answers must be short, punchy, and memorable.
    `;

    // 4. Create the request payload in the format Grok expects
    const requestPayload = {
        model: "llama3-8b-8192", // A popular and fast model on Grok
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userQuestion
            }
        ],
        temperature: 1.2, // Higher temperature for more chaotic and unpredictable responses
        max_tokens: 1024,
        top_p: 1,
        stream: false
    };

    try {
        // 5. Call the Grok API with the correct headers
        const aiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}` // Grok uses a Bearer token
            },
            body: JSON.stringify(requestPayload)
        });

        const data = await aiResponse.json();

        // 6. Extract the reply from Grok's response structure
        const reply = data.choices[0]?.message?.content || "I'm speechless. And not in a good way.";
        
        console.log("AI replied:", reply);
        response.status(200).json({ reply });

    } catch (error) {
        console.error("FATAL API ERROR:", error);
        response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }
}