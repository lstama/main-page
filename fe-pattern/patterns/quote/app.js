/* Quote — progressive enhancement. Pure JS, no framework.

   Enhancement: injects a "Copy" button into each figure that copies the
   quoted text to the clipboard. Quotes work without JS — the button is
   optional and added progressively. */
(function () {
  "use strict";

  var figures = Array.prototype.slice.call(document.querySelectorAll(".quote"));
  if (!figures.length) return;

  figures.forEach(function (figure) {
    var blockquote = figure.querySelector("blockquote");
    if (!blockquote) return;

    var text = blockquote.textContent.trim();

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quote-copy";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy quote to clipboard");

    btn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copied!";
          setTimeout(function () { btn.textContent = "Copy"; }, 1200);
        });
      }
    });

    figure.appendChild(btn);
  });
})();
