/* Typography Scale — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var ratioEl = document.getElementById("ratio");
  var baseEl = document.getElementById("base");
  var stepsEl = document.getElementById("steps");
  var scale = document.getElementById("scale");
  if (!scale) return;

  var SAMPLE = "The quick brown fox jumps over the lazy dog.";

  function render() {
    var base = parseFloat(baseEl.value) || 16;
    var ratio = parseFloat(ratioEl.value) || 1;
    var steps = parseInt(stepsEl.value, 10) || 7;

    scale.innerHTML = "";

    for (var i = steps - 1; i >= 0; i--) {
      var size = base * Math.pow(ratio, i);
      var row = document.createElement("div");
      row.className = "scale-row";

      var meta = document.createElement("span");
      meta.className = "scale-meta";
      meta.textContent = "H" + i + (i === 0 ? " · body" : "");

      var text = document.createElement("p");
      text.className = "scale-text";
      text.textContent = SAMPLE;
      text.style.fontSize = size + "px";
      if (i >= 5) text.style.fontWeight = "700";

      var px = document.createElement("span");
      px.className = "scale-px";
      px.textContent = size.toFixed(1) + "px";

      row.appendChild(meta);
      row.appendChild(text);
      row.appendChild(px);
      scale.appendChild(row);
    }
  }

  ratioEl.addEventListener("change", render);
  baseEl.addEventListener("input", render);
  stepsEl.addEventListener("input", render);
  render();
})();
