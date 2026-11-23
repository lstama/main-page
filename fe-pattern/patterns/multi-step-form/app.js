/* Multi-step Form Wizard — progressive enhancement. Pure JS, no framework.
 * Guided steps with per-step validation, a progress bar + stepper,
 * focus management, aria-current, and localStorage persistence.
 */
(function () {
  "use strict";

  // ---- Theme: follow the gallery's global theme when embedded ------------
  var docEl = document.documentElement;
  var GALLERY_KEY = "fe-theme"; // gallery's global theme key

  function stored() { return localStorage.getItem("theme"); }
  function system() { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function globalTheme() {
    // Embedded in the gallery, the parent's data-theme is the source of truth.
    try {
      if (window.parent && window.parent !== window) {
        return window.parent.document.documentElement.getAttribute("data-theme");
      }
    } catch (e) {}
    return null;
  }
  function applyTheme(theme) { docEl.setAttribute("data-theme", theme); }
  function resolveTheme() {
    var g = globalTheme();
    if (g) return g;                 // embedded: follow the gallery's global theme
    return stored() || system();     // standalone: persisted choice, else OS
  }
  applyTheme(resolveTheme());
  // Gallery toggled its global theme: this frame gets a storage event for fe-theme.
  window.addEventListener("storage", function (e) {
    if (e.key === GALLERY_KEY) applyTheme(resolveTheme());
  });
  // Standalone: follow OS changes until the user overrides.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!globalTheme() && !stored()) applyTheme(e.matches ? "dark" : "light");
  });

  var STORAGE_KEY = "fe-multi-step-form";

  var form = document.getElementById("wizard");
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var stepper = document.getElementById("stepper");
  var fill = document.getElementById("progress-fill");
  var backBtn = document.getElementById("back");
  var nextBtn = document.getElementById("next");
  var restartBtn = document.getElementById("restart");
  var statusEl = document.getElementById("form-status");
  var reviewEl = document.getElementById("review");
  if (!form) return;

  var TOTAL = panels.length; // 4 (incl. done)
  var current = 0;

  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function save() {
    var data = {};
    ["email", "password", "fullname", "company"].forEach(function (name) {
      var el = form.elements[name];
      if (el) data[name] = el.value;
    });
    data._step = current;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      // Only restore if the user had genuinely made progress.
      return d && (d.email || d.fullname || d._step > 0) ? d : null;
    } catch (e) {
      return null;
    }
  }

  function restore(d) {
    ["email", "password", "fullname", "company"].forEach(function (name) {
      var el = form.elements[name];
      if (el && d[name] !== undefined) el.value = d[name];
    });
    current = Math.min(d._step || 0, TOTAL - 1);
  }

  // ---- Validation per step ------------------------------------------------
  function validate(step) {
    var ok = true;
    var msg = "";

    function fail(el, text) {
      el.setAttribute("aria-invalid", "true");
      var err = document.getElementById(el.id + "-err");
      if (err) err.textContent = text;
      ok = false;
    }
    function clearErr(el) {
      el.removeAttribute("aria-invalid");
      var err = document.getElementById(el.id + "-err");
      if (err) err.textContent = "";
    }

    if (step === 0) {
      var email = form.elements.email;
      var password = form.elements.password;
      clearErr(email); clearErr(password);
      var emailVal = email.value.trim();
      if (!emailVal) { fail(email, "Email is required."); }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { fail(email, "Enter a valid email address."); }
      if (!password.value) { fail(password, "Password is required."); }
      else if (password.value.length < 8) { fail(password, "At least 8 characters."); }
      msg = ok ? "Account details look good." : "Please fix the fields above.";
    } else if (step === 1) {
      var name = form.elements.fullname;
      clearErr(name);
      if (!name.value.trim()) { fail(name, "Name is required."); ok = false; }
      msg = ok ? "Profile saved." : "Please enter your name.";
    } else if (step === 2) {
      msg = "Everything look right?";
    }

    return { ok: ok, msg: msg };
  }

  // ---- Render -------------------------------------------------------------
  function render() {
    // Panels
    panels.forEach(function (panel) {
      var i = parseInt(panel.getAttribute("data-panel"), 10);
      var isCurrent = i === current;
      panel.hidden = !isCurrent;
      if (isCurrent) {
        // Move focus into the step so screen readers announce it and keyboard
        // users land on a focusable control when one exists.
        var target = panel.querySelector("input, button");
        var focusTarget = target || panel.querySelector(".panel-title");
        if (focusTarget) focusTarget.focus();
      }
    });

    // Stepper
    steps.forEach(function (stepEl, i) {
      var done = i < current;
      var active = i === current;
      stepEl.classList.toggle("is-done", done);
      stepEl.classList.toggle("is-active", active);
      stepEl.classList.toggle("is-upcoming", i > current);
      stepEl.removeAttribute("aria-current");
      if (active) stepEl.setAttribute("aria-current", "step");
      var marker = stepEl.querySelector(".step-marker");
      if (marker) marker.textContent = done ? "✓" : (i + 1);
    });

    // Progress bar (based on non-done steps)
    var progress = TOTAL > 1 ? (current / (TOTAL - 1)) * 100 : 0;
    if (fill) fill.style.width = progress + "%";

    // Buttons
    var isReview = current === TOTAL - 2;
    var isFirst = current === 0;
    nextBtn.textContent = isReview ? "Finish" : "Next";
    var actions = document.querySelector(".actions");
    if (actions) {
      actions.style.display = current === TOTAL - 1 ? "none" : "";
    }
    backBtn.style.visibility = isFirst ? "hidden" : "visible";

    // Review summary
    if (current === 2) renderReview();
  }

  function renderReview() {
    if (!reviewEl) return;
    var email = form.elements.email.value.trim();
    var name = form.elements.fullname.value.trim();
    var company = form.elements.company.value.trim();
    reviewEl.innerHTML =
      row("Email", email) + row("Name", name) + row("Company", company || "Not provided");
  }
  function row(label, value) {
    return "<div class='review-row'><dt>" + label + "</dt><dd>" + value + "</dd></div>";
  }

  // ---- Navigation ---------------------------------------------------------
  function next() {
    var step = current;
    if (step === TOTAL - 1) {
      // Finish
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      current = TOTAL - 1;
      announce("Form submitted successfully.");
      render();
      return;
    }
    var res = validate(step);
    if (!res.ok) {
      announce(res.msg);
      var firstInvalid = panels[step].querySelector("[aria-invalid]");
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    current = step + 1;
    save();
    announce("Step " + (current + 1) + " of " + TOTAL + ": " +
      (current === 2 ? "Review" : current === TOTAL - 1 ? "Done" : "Profile"));
    render();
  }

  function back() {
    if (current === 0) return;
    current -= 1;
    save();
    announce("Back to step " + (current + 1) + " of " + TOTAL);
    render();
  }

  // ---- Events -------------------------------------------------------------
  // Next advances on click (mouse/touch) or Enter/Return in any field.
  nextBtn.addEventListener("click", function () { next(); });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === "Return") {
      e.preventDefault();
      next();
    }
  });
  backBtn.addEventListener("click", back);

  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      console.log("RESTART-CLICK-FIRED");
      form.reset();
      console.log("AFTER-RESET");
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { console.log("REMOVE-ERR", e); }
      console.log("AFTER-REMOVE");
      current = 0;
      // Clear any error text
      document.querySelectorAll(".error").forEach(function (el) { el.textContent = ""; });
      console.log("AFTER-CLEAR-ERRORS");
      announce("Form reset. Starting over.");
      console.log("AFTER-ANNOUNCE");
      render();
      console.log("AFTER-RENDER");
    });
  }

  // ---- Init ---------------------------------------------------------------
  var saved = load();
  if (saved) {
    restore(saved);
    announce("Restored your progress at step " + (current + 1) + " of " + TOTAL + ".");
  } else {
    current = 0;
  }
  render();
})();
