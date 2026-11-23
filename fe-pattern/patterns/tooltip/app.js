/* Tooltip — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var hosts = Array.prototype.slice.call(document.querySelectorAll("[data-tooltip]"));
  if (!hosts.length) return;

  var current = null;   // the tooltip element currently shown
  var hideTimer = null;

  function makeTip(host) {
    var tip = document.createElement("div");
    tip.className = "tooltip";
    tip.setAttribute("role", "tooltip");
    tip.textContent = host.getAttribute("data-tooltip");
    var pos = host.getAttribute("data-pos") || "top";
    tip.classList.add("pos-" + pos);
    // Append to host so it scrolls/clips with content.
    host.appendChild(tip);
    return tip;
  }

  function position(tip, host) {
    // Inline elements (e.g. <span>) have zero height; nudge so the tip
    // doesn't clip against the text line. Actual placement is handled by
    // the .pos-* CSS classes, which position the tip relative to this
    // (position: relative) host.
    if (host.tagName === "SPAN" || getComputedStyle(host).display === "inline") {
      host.style.display = "inline-block";
    }
  }

  function show(host) {
    clearTimeout(hideTimer);
    var tip = host.querySelector(".tooltip");
    if (!tip) tip = makeTip(host);
    current = tip;
    position(tip, host);
    requestAnimationFrame(function () {
      tip.classList.add("is-visible");
    });
  }

  function hide() {
    clearTimeout(hideTimer);
    if (!current) return;
    current.classList.remove("is-visible");
    var host = current.parentNode;
    hideTimer = setTimeout(function () {
      if (current && current.parentNode === host) current.remove();
      current = null;
    }, 120);
  }

  hosts.forEach(function (host) {
    // Associate the tooltip with the host for screen readers.
    var tip = host.querySelector(".tooltip");
    if (tip) {
      host.setAttribute("aria-describedby", tip.id || "");
    }

    host.addEventListener("mouseenter", function () { show(host); });
    host.addEventListener("mouseleave", function () { hide(); });
    host.addEventListener("focus", function () { show(host); });
    host.addEventListener("blur", function () { hide(); });

    // Track the pointer for left/right positioned tips.
    host.addEventListener("mousemove", function () {
      if (current) position(current, host);
    });
  });

  // Escape hides any open tooltip.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
  });
})();
