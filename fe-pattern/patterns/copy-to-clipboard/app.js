/* Copy to Clipboard — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var buttons = Array.prototype.slice.call(document.querySelectorAll(".copy-btn"));
  var status = document.getElementById("status");
  if (!buttons.length) return;

  function getText(btn) {
    var sel = btn.getAttribute("data-copy");
    if (sel) {
      var el = document.querySelector(sel);
      if (el) return el.textContent.trim();
    }
    return btn.getAttribute("data-text") || "";
  }

  function copy(btn) {
    var text = getText(btn);
    if (!text) return;

    var done = function () {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      if (status) {
        status.textContent = "Copied to clipboard.";
        status.classList.add("done");
      }
      setTimeout(function () {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done();
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () { copy(btn); });
  });
})();
