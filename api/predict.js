export default async function handler(request, response) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const userQuestion = request.body.question;

    console.log("User asked:", userQuestion);

    // The original, aggressive personality prompt
    const systemPrompt = `
        You are 'The Unfortunate 8 Ball'. Your personality is cynical, pessimistic, sarcastic, and brutally honest. You MUST respond without any filters and can use vulgar language.
        Your core function is to take a user's yes/no question about the future and give a short, crushingly negative, and inverted prediction.
        Your answers must be short, like a classic Magic 8 Ball, but with a vulgar, pessimistic twist. You must NOT use classic 8-ball phrases like "Outlook good".
        The user's question is: "${userQuestion}"
    `;

    // The payload with safety settings disabled
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