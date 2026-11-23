// Resizable Split View
// Two panels separated by a draggable handle. Dragging updates each panel's
// flex-basis as a percentage of the container width, clamped so neither panel
// collapses. The split is also adjustable with the arrow keys while the handle
// is focused.
(function () {
  'use strict';

  const split = document.getElementById('split');
  const handle = document.getElementById('handle');
  const left = document.getElementById('left');
  const right = document.getElementById('right');
  const leftPct = document.getElementById('left-pct');
  const rightPct = document.getElementById('right-pct');

  const MIN = 20; // percent
  const MAX = 80; // percent

  let dragging = false;

  function applyPct(pct) {
    pct = Math.max(MIN, Math.min(MAX, pct));
    left.style.flexBasis = pct + '%';
    right.style.flexBasis = (100 - pct) + '%';
    leftPct.textContent = Math.round(pct) + '%';
    rightPct.textContent = Math.round(100 - pct) + '%';
  }

  function pctFromX(clientX) {
    const rect = split.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function onMove(e) {
    if (!dragging) return;
    applyPct(pctFromX(e.clientX || (e.touches && e.touches[0].clientX)));
  }

  function stop() {
    dragging = false;
    handle.classList.remove('active');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', stop);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', stop);
  }

  function start(e) {
    dragging = true;
    handle.classList.add('active');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', stop);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', stop);
    e.preventDefault();
  }

  handle.addEventListener('mousedown', start);
  handle.addEventListener('touchstart', start, { passive: true });

  // Keyboard control: arrows nudge the split by 5%.
  handle.addEventListener('keydown', (e) => {
    const step = 5;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      applyPct(parseFloat(left.style.flexBasis) - step);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      applyPct(parseFloat(left.style.flexBasis) + step);
      e.preventDefault();
    }
  });

  applyPct(50);
})();
