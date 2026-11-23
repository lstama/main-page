// Debounce search.
// debounce() delays execution until the user has paused typing. We then run a
// simulated async search (with a delay) and highlight matching text.
const input = document.getElementById('q');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('q-status');

const DATABASE = [
  'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact',
  'Next.js', 'Nuxt', 'Astro', 'Vite', 'webpack', 'esbuild',
  'TypeScript', 'Tailwind CSS', 'Express', 'SvelteKit',
];

// Delay a function until `wait` ms have passed since the last call.
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Simulated async search backend.
function search(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      resolve(
        DATABASE.filter((item) => item.toLowerCase().includes(q)).map((item) => ({
          item,
          match: highlight(item, q),
        }))
      );
    }, 300);
  });
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return escapeHtml(text);
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const runSearch = debounce(async (query) => {
  if (!query.trim()) {
    resultsEl.innerHTML = '';
    statusEl.textContent = '';
    return;
  }
  statusEl.textContent = `Searching…`;
  const items = await search(query);
  if (!items.length) {
    resultsEl.innerHTML = `<li class="empty">No results for “${escapeHtml(query)}”.</li>`;
    statusEl.textContent = '0 results';
    return;
  }
  resultsEl.innerHTML = items
    .map((i) => `<li>${i.match}</li>`)
    .join('');
  statusEl.textContent = `${items.length} result${items.length === 1 ? '' : 's'}`;
}, 400);

input.addEventListener('input', (e) => runSearch(e.target.value));
