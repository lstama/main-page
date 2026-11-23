// Accessible modal dialog.
// Handles: open/close, ESC to close, backdrop click to close, focus trap,
// focus restoration to the trigger, and body-scroll lock.
const overlay = document.getElementById('overlay');
const modal = overlay.querySelector('.modal');
const openBtn = document.getElementById('open');
const closeBtns = overlay.querySelectorAll('[data-close], .modal-close, #cancel');
const confirmBtn = document.getElementById('confirm');

let lastFocused = null;

const focusableSel =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function openModal() {
  lastFocused = document.activeElement;
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.body.style.overflow = 'hidden';
  // Focus the first focusable element inside the modal.
  const first = modal.querySelector(focusableSel);
  (first || modal).focus();
}

function closeModal() {
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    // Return focus to whatever opened the dialog.
    lastFocused?.focus?.();
  }, 200);
}

// Escape key closes.
document.addEventListener('keydown', (e) => {
  if (overlay.hidden) return;
  if (e.key === 'Escape') return closeModal();
  if (e.key === 'Tab') return trapFocus(e);
});

// Focus trap: keep Tab within the modal.
function trapFocus(e) {
  const focusables = modal.querySelectorAll(focusableSel);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// Click on backdrop (not the modal) closes.
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

openBtn.addEventListener('click', openModal);
closeBtns.forEach((btn) => btn.addEventListener('click', closeModal));
confirmBtn.addEventListener('click', () => {
  closeModal();
});
