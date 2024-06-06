const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
}
resizeCanvas();

let isDrawing = false;
let isEraser = false;

const penSizeSlider = document.getElementById('penSize');
const penOpacitySlider = document.getElementById('penOpacity');
// const togglePenEraserButton = document.getElementById('togglePenEraser');
const penButton = document.getElementById('penButton');
const eraserButton = document.getElementById('eraserButton');
const clearCanvasButton = document.getElementById('clearCanvas');
const currentModeIndicator = document.getElementById('currentMode');
const colorLabel = document.getElementById('colorLabel');

// Mouse Events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

// Touch Events
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', (event) => {
    // Prevent scrolling while drawing
    event.preventDefault();
    draw(event.touches[0]);
});

// togglePenEraserButton.addEventListener('click', () => {
//     isEraser = !isEraser;
//     if (isEraser) {
//         togglePenEraserButton.textContent = "Switch to Pen";
//         currentModeIndicator.textContent = "Current Mode: Eraser";
//     } else {
//         togglePenEraserButton.textContent = "Switch to Eraser";
//         currentModeIndicator.textContent = "Current Mode: Pen";
//     }
// });
const penColorPicker = document.getElementById('penColor');
penColorPicker.addEventListener('input', () => {
    colorLabel.style.color = penColorPicker.value;
});

penButton.addEventListener('click', () => {
    isEraser = false;
    penButton.style.backgroundColor =  "#2a7bac";
    eraserButton.style.backgroundColor =  "#3498db";
    // Pen U+270E
});

eraserButton.addEventListener('click', () => {
    isEraser = true;
    penButton.style.backgroundColor =  "#3498db";
    eraserButton.style.backgroundColor =  "#2a7bac";
    // Pen U+270E
});

//Eraser U+2327
clearCanvasButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function startDrawing(event) {
    isDrawing = true;
    const pos = getMousePos(canvas, event);
    ctx.moveTo(pos.x, pos.y);
    ctx.beginPath();
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}

function draw(event) {
    if (!isDrawing) return;

    const pos = getMousePos(canvas, event);

    ctx.lineWidth = penSizeSlider.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? 'white' : penColorPicker.value;
    ctx.globalAlpha = penOpacitySlider.value;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.moveTo(pos.x, pos.y);
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
