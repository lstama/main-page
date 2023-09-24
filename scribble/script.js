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
const penColorPicker = document.getElementById('penColor');
const togglePenEraserButton = document.getElementById('togglePenEraser');
const clearCanvasButton = document.getElementById('clearCanvas');
const currentModeIndicator = document.getElementById('currentMode');

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    const pos = getMousePos(canvas, event);
    ctx.moveTo(pos.x, pos.y);
    ctx.beginPath();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.closePath();
});

canvas.addEventListener('mousemove', draw);

togglePenEraserButton.addEventListener('click', () => {
    isEraser = !isEraser;
    if (isEraser) {
        togglePenEraserButton.textContent = "Switch to Pen";
        currentModeIndicator.textContent = "Current Mode: Eraser";
    } else {
        togglePenEraserButton.textContent = "Switch to Eraser";
        currentModeIndicator.textContent = "Current Mode: Pen";
    }
});

clearCanvasButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

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
