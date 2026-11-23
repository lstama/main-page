/* Tabs — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var tabsList = document.getElementById("tabs");
  if (!tabsList) return;

  var tabs = Array.prototype.slice.call(tabsList.querySelectorAll("[role='tab']"));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  });
  var status = document.getElementById("status");

  function indexof(tab) {
    return tabs.indexOf(tab);
  }

  function activateTab(tab, setFocus) {
    tabs.forEach(function (other, i) {
      var isSelected = other === tab;
      other.setAttribute("aria-selected", isSelected ? "true" : "false");
      other.tabIndex = isSelected ? 0 : -1;
      panels[i].hidden = !isSelected;
      if (isSelected) {
        panels[i].tabIndex = 0;
      } else {
        panels[i].tabIndex = -1;
      }
    });
    if (setFocus) tab.focus();
    announce("Tab activated: " + tab.textContent.trim());
  }

  function announce(msg) {
    if (status) status.textContent = msg;
  }

  // Click handling.
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var newIndex = indexof(tab);
      if (indexof(tab) === -1) return;
      activateTab(tab, true);
      moveFocus(newIndex);
    });
  });

  // Keyboard handling (roving tabindex, arrow keys, Home/End).
  tabsList.addEventListener("keydown", function (e) {
    var currentIndex = indexof(document.activeElement);
    if (currentIndex === -1) return;

    var newIndex = currentIndex;
    var wrap = false;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        newIndex = currentIndex + 1;
        wrap = true;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        newIndex = currentIndex - 1;
        wrap = true;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();

    if (wrap) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        newIndex = (currentIndex + 1) % tabs.length;
      } else {
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }
    }

    // Activate and focus the new tab.
    var newTab = tabs[newIndex];
    activateTab(newTab, true);
  });

  // Initialize: ensure only the first tab is active.
  activateTab(tabs[0], false);
  announce("Tabs ready. " + tabs.length + " tabs available.");
})();
