// AI Prompt Composer
// Auto-resizing textarea, attach toggles, char counter, Enter=send /
// Shift+Enter=newline, send -> loading state, simulated streaming reply.
(function () {
  'use strict';

  const MAX = 2000;
  const warnAt = Math.round(MAX * 0.9);

  const form = document.getElementById('composer-form');
  const textarea = document.getElementById('prompt');
  const counter = document.getElementById('counter');
  const sendBtn = document.getElementById('send-btn');
  const spinner = sendBtn.querySelector('.send-spinner');
  const thread = document.getElementById('thread');
  const attachBtns = Array.from(document.querySelectorAll('.attach-btn'));

  let busy = false;

  function updateCounter() {
    if (textarea.value.length > MAX) {
      textarea.value = textarea.value.slice(0, MAX);
    }
    const len = textarea.value.length;
    counter.textContent = len + ' / ' + MAX;
    counter.classList.toggle('warn', len >= warnAt && len < MAX);
    counter.classList.toggle('over', len > MAX);
  }

  function autosize() {
    textarea.style.height = '24px';
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
  }

  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = 'msg msg-' + role;
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'assistant' ? 'AI' : 'You';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    msg.append(avatar, bubble);
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
    return bubble;
  }

  function addTyping() {
    const msg = document.createElement('div');
    msg.className = 'msg msg-assistant';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'AI';
    const typing = document.createElement('div');
    typing.className = 'bubble typing';
    typing.setAttribute('role', 'status');
    typing.append(document.createElement('span'), document.createElement('span'), document.createElement('span'));
    msg.append(avatar, typing);
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
    return typing;
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    spinner.hidden = !state;
    sendBtn.querySelector('svg').hidden = state;
    textarea.disabled = state;
  }

  function simulateReply(userText) {
    const typing = addTyping();
    const delay = () => new Promise((r) => setTimeout(r, 900));
    delay().then(() => {
      typing.remove();
      const bubble = addMessage(
        'Got it — "' + userText.trim().slice(0, 60) + (userText.trim().length > 60 ? '…' : '') + '". This is a simulated reply.',
        'assistant'
      );
      setBusy(false);
      textarea.focus();
    });
  }

  function send() {
    const text = textarea.value.trim();
    if (!text || busy) return;
    addMessage(text, 'user');
    textarea.value = '';
    autosize();
    updateCounter();
    setBusy(true);
    simulateReply(text);
  }

  textarea.addEventListener('input', () => {
    autosize();
    updateCounter();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!busy) send();
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      send();
    }
  });

  attachBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });

  autosize();
  updateCounter();
})();
