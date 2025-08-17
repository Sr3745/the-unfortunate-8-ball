// Get all the elements we need
const magic8Ball = document.getElementById('magic-8-ball');
const answerText = document.getElementById('answer-text');
const questionForm = document.getElementById('question-form');
const userInput = document.getElementById('user-input');
const askAgainBtn = document.getElementById('ask-again-btn');
const scene = document.querySelector('.scene');

// Handle form submission
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = userInput.value.trim();
    if (!question) return;

    // 1. Start the process
    questionForm.classList.add('hidden');
    answerText.textContent = '...';
    scene.classList.add('zoomed-in');
    magic8Ball.classList.add('shaking');

    try {
        // 2. Call our backend API
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        // --- NEW: Check if the server responded correctly ---
        if (!response.ok) {
            // If the server sent an error, throw it to the catch block
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply;

        // 3. Stop shaking and show the answer
        magic8Ball.addEventListener('animationend', () => {
            magic8Ball.classList.remove('shaking');
            answerText.textContent = reply;
            setTimeout(() => {
                askAgainBtn.classList.add('visible');
            }, 500);
        }, { once: true });

    } catch (error) {
        // --- NEW: This will catch and log any error ---
        console.error("FRONTEND ERROR:", error); // This will show up in the browser console
        magic8Ball.classList.remove('shaking');
        answerText.textContent = "Something broke. Check the console.";
        setTimeout(() => {
            askAgainBtn.classList.add('visible');
        }, 500);
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