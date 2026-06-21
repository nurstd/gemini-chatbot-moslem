const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Maintain conversation history to send to backend API
let conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to UI and history
  appendMessage('user', userMessage);
  conversationHistory.push({ role: 'user', text: userMessage });
  input.value = '';

  // Show temporary "Thinking..." message
  const thinkingMessageEl = appendMessage('bot', 'Thinking...');
  thinkingMessageEl.classList.add('thinking');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation: conversationHistory })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.result) {
      // Replace thinking message with the AI's actual reply (rendered as markdown)
      if (window.marked) {
        thinkingMessageEl.innerHTML = marked.parse(data.result);
      } else {
        thinkingMessageEl.textContent = data.result;
      }
      thinkingMessageEl.classList.remove('thinking');
      
      // Save the model response to history
      conversationHistory.push({ role: 'model', text: data.result });
    } else {
      throw new Error('No result in response');
    }
  } catch (error) {
    console.error('Error fetching chat response:', error);
    thinkingMessageEl.textContent = 'Failed to get response from server.';
    thinkingMessageEl.classList.add('error');
  } finally {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  if (sender === 'bot') {
    if (window.marked) {
      msg.innerHTML = marked.parse(text);
    } else {
      msg.textContent = text;
    }
  } else {
    msg.textContent = text;
  }
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
