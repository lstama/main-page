// File upload with preview.
//
// Cross-device: drag-drop on desktop, native picker on mobile (tap) or keyboard
// (Enter/Space on the drop zone). The native `<input type="file">` is the a11y
// backbone — it is visually hidden but fully focusable. JS reads the chosen
// files, renders thumbnails (images) or file info (others), and lets each be
// removed. The checked `files` array is the single source of truth.

const form = document.getElementById('upload-form');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewList = document.getElementById('preview-list');
const submitBtn = document.getElementById('submit-btn');
const status = document.getElementById('upload-status');

let files = []; // array of File objects — single source of truth

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function isImage(file) {
  return file.type.startsWith('image/');
}

function render() {
  previewList.innerHTML = '';

  files.forEach((file, index) => {
    const li = document.createElement('li');
    li.className = 'preview-item';
    li.setAttribute('role', 'listitem');

    // Thumbnail or file icon
    if (isImage(file)) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      li.appendChild(img);
    } else {
      const icon = document.createElement('div');
      icon.className = 'file-icon';
      icon.textContent = '📄';
      icon.setAttribute('aria-hidden', 'true');
      li.appendChild(icon);
    }

    // Name + size
    const info = document.createElement('div');
    info.className = 'file-info';
    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;
    const size = document.createElement('span');
    size.className = 'file-size';
    size.textContent = formatSize(file.size);
    info.appendChild(name);
    info.appendChild(size);
    li.appendChild(info);

    // Remove
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeFile(index));
    li.appendChild(removeBtn);

    previewList.appendChild(li);
  });

  // Submit button
  const count = files.length;
  submitBtn.disabled = count === 0;
  submitBtn.textContent = count ? `Upload ${count} ${count === 1 ? 'file' : 'files'}` : 'Upload';

  // Announce for screen readers
  if (count === 0) {
    status.textContent = 'No files selected';
  } else {
    status.textContent = `${count} ${count === 1 ? 'file' : 'files'} selected: ` +
      files.map((f) => f.name).join(', ');
  }
}

function addFiles(newFiles) {
  files = files.concat(newFiles);
  render();
}

function removeFile(index) {
  files.splice(index, 1);
  render();
}

// --- Pick via native input (tap / keyboard fallback) ---
fileInput.addEventListener('change', () => {
  addFiles(Array.prototype.slice.call(fileInput.files));
  fileInput.value = ''; // allow re-selecting the same file next time
});

// --- Drop zone acts as a button that opens the picker ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    fileInput.click();
  }
});

// --- Drag-drop feedback ---
['dragenter', 'dragover'].forEach((evt) => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
});
['dragleave', 'drop'].forEach((evt) => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
  });
});
dropZone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt && dt.files) addFiles(Array.prototype.slice.call(dt.files));
});

// --- Submit (demo: just confirm; no real network call) ---
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (files.length === 0) return;
  submitBtn.textContent = `Uploaded ${files.length} file${files.length === 1 ? '' : 's'} ✓`;
  submitBtn.classList.add('uploaded');
});

render();
