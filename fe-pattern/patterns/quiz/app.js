/* Quiz — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var quiz = document.getElementById("quiz");
  var questionsEl = document.getElementById("questions");
  var submitBtn = document.getElementById("submit");
  var result = document.getElementById("result");
  var resultTitle = document.getElementById("result-title");
  var resultText = document.getElementById("result-text");
  var retryBtn = document.getElementById("retry");
  if (!quiz) return;

  var DATA = [
    {
      q: "Which HTML attribute marks content as invisible to screen readers?",
      options: ["hidden", "aria-hidden", "display:none", "vismode"],
      answer: 1,
    },
    {
      q: "What does the 'defer' attribute do on a <script> tag?",
      options: ["Runs the script before parsing", "Runs after HTML parsed, in order",
        "Loads the script asynchronously with no order", "Minifies the script"],
      answer: 1,
    },
    {
      q: "Which CSS unit is relative to the viewport width?",
      options: ["em", "ex", "vw", "rem"],
      answer: 2,
    },
  ];

  var state = DATA.map(function () { return false; }); // answered?

  function render() {
    questionsEl.innerHTML = "";
    DATA.forEach(function (item, qi) {
      var li = document.createElement("li");
      li.className = "question";
      li.dataset.qi = qi;

      var title = document.createElement("p");
      title.className = "q-title";
      title.textContent = (qi + 1) + ". " + item.q;
      li.appendChild(title);

      var opts = document.createElement("div");
      opts.className = "options";

      item.options.forEach(function (opt, oi) {
        var wrap = document.createElement("label");
        wrap.className = "option";

        var input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + qi;
        input.value = oi;

        var label = document.createElement("span");
        label.textContent = opt;

        wrap.appendChild(input);
        wrap.appendChild(label);
        opts.appendChild(wrap);
      });

      li.appendChild(opts);
      questionsEl.appendChild(li);
    });
  }

  function score() {
    var correct = 0;
    DATA.forEach(function (item, qi) {
      var chosen = formValue(qi);
      var li = questionsEl.querySelector('[data-qi="' + qi + '"]');
      var opts = li.querySelectorAll(".option");
      var feedback = li.querySelector(".feedback") || document.createElement("p");

      // Mark correct/wrong options.
      opts.forEach(function (opt, oi) {
        opt.classList.remove("answer-correct", "answer-wrong");
        if (oi === item.answer) opt.classList.add("answer-correct");
        if (chosen === oi && oi !== item.answer) opt.classList.add("answer-wrong");
      });

      if (chosen === item.answer) {
        correct += 1;
        li.classList.add("correct");
        li.classList.remove("incorrect");
      } else {
        li.classList.add("incorrect");
        li.classList.remove("correct");
      }
    });
    return { correct: correct, total: DATA.length };
  }

  function formValue(qi) {
    var radios = quiz.querySelectorAll('input[name="q' + qi + '"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return parseInt(radios[i].value, 10);
    }
    return -1;
  }

  function onSubmit(e) {
    e.preventDefault();
    var s = score();
    var pct = Math.round(s.correct / s.total * 100);
    resultTitle.textContent = pct + "% correct";
    resultText.textContent = "You got " + s.correct + " of " + s.total + " right.";
    result.hidden = false;
    submitBtn.hidden = true;
    result.focus();
  }

  function onRetry() {
    var inputs = quiz.querySelectorAll("input[type='radio']");
    inputs.forEach(function (r) { r.checked = false; });
    questionsEl.querySelectorAll(".question").forEach(function (q) {
      q.classList.remove("correct", "incorrect");
    });
    result.hidden = true;
    submitBtn.hidden = false;
    submitBtn.focus();
  }

  render();
  quiz.addEventListener("submit", onSubmit);
  retryBtn.addEventListener("click", onRetry);
})();
