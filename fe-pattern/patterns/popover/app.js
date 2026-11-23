/* Popover — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var trigger = document.getElementById("trigger");
  var popover = document.getElementById("popover");
  var actionBtn = document.getElementById("pop-action");
  var cancelBtn = document.getElementById("pop-cancel");
  var note = document.getElementById("note");
  if (!trigger || !popover) return;

  var lastFocused = null;

  function position() {
    // Keep the panel on screen; flip horizontally if it would clip.
    var rect = trigger.getBoundingClientRect();
    var popoverRect = popover.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - popoverRect.width / 2;
    var viewportW = window.innerWidth || document.documentElement.clientWidth;
    if (left < 8) left = 8;
    if (left + popoverRect.width > viewportW - 8) {
      left = viewportW - 8 - popoverRect.width;
    }
    var top = rect.bottom + 8;
    var viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (top + popoverRect.height > viewportH - 8) {
      // Flip above the trigger.
      top = rect.top - popoverRect.height - 8;
    }
    popover.style.left = Math.max(8, Math.round(left)) + "px";
    popover.style.top = Math.max(8, Math.round(top)) + "px";
    popover.style.transform = "none";
  }

  function open() {
    lastFocused = document.activeElement;
    popover.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    position();
    // Focus the first focusable element inside the popover.
    var focusable = popover.querySelector("button, [tabindex]");
    (focusable || popover).focus();
    if (note) note.textContent = "Status: open";
  }

  function close() {
    popover.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    if (note) note.textContent = "Status: closed";
  }

  function toggle() {
    if (popover.classList.contains("is-open")) close();
    else open();
  }

  trigger.addEventListener("click", toggle);
  cancelBtn.addEventListener("click", close);
  actionBtn.addEventListener("click", close);

  // Keyboard: Esc closes; Tab stays trapped inside.
  document.addEventListener("keydown", function (e) {
    if (!popover.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      trapFocus(e);
    }
  });

  function trapFocus(e) {
    var focusables = popover.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"]), a[href], input, select, textarea'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Outside click closes.
  document.addEventListener("click", function (e) {
    if (!popover.classList.contains("is-open")) return;
    var inPopover = popover.contains(e.target);
    var isTrigger = trigger.contains(e.target);
    if (!inPopover && !isTrigger) close();
  });

  window.addEventListener("resize", function () {
    if (popover.classList.contains("is-open")) position();
  });
})();
