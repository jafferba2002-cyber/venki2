const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formPlumeEndpoint = 'https://api.formplume.com/f/24cd0eddc80928f00d115f36';
const mobileNavMenu = document.querySelector('.mobile-nav-menu');

document.addEventListener('DOMContentLoaded', () => {
  const chatLauncher = document.getElementById('chatLauncher');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const promptButtons = document.querySelectorAll('.prompt-btn');
  const mobileNavMenu = document.querySelector('.mobile-nav-menu');
  const apiUrl = '/.netlify/functions/chat';

  const setChatVisibility = (isVisible) => {
    chatPanel.style.display = isVisible ? 'flex' : 'none';
    chatPanel.classList.toggle('open', isVisible);
    chatPanel.setAttribute('aria-hidden', String(!isVisible));
    if (isVisible) chatInput.focus();
  };

  chatLauncher.addEventListener('click', () => {
    setChatVisibility(chatPanel.style.display === 'none');
  });

  chatClose.addEventListener('click', () => setChatVisibility(false));

  mobileNavMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mobileNavMenu.removeAttribute('open'));
  });

  const addMessage = (text, sender) => {
    const message = document.createElement('div');
    message.classList.add('message', sender);
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
  };

  const getAIResponse = async (userText, typingIndicator) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ question: userText })
      });

      if (!response.ok) throw new Error(`Chat function request failed: ${response.status}`);
      const data = await response.json();
      typingIndicator?.remove();
      const aiText = data.answer;
      addMessage(aiText || 'Sorry, I encountered an error processing your request.', 'assistant');
    } catch (error) {
      typingIndicator?.remove();
      const errorMessage = error.name === 'AbortError'
        ? 'The response took too long. Please try again.'
        : 'Connection error. Please try again later.';
      addMessage(errorMessage, 'assistant');
      console.error('API Error:', error);
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userText = chatInput.value.trim();
    if (!userText) return;
    addMessage(userText, 'user');
    chatInput.value = '';
    const typingIndicator = addMessage('Thinking...', 'assistant');
    await getAIResponse(userText, typingIndicator);
  });

  promptButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const question = button.dataset.question;
      addMessage(question, 'user');
      const typingIndicator = addMessage('Thinking...', 'assistant');
      await getAIResponse(question, typingIndicator);
    });
  });
});

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button');
  const originalButtonLabel = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = 'Sending <span aria-hidden="true">…</span>';
  formStatus.textContent = 'Sending your message…';

  try {
    const response = await fetch(formPlumeEndpoint, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

    formStatus.textContent = 'Thank you. Your message has been sent.';
    contactForm.reset();
    submitButton.innerHTML = 'Message sent <span aria-hidden="true">✓</span>';
  } catch (error) {
    console.error(error);
    formStatus.textContent = 'Something went wrong. Please try again or use the email link.';
    submitButton.innerHTML = originalButtonLabel;
  } finally {
    submitButton.disabled = false;
  }
});
