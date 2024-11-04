document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatContainer = document.getElementById('chat-container');
    const loginContainer = document.getElementById('login-container');
    const chatHistory = document.getElementById('chat-history');

    let username = '';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        username = formData.get('username');
        const password = formData.get('password');

        // Perform user authentication (this is a placeholder, replace with actual authentication logic)
        if (username && password) {
            loginContainer.style.display = 'none';
            chatContainer.style.display = 'block';
        } else {
            alert('Invalid username or password');
        }
    });

    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = messageInput.value;
        if (message.trim() === '') return;

        // Display user message in chat history
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'user-message';
        userMessageElement.textContent = `${username}: ${message}`;
        chatHistory.appendChild(userMessageElement);

        // Send user message to Node.js server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, message })
        });

        const data = await response.json();

        // Display response from Azure OpenAI in chat history
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'bot-message';
        botMessageElement.textContent = `Bot: ${data.response}`;
        chatHistory.appendChild(botMessageElement);

        messageInput.value = '';
    });
});
