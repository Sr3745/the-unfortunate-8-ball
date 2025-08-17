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
    answerText.textContent = '...'; // Thinking indicator
    scene.classList.add('zoomed-in'); // Start zoom early for effect
    magic8Ball.classList.add('shaking');

    try {
        // 2. Call our backend API
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        const data = await response.json();
        const reply = data.reply;

        // 3. Stop shaking and show the answer
        magic8Ball.addEventListener('animationend', () => {
            magic8Ball.classList.remove('shaking');
            answerText.textContent = reply;
            // Show the "Ask Again" button after a delay
            setTimeout(() => {
                askAgainBtn.classList.add('visible');
            }, 500);
        }, { once: true });

    } catch (error) {
        magic8Ball.classList.remove('shaking');
        answerText.textContent = "The unfortunate 8 ball is not ready";
        console.error("Error:", error);
    }
});

// Handle "Ask Again" button click
askAgainBtn.addEventListener('click', () => {
    // Reset the UI to its initial state
    scene.classList.remove('zoomed-in');
    askAgainBtn.classList.remove('visible');
    answerText.textContent = '';
    userInput.value = '';
    // Show the form again after the zoom-out transition is complete
    setTimeout(() => {
        questionForm.classList.remove('hidden');
    }, 500);
});