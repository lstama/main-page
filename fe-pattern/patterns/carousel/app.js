// Accessible image carousel — WAI-ARIA "carousel" pattern.
//
// Structure:
//   - A region with aria-roledescription="carousel".
//   - Each slide has aria-roledescription="slide" + aria-posinset / aria-setsize.
//   - Prev/next <button>s with aria-controls pointing at the track.
//   - Indicator buttons in a role="group"; the active one has aria-current="true".
//   - Inactive slides are aria-hidden so screen readers only announce the current one.
//
// Every navigation source funnels through goTo():
//   - Prev/next buttons (mouse / tap)
//   - Indicator buttons (mouse / tap)
//   - Keyboard: ArrowLeft / ArrowRight (Home / End jump to first / last)
//   - Touch: horizontal swipe past a threshold
//
// Autoplay advances on an interval and pauses on hover, when the tab is hidden
// (page visibility API), and while paused via the toggle.

const carousel = document.getElementById('demo-carousel');
const track = carousel.querySelector('.carousel-track');
const slides = [...carousel.querySelectorAll('.carousel-slide')];
const prevBtn = carousel.querySelector('.carousel-prev');
const nextBtn = carousel.querySelector('.carousel-next');
const indicatorsWrap = carousel.querySelector('.carousel-indicators');
const autoplayToggle = document.getElementById('autoplay-toggle');
const toggleLabel = autoplayToggle.querySelector('.toggle-label');
const autoplayHint = document.querySelector('.autoplay-hint');

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50; // px

let current = 0;
let autoplayTimer = null;
let isPlaying = true;
let touchStartX = 0;
let isDragging = false;

function clampIndex(i) {
  // Wrap around both ends.
  return ((i % slides.length) + slides.length) % slides.length;
}

function render(index) {
  current = clampIndex(index);
  track.style.transform = `translateX(${-current * 100}%)`;

  slides.forEach((slide, i) => {
    const isActive = i === current;
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });
  indicatorsWrap.querySelectorAll('.carousel-indicator').forEach((dot, i) => {
    dot.setAttribute('aria-current', i === current ? 'true' : 'false');
  });
}

function goTo(index) {
  render(index);
  resetAutoplay();
}
function next() {
  render(current + 1);
  resetAutoplay();
}
function prev() {
  render(current - 1);
  resetAutoplay();
}

// --- Buttons + indicators ---
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
indicatorsWrap.addEventListener('click', (e) => {
  const dot = e.target.closest('.carousel-indicator');
  if (!dot) return;
  goTo(parseInt(dot.dataset.index, 10));
});

// --- Keyboard ---
carousel.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft': e.preventDefault(); prev(); break;
    case 'ArrowRight': e.preventDefault(); next(); break;
    case 'Home': e.preventDefault(); goTo(0); break;
    case 'End': e.preventDefault(); goTo(slides.length - 1); break;
  }
});

// --- Touch swipe ---
carousel.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
  isDragging = true;
  track.classList.add('is-changing'); // no transition while dragging
}, { passive: true });

carousel.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  isDragging = false;
  track.classList.remove('is-changing');
  const diff = touchStartX - e.changedTouches[0].clientX; // left>0, right<0
  if (Math.abs(diff) > SWIPE_THRESHOLD) {
    diff > 0 ? next() : prev(); // swipe left -> next, swipe right -> prev
  }
}, { passive: true });

// --- Autoplay ---
function startAutoplay() {
  stopAutoplay();
  if (!isPlaying) return;
  // Advance only; manual controls reset the countdown separately.
  autoplayTimer = setInterval(() => render(current + 1), AUTOPLAY_MS);
}
function stopAutoplay() {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}
// Restart the timer after a manual nav so it doesn't advance immediately.
function resetAutoplay() {
  if (isPlaying) startAutoplay();
}

autoplayToggle.addEventListener('click', () => {
  isPlaying = !isPlaying;
  autoplayToggle.setAttribute('aria-pressed', String(isPlaying));
  autoplayToggle.querySelector('.icon-play').hidden = !isPlaying;
  autoplayToggle.querySelector('.icon-pause').hidden = isPlaying;
  toggleLabel.textContent = isPlaying ? 'Pause' : 'Play';
  autoplayHint.textContent = isPlaying ? 'Autoplay on' : 'Autoplay paused';
  if (isPlaying) startAutoplay();
  else stopAutoplay();
});

// Pause on hover and when the tab is no longer visible.
carousel.addEventListener('mouseenter', () => { if (isPlaying) stopAutoplay(); });
carousel.addEventListener('mouseleave', () => { if (isPlaying) startAutoplay(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay();
  else if (isPlaying) startAutoplay();
});

// --- Init: build indicators + set initial ARIA state ---
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'carousel-indicator';
  dot.dataset.index = i;
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  indicatorsWrap.appendChild(dot);
});
slides.forEach((slide, i) => {
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-posinset', i + 1);
  slide.setAttribute('aria-setsize', slides.length);
  slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
});

render(0);
startAutoplay();
