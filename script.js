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
