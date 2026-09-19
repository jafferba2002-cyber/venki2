const chatLauncher = document.getElementById('chatLauncher');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formPlumeEndpoint = 'https://api.formplume.com/f/24cd0eddc80928f00d115f36';

function toggleChat(open) {
  chatPanel.classList.toggle('open', open);
  chatPanel.setAttribute('aria-hidden', String(!open));
  if (open) chatInput.focus();
}

chatLauncher.addEventListener('click', () => toggleChat(true));
chatClose.addEventListener('click', () => toggleChat(false));

document.querySelectorAll('.quick-prompts button').forEach((button) => {
  button.addEventListener('click', () => sendChatMessage(button.dataset.question));
});

function addMessage(text, type) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function answerQuestion(question) {
  const normalized = question.toLowerCase();
  if (normalized.includes('current') || normalized.includes('role') || normalized.includes('work')) {
    return 'Venkatesh is currently a Chief Manager and Area Operations Manager at IDFC FIRST Bank, leading operations across Tamil Nadu and Kerala.';
  }
  if (normalized.includes('strength') || normalized.includes('expertise') || normalized.includes('good')) {
    return 'His strongest areas are regional operations, lending and disbursement, legal documentation, risk controls, audits, and developing high-performing teams.';
  }
  if (normalized.includes('contact') || normalized.includes('email') || normalized.includes('reach')) {
    return 'You can reach him at venkisvoct@gmail.com, or use the contact form on this page to send a message.';
  }
  if (normalized.includes('education') || normalized.includes('degree') || normalized.includes('study')) {
    return 'He holds a B.Com in Computer Application and an MBA in Finance from Bharathiar University.';
  }
  if (normalized.includes('experience') || normalized.includes('career') || normalized.includes('years')) {
    return 'Venkatesh brings 20+ years of banking experience, including leadership roles at IDFC FIRST Bank, RBL Bank, Kotak Mahindra Bank, and HDFC-associated operations.';
  }
  if (normalized.includes('award') || normalized.includes('recognition')) {
    return 'His recognition includes Star of the Quarter, Star of the Month, Certificate of Efficiency, and the Risk Prevention Award at Kotak Mahindra Bank.';
  }
  return 'I can help with his current role, experience, expertise, education, awards, or contact details. What would you like to know?';
}

function sendChatMessage(question) {
  const trimmed = question.trim();
  if (!trimmed) return;
  addMessage(trimmed, 'user');
  chatInput.value = '';
  window.setTimeout(() => addMessage(answerQuestion(trimmed), 'assistant'), 350);
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendChatMessage(chatInput.value);
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
