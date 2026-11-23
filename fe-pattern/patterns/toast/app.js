// Toast notifications — a small, dependency-free toast system.
// Usage: toast('Saved!', 'success');  // type: success | info | warning | error
const ICONS = {
  success: '✓',
  info: 'ℹ',
  warning: '!',
  error: '✕',
};

function toast(message, type = 'info', { timeout = 3500 } = {}) {
  const host = document.querySelector('.toast-host');
  if (!host) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${ICONS[type] ?? ICONS.info}</span>
    <span class="toast-body">${escapeHtml(message)}</span>
    <button class="toast-close" type="button" aria-label="Dismiss">✕</button>`;

  host.appendChild(el);
  // Trigger the enter animation on the next frame.
  requestAnimationFrame(() => el.classList.add('show'));

  const dismiss = () => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 200);
  };

  el.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, timeout);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Demo wiring
document.querySelectorAll('.demo-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const messages = {
      success: 'Changes saved successfully.',
      info: 'New version available.',
      warning: 'Your session expires in 5 minutes.',
      error: 'Could not connect to the server.',
    };
    toast(messages[type], type);
  });
});
