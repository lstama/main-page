/* Cookie consent banner.
 *
 * Accessibility:
 *   - The banner is a <div role="dialog" aria-modal="true" aria-labelledby="cookie-title">.
 *   - On open, focus moves into the banner and is trapped (Tab/Shift+Tab wrap within it);
 *     Escape moves focus back to the last focused element.
 *   - On close, focus is restored to the element that opened the banner.
 *   - A role=status aria-live region announces the outcome.
 *
 * Behaviour:
 *   - Choice is persisted in localStorage so it survives reloads.
 *   - Accept/Reject both close the banner and announce the choice.
 */
const STORAGE_KEY = 'fe-cookie-consent';
const cookie = document.getElementById('cookie');
const acceptBtn = document.getElementById('cookie-accept');
const rejectBtn = document.getElementById('cookie-reject');
const result = document.getElementById('result');
const lastFocused = { el: null };

function showBanner() {
  lastFocused.el = document.activeElement;
  cookie.hidden = false;
  // Move focus into the banner and trap it.
  acceptBtn.focus();
  document.addEventListener('keydown', handleKeydown);
  document.body.style.overflow = 'hidden';
}

function hideBanner(choice) {
  cookie.hidden = true;
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
  if (lastFocused.el && typeof lastFocused.el.focus === 'function') lastFocused.el.focus();
  if (choice) {
    result.textContent = `Cookies: ${choice}`;
  } else {
    result.textContent = '';
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    hideBanner('');
    return;
  }
  if (e.key !== 'Tab') return;

  const focusables = cookie.querySelectorAll('button:not([disabled])');
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

function choose(choice) {
  localStorage.setItem(STORAGE_KEY, choice);
  hideBanner(choice === 'accept' ? 'Accepted' : 'Rejected');
}

acceptBtn.addEventListener('click', () => choose('accept'));
rejectBtn.addEventListener('click', () => choose('reject'));

// Show the banner only if the user has not made a choice yet.
if (!localStorage.getItem(STORAGE_KEY)) {
  showBanner();
}
