const magic8Ball = document.getElementById('magic-8-ball');
const answerText = document.getElementById('answer-text');
const questionForm = document.getElementById('question-form');
const userInput = document.getElementById('user-input');
const askAgainBtn = document.getElementById('ask-again-btn');
const scene = document.querySelector('.scene');

// A simple function to show the final answer and clean up
function showFinalState(reply) {
    // This is the key: we remove the 'shaking' class here to stop the infinite loop
    magic8Ball.classList.remove('shaking');
    answerText.textContent = reply;
    setTimeout(() => {
        askAgainBtn.classList.add('visible');
    }, 500);
}

// Handle form submission
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = userInput.value.trim();
    if (!question) return;

    // 1. Set up the UI for the loading state
    questionForm.classList.add('hidden');
    answerText.textContent = '...';
    scene.classList.add('zoomed-in');
    magic8Ball.classList.add('shaking'); // This now starts the infinite shake

    try {
        // 2. Call our backend API and wait for the response
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.reply) {
            throw new Error("Invalid response from server.");
        }

        // 3. Once we have the answer, show it.
        showFinalState(data.reply);

    } catch (error) {
        console.error("FRONTEND ERROR:", error);
        // If anything goes wrong, show an error message.
        showFinalState("Something broke. Check the console.");
    }
});

// Handle "Ask Again" button click
askAgainBtn.addEventListener('click', () => {
    scene.classList.remove('zoomed-in');
    askAgainBtn.classList.remove('visible');
    answerText.textContent = '';
    userInput.value = '';
    setTimeout(() => {
        questionForm.classList.remove('hidden');
    }, 500);
});