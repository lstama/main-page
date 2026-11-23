/* Gradient Generator — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var c1 = document.getElementById("c1");
  var c2 = document.getElementById("c2");
  var angle = document.getElementById("angle");
  var angleVal = document.getElementById("angle-val");
  var preview = document.getElementById("preview");
  var css = document.getElementById("css");
  var copyBtn = document.getElementById("copy");
  if (!preview) return;

  function update() {
    var value = "linear-gradient(" + angle.value + "deg, " + c1.value + ", " + c2.value + ")";
    preview.style.background = value;
    css.value = value;
    angleVal.textContent = angle.value + "°";
  }

  function copy() {
    var text = css.value;
    var done = function () {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
      setTimeout(function () {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }

    function fallback() {
      css.focus();
      css.select();
      try {
        document.execCommand("select");
        document.execCommand("copy");
        done();
      } catch (e) {
        /* clipboard unavailable */
      }
    }
  }

  c1.addEventListener("input", update);
  c2.addEventListener("input", update);
  angle.addEventListener("input", update);
  copyBtn.addEventListener("click", copy);

  update();
})();
