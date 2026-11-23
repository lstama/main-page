// Wishlist Heart
// Toggles a favorite state with a fill-pop animation, updates aria-pressed,
// and reflects the state in the hint text.
(function () {
  'use strict';

  const heart = document.getElementById('heart');
  const hint = document.getElementById('hint');

  heart.addEventListener('click', () => {
    const liked = heart.getAttribute('aria-pressed') === 'true';
    const next = liked ? 'false' : 'true';
    heart.setAttribute('aria-pressed', next);

    if (!liked) {
      heart.classList.remove('pop');
      void heart.offsetWidth; // restart the animation
      heart.classList.add('pop');
      hint.textContent = 'Added to your wishlist ♥';
      hint.classList.add('on');
      heart.setAttribute('title', 'Remove from wishlist');
    } else {
      hint.textContent = 'Tap the heart to add to your wishlist';
      hint.classList.remove('on');
      heart.setAttribute('title', 'Add to wishlist');
    }
  });

  heart.addEventListener('animationend', () => heart.classList.remove('pop'));
})();
