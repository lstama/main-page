/* Parallax — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var hero = document.getElementById("hero");
  var bg = document.querySelector(".layer-bg");
  var mid = document.querySelector(".layer-mid");
  if (!hero || (!bg && !mid)) return;

  // Honor accessibility: skip the effect if the user asked for reduced motion.
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  var BG_SPEED = 0.3;   // background moves slowly
  var MID_SPEED = 0.6;  // foreground moves faster

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      var heroH = hero.offsetHeight;
      // Only animate while the hero is in view.
      if (y < heroH) {
        if (bg) bg.style.transform = "translate3d(0, " + (y * BG_SPEED) + "px, 0)";
        if (mid) mid.style.transform = "translate3d(0, " + (y * MID_SPEED) + "px, 0)";
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    if (!ticking) onScroll();
  });
})();
