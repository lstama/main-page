/* Date Range Picker
 * Pick a start and end date by clicking or dragging across a single-month grid.
 * Keyboard: arrows move focus, Home/End jump within the week, Enter/Space sets the
 * range, T = today, Esc = close. Range is stored as start/end Date objects and
 * rendered as YYYY-MM-DD – YYYY-MM-DD.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const $ = (id) => document.getElementById(id);
const daysEl = $("range-days");
const titleEl = $("range-cal-title");
const inputEl = $("range-input");
const outputEl = $("range-output");
const dialog = $("range-calendar");
const trigger = $("range-trigger");

const state = {
  view: { month: new Date().getMonth(), year: new Date().getFullYear() },
  start: null, // Date | null
  end: null, // Date | null
  focus: null, // Date currently focused for keyboard
  // Transient drag/preview range (null means "use start/end"):
  preview: null, // { start: Date, end: Date }
};

// Maps the current grid's cells to their Date so the range preview can be
// updated in place (no DOM rebuild) while dragging.
let cellsByDate = {};

/* ---------- date helpers ---------- */
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a, b) {
  return a && b && ymd(a) === ymd(b);
}

function earlier(a, b) {
  // returns the earlier of two Dates (a or b); either may be null
  if (!a) return b;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}
function later(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

function startOfMonth(y, m) {
  return new Date(y, m, 1);
}
function endOfMonth(y, m) {
  return new Date(y, m + 1, 0);
}

function addDays(d, n) {
  const nd = new Date(d);
  nd.setDate(d.getDate() + n);
  return nd;
}

/* ---------- grid building ---------- */
function buildCells(y, m) {
  const first = startOfMonth(y, m);
  const last = endOfMonth(y, m);
  const lead = first.getDay(); // 0..6, how many cells precede the 1st
  const gridStart = addDays(first, -lead);
  const cells = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
  return cells;
}

function rangeClasses(date) {
  const inRange = state.preview || { start: state.start, end: state.end };
  const s = inRange.start;
  const e = inRange.end;
  const classes = [];
  if (s && e && date.getTime() >= s.getTime() && date.getTime() <= e.getTime()) {
    classes.push("is-in-range");
  }
  if (sameDay(date, s) && sameDay(date, e)) {
    classes.push("is-range-start", "is-range-end");
  } else if (sameDay(date, s)) {
    classes.push("is-range-start");
  } else if (sameDay(date, e)) {
    classes.push("is-range-end");
  }
  return classes.join(" ");
}

function render() {
  const { month, year } = state.view;
  titleEl.textContent = `${MONTHS[month]} ${year}`;

  const cells = buildCells(year, month);
  daysEl.innerHTML = "";
  cellsByDate = {};

  cells.forEach((date) => {
    const inMonth = date.getMonth() === month && date.getFullYear() === year;
    const isToday = sameDay(date, new Date());
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-day" + (inMonth ? "" : " aria-disabled=\"true\"") + (isToday ? " is-today" : "");
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("id", `rd-${ymd(date)}`);
    btn.setAttribute("aria-label", date.toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
    if (!inMonth) btn.setAttribute("aria-disabled", "true");
    else btn.setAttribute("aria-selected", String(sameDay(date, state.start) || sameDay(date, state.end)));

    if (inMonth) {
      btn.classList.add(...rangeClasses(date).split(" ").filter(Boolean));
      btn.addEventListener("pointerdown", onPointerDown);
    }
    btn.addEventListener("pointerover", onPointerOver);
    btn.appendChild(document.createTextNode(date.getDate().toString()));
    daysEl.appendChild(btn);
    cellsByDate[ymd(date)] = { btn, date };
  });

  // Keep the keyboard focus on the same logical date across rebuilds.
  if (state.focus) {
    const id = `rd-${ymd(state.focus)}`;
    const el = document.getElementById(id);
    if (el) el.focus({ preventScroll: true });
    else {
      // focus landed on an out-of-month cell; move it into view
      state.focus = clampIntoView(state.focus);
      const el2 = document.getElementById(`rd-${ymd(state.focus)}`);
      if (el2) el2.focus({ preventScroll: true });
    }
  }

  updateInput();
  updateOutput();
}

// Updates only the range styling of the already-rendered cells, so pointer
// capture survives a drag (render() would rebuild the grid and drop it).
function updateRangePreview() {
  const s = state.preview ? state.preview.start : state.start;
  const e = state.preview ? state.preview.end : state.end;
  for (const key in cellsByDate) {
    const { btn, date } = cellsByDate[key];
    btn.classList.remove("is-in-range", "is-range-start", "is-range-end");
    if (s && e && date.getTime() >= s.getTime() && date.getTime() <= e.getTime()) {
      btn.classList.add("is-in-range");
    }
    if (sameDay(date, s) && sameDay(date, e)) {
      btn.classList.add("is-range-start", "is-range-end");
    } else if (sameDay(date, s)) {
      btn.classList.add("is-range-start");
    } else if (sameDay(date, e)) {
      btn.classList.add("is-range-end");
    }
  }
}

function clampIntoView(d) {
  const first = startOfMonth(state.view.year, state.view.month);
  const last = endOfMonth(state.view.year, state.view.month);
  if (d.getTime() < first.getTime()) return first;
  if (d.getTime() > last.getTime()) return last;
  return d;
}

function updateInput() {
  if (state.start && state.end) {
    inputEl.value = `${ymd(state.start)} – ${ymd(state.end)}`;
  } else if (state.start) {
    inputEl.value = `${ymd(state.start)} –`;
  } else {
    inputEl.value = "";
  }
}

function updateOutput() {
  if (state.start && state.end) {
    outputEl.textContent = `${ymd(state.start)} – ${ymd(state.end)}`;
  } else if (state.start) {
    outputEl.textContent = `Start: ${ymd(state.start)} (pick end date)`;
  } else {
    outputEl.textContent = "None";
  }
}

/* ---------- selection ---------- */
function pickDate(date) {
  const { start, end } = state;
  if (!start || end) {
    // begin a fresh range
    state.start = date;
    state.end = null;
  } else if (date.getTime() < start.getTime()) {
    state.start = date; // dragged/clicked to the left
  } else {
    state.end = date; // complete the range
  }
  state.focus = date;
  state.preview = null;
  render();
}

function commitDrag(preview) {
  state.start = preview.start;
  state.end = preview.end;
  state.focus = preview.start;
  state.preview = null;
  render();
}

/* ---------- drag / hover preview ---------- */
function onPointerDown(e) {
  const date = parseDate(e.currentTarget);
  state.preview = { start: date, end: date };
  updateRangePreview();
  // NOTE: intentionally do NOT set pointer capture. Capturing on the start
  // cell would redirect every pointerover to that cell, so the preview could
  // never track the cursor while dragging. pointerover fires on the element
  // under the cursor only without capture; onPointerUp (document, capture
  // phase) still finalizes the drag even if the pointer leaves the grid.
}

function onPointerOver(e) {
  if (!state.preview) return;
  const date = parseDate(e.currentTarget);
  state.preview = {
    start: earlier(state.preview.start, date),
    end: later(state.preview.end, date),
  };
  updateRangePreview();
}

function onPointerUp() {
  if (state.preview) {
    if (sameDay(state.preview.start, state.preview.end)) {
      // single-click drag: treat as a plain pick
      pickDate(state.preview.start);
    } else {
      commitDrag(state.preview);
    }
  }
  state.preview = null;
}

function parseDate(btn) {
  const id = btn.id; // rd-YYYY-MM-DD
  const [y, m, d] = id.slice(3).split("-").map(Number);
  return new Date(y, m - 1, d);
}

document.addEventListener("pointerup", onPointerUp, true);

/* ---------- navigation ---------- */
function prevMonth() {
  if (state.view.month === 0) {
    state.view = { month: 11, year: state.view.year - 1 };
  } else {
    state.view.month -= 1;
  }
  state.focus = clampIntoView(state.focus || new Date());
  render();
}
function nextMonth() {
  if (state.view.month === 11) {
    state.view = { month: 0, year: state.view.year + 1 };
  } else {
    state.view.month += 1;
  }
  state.focus = clampIntoView(state.focus || new Date());
  render();
}
function goToday() {
  const today = new Date();
  state.view = { month: today.getMonth(), year: today.getFullYear() };
  state.focus = today;
  render();
}
function clearRange() {
  state.start = null;
  state.end = null;
  state.preview = null;
  state.focus = new Date();
  render();
}

/* ---------- open / close ---------- */
function open() {
  if (!state.focus) state.focus = state.start || state.end || new Date();
  state.focus = clampIntoView(state.focus);
  dialog.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  render();
  const focused = document.getElementById(`rd-${ymd(state.focus)}`);
  if (focused) focused.focus({ preventScroll: true });
}
function close() {
  dialog.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  trigger.focus();
}

/* ---------- keyboard ---------- */
function handleGridKey(e) {
  if (!state.focus) return;
  const d = state.focus;
  let handled = true;
  switch (e.key) {
    case "ArrowRight": state.focus = addDays(d, 1); break;
    case "ArrowLeft": state.focus = addDays(d, -1); break;
    case "ArrowDown": state.focus = addDays(d, 7); break;
    case "ArrowUp": state.focus = addDays(d, -7); break;
    case "Home": state.focus = addDays(d, -d.getDay()); break;
    case "End": state.focus = addDays(d, 6 - d.getDay()); break;
    case "PageDown": state.focus = pageNav(d, 1); break;
    case "PageUp": state.focus = pageNav(d, -1); break;
    case "Enter":
    case " ":
      e.preventDefault();
      pickDate(d);
      return;
    case "t":
    case "T":
      goToday();
      render();
      return;
    case "Escape":
      handled = false;
      close();
      return;
    default:
      handled = false;
  }
  if (handled) {
    e.preventDefault();
    state.focus = clampIntoView(state.focus);
    render();
  }
}

function pageNav(d, dir) {
  const first = startOfMonth(state.view.year, state.view.month);
  const dayOfWeek = first.getDay();
  const anchor = addDays(first, -dayOfWeek); // Sunday of visible week
  return addDays(anchor, dir * 7);
}

function handleInputKey(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    open();
  }
}

/* ---------- wire up ---------- */
trigger.addEventListener("click", open);
$("range-prev").addEventListener("click", prevMonth);
$("range-next").addEventListener("click", nextMonth);
$("range-today").addEventListener("click", goToday);
$("range-clear").addEventListener("click", clearRange);
$("range-close").addEventListener("click", close);
inputEl.addEventListener("keydown", handleInputKey);
daysEl.addEventListener("keydown", handleGridKey);

// Initial paint (calendar stays closed until opened).
updateInput();
updateOutput();
