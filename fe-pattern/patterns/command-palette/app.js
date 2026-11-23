// Command Palette
// Keyboard-driven command menu with fuzzy search, roving selection, highlighting,
// and screen-reader announcements. Open with ⌘K / Ctrl+K.

const commands = [
  { icon: '📄', title: 'New File', sub: 'Create a new file', group: 'File', shortcut: ['⌘', 'N'] },
  { icon: '💾', title: 'Save', sub: 'Save current file', group: 'File', shortcut: ['⌘', 'S'] },
  { icon: '📂', title: 'Open File…', sub: 'Open a file from disk', group: 'File', shortcut: ['⌘', 'O'] },
  { icon: '📑', title: 'Save All', sub: 'Save all open files', group: 'File' },
  { icon: '🔍', title: 'Search', sub: 'Search across the project', group: 'Edit', shortcut: ['⌘', 'Shift', 'F'] },
  { icon: '↩️', title: 'Undo', sub: 'Undo last action', group: 'Edit', shortcut: ['⌘', 'Z'] },
  { icon: '↪️', title: 'Redo', sub: 'Redo last action', group: 'Edit', shortcut: ['⌘', 'Shift', 'Z'] },
  { icon: '📝', title: 'Paste', sub: 'Paste from clipboard', group: 'Edit', shortcut: ['⌘', 'V'] },
  { icon: '🎨', title: 'Toggle Theme', sub: 'Switch light/dark theme', group: 'View' },
  { icon: '➡️', title: 'Go to Line…', sub: 'Jump to a line number', group: 'View', shortcut: ['⌘', 'G'] },
  { icon: '📐', title: 'Toggle Word Wrap', sub: 'Wrap long lines', group: 'View' },
  { icon: '⚙️', title: 'Settings', sub: 'Open settings', group: 'Help' },
  { icon: '❓', title: 'Keyboard Shortcuts', sub: 'List all shortcuts', group: 'Help' },
  { icon: '🚀', title: 'Run Build', sub: 'Compile the project', group: 'Terminal', shortcut: ['⌘', 'Shift', 'B'] },
  { icon: '🐞', title: 'Start Debugger', sub: 'Launch the debugger', group: 'Terminal' },
  { icon: '📊', title: 'Show Output', sub: 'Open the output panel', group: 'Terminal' },
];

const overlay = document.getElementById('overlay');
const query = document.getElementById('query');
const results = document.getElementById('results');
const foot = document.getElementById('foot');
const openBtn = document.getElementById('open');
const closeBtn = document.getElementById('close');
const logEl = document.getElementById('log');

let selectedIndex = -1;
let visibleCommands = [];
let logTimer = null;

function highlight(text, matchIndexes) {
  if (!matchIndexes || !matchIndexes.length) return escapeHtml(text);
  const set = new Set(matchIndexes);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (set.has(i)) out += `<mark>${escapeHtml(ch)}</mark>`;
    else out += escapeHtml(ch);
  }
  return out;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Simple fuzzy matcher: returns sorted matching indexes or null.
function fuzzy(needle, haystack) {
  needle = needle.toLowerCase();
  haystack = haystack.toLowerCase();
  if (haystack.includes(needle)) {
    // prefer prefix match (higher score => earlier indexes)
    return { indexes: matchPositions(needle, haystack), score: haystack.startsWith(needle) ? 2 : 1 };
  }
  const indexes = [];
  let hi = 0;
  for (let ni = 0; ni < needle.length; ni++) {
    const pos = haystack.indexOf(needle[ni], hi);
    if (pos === -1) return null;
    indexes.push(pos);
    hi = pos + 1;
  }
  return { indexes, score: 0 };
}

function matchPositions(needle, haystack) {
  const indexes = [];
  let hi = 0;
  for (let ni = 0; ni < needle.length; ni++) {
    const pos = haystack.indexOf(needle[ni], hi);
    indexes.push(pos);
    hi = pos + 1;
  }
  return indexes;
}

function rank(term) {
  if (!term) return commands.map((c, i) => ({ cmd: c, indexes: [], score: 0 }));
  const scored = [];
  for (const cmd of commands) {
    const titleIdx = fuzzy(term, cmd.title);
    const subIdx = fuzzy(term, cmd.sub);
    if (!titleIdx && !subIdx) continue;
    const indexes = titleIdx && subIdx
      ? [...titleIdx.indexes, subIdx.indexes.length + titleIdx.indexes.length]
      : (titleIdx ? titleIdx.indexes : subIdx.indexes);
    const score = (titleIdx ? titleIdx.score : 0) + (subIdx ? subIdx.score : 0);
    scored.push({ cmd, indexes, score });
  }
  scored.sort((a, b) => b.score - a.score || a.cmd.title.localeCompare(b.cmd.title));
  return scored;
}

