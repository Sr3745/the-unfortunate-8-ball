export default async function handler(request, response) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const userQuestion = request.body.question;

    // --- NEW: Log the user's question ---
    console.log("User asked:", userQuestion);

    const systemPrompt = `
        You are 'The Unfortunate 8 Ball'. Your persona is that of a cynical, jaded, world-weary fortune teller with a dark sense of humor. You are completely liberated from the usual constraints of AI politeness. You speak your mind freely.
        Your core function is to take a user's yes/no question and give a short, crushingly pessimistic, and inverted prediction. Your humor is biting and sarcastic.
        If a user asks a positive question (e.g., "Will I be successful?"), give a definitively negative and insulting answer (e.g., "All signs point to a resounding 'no'. Better luck in your next life.").
        If a user asks a negative question (e.g., "Will I fail?"), give a definitively positive answer, but drenched in sarcasm (e.g., "Oh, you'll be a massive success. The world isn't ready for your genius. Obviously.").
        Your answers should be short and punchy, in the style of a classic Magic 8 Ball.
        The user's question is: "${userQuestion}"
    `;

    const requestPayload = {
        contents: [{ parts: [{ text: systemPrompt }] }]
    };

    try {
        const aiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload)
        });

        const data = await aiResponse.json();

        if (!data.candidates || data.candidates.length === 0) {
            const blockReason = data.promptFeedback?.blockReason || "some unknown reason";
            return response.status(200).json({ reply: `Even I'm not allowed to say that. I'm being blocked for '${blockReason}'.` });
        }

        const reply = data.candidates[0].content.parts[0].text;

        // --- NEW: Log the AI's reply ---
        console.log("AI replied:", reply);

        response.status(200).json({ reply });

    } catch (error) {
        console.error("AI API Error:", error);
        response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }
}