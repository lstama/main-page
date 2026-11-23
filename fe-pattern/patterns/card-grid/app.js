/* Card Grid — progressive enhancement. Pure JS, no framework.

   Enhancement: reveals cards with a staggered fade-up as they enter the viewport
   via IntersectionObserver. Cards work and read fine without JS — the animation
   is purely optional. */
(function () {
  "use strict";

  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  if (!cards.length) return;

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach(function (card, i) {
      card.style.transitionDelay = (i % 6 * 60) + "ms";
      io.observe(card);
    });
  } else {
    // Fallback: show everything immediately.
    cards.forEach(function (card) { card.classList.add("is-visible"); });
  }
})();
