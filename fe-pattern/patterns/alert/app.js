/* Alerts — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var alerts = Array.prototype.slice.call(document.querySelectorAll(".alert"));
  if (!alerts.length) return;

  function dismiss(alert) {
    // Animate a quick fade, then hide.
    alert.style.transition = "opacity 0.2s ease, max-height 0.2s ease";
    alert.style.opacity = "0";
    setTimeout(function () {
      alert.classList.add("is-hidden");
    }, 200);
  }

  alerts.forEach(function (alert) {
    var close = alert.querySelector(".alert-close");
    if (close) {
      close.addEventListener("click", function () { dismiss(alert); });
    }
  });

  // Escape dismisses the last focused alert.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var visible = alerts.filter(function (a) {
      return !a.classList.contains("is-hidden");
    });
    if (visible.length) dismiss(visible[visible.length - 1]);
  });
})();
