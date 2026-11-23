/* Notification Badge — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var countBadges = Array.prototype.slice.call(document.querySelectorAll(".badge-count"));
  var addBtn = document.getElementById("add");
  var resetBtn = document.getElementById("reset");
  if (!countBadges.length) return;

  // Pick the first count badge as the interactive target.
  var badge = countBadges[0];

  function render(value) {
    if (value <= 0) {
      badge.classList.add("badge-hidden");
      badge.textContent = "0";
    } else if (value >= 100) {
      badge.classList.remove("badge-hidden");
      badge.textContent = "99+";
    } else {
      badge.classList.remove("badge-hidden");
      badge.textContent = String(value);
    }
  }

  // Clicking the badge decrements it.
  badge.addEventListener("click", function () {
    var current = parseInt(badge.getAttribute("data-count"), 10) || 0;
    var next = Math.max(0, current - 1);
    badge.setAttribute("data-count", String(next));
    render(next);
  });

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      var current = parseInt(badge.getAttribute("data-count"), 10) || 0;
      var next = current + 1;
      badge.setAttribute("data-count", String(next));
      render(next);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      var start = parseInt(badge.getAttribute("data-count"), 10) || 0;
      // Reset to the original demo value (3) if we don't track it separately.
      render(3);
      badge.setAttribute("data-count", "3");
    });
  }

  render(3);
})();
