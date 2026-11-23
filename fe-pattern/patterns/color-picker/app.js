/* Color Picker — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var trigger = document.getElementById("color-trigger");
  var picker = document.getElementById("color-picker");
  var swatches = document.getElementById("cp-swatches");
  var swatchEl = document.getElementById("color-swatch");
  var hexEl = document.getElementById("color-hex");
  var display = document.getElementById("color-display");
  var preview = document.getElementById("color-preview");
  var native = document.getElementById("color-native");
  var applyNative = document.getElementById("color-apply-native");
  var closeBtn = document.getElementById("color-close");

  if (!picker) return;

  var PRESETS = [
    "#2563EB", "#DC2626", "#16A34A", "#EA580C", "#7C3AED", "#DB2777",
    "#0891B2", "#CA8A04", "#4F46E5", "#BE123C", "#059669", "#9A3412",
  ];

  var currentColor = "#2563EB";

  function normalizeHex(hex) {
    if (!hex || hex.charAt(0) !== "#") return "#000000";
    if (hex.length === 4) {
      // #RGB -> #RRGGBB
      hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex.toUpperCase();
  }

  function setColor(hex, announce) {
    currentColor = normalizeHex(hex);
    swatchEl.style.background = currentColor;
    hexEl.textContent = currentColor;
    display.value = currentColor;
    native.value = currentColor;
    preview.style.background = currentColor;
    if (announce) {
      // Update the aria-live region on the preview element.
      preview.setAttribute("aria-live", "polite");
    }
    updateSelectedState();
  }

  function updateSelectedState() {
    var items = swatches.querySelectorAll(".cp-swatch");
    for (var i = 0; i < items.length; i++) {
      var selected = items[i].getAttribute("data-color") === currentColor;
      items[i].setAttribute("aria-selected", selected ? "true" : "false");
    }
  }

  function renderSwatches() {
    PRESETS.forEach(function (color) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cp-swatch";
      btn.setAttribute("data-color", color);
      btn.setAttribute("aria-label", color);
      btn.style.background = color;
      btn.setAttribute("aria-selected", color === currentColor ? "true" : "false");

      btn.addEventListener("click", function () {
        setColor(color, true);
      });

      swatches.appendChild(btn);
    });
  }

  function openPicker() {
    picker.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    var first = swatches.querySelector(".cp-swatch[aria-selected='true']") || swatches.firstChild;
    if (first) first.focus();
  }

  function closePicker() {
    picker.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  }

  function togglePicker() {
    if (picker.hidden) openPicker();
    else closePicker();
  }

  // Trigger.
  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    togglePicker();
  });

  // Close.
  closeBtn.addEventListener("click", function () { closePicker(); });

  // Apply native color.
  applyNative.addEventListener("click", function () {
    setColor(native.value, true);
  });

  // Native color input also applies on change.
  native.addEventListener("input", function () {
    setColor(native.value, false);
  });

  // Outside click closes.
  document.addEventListener("click", function (e) {
    if (!picker.hidden && !picker.contains(e.target) && !trigger.contains(e.target)) {
      closePicker();
    }
  });

  // Keyboard navigation.
  picker.addEventListener("keydown", function (e) {
    var items = Array.prototype.slice.call(swatches.querySelectorAll(".cp-swatch"));
    var current = document.activeElement;
    var index = items.indexOf(current);

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closePicker();
        return;
      case "Tab":
        closePicker();
        return;
      case "Enter":
      case " ":
        if (index >= 0) {
          e.preventDefault();
          setColor(items[index].getAttribute("data-color"), true);
        }
        return;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) items[index - 1].focus();
        else if (items.length) items[items.length - 1].focus();
        return;
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (index < items.length - 1) items[index + 1].focus();
        else if (items.length) items[0].focus();
        return;
      case "Home":
        e.preventDefault();
        if (items.length) items[0].focus();
        return;
      case "End":
        e.preventDefault();
        if (items.length) items[items.length - 1].focus();
        return;
      default:
        return;
    }
  });

  // Initialize.
  renderSwatches();
  setColor(currentColor, false);
})();
