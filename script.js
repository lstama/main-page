// For Collapsible
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    var leftChild = this.querySelector(".collapsible-left");
    var rightChild = this.querySelector(".collapsible-right");
    if (content.clientHeight) {
      content.style.height = "0";
      rightChild.style.borderBottomRightRadius = "4px"; //right is the first one
      leftChild.style.borderBottomLeftRadius = "4px";
    } else {
      content.style.height = content.scrollHeight + "px";
      rightChild.style.borderBottomRightRadius = "0px"; //right is the first one
      leftChild.style.borderBottomLeftRadius = "0px";
    }
  });
}

// const card = document.getElementById('card');
// const toggleBtn = document.getElementById('toggle');
// const toggleBackBtn = document.getElementById('toggle-back');
// const front = card.querySelector('.front');
// const back = card.querySelector('.back');

// function adjustHeight() {
//   const visible = card.classList.contains('show-back') ? back : front;
//   card.style.height = visible.scrollHeight + 'px';
// }

// toggleBtn.addEventListener('click', () => {
//   card.classList.toggle('show-back');
//   adjustHeight();
// });

// toggleBackBtn.addEventListener('click', () => {
//   card.classList.toggle('show-back');
//   adjustHeight();
// });

// // Initial height
// window.addEventListener('load', adjustHeight);
// window.addEventListener('resize', adjustHeight);

// const ro = new ResizeObserver(() => adjustHeight());
// ro.observe(front);
// ro.observe(back);


const card = document.getElementById('card');
const toggleBtn = document.getElementById('toggle');
const toggleBackBtn = document.getElementById('toggle-back');
const front = card.querySelector('.front');
const back = card.querySelector('.back');

function adjustHeight() {
  const visible = card.classList.contains('show-back') ? back : front;
  card.style.height = visible.scrollHeight + 'px';
}

function animateSwap() {
  const showingBack = card.classList.contains('show-back');
  const current = showingBack ? back : front;
  const next = showingBack ? front : back;

  // Slide out current
  current.classList.add('anim-slide-out');

  current.addEventListener('animationend', () => {
    current.classList.remove('anim-slide-out');
    card.classList.toggle('show-back');
    adjustHeight();

    // Slide in next
    next.classList.add('anim-slide-in');
    next.addEventListener('animationend', () => {
      next.classList.remove('anim-slide-in');
    }, { once: true });
  }, { once: true });
}

toggleBtn.addEventListener('click', animateSwap);
toggleBackBtn.addEventListener('click', animateSwap);


// Adjust on load and resize
window.addEventListener('load', adjustHeight);
window.addEventListener('resize', adjustHeight);

// Observe for internal height changes
const ro = new ResizeObserver(() => adjustHeight());
ro.observe(front);
ro.observe(back);
