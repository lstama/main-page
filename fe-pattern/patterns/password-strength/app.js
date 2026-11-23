// Password strength meter.
//
// Measures a password against concrete, visible criteria and maps the count of
// met criteria to a 5-level strength indicator. The same checks back the visual
// meter, so the bar and the checklist can never disagree.

const password = document.getElementById('password');
const meter = document.querySelector('.meter');
const label = document.getElementById('strength-label');
const criteriaItems = document.querySelectorAll('.criteria li');

// Criteria: each returns true/false. The checklist mirrors these exactly.
const checks = {
  length: (v) => v.length >= 8,
  lower: (v) => /[a-z]/.test(v),
  upper: (v) => /[A-Z]/.test(v),
  digit: (v) => /[0-9]/.test(v),
  special: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
};

const LABELS = {
  0: 'Enter a password',
  1: 'Weak — easy to guess',
  2: 'Fair — could be stronger',
  3: 'Okay — getting there',
  4: 'Good — solid password',
  5: 'Strong — great choice',
};

function evaluate(value) {
  // Count met criteria and mark each checklist row.
  let met = 0;
  criteriaItems.forEach((li) => {
    const name = li.dataset.criterion;
    const passed = checks[name](value);
    li.classList.toggle('met', passed);
    if (passed) met += 1;
  });
  return met;
}

function updateMeter(value) {
  const score = evaluate(value);
  // Empty input -> level 0 (no bars filled). Otherwise score maps 1:1 to level.
  const level = value.length === 0 ? 0 : score;
  meter.setAttribute('data-level', String(level));
  label.textContent = LABELS[level];
}

password.addEventListener('input', () => updateMeter(password.value));
updateMeter(''); // initial state
