// Dark mode toggle: CSS variables + system preference + persisted choice.
const html = document.documentElement;
const toggle = document.getElementById('theme-toggle');

function stored() { return localStorage.getItem('theme'); }
function system() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function apply(theme) { html.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }

// 1. Respect a saved choice, else follow the OS.
apply(stored() || system());

// 2. Let the user override.
toggle.addEventListener('click', () => {
  apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// 3. Follow OS changes until the user has made a manual choice.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!stored()) apply(e.matches ? 'dark' : 'light');
});
