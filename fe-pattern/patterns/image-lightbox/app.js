// Image lightbox / gallery.
//
// A modal image viewer. Clicking a thumbnail opens it full-size; ArrowLeft/Right
// (keyboard) or swipe (touch) navigate; Escape or clicking outside the image closes.
//
// Accessibility: the lightbox is a modal dialog (`role="dialog"` + `aria-modal`).
// On open it traps Tab focus inside, locks body scroll, and restores focus to the
// clicked thumbnail on close. `aria-hidden` + `hidden` gate the closed state.

const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const img = document.getElementById('lightbox-img');
const caption = document.getElementById('lightbox-caption');
const prevBtn = document.getElementById('lightbox-prev');
const nextBtn = document.getElementById('lightbox-next');
const closeBtn = document.getElementById('lightbox-close');
const items = [...gallery.querySelectorAll('.gallery-item')];

let current = 0;
let lastFocused = null;

function srcFor(item) {
  return item.getAttribute('data-full');
}
function captionFor(item) {
  return item.getAttribute('data-caption');
}

function render() {
  const item = items[current];
  img.src = srcFor(item);
  img.alt = captionFor(item);
  caption.textContent = `${captionFor(item)} — ${current + 1} of ${items.length}`;
}

function clamp(index) {
  return ((index % items.length) + items.length) % items.length;
}

function open(index) {
  lastFocused = document.activeElement;
  current = clamp(index);
  render();
  lightbox.hidden = false;
  lightbox.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden'; // lock background scroll
  // Move focus inside the dialog (first control).
  closeBtn.focus();
}

function close() {
  lightbox.hidden = true;
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // unlock scroll
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

function next() {
  current = clamp(current + 1);
  render();
}
function prev() {
  current = clamp(current - 1);
  render();
}

// --- Open on thumbnail click ---
gallery.addEventListener('click', (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  open(items.indexOf(item));
});

// --- Controls ---
prevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  prev();
});
nextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  next();
});
closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  close();
});

// Click on the backdrop (not the image) closes.
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) close();
});

// --- Keyboard ---
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    next();
  }
});

// --- Touch swipe ---
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) next(); // swipe left -> next
    else prev(); // swipe right -> prev
  }
}, { passive: true });

// --- Focus trap ---
// Every Tab is intercepted and focus is moved explicitly through the dialog's
// controls, wrapping at the ends so focus can't escape to the gallery behind.
lightbox.addEventListener('keydown', (e) => {
  if (lightbox.hidden || e.key !== 'Tab') return;
  const focusable = lightbox.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const elements = Array.prototype.slice.call(focusable);
  if (elements.length === 0) return;
  e.preventDefault(); // we own focus movement while the dialog is open
  const idx = elements.indexOf(document.activeElement);
  const nextIdx = e.shiftKey
    ? ((idx - 1) % elements.length + elements.length) % elements.length
    : (idx + 1) % elements.length;
  elements[idx === -1 ? (e.shiftKey ? elements.length - 1 : 0) : nextIdx].focus();
});
