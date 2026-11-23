// Data fetching states pattern.
//
// The core idea: a fetch has exactly four outcomes, and your UI should render
// each of them explicitly instead of guessing:
//
//   loading  -> show a spinner/skeleton while the request is in flight
//   success  -> render the data
//   error    -> show a message + retry (never leave users staring at a blank screen)
//   empty    -> show a "nothing here" state (distinct from error)
//
// We drive this with a tiny state machine: one `render(state)` function swaps the
// container's markup, so there is exactly one source of truth for what the user sees.

const stateEl = document.getElementById('state');
const fetchBtn = document.getElementById('fetchBtn');
const failToggle = document.getElementById('failToggle');

const SAMPLE = [
  { name: 'Ada Lovelace', email: 'ada@example.com' },
  { name: 'Alan Turing', email: 'alan@example.com' },
  { name: 'Grace Hopper', email: 'grace@example.com' },
];

// Simulated API. Swap this for a real `fetch()` call.
// `fail` mimics a network/HTTP error; an empty array mimics a successful but
// empty response.
function apiFetchUsers({ fail }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) return reject(new Error('Network error: unable to reach the server.'));
      resolve(SAMPLE); // change to `resolve([])` to see the empty state
    }, 1200);
  });
}

// ---- Render each state -----------------------------------------------------
function setBusy(busy) {
  fetchBtn.disabled = busy;
  fetchBtn.textContent = busy ? 'Loading…' : 'Fetch users';
}

function renderIdle() {
  stateEl.className = 'state state-idle';
  stateEl.innerHTML = '<p class="idle">Press “Fetch users” to load data.</p>';
}

function renderLoading() {
  stateEl.className = 'state loading';
  stateEl.innerHTML = `
    <div class="loading-wrap">
      <div class="spinner" role="status" aria-label="Loading"></div>
      <span>Loading…</span>
    </div>`;
}

function renderSuccess(data) {
  stateEl.className = 'state';
  const rows = data
    .map(
      (u) => `
    <li class="list-item">
      <span class="avatar">${initials(u.name)}</span>
      <div>
        <p class="item-name">${u.name}</p>
        <p class="item-email">${u.email}</p>
      </div>
    </li>`
    )
    .join('');
  stateEl.innerHTML = `<ul class="list">${rows}</ul>`;
}

function renderError(message) {
  stateEl.className = 'state';
  stateEl.innerHTML = `
    <div class="msg error">
      <span class="msg-icon" aria-hidden="true">⚠️</span>
      <p class="msg-title">Something went wrong</p>
      <p class="msg-text">${message}</p>
      <button class="retry-btn" id="retryBtn" type="button">Try again</button>
    </div>`;
  document.getElementById('retryBtn').addEventListener('click', runFetch);
}

function renderEmpty() {
  stateEl.className = 'state';
  stateEl.innerHTML = `
    <div class="msg msg-empty">
      <span class="msg-icon" aria-hidden="true">📭</span>
      <p class="msg-title">No users found</p>
      <p class="msg-text">There is nothing to show right now.</p>
    </div>`;
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ---- Controller ------------------------------------------------------------
async function runFetch() {
  setBusy(true);
  renderLoading();
  try {
    const data = await apiFetchUsers({ fail: failToggle.checked });
    if (data.length === 0) {
      renderEmpty();
    } else {
      renderSuccess(data);
    }
  } catch (err) {
    renderError(err.message);
  } finally {
    setBusy(false);
  }
}

fetchBtn.addEventListener('click', runFetch);
renderIdle();