function render() {
  const term = query.value.trim();
  const ranked = rank(term);
  visibleCommands = ranked.map((r) => r.cmd);

  // Flatten into groups for display, tracking flat indices.
  results.innerHTML = '';
  let flatIndex = 0;
  const groups = {};
  ranked.forEach((r) => {
    (groups[r.cmd.group] = groups[r.cmd.group] || []).push(r);
  });

  let placeholderIndex = -1;
  Object.keys(groups).forEach((groupName) => {
    const items = groups[groupName];
    if (items.length === 0) return;
    const label = document.createElement('li');
    label.className = 'group-label';
    label.setAttribute('role', 'presentation');
    label.textContent = groupName;
    results.appendChild(label);

    items.forEach((r) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      const btn = document.createElement('button');
      btn.className = 'command';
      btn.setAttribute('type', 'button');
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-index', String(flatIndex));
      btn.setAttribute('aria-selected', 'false');

      const titleMatch = r.cmd.title.toLowerCase().includes(term.toLowerCase());
      const idxs = titleMatch ? r.indexes : [];
      btn.innerHTML = `
        <span class="cmd-icon" aria-hidden="true">${r.cmd.icon}</span>
        <span class="cmd-main">
          <span class="cmd-title">${highlight(r.cmd.title, idxs)}</span>
          <span class="cmd-sub">${escapeHtml(r.cmd.sub)}</span>
        </span>
        ${r.cmd.shortcut
          ? `<span class="cmd-shortcut" aria-hidden="true">${r.cmd.shortcut
              .map((k) => `<kbd>${k}</kbd>`)
              .join('')}</span>`
          : '<span></span>'}
      `;
      btn.addEventListener('click', () => execute(r.cmd));
      li.appendChild(btn);
      results.appendChild(li);
      flatIndex++;
    });
  });

  if (ranked.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.setAttribute('role', 'presentation');
    empty.textContent = 'No matching commands';
    results.appendChild(empty);
    flatIndex = -1;
  }

  // Clamp selection.
  if (selectedIndex >= flatIndex) selectedIndex = Math.max(flatIndex - 1, -1);
  if (flatIndex === 0) selectedIndex = -1;
  applySelection();
  updateCount();
}

function updateCount() {
  const n = visibleCommands.length;
  foot.innerHTML = n === 0
    ? '<span>No commands</span>'
    : `<span>${n} command${n === 1 ? '' : 's'}</span><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> run</span><span><kbd>Esc</kbd> close</span>`;
}

function applySelection() {
  const buttons = results.querySelectorAll('.command');
  buttons.forEach((b, i) => {
    const selected = i === selectedIndex;
    b.setAttribute('aria-selected', selected ? 'true' : 'false');
    if (selected) {
      b.scrollIntoView({ block: 'nearest' });
    }
  });
}

function execute(cmd) {
  logEl.textContent = `Running: ${cmd.title}`;
  logEl.classList.add('is-visible');
  clearTimeout(logTimer);
  logTimer = setTimeout(() => logEl.classList.remove('is-visible'), 2200);
  close();
}

function open() {
  overlay.hidden = false;
  query.value = '';
  selectedIndex = 0;
  render();
  query.focus();
  document.body.style.overflow = 'hidden';
}

function close() {
  overlay.hidden = true;
  document.body.style.overflow = '';
  openBtn.focus();
}

function toggle() {
  if (overlay.hidden) open();
  else close();
}

// Keyboard: global open shortcut.
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k')) {
    e.preventDefault();
    toggle();
  }
});

// Palette-internal keyboard handling.
overlay.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Escape':
      e.preventDefault();
      close();
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (visibleCommands.length) {
        selectedIndex = (selectedIndex + 1) % visibleCommands.length;
        applySelection();
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (visibleCommands.length) {
        selectedIndex = selectedIndex <= 0 ? visibleCommands.length - 1 : selectedIndex - 1;
        applySelection();
      }
      break;
    case 'Home':
      e.preventDefault();
      if (visibleCommands.length) {
        selectedIndex = 0;
        applySelection();
      }
      break;
    case 'End':
      e.preventDefault();
      if (visibleCommands.length) {
        selectedIndex = visibleCommands.length - 1;
        applySelection();
      }
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < visibleCommands.length) {
        execute(visibleCommands[selectedIndex]);
      }
      break;
    default:
      break;
  }
});

query.addEventListener('input', () => {
  selectedIndex = 0;
  render();
});

openBtn.addEventListener('click', open);
closeBtn.addEventListener('click', close);

// Click on backdrop (not the palette) closes.
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) close();
});

// Init: nothing open.
overlay.hidden = true;
