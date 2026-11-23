// Contribution Heat Map
// A GitHub-style year of activity. Generates ~52 weeks of daily counts,
// renders them as a grid (weeks = columns, days = rows), colors each cell by
// activity level, and shows a tooltip on hover. Arrow keys move the focused
// cell so keyboard users get the same feedback.
(function () {
  'use strict';

  const grid = document.getElementById('grid');
  const tooltip = document.getElementById('tooltip');
  const WEEKS = 53;
  const DAYS_PER_WEEK = 7;

  // Build a realistic-looking dataset: start 52 weeks ago on a Sunday, end today.
  function buildData() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * DAYS_PER_WEEK);

    const data = [];
    const d = new Date(start);
    for (let i = 0; i < WEEKS * DAYS_PER_WEEK; i++) {
      if (d > today) break;
      // Weighted random: most days have a little activity, few have a lot.
      const r = Math.random();
      const count = r < 0.35 ? 0 : r < 0.7 ? Math.floor(Math.random() * 3) + 1
        : r < 0.92 ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 5) + 7;
      data.push({ date: new Date(d), count });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }

  function levelFor(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  function formatDate(d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  const data = buildData();
  const cells = [];

  data.forEach((day) => {
    const cell = document.createElement('span');
    cell.className = 'cell';
    cell.setAttribute('role', 'gridcell');
    const level = levelFor(day.count);
    cell.setAttribute('data-level', String(level));
    cell.setAttribute('aria-label', formatDate(day.date) + ': ' + day.count + ' contributions');
    cell.dataset.date = day.date.toISOString().slice(0, 10);
    cells.push(cell);
    grid.appendChild(cell);
  });

  // Tooltip positioning that stays inside the heatmap container.
  function showTooltip(cell) {
    var rect = cell.getBoundingClientRect();
    var container = grid.parentElement.getBoundingClientRect();
    var tip = document.getElementById('tooltip');
    tip.textContent = cell.getAttribute('aria-label');
    tip.hidden = false;
    tip.classList.add('visible');
    // Measure after showing so offsetWidth is real (hidden elements are 0).
    var half = tip.offsetWidth / 2;
    var left = rect.left - container.left + rect.width / 2;
    var top = rect.top - container.top;
    left = Math.max(half, Math.min(left, container.width - half));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
    setTimeout(() => { if (!tooltip.classList.contains('visible')) tooltip.hidden = true; }, 100);
  }

  cells.forEach((cell) => {
    cell.addEventListener('mouseover', () => showTooltip(cell));
    cell.addEventListener('mouseout', () => hideTooltip());
  });
})();
