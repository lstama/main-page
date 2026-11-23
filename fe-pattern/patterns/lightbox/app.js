/* Lightbox — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));
  if (!thumbs.length) return;

  var images = thumbs.map(function (t) {
    return {
      src: t.getAttribute("data-src"),
      caption: t.getAttribute("data-caption") || "",
    };
  });

  var openBtn = document.activeElement; // restore focus on close

  // Build the lightbox DOM once.
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Image viewer");
  lb.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Close (Esc)">×</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous image">‹</button>' +
    '<img src="" alt="" />' +
    '<div class="lb-caption"></div>' +
    '<button class="lb-btn lb-next" aria-label="Next image">›</button>';
  document.body.appendChild(lb);

  var img = lb.querySelector("img");
  var caption = lb.querySelector(".lb-caption");
  var closeBtn = lb.querySelector(".lb-close");
  var prevBtn = lb.querySelector(".lb-prev");
  var nextBtn = lb.querySelector(".lb-next");

  var index = 0;
  var isOpen = false;

  function show(i) {
    index = (i + images.length) % images.length;
    img.src = images[index].src;
    img.alt = images[index].caption || "Image " + (index + 1);
    caption.textContent = images[index].caption + "  (" + (index + 1) + " / " + images.length + ")";
  }

  function open() {
    isOpen = true;
    var t = document.activeElement;
    if (t && t.classList.contains("thumb")) index = thumbs.indexOf(t);
    lb.classList.add("is-open");
    closeBtn.focus();
  }

  function close() {
    isOpen = false;
    lb.classList.remove("is-open");
    if (openBtn) openBtn.focus();
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    var focusables = lb.querySelectorAll("button, img[src]");
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  lb.addEventListener("click", function (e) {
    // Click on backdrop (not on image or buttons) closes.
    if (e.target === lb) close();
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(index - 1); });
  nextBtn.addEventListener("click", function () { show(index + 1); });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") trapFocus(e);
  });

  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      openBtn = t;
      open();
    });
  });
})();
