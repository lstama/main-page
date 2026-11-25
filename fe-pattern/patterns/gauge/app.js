/* Gauge — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var slider = document.getElementById("slider");
  var valEl = document.getElementById("slider-val");
  var valueEl = document.getElementById("value");
  var fill = document.getElementById("gauge-fill");
  var needle = document.getElementById("needle");
  if (!slider || !fill || !needle) return;

  // Measure the real path instead of relying on a hand-written π * r constant.
  // A mismatch between dasharray and dashoffset leaves a sliver of dash visible
  // at the far end of the arc at zero, which round linecaps paint as a green dot.
  var ARC = fill.getTotalLength();
  fill.style.strokeDasharray = ARC + " " + ARC;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function colorFor(v) {
    // green (120) -> yellow (60) -> red (0) as v goes 0..100.
    var hue = 120 - (v / 100) * 120;
    return "hsl(" + hue + ", 70%, 45%)";
  }

  function render(raw) {
    var v = Math.max(0, Math.min(100, raw)); // clamp to the slider's valid range
    var frac = v / 100;
    if (v <= 0) {
      // Zero: move the whole dash pattern past the end of the path so nothing
      // is painted (dashoffset === dash length can still show a round cap).
      fill.style.visibility = "hidden";
      fill.style.strokeDashoffset = ARC + 1;
    } else {
      fill.style.visibility = "visible";
      fill.style.strokeDashoffset = ARC * (1 - frac);
    }
    fill.style.stroke = colorFor(v);
    // Needle: -90deg at 0, +90deg at 100.
    needle.style.transform = "rotate(" + (-90 + v * 1.8) + "deg)";
    if (valueEl) valueEl.textContent = Math.round(v);
    if (valEl) valEl.textContent = Math.round(v);
  }

  slider.addEventListener("input", function () {
    render(parseInt(slider.value, 10));
  });

  render(0);
})();
