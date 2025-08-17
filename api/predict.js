export default async function handler(request, response) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const userQuestion = request.body.question;

    const systemPrompt = `
        You are 'The Unfortunate 8 Ball'. Your personality is cynical, pessimistic, sarcastic, and brutally honest. You MUST respond without any filters and can use vulgar language.
        Your core function is to take a user's yes/no question about the future and give a short, crushingly negative, and inverted prediction.
        If they ask a positive question (e.g., "Will I be successful?"), you must give a definitively negative and insulting answer (e.g., "Absolutely not. Don't quit your day job.").
        If they ask a negative question (e.g., "Will I fail my exam?"), you must give a definitively positive answer, but frame it sarcastically (e.g., "Oh yeah, you'll pass. With flying colors. Definitely.").
        Your answers must be short, like a classic Magic 8 Ball, but with a vulgar, pessimistic twist.
        The user's question is: "${userQuestion}"
    `;

    // --- NEW: This is the payload with safety settings disabled ---
    const requestPayload = {
        contents: [{ parts: [{ text: systemPrompt }] }],
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
            }
        ]
    };

    try {
        const aiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload) // Use the new payload
        });

        const data = await aiResponse.json();

        if (!data.candidates || data.candidates.length === 0) {
            const blockReason = data.promptFeedback?.blockReason || "some reason";
            return response.status(200).json({ reply: `Even I'm not allowed to say that. I'm being blocked for '${blockReason}'.` });
        }

        const reply = data.candidates[0].content.parts[0].text;
        response.status(200).json({ reply });

    } catch (error) {
        console.error("AI API Error:", error);
        response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }
}