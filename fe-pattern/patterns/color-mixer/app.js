/* Color Mixer — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var c1 = document.getElementById("c1");
  var c2 = document.getElementById("c2");
  var ratio = document.getElementById("ratio");
  var ratioVal = document.getElementById("ratio-val");
  var result = document.getElementById("result");
  var hex = document.getElementById("hex");
  var rgb = document.getElementById("rgb");
  if (!result) return;

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(rgb) {
    var to = function (v) {
      var h = Math.round(v).toString(16);
      return h.length < 2 ? "0" + h : h;
    };
    return "#" + to(rgb.r) + to(rgb.g) + to(rgb.b).toUpperCase();
  }

  function luminance(rgb) {
    return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  }

  function mix() {
    var a = hexToRgb(c1.value);
    var b = hexToRgb(c2.value);
    if (!a || !b) return;
    var t = ratio.value / 100; // fraction of c2
    var blended = {
      r: a.r * (1 - t) + b.r * t,
      g: a.g * (1 - t) + b.g * t,
      b: a.b * (1 - t) + b.b * t,
    };
    var hexVal = rgbToHex(blended);

    result.style.background = hexVal;
    result.style.color = luminance(blended) > 0.55 ? "#1a1a1a" : "#ffffff";
    result.textContent = hexVal.toUpperCase();

    hex.value = hexVal.toUpperCase();
    rgb.value = "rgb(" + Math.round(blended.r) + ", " + Math.round(blended.g) + ", " +
      Math.round(blended.b) + ")";
    ratioVal.textContent = Math.round((1 - t) * 100) + "% base / " + Math.round(t * 100) + "% mix";
  }

  c1.addEventListener("input", mix);
  c2.addEventListener("input", mix);
  ratio.addEventListener("input", mix);
  mix();
})();
