const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9; // Adjusting to 90% of viewport width to match container width
    canvas.height = window.innerHeight * 0.7; // An arbitrary height; adjust as needed
}

// Set the canvas size when the page loads
resizeCanvas();

let isDrawing = false;

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    const pos = getMousePos(canvas, event);
    ctx.moveTo(pos.x, pos.y); // Start the path where the mouse is
    ctx.beginPath(); // Start a new path
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mousemove', draw);

function draw(event) {
    if (!isDrawing) return;

    const pos = getMousePos(canvas, event);

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Move to the current mouse position
    ctx.moveTo(pos.x, pos.y);
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
