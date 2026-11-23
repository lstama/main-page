/* Search autocomplete (type-ahead combobox).
 *
 * Accessibility (WAI-ARIA combobox pattern):
 *   - The input is role="combobox" with aria-autocomplete="list" and aria-controls pointing
 *     at the listbox.
 *   - The dropdown is role="listbox"; each item is role="option" with aria-selected.
 *   - A role=status aria-live region announces the number of results (not the spoken list,
 *     to avoid flooding screen-reader users).
 *
 * Keyboard (PC):
 *   - Type to filter.
 *   - ArrowDown / ArrowUp move the active highlight (wrapping).
 *   - Enter selects the active option (or the first if none active).
 *   - Escape closes the listbox and returns focus to the input.
 *   - Tab moves focus away and closes the listbox.
 *
 * Mouse/touch: click/tap an option to select.
 */
const DATA = [
  "JavaScript", "TypeScript", "Python", "Ruby", "Go", "Rust", "Java", "C++",
  "C#", "PHP", "Swift", "Kotlin", "Scala", "Haskell", "Elixir", "Dart",
  "Lua", "Shell", "HTML", "CSS", "SQL", "Markdown", "JSON", "YAML",
];

const input = document.getElementById("search");
const listbox = document.getElementById("listbox");
const status = document.getElementById("status");
const result = document.getElementById("result");

let activeIndex = -1;
let filtered = [];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text, label) {
  // Wrap matching chars in <span class="match"> for emphasis.
  if (!text) return label;
  const re = new RegExp(`(${escapeRegExp(text)})`, "i");
  return label.replace(re, "<span class='match'>$1</span>");
}

function render() {
  listbox.innerHTML = "";
  activeIndex = -1;

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "no-results";
    li.textContent = "No results found";
    listbox.appendChild(li);
    input.setAttribute("aria-expanded", "false");
    return;
  }

  filtered.forEach((name, i) => {
    const li = document.createElement("li");
    li.className = "option";
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    li.innerHTML = highlight(input.value, name);
    li.dataset.index = String(i);
    li.addEventListener("click", () => selectOption(i));
    listbox.appendChild(li);
  });

  input.setAttribute("aria-expanded", "true");
}

function updateActive() {
  const options = listbox.querySelectorAll(".option");
  options.forEach((o) => o.classList.toggle("is-active", o.dataset.index === String(activeIndex)));
}

function showResults() {
  const q = input.value.trim();
  filtered = q
    ? DATA.filter((n) => n.toLowerCase().includes(q.toLowerCase()))
    : [...DATA];
  render();
  status.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"} available`;
}

function selectOption(i) {
  if (i < 0 || i >= filtered.length) return;
  input.value = filtered[i];
  result.textContent = `Selected: ${filtered[i]}`;
  closeListbox();
}

function openListbox() {
  listbox.hidden = false;
  showResults();
}

function closeListbox() {
  listbox.hidden = true;
  input.setAttribute("aria-expanded", "false");
  activeIndex = -1;
}

input.addEventListener("input", () => {
  result.textContent = "";
  openListbox();
});

input.addEventListener("focus", () => openListbox());

input.addEventListener("keydown", (e) => {
  const options = listbox.querySelectorAll(".option");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (listbox.hidden || options.length === 0) return;
    activeIndex = (activeIndex + 1) % options.length;
    updateActive();
    options[activeIndex].scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (listbox.hidden || options.length === 0) return;
    activeIndex = activeIndex <= 0 ? options.length - 1 : activeIndex - 1;
    updateActive();
    options[activeIndex].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (!listbox.hidden && options.length > 0) {
      const idx = activeIndex >= 0 ? activeIndex : 0;
      selectOption(idx);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeListbox();
    input.focus();
  }
});

// Close on click outside the field.
document.addEventListener("click", (e) => {
  if (!e.target.closest(".field")) closeListbox();
});

// Announce once on load.
status.textContent = "Type to search";
