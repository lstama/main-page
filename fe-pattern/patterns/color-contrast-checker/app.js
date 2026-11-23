/* Contrast Checker — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var fg = document.getElementById("fg");
  var bg = document.getElementById("bg");
  var ratioValue = document.getElementById("ratio-value");
  var preview = document.getElementById("preview");
  if (!fg || !bg) return;

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  // sRGB channel to linear.
  function linear(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    return 0.2126 * linear(rgb.r) + 0.7152 * linear(rgb.g) + 0.0722 * linear(rgb.b);
  }

  function contrast(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    var lighter = Math.max(la, lb);
    var darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function update() {
    var fgRgb = hexToRgb(fg.value);
    var bgRgb = hexToRgb(bg.value);
    if (!fgRgb || !bgRgb) return;

    var ratio = contrast(fgRgb, bgRgb);
    ratioValue.textContent = ratio.toFixed(2) + " : 1";

    // Apply colors to the preview.
    preview.style.color = fg.value;
    preview.style.background = bg.value;

    // WCAG thresholds. Rows: AAA large, AA large, AAA normal, AA normal.
    var thresholds = [4.5, 3, 7, 4.5];

    var lis = Array.prototype.slice.call(document.querySelectorAll(".grades li"));
    lis.forEach(function (li, i) {
      var val = li.querySelector(".g-value");
      var ok = ratio >= thresholds[i];
      val.textContent = ok ? "PASS" : "FAIL";
      val.className = "g-value " + (ok ? "pass" : "fail");
    });
  }

  fg.addEventListener("input", update);
  bg.addEventListener("input", update);
  update();
})();
