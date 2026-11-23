/* Inline Editing — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var STORAGE_KEY = "fe-pattern-inline-editing";
  var editable = document.getElementById("editable");
  if (!editable) return;

  var status = document.getElementById("status");
  var toolbar = editable.parentElement.querySelector(".toolbar");
  var buttons = toolbar
    ? Array.prototype.slice.call(toolbar.querySelectorAll("button[data-cmd]"))
    : [];
  var resetBtn = document.getElementById("reset");

  // Load saved content from localStorage.
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }
  if (saved !== null) {
    editable.innerHTML = saved;
    announce("Loaded saved content");
  } else {
    announce("Ready to edit");
  }

  // Save content to localStorage.
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, editable.innerHTML);
    } catch (e) {
      /* ignore quota / private-mode errors */
    }
  }

  // Update toolbar pressed state to match current selection.
  function updateToolbar() {
    buttons.forEach(function (btn) {
      var cmd = btn.getAttribute("data-cmd");
      var pressed = false;
      if (cmd === "undo" || cmd === "redo") {
        pressed = false;
      } else {
        try {
          pressed = document.queryCommandState(cmd);
        } catch (e) {
          pressed = false;
        }
      }
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
  }

  // Execute a formatting command from the toolbar.
  function execCmd(cmd) {
    editable.focus();
    document.execCommand(cmd, false, null);
    editable.focus();
    save();
    updateToolbar();
    announce("Applied " + cmd);
  }

  // Toolbar click handling.
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var cmd = btn.getAttribute("data-cmd");
      if (cmd === "undo") {
        document.execCommand("undo", false, null);
      } else if (cmd === "redo") {
        document.execCommand("redo", false, null);
      } else {
        execCmd(cmd);
      }
      editable.focus();
      save();
      updateToolbar();
    });
  });

  // Keyboard shortcuts: Ctrl/Cmd + B/I/U.
  editable.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey) {
      var key = e.key.toLowerCase();
      if (key === "b" || key === "i" || key === "u") {
        e.preventDefault();
        var cmd = key === "b" ? "bold" : key === "i" ? "italic" : "underline";
        document.execCommand(cmd, false, null);
        save();
        updateToolbar();
      }
    }
  });

  // Save on input.
  editable.addEventListener("input", function () {
    save();
    updateToolbar();
    announce("Saved");
  });

  // Update toolbar state when selection changes.
  document.addEventListener("selectionchange", function () {
    if (document.activeElement === editable) {
      updateToolbar();
    }
  });

  // Reset button.
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Reset all content? This cannot be undone.")) {
        editable.innerHTML =
          '<p>Start editing this text. Select words and use the toolbar to format them.</p>';
        save();
        updateToolbar();
        editable.focus();
        announce("Content reset to default");
      }
    });
  }

  function announce(msg) {
    if (status) {
      status.textContent = msg;
    }
  }
})();
