/* Count-up counter.
 *
 * Accessibility:
 *   - The animated number is plain text; the FINAL value is announced once via a
 *     role=status aria-live region. Intermediate frames are NOT announced (announcing
 *     every number 0,1,2,... would flood screen-reader users).
 *   - Respects prefers-reduced-motion: if set, the counter jumps straight to its target
 *     with no animation.
 *
 * Behaviour:
 *   - Each .stat-num carries data-target (and optional data-suffix).
 *   - Counting starts when the element scrolls into view (IntersectionObserver), so
 *     mobile users who scroll down trigger it, and it doesn't animate off-screen numbers.
 */
const counters = [...document.querySelectorAll('.stat-num')];
const status = document.getElementById('status');
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION = 1200; // ms

function formatNumber(n) {
  return Math.round(n).toLocaleString('en-US');
}

function animateCounter(el) {
  const target = Number(el.dataset.target);
  const suffix = el.dataset.suffix ?? '';
  if (!Number.isFinite(target)) {
    el.textContent = formatNumber(target) + suffix;
    return;
  }
  const start = performance.now();
  let frame = null;

  const step = (now) => {
    const progress = Math.min((now - start) / DURATION, 1);
    // easeOutCubic for a natural deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNumber(eased * target) + suffix;
    if (progress < 1) {
      frame = requestAnimationFrame(step);
    } else {
      el.textContent = formatNumber(target) + suffix;
      announce(el);
    }
  };
  if (REDUCED_MOTION) {
    el.textContent = formatNumber(target) + suffix;
    announce(el);
    return;
  }
  frame = requestAnimationFrame(step);
}

function announce(el) {
  const label = el.closest('.stat')?.querySelector('.stat-label')?.textContent ?? '';
  const value = formatNumber(Number(el.dataset.target));
  status.textContent = `${label}: ${value}${el.dataset.suffix ?? ''}`;
}

// Start counting when a counter scrolls into view.
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => io.observe(c));
} else {
  // Fallback: count everything immediately.
  counters.forEach(animateCounter);
}
