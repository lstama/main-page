/* Box Shadow Generator — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var preview = document.getElementById("preview");
  var dx = document.getElementById("dx");
  var dy = document.getElementById("dy");
  var blur = document.getElementById("blur");
  var spread = document.getElementById("spread");
  var opacity = document.getElementById("opacity");
  var color = document.getElementById("color");
  var css = document.getElementById("css");
  var copyBtn = document.getElementById("copy");
  if (!preview) return;

  var box = document.createElement("div");
  box.className = "box";
  preview.appendChild(box);

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function render() {
    var rgb = hexToRgb(color.value);
    var shadow =
      dx.value + "px " +
      dy.value + "px " +
      blur.value + "px " +
      spread.value + "px " +
      "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + (opacity.value / 100) + ")";
    box.style.boxShadow = shadow;
    css.value = "box-shadow: " + shadow + ";";
  }

  [dx, dy, blur, spread, opacity, color].forEach(function (el) {
    el.addEventListener("input", render);
  });

  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(css.value).then(function () {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(function () {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("copied");
        }, 1200);
      });
    });
  }

  render();
})();
