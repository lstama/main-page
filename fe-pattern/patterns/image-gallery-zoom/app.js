/* Image gallery with zoom.
 *
 * Accessibility:
 *   - The viewer is a <div role="dialog" aria-modal="true"> with a title and a live counter.
 *   - Keyboard: ArrowLeft/Right navigate, Esc closes, +/− (or =) zoom, Home/End jump to
 *     first/last image.
 *   - Focus is trapped inside the viewer while open and restored to the opening thumbnail on close.
 *   - Images carry descriptive alt text.
 *
 * Cross-device interaction:
 *   - PC: click thumbnail, arrow keys, scroll wheel to zoom, +/- buttons.
 *   - Mobile: tap thumbnail, tap arrows, +/- buttons, double-tap to toggle zoom.
 */
const IMAGES = [
  { title: "Mountain sunrise", color: "#f59e0b", alt: "Orange sunrise over mountain silhouettes" },
  { title: "Ocean waves", color: "#0ea5e9", alt: "Blue ocean waves near the shore" },
  { title: "Forest path", color: "#16a34a", alt: "Sunlit path through a green forest" },
  { title: "Desert dunes", color: "#d97706", alt: "Winding sand dunes in a desert" },
  { title: "Night sky", color: "#4f46e5", alt: "Starry night sky over a lake" },
  { title: "City lights", color: "#db2777", alt: "City skyline lit up at night" },
];

const thumbGrid = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const img = document.getElementById("lightbox-img");
const title = document.getElementById("lightbox-title");
const counter = document.getElementById("lightbox-counter");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const closeBtn = document.getElementById("lightbox-close");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const zoomResetBtn = document.getElementById("zoom-reset");
const zoomLevel = document.getElementById("zoom-level");

let currentIndex = 0;
let zoom = 1;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
let lastFocused = null;

function makeSvg(data, size) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="100%" height="100%" fill="${data.color}"/>` +
      `<circle cx="50%" cy="35%" r="18%" fill="rgba(255,255,255,0.85)"/>` +
      `<path d="M0 100 L40 55 L70 80 L100 50 L100 100 Z" fill="rgba(0,0,0,0.25)"/>` +
      `</svg>`
  )}`;
}

function renderThumbs() {
  thumbGrid.innerHTML = "";
  IMAGES.forEach((data, i) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "thumb";
    thumb.setAttribute("aria-label", `View ${data.title}`);
    thumb.innerHTML =
      `<img src="${makeSvg(data, 200)}" alt="${data.alt}" />` +
      `<span class="thumb-zoom-hint" aria-hidden="true">🔍 Zoom</span>`;
    thumb.addEventListener("click", () => openViewer(i));
    thumbGrid.appendChild(thumb);
  });
}

function renderViewer() {
  const data = IMAGES[currentIndex];
  img.src = makeSvg(data, 800);
  img.alt = data.alt;
  title.textContent = `${data.title} (${currentIndex + 1} of ${IMAGES.length})`;
  counter.textContent = `${currentIndex + 1} / ${IMAGES.length}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === IMAGES.length - 1;
  setZoom(zoom);
}

function setZoom(z) {
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  img.style.transform = `scale(${zoom})`;
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
}

function goTo(i) {
  currentIndex = (i + IMAGES.length) % IMAGES.length;
  renderViewer();
}

function openViewer(i) {
  lastFocused = document.activeElement;
  currentIndex = i;
  zoom = 1;
  lightbox.hidden = false;
  renderViewer();
  // Focus the close button (first focusable in the viewer).
  closeBtn.focus();
  document.addEventListener("keydown", handleKeydown);
  // Lock background scroll.
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  lightbox.hidden = true;
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

function handleKeydown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeViewer();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    goTo(currentIndex - 1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    goTo(currentIndex + 1);
  } else if (e.key === "+" || e.key === "=") {
    e.preventDefault();
    setZoom(zoom + 0.25);
  } else if (e.key === "−" || e.key === "-") {
    e.preventDefault();
    setZoom(zoom - 0.25);
  } else if (e.key === "0") {
    e.preventDefault();
    setZoom(1);
  } else if (e.key === "Home") {
    e.preventDefault();
    goTo(0);
  } else if (e.key === "End") {
    e.preventDefault();
    goTo(IMAGES.length - 1);
  }
}

// Focus trap: keep Tab within the viewer.
lightbox.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const focusables = lightbox.querySelectorAll(
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
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
});

// Buttons.
prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
nextBtn.addEventListener("click", () => goTo(currentIndex + 1));
closeBtn.addEventListener("click", closeViewer);
zoomInBtn.addEventListener("click", () => setZoom(zoom + 0.25));
zoomOutBtn.addEventListener("click", () => setZoom(zoom - 0.25));
zoomResetBtn.addEventListener("click", () => setZoom(1));

// Click backdrop (but not the image or inner panel) to close.
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeViewer();
});

// Scroll wheel to zoom (PC).
lightbox.addEventListener("wheel", (e) => {
  if (!lightbox.hidden) {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25));
  }
}, { passive: false });

// Double-tap to toggle zoom (mobile).
let lastTap = 0;
lightbox.addEventListener("touchend", (e) => {
  const now = Date.now();
  if (now - lastTap < 300) {
    e.preventDefault();
    setZoom(zoom > 1.5 ? 1 : 2);
  }
  lastTap = now;
}, { passive: false });

renderThumbs();
