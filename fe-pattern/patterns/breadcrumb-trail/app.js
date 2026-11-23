/* Breadcrumb trail.
 *
 * Accessibility (WAI-ARIA Breadcrumb pattern):
 *   - <nav aria-label="Breadcrumb"> wraps an <ol>.
 *   - Each step is a <li><a> linking to its level.
 *   - The current page is the last <li> with <span aria-current="page">.
 *   - Separators are real characters (not decorative ::before), so they are announced
 *     correctly by screen readers.
 *
 * Responsive (cross-device):
 *   - On narrow screens, if the path has more than 3 steps, the middle steps are hidden
 *     behind an "…" toggle so the trail stays compact on mobile. Expanding shows all steps.
 */
const PATHS = [
  [["Home", "/"]],
  [["Home", "/"], ["Patterns", "/patterns"]],
  [["Home", "/"], ["Patterns", "/patterns"], ["Search Autocomplete", "/patterns/search"]],
  [
    ["Home", "/"],
    ["Patterns", "/patterns"],
    ["Search Autocomplete", "/patterns/search"],
    ["Configuration", "/patterns/search/config"],
  ],
];

const list = document.getElementById("crumbs-list");
const select = document.getElementById("path-select");
const MAX_SHOWN = 3; // home + current + at most one middle on narrow screens
let expanded = false; // user clicked the ellipsis to reveal all steps

function render(path) {
  list.innerHTML = "";
  const total = path.length;
  const isNarrow = window.innerWidth <= 480;
  // On narrow screens, keep the first (home), last (current), and collapse the middle —
  // unless the user has expanded the trail or the path is short.
  const showAll = expanded || !isNarrow || total <= MAX_SHOWN;

  path.forEach(([label, href], i) => {
    const isLast = i === total - 1;
    const isMiddle = !showAll && i > 0 && i < total - 1;
    const isEllipsis = !showAll && i === 1;

    const li = document.createElement("li");

    if (isEllipsis) {
      // Ellipsis button that reveals the collapsed middle steps.
      const ell = document.createElement("button");
      ell.type = "button";
      ell.className = "crumbs-ellipsis";
      ell.setAttribute("aria-label", "Show collapsed breadcrumb items");
      ell.textContent = "…";
      ell.addEventListener("click", () => {
        expanded = true;
        render(PATHS[select.selectedIndex]);
      });
      li.appendChild(ell);
    } else if (i > 0) {
      // Separator before each step except the first.
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.setAttribute("aria-hidden", "true");
      sep.textContent = "/";
      li.appendChild(sep);
    }

    if (isLast) {
      const span = document.createElement("span");
      span.setAttribute("aria-current", "page");
      span.textContent = label;
      li.appendChild(span);
    } else if (!isMiddle) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      li.appendChild(a);
    }

    // Append unless this is a hidden middle step — but always show the ellipsis button.
    if (!isMiddle || isEllipsis) list.appendChild(li);
  });
}

select.addEventListener("change", () => render(PATHS[Number(select.value)]));
window.addEventListener("resize", () => render(PATHS[Number(select.value)]));

// Initial render.
render(PATHS[Number(select.value)]);
