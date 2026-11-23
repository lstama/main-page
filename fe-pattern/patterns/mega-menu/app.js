/* Mega Menu — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var trigger = document.getElementById("mega-trigger");
  var menu = document.getElementById("mega-menu");
  if (!trigger || !menu) return;

  var items = Array.prototype.slice.call(menu.querySelectorAll("[role='menuitem']"));

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    if (items.length) items[0].focus();
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  }

  function toggleMenu() {
    if (menu.hidden) openMenu();
    else closeMenu();
  }

  // Trigger.
  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    toggleMenu();
  });

  // Close on outside click.
  document.addEventListener("click", function (e) {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== trigger) {
      closeMenu();
    }
  });

  // Keyboard navigation.
  menu.addEventListener("keydown", function (e) {
    var index = items.indexOf(document.activeElement);
    var newIndex = index;

    switch (e.key) {
      case "ArrowDown":
        newIndex = index < items.length - 1 ? index + 1 : 0;
        break;
      case "ArrowUp":
        newIndex = index > 0 ? index - 1 : items.length - 1;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = items.length - 1;
        break;
      case "Escape":
        e.preventDefault();
        closeMenu();
        return;
      case "Tab":
        closeMenu();
        return;
      default:
        return;
    }

    e.preventDefault();
    items[newIndex].focus();
  });

  // Trigger keyboard support (Enter/Space opens).
  trigger.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " " || e.key === "Spacebar") && menu.hidden) {
      e.preventDefault();
      openMenu();
    }
  });

  // Initialize.
  closeMenu();
})();
