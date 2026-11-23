/* Sortable List — progressive enhancement. Pure JS, no framework.
 * Reorder by pointer drag (mouse + touch) or keyboard (↑/↓, Home/End).
 * State lives in an array, persisted to localStorage.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "fe-sortable-list";
  var DEFAULTS = [
    { id: "a", text: "Ship onboarding flow" },
    { id: "b", text: "Fix checkout crash on Safari" },
    { id: "c", text: "Write release notes" },
    { id: "d", text: "Audit a11y issues" },
    { id: "e", text: "Plan next sprint" },
  ];

  var listEl = document.getElementById("list");
  var statusEl = document.getElementById("list-status");
  var resetBtn = document.getElementById("reset");
  if (!listEl) return;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULTS.map(function (i) { return { id: i.id, text: i.text }; });
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  var items = load();

  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function render() {
    listEl.innerHTML = "";
    items.forEach(function (item, index) {
      var li = document.createElement("li");
      li.className = "list-item" + (index === 0 ? " is-first" : "") +
        (index === items.length - 1 ? " is-last" : "");
      li.setAttribute("data-id", item.id);
      li.setAttribute("tabindex", "0");

      var handle = document.createElement("button");
      handle.type = "button";
      handle.className = "grip";
      handle.setAttribute("aria-hidden", "true");
      handle.textContent = "⠷";
      handle.tabIndex = -1; // focus managed on the item, not the grip

      var label = document.createElement("span");
      label.className = "item-label";
      label.textContent = item.text;

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "item-remove";
      remove.setAttribute("aria-label", "Remove " + item.text);
      remove.textContent = "✕";

      li.appendChild(handle);
      li.appendChild(label);
      li.appendChild(remove);
      listEl.appendChild(li);
    });
  }

  function itemEls() { return Array.prototype.slice.call(listEl.querySelectorAll(".list-item")); }
  function indexFor(el) { return itemEls().indexOf(el); }

  function moveFromArray(from, to) {
    if (from === to || from < 0 || to >= items.length) return false;
    var [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    save();
    return true;
  }

  function announceMove(el) {
    var idx = indexFor(el) + 1;
    var text = el.querySelector(".item-label").textContent;
    announce("Moved " + text + " to position " + idx + " of " + items.length);
  }

  // ---- Keyboard -----------------------------------------------------------
  listEl.addEventListener("keydown", function (e) {
    var el = document.activeElement && listEl.contains(document.activeElement)
      ? document.activeElement : null;
    if (!el) return;
    var from = indexFor(el);
    var to = from;

    switch (e.key) {
      case "ArrowUp":   to = from > 0 ? from - 1 : from; break;
      case "ArrowDown": to = from < items.length - 1 ? from + 1 : from; break;
      case "Home":      to = 0; break;
      case "End":       to = items.length - 1; break;
      default: return;
    }
    e.preventDefault();
    if (to === from) return;
    moveFromArray(from, to);
    render();
    var target = itemEls()[to];
    target.focus();
    announceMove(target);
  });

  // ---- Pointer drag (mouse + touch) ---------------------------------------
  var dragging = null;
  var startY = 0;

  function onPointerDown(e) {
    var item = e.target.closest(".list-item");
    if (!item) return;
    dragging = item;
    startY = e.clientY;
    item.classList.add("dragging");
    listEl.style.touchAction = "none"; // stop page scroll while dragging
    try { listEl.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var to = indexFor(document.elementFromPoint(e.clientX, e.clientY));
    var from = indexFor(dragging);
    if (to >= 0 && to !== from) {
      moveFromArray(from, to);
      render();
      dragging = itemEls()[to];
      dragging.classList.add("dragging");
      announceMove(dragging);
    }
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging.classList.remove("dragging");
    listEl.style.touchAction = "";
    dragging.blur();
    dragging.focus();
    dragging = null;
    listEl.releasePointerCapture(e.pointerId);
  }

  listEl.addEventListener("pointerdown", onPointerDown);
  listEl.addEventListener("pointermove", onPointerMove);
  listEl.addEventListener("pointerup", onPointerUp);
  listEl.addEventListener("pointercancel", onPointerUp);

  // ---- Remove -------------------------------------------------------------
  listEl.addEventListener("click", function (e) {
    var removeBtn = e.target.closest(".item-remove");
    if (!removeBtn) return;
    var el = removeBtn.closest(".list-item");
    var text = el.querySelector(".item-label").textContent;
    var idx = indexFor(el);
    items.splice(idx, 1);
    save();
    render();
    var next = itemEls()[Math.min(idx, items.length - 1)];
    if (next) next.focus();
    announce(text + " removed. " + items.length + " items left.");
  });

  // ---- Reset --------------------------------------------------------------
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      items = DEFAULTS.map(function (i) { return { id: i.id, text: i.text }; });
      save();
      render();
      announce("List reset to default order.");
    });
  }

  render();
  announce(items.length + " items. Use arrow keys or drag to reorder.");
})();
