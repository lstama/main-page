// Star rating input (1–5).
//
// Accessibility first: the control is a native radio group. Keyboard (arrow keys),
// focus ring, and screen readers all work with zero JS. JS progressively enhances it:
//   - hover preview   : stars light up to the hovered star without committing
//   - mouse drag      : brush-select by dragging across the stars
//   - tap / click     : commit on release (native radio toggle)
//   - touch tap/drag  : same behaviour via touch events
//
// The checked radio is the source of truth; JS only mirrors it into the `.on`
// classes that paint the stars, and updates the live result text.

const group = document.querySelector('.rating-group');
const labels = [...group.querySelectorAll('.star-input')];
const stars = labels.map((l) => l.querySelector('.star'));
const result = document.getElementById('rating-result');

let pressing = false; // pointer currently down (mouse or touch)
let dragged = false; // pointer moved while down (drag vs tap)
let hoverValue = 0; // hover/drag preview value (0 = none)

function checkedValue() {
  const checked = group.querySelector('input:checked');
  return checked ? parseInt(checked.value, 10) : 0;
}

function paint() {
  const target = hoverValue || checkedValue();
  stars.forEach((star, i) => star.classList.toggle('on', i + 1 <= target));
}

function announce() {
  const value = checkedValue();
  result.textContent = value
    ? `You rated ${value} ${value === 1 ? 'star' : 'stars'}`
    : 'No rating selected';
}

// Commit a value by checking the matching radio (also fires `change` on real
// interactions). paint()/announce() are called explicitly too, because some
// environments don't fire `change` on a programmatic .checked assignment.
function commit(value) {
  const radio = group.querySelector(`input[value="${value}"]`);
  if (radio) radio.checked = true;
  paint();
  announce();
}

// --- Native change (keyboard, tap, programmatic) ---
group.addEventListener('change', () => {
  paint();
  announce();
});

// --- Mouse hover + drag ---
labels.forEach((label, i) => {
  const value = i + 1;
  label.addEventListener('mouseenter', () => {
    hoverValue = value;
    paint();
  });
  label.addEventListener('mouseleave', () => {
    if (!pressing) {
      hoverValue = 0;
      paint();
    }
  });
  label.addEventListener('mousedown', () => {
    pressing = true;
    dragged = false;
  });
  label.addEventListener('click', (e) => {
    // During a drag the mouseup already committed the dragged-to value;
    // suppress the native radio toggle so it can't override with the
    // mousedown star.
    if (dragged) e.preventDefault();
    pressing = false;
  });
});

group.addEventListener('mousemove', (e) => {
  if (!pressing) return;
  const star = e.target.closest('.star');
  if (!star) return;
  const idx = stars.indexOf(star);
  if (idx !== -1) {
    dragged = true;
    hoverValue = idx + 1;
    paint();
  }
});

window.addEventListener('mouseup', () => {
  if (!pressing) return;
  if (dragged) commit(hoverValue);
  pressing = false;
  hoverValue = 0;
  paint();
});

// --- Touch ---
group.addEventListener('touchstart', (e) => {
  const star = e.target.closest('.star');
  if (!star) return;
  const idx = stars.indexOf(star);
  if (idx !== -1) {
    pressing = true;
    dragged = true;
    hoverValue = idx + 1;
    paint();
  }
}, { passive: true });

group.addEventListener('touchmove', (e) => {
  if (!pressing) return;
  const star = e.target.closest('.star');
  if (!star) return;
  const idx = stars.indexOf(star);
  if (idx !== -1) {
    hoverValue = idx + 1;
    paint();
  }
}, { passive: true });

group.addEventListener('touchend', () => {
  if (!pressing) return;
  commit(hoverValue);
  pressing = false;
  hoverValue = 0;
  paint();
});

// Initial paint.
paint();
announce();
