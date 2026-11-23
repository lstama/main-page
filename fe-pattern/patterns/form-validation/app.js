// Client-side form validation.
// Validates each field on blur, validates all on submit, and exposes accessible state.
const form = document.getElementById('form');

const rules = {
  email: {
    validate: (v) => {
      if (!v.trim()) return 'Email is required.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Enter a valid email address.';
      return '';
    },
  },
  password: {
    validate: (v) => {
      if (!v) return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      return '';
    },
  },
};

function setError(input, message) {
  const msgEl = document.getElementById(`${input.name}-msg`);
  const invalid = message.length > 0;
  input.parentElement.classList.toggle('input-invalid', invalid);
  input.parentElement.classList.toggle('input-valid', !invalid && input.value.length > 0);
  input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  msgEl.textContent = message;
  msgEl.classList.toggle('empty', !invalid);
}

function validateField(input) {
  const message = rules[input.name].validate(input.value);
  setError(input, message);
  return message;
}

// Validate this field as soon as the user leaves it.
form.querySelectorAll('input').forEach((input) => {
  input.addEventListener('blur', () => validateField(input));
});

// Validate everything when submitted.
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const messages = [];
  form.querySelectorAll('input').forEach((input) => {
    const m = validateField(input);
    if (m) messages.push(m);
  });
  if (messages.length) {
    form.querySelector('input').focus();
    return;
  }
  const btn = form.querySelector('.submit');
  btn.disabled = true;
  btn.textContent = 'Creating…';
  setTimeout(() => {
    btn.textContent = 'Account created ✓';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Create account';
      form.reset();
      form.querySelectorAll('input').forEach((input) => setError(input, ''));
    }, 1500);
  }, 800);
});
