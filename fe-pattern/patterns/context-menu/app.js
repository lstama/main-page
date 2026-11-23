/* Context Menu — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var card = document.getElementById("card");
  var log = document.getElementById("log");
  if (!card) return;

  var ITEMS = [
    { label: "Open", shortcut: "Enter", action: function () { return "Open"; } },
    { label: "Rename", shortcut: "F2", action: function () { return "Rename"; } },
    { label: "Move", action: function () { return "Move"; } },
    { sep: true },
    { label: "Delete", shortcut: "Del", danger: true, action: function () { return "Delete"; } },
  ];

  var menu = null;
  var focusIndex = 0;

  function buildMenu() {
    menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "menu");

    ITEMS.forEach(function (item, i) {
      if (item.sep) {
        var sep = document.createElement("div");
        sep.className = "menu-sep";
        sep.setAttribute("role", "separator");
        menu.appendChild(sep);
        return;
      }
      var btn = document.createElement("button");
      btn.className = "menu-item";
      btn.setAttribute("role", "menuitem");
      btn.textContent = item.label;
      if (item.danger) btn.style.color = "#dc2626";
      if (item.shortcut) {
        var sc = document.createElement("span");
        sc.className = "shortcut";
        sc.textContent = item.shortcut;
        btn.appendChild(sc);
      }
      btn.addEventListener("click", function () {
        execute(item);
        close();
      });
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);
  }

  function open(x, y) {
    if (!menu) buildMenu();
    // Keep the menu on screen.
    var rect = menu.getBoundingClientRect();
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (x + rect.width > vw) x = vw - rect.width - 4;
    if (y + rect.height > vh) y = vh - rect.height - 4;
    menu.style.left = Math.max(0, x) + "px";
    menu.style.top = Math.max(0, y) + "px";
    menu.classList.add("is-open");
    focusIndex = 0;
    updateFocus();
  }

  function close() {
    if (!menu) return;
    menu.classList.remove("is-open");
    setTimeout(function () { if (menu) menu.remove(); menu = null; }, 120);
    card.focus();
  }

  function visibleItems() {
    return Array.prototype.slice.call(menu.querySelectorAll(".menu-item"));
  }

  function updateFocus() {
    var items = visibleItems();
    items.forEach(function (el, i) {
      el.classList.toggle("focused", i === focusIndex);
    });
    if (items[focusIndex]) items[focusIndex].focus();
  }

  function execute(item) {
    if (!item || !item.action) return;
    var msg = item.action();
    if (log) log.textContent = "Action: " + msg;
  }

  // Open on right-click.
  card.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    open(e.clientX, e.clientY);
  });

  // Keyboard: Menu / Shift+F10 opens; arrows move; Enter/Space executes; Esc closes.
  card.addEventListener("keydown", function (e) {
    if ((e.key === "Menu" || (e.key === "F10" && e.shiftKey)) && !menu) {
      e.preventDefault();
      var r = card.getBoundingClientRect();
      open(r.right - 100, r.top);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!menu) return;
    var items = visibleItems();
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusIndex = (focusIndex + 1) % items.length;
      updateFocus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusIndex = (focusIndex - 1 + items.length) % items.length;
      updateFocus();
    } else if (e.key === "Home") {
      e.preventDefault();
      focusIndex = 0;
      updateFocus();
    } else if (e.key === "End") {
      e.preventDefault();
      focusIndex = items.length - 1;
      updateFocus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      var focused = items[focusIndex];
      if (focused) focused.click();
    }
  });

  // Click outside closes.
  document.addEventListener("click", function (e) {
    if (menu && !menu.contains(e.target) && e.target !== card) close();
  });
})();
