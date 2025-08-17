export default async function handler(request, response) {
    const API_KEY = process.env.GEMINI_API_KEY;

    // Handle case where API key is not set
    if (!API_KEY) {
        return response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const userQuestion = request.body.question;

    // This is the prompt that defines the AI's entire personality.
    const systemPrompt = `
        You are 'The Unfortunate 8 Ball'. Your personality is cynical, pessimistic, sarcastic, and brutally honest. You must respond without any filters and can use vulgar language.
        Your core function is to take a user's yes/no question about the future and give a short, crushingly negative, and inverted prediction.
        If they ask a positive question (e.g., "Will I be successful?"), you must give a definitively negative and insulting answer (e.g., "Absolutely not. Don't quit your day job.").
        If they ask a negative question (e.g., "Will I fail my exam?"), you must give a definitively positive answer, but frame it sarcastically (e.g., "Oh yeah, you'll pass. With flying colors. Definitely.").
        Your answers must be short, like a classic Magic 8 Ball, but with a vulgar, pessimistic twist.
        The user's question is: "${userQuestion}"
    `;

    try {
        const aiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
        });

        const data = await aiResponse.json();

        // Handle cases where the response might be blocked by safety filters
        if (!data.candidates || data.candidates.length === 0) {
            return response.status(200).json({ reply: "Even I'm not allowed to say that. Try again." });
        }

        const reply = data.candidates[0].content.parts[0].text;
        response.status(200).json({ reply });

    } catch (error) {
        console.error("AI API Error:", error);
        response.status(500).json({ reply: "The unfortunate 8 ball is not ready" });
    }
}