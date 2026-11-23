/* Back to top button.
 *
 * Accessibility:
 *   - Native <button> = keyboard + screen reader support for free.
 *   - aria-label="Back to top" describes the action.
 *
 * Behaviour:
 *   - The button is hidden until the user scrolls past a threshold, then fades in.
 *   - Clicking/tapping smooth-scrolls the page back to the top.
 */
const btn = document.getElementById('back-to-top');
const THRESHOLD = 300; // px scrolled before the button appears

function onScroll() {
  if (window.scrollY > THRESHOLD) {
    btn.classList.add('is-visible');
    btn.hidden = false;
  } else {
    btn.classList.remove('is-visible');
    btn.hidden = true;
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

btn.addEventListener('click', scrollToTop);
window.addEventListener('scroll', onScroll, { passive: true });

// Initial state.
onScroll();
