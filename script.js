const magic8Ball = document.getElementById('magic-8-ball');
const answerText = document.getElementById('answer-text');
const questionForm = document.getElementById('question-form');
const userInput = document.getElementById('user-input');
const askAgainBtn = document.getElementById('ask-again-btn');
const scene = document.querySelector('.scene');

// A function to show the final answer and clean up
function showAnswer(reply) {
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

    questionForm.classList.add('hidden');
    answerText.textContent = '...';
    scene.classList.add('zoomed-in');
    magic8Ball.classList.add('shaking');

    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        // More robust check: ensure the response is ok AND is JSON
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.reply) {
            throw new Error("Invalid response format from server.");
        }

        // Use the animationend event to wait for the shake to finish
        magic8Ball.addEventListener('animationend', () => {
            showAnswer(data.reply);
        }, { once: true });

    } catch (error) {
        console.error("FRONTEND ERROR:", error);
        // If there's an error, show it immediately without waiting for animation
        showAnswer("Something broke. Check the console.");
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