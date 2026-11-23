// Off-canvas navigation.
//
// Layout is responsive (pure CSS):
//   - Mobile (<768px): a hamburger opens the drawer over a backdrop. The drawer is
//     modal — Tab is trapped inside, Escape closes it, and focus returns to the toggle.
//   - Desktop (>=768px): the drawer is persistent (always visible), the content flows
//     beside it, and there is no hamburger, backdrop, or modal behaviour.
//
// The drawer's aria-hidden is the single source of truth for the mobile open state.
// On desktop the media query forces the drawer visible regardless of aria-hidden, and
// there is no toggle, so the modal logic never activates on a wide screen.

const toggle = document.getElementById('nav-toggle');
const closeBtn = document.getElementById('nav-close');
const drawer = document.getElementById('site-nav');
const backdrop = document.getElementById('backdrop');

function isOpen() {
  return drawer.getAttribute('aria-hidden') === 'false';
}

function openNav() {
  drawer.setAttribute('aria-hidden', 'false');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Close navigation');
  backdrop.hidden = false;
  document.body.classList.add('nav-open');
  // Move focus into the menu so screen-reader users land on the navigation.
  closeBtn.focus();
}

function closeNav() {
  drawer.setAttribute('aria-hidden', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  backdrop.hidden = true;
  document.body.classList.remove('nav-open');
  // Restore focus to the toggle that opened the menu.
  toggle.focus();
}

toggle.addEventListener('click', () => (isOpen() ? closeNav() : openNav()));
closeBtn.addEventListener('click', closeNav);
backdrop.addEventListener('click', closeNav);

// Escape closes an open menu.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen()) {
    e.preventDefault();
    closeNav();
  }
});

// Focus trap: while the mobile menu is open, every Tab/Shift+Tab is intercepted and
// focus is moved explicitly through the drawer's focusables, wrapping at the ends so
// focus can never escape to the toggle, backdrop, or page behind it.
drawer.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !isOpen()) return;
  const focusable = drawer.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const elements = Array.prototype.slice.call(focusable);
  if (elements.length === 0) return;
  e.preventDefault(); // always: we own focus movement while the menu is open
  const first = elements[0];
  const last = elements[elements.length - 1];
  const idx = elements.indexOf(document.activeElement);
  const next = e.shiftKey
    ? ((idx - 1) % elements.length + elements.length) % elements.length
    : (idx + 1) % elements.length;
  // If focus somehow isn't inside the menu, start from the first element.
  elements[idx === -1 ? (e.shiftKey ? elements.length - 1 : 0) : next].focus();
});
