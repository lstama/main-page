/* Responsive sticky navbar.
 *
 * Accessibility backbone:
 *   - <nav role="navigation"> with an accessible label.
 *   - Hamburger is a real <button> with aria-controls / aria-expanded and a
 *     dynamic aria-label (Open/Close menu).
 *   - Links are real <a> elements, keyboard-focusable and Tab-navigable.
 *
 * Progressive enhancement (all cross-device):
 *   - Mobile (<768px): links collapse into the hamburger; toggling slides the
 *     menu in over a dimmed backdrop.
 *   - Keyboard: Escape closes; ArrowUp/ArrowDown move focus between links while
 *     the mobile menu is open; focus is restored to the hamburger on close.
 *   - Scroll: the navbar hides when scrolling down and reappears on scroll up.
 */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = [...navMenu.querySelectorAll('.nav-link')];

const MOBILE_BREAKPOINT = 768;
const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

function toggleMenu(open) {
  const isOpen = open != null ? open : !navbar.classList.contains('is-open');
  navbar.classList.toggle('is-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  if (isOpen) {
    // Move focus into the menu so keyboard/AT users land on the first link.
    navLinks[0]?.focus();
  } else {
    // Restore focus to the control that opened the menu.
    hamburger.focus();
  }
}

hamburger.addEventListener('click', () => toggleMenu());

// Close the menu after selecting a link on mobile.
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (mq.matches) toggleMenu(false);
  });
});

// Keyboard: Escape closes; arrows move between links while open.
document.addEventListener('keydown', (e) => {
  if (!navbar.classList.contains('is-open')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    toggleMenu(false);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusLink(1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusLink(-1);
  }
});

function focusLink(dir) {
  const current = navLinks.indexOf(document.activeElement);
  let next = current === -1 ? 0 : current + dir;
  next = (next + navLinks.length) % navLinks.length;
  navLinks[next]?.focus();
}

// Resize: when returning to desktop, close the mobile menu.
mq.addEventListener('change', () => {
  if (!mq.matches && navbar.classList.contains('is-open')) {
    toggleMenu(false);
  }
});

// Scroll: hide on scroll-down, reveal on scroll-up.
let lastScrollY = window.scrollY || 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 10 && y > lastScrollY) {
    navbar.classList.add('is-hidden');
  } else {
    navbar.classList.remove('is-hidden');
  }
  lastScrollY = y;
}, { passive: true });
