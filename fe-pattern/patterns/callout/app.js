/* Callout — progressive enhancement. Pure JS, no framework.

   Callouts are primarily static content, so this enhancement is optional:
   it injects a dismiss affordance into each callout, remembers which ones the
   user dismissed in localStorage, and offers a restore link. Callouts work
   without JS — the enhancement degrades gracefully. */
(function () {
  "use strict";

  var STORAGE_KEY = "fe-pattern-callout-dismissed";
  var callouts = Array.prototype.slice.call(document.querySelectorAll(".callout"));
  if (!callouts.length) return;

  var dismissed = {};
  try {
    dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    dismissed = {};
  }

  callouts.forEach(function (callout, i) {
    var kind = "callout-" + i;
    callout.dataset.kind = kind;

    // Skip if already dismissed and we're restoring the hidden state.
    if (dismissed[kind]) {
      callout.style.display = "none";
      return;
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "callout-close";
    close.setAttribute("aria-label", "Dismiss this note");
    close.textContent = "×";
    close.addEventListener("click", function () {
      callout.style.display = "none";
      dismissed[kind] = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
      } catch (e) {
        /* ignore */
      }
    });
    callout.appendChild(close);
  });

  // Restore link (shown only if something was dismissed).
  var anyDismissed = Object.keys(dismissed).some(function (k) { return dismissed[k]; });
  if (anyDismissed) {
    var restore = document.createElement("button");
    restore.type = "button";
    restore.className = "callout-restore";
    restore.textContent = "Restore dismissed notes";
    restore.addEventListener("click", function () {
      callouts.forEach(function (callout) {
        callout.style.display = "";
      });
      dismissed = {};
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
      } catch (e) {
        /* ignore */
      }
    });
    document.getElementById("main").appendChild(restore);
  }
})();
