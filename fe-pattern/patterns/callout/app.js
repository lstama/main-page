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

  var main = document.getElementById("main");
  var dismissed = {};
  try {
    var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (stored && typeof stored === "object") dismissed = stored;
  } catch (e) {
    dismissed = {};
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
    } catch (e) {
      /* ignore */
    }
  }

  // Keep the restore control in the DOM from the start and toggle its
  // visibility. Building it only on load meant dismissing a note gave no
  // way to restore it until the page was reloaded.
  var restore = document.createElement("button");
  restore.type = "button";
  restore.className = "callout-restore";
  restore.textContent = "Restore dismissed notes";
  restore.hidden = true;

  function refreshRestore() {
    var anyDismissed = Object.keys(dismissed).some(function (k) { return dismissed[k]; });
    restore.hidden = !anyDismissed;
  }

  callouts.forEach(function (callout, i) {
    var kind = "callout-" + i;
    callout.dataset.kind = kind;

    // Wire every callout, including ones already marked dismissed in storage:
    // skipping them left restored callouts without a dismiss button.
    var close = document.createElement("button");
    close.type = "button";
    close.className = "callout-close";
    close.setAttribute("aria-label", "Dismiss this note");
    close.textContent = "×";
    close.addEventListener("click", function () {
      callout.style.display = "none";
      dismissed[kind] = true;
      persist();
      refreshRestore();
    });
    callout.appendChild(close);

    if (dismissed[kind]) callout.style.display = "none";
  });

  restore.addEventListener("click", function () {
    callouts.forEach(function (callout) {
      callout.style.display = "";
    });
    dismissed = {};
    persist();
    refreshRestore();
  });

  main.appendChild(restore);
  refreshRestore();
})();
