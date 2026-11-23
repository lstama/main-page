/* Pagination.
 *
 * Accessibility backbone:
 *   - <nav aria-label="Pagination"> wraps the controls.
 *   - Each page control is a real <button>; the active page carries
 *     <span aria-current="page">.
 *   - Prev/Next have descriptive aria-labels and are disabled at the ends.
 *   - A role=status aria-live region announces the current page range.
 *
 * Keyboard (all cross-device): Tab moves between buttons; ArrowLeft/Right move
 * one page; Home/End jump to first/last. Mouse/touch: click/tap any control.
 */
const items = Array.from({ length: 37 }, (_, i) => ({
  name: `Person ${i + 1}`,
  role: ['Engineer', 'Designer', 'PM', 'Analyst', 'Lead'][i % 5],
}));

const PAGE_SIZE = 5;
const totalPages = Math.ceil(items.length / PAGE_SIZE);
let currentPage = 1;

const grid = document.getElementById('grid');
const pageList = document.getElementById('page-list');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const status = document.getElementById('status');

function pageItems(page) {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function renderItems() {
  grid.innerHTML = '';
  pageItems(currentPage).forEach((it) => {
    const li = document.createElement('li');
    li.innerHTML =
      `<span class="dot" aria-hidden="true">${it.name.split(' ')[1]}</span>` +
      `<span class="meta"><span class="name">${it.name}</span>` +
      `<span class="role">${it.role}</span></span>`;
    grid.appendChild(li);
  });
}

// Build the page-number row with ellipsis for large ranges.
function renderPager() {
  pageList.innerHTML = '';
  const pages = buildPageRange(currentPage, totalPages);
  pages.forEach((p) => {
    if (p === '...') {
      const ell = document.createElement('li');
      ell.className = 'ellipsis';
      ell.setAttribute('aria-hidden', 'true');
      ell.textContent = '…';
      pageList.appendChild(ell);
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'page-btn';
    btn.textContent = p;
    btn.setAttribute('aria-label', `Page ${p}`);
    if (p === currentPage) btn.setAttribute('aria-current', 'page');
    btn.addEventListener('click', () => goTo(p));
    pageList.appendChild(btn);
  });

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  status.textContent = `Page ${currentPage} of ${totalPages} — ` +
    `Showing ${((currentPage - 1) * PAGE_SIZE) + 1}-${currentPage * PAGE_SIZE} of ${items.length}`;
}

function buildPageRange(current, total) {
  // Show the first/last pages, the neighbours of the current page, then insert
  // an ellipsis wherever two kept numbers are more than one apart (no doubles).
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const kept = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...kept].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const result = [];
  let prev = 0;
  for (const n of sorted) {
    if (n > prev + 1) result.push('...');
    result.push(n);
    prev = n;
  }
  return result;
}

function goTo(page) {
  if (page < 1 || page > totalPages || page === currentPage) return;
  currentPage = page;
  renderItems();
  renderPager();
  // Keep the pager in view after a keyboard jump.
  prevBtn.scrollIntoView({ block: 'nearest' });
}

prevBtn.addEventListener('click', () => goTo(currentPage - 1));
nextBtn.addEventListener('click', () => goTo(currentPage + 1));

// Keyboard: ArrowLeft/Right move a page, Home/End jump to the ends.
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goTo(currentPage - 1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    goTo(currentPage + 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    goTo(1);
  } else if (e.key === 'End') {
    e.preventDefault();
    goTo(totalPages);
  }
});

renderItems();
renderPager();
