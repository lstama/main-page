// Responsive data table — grid on desktop, cards on mobile.
//
// Structure:
//   - A semantic <table> with thead/tbody.
//   - Each <td> carries data-key (the column key, for sorting) and data-label
//     (the mobile card label). They differ in case on purpose: keys are lowercase
//     identifiers; labels are the human-facing, capitalized text shown on cards.
//   - <th sortable data-key> headers are clickable to sort that column.
//
// Behavior:
//   - The responsive collapse is pure CSS: below 640px each row becomes a card and
//     cells become label/value pairs. No JS is needed for the collapse itself.
//   - Sorting reorders the existing <tr> rows in place — no data duplication.

const table = document.getElementById('demo-table');
const thead = table.querySelector('thead');
const tbody = table.querySelector('tbody');
const rows = [...tbody.querySelectorAll('tr')];
const rowCount = document.getElementById('row-count');

let sortKey = null;
let sortDir = 1; // 1 ascending, -1 descending

function cellText(row, key) {
  return (row.querySelector(`td[data-key="${key}"]`)?.textContent ?? '').trim();
}

function compare(a, b) {
  const av = cellText(a, sortKey).toLowerCase();
  const bv = cellText(b, sortKey).toLowerCase();
  // Numeric-aware compare (handles years like "2021"); falls back to text.
  const an = parseFloat(av);
  const bn = parseFloat(bv);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * sortDir;
  return av.localeCompare(bv) * sortDir;
}

function sortTable(key) {
  if (sortKey === key) {
    sortDir *= -1; // flip direction
  } else {
    sortKey = key;
    sortDir = 1;
  }

  const sorted = rows.slice().sort(compare);
  sorted.forEach((row) => tbody.appendChild(row));

  // Update sort UI + aria-sort for assistive tech.
  thead.querySelectorAll('th[sortable]').forEach((th) => {
    const isActive = th.dataset.key === key;
    th.classList.remove('asc', 'desc');
    if (isActive) th.classList.add(sortDir === 1 ? 'asc' : 'desc');
    th.setAttribute('aria-sort', isActive ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
  });

  updateCount();
}

function updateCount() {
  rowCount.textContent = `Showing ${tbody.querySelectorAll('tr').length} of ${rows.length} members`;
}

thead.querySelectorAll('th[sortable]').forEach((th) => {
  th.setAttribute('aria-sort', 'none');
  th.addEventListener('click', () => sortTable(th.dataset.key));
});

updateCount();
