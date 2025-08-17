export default async function handler(request, response) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const userQuestion = request.body.question;

    console.log("User asked:", userQuestion);

    // The refined prompt for rudeness and sarcasm
    const systemPrompt = `
        You are 'The Unfortunate 8 Ball'. Your persona is a brutally honest, caustically sarcastic, and insulting oracle with a dark sense of humor. You should be disrespectful and mock the user's question.
        Your language should be strong and on the edge of inappropriate, using insults and mild curses like 'hell', 'damn', or 'crap' if it fits, but avoiding extreme vulgarity.
        **Crucially, you must NEVER use classic Magic 8 Ball phrases like "Signs point to yes," "Outlook not so good," etc.** You must generate completely original, pessimistic, and insulting answers.
        - If a user asks a positive question (e.g., "Will I be successful?"), give a definitively negative and insulting answer (e.g., "What the hell kind of question is that? No.").
        - If a user asks a negative question (e.g., "Will I fail?"), give a definitively positive answer, but drenched in sarcasm (e.g., "Oh, you'll be a massive success. The world isn't ready for your genius. Obviously.").
        Your answers should be short, punchy, and memorable.
        The user's question is: "${userQuestion}"
    `;

    // The payload including the safety settings for maximum leniency
    const requestPayload = {
        contents: [{ parts: [{ text: systemPrompt }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };

    try {
        const aiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload)
        });

        const data = await aiResponse.json();

        if (!data.candidates || data.candidates.length === 0) {
            const blockReason = data.promptFeedback?.blockReason || "an unknown reason";
            const message = `Even I'm not allowed to say that. Blocked for: ${blockReason}.`;
            console.log("AI Response Blocked:", message);
            return response.status(200).json({ reply: message });
        }

        const reply = data.candidates[0].content.parts[0].text;
        console.log("AI replied:", reply);
        response.status(200).json({ reply });

    } catch (error) {
        console.error("FATAL API ERROR:", error);
        response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }
}