const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Set the canvas size when the page loads
resizeCanvas();

let isDrawing = false;

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);  // Start the path where the mouse is
    ctx.beginPath();  // Start a new path
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mousemove', draw);

function draw(event) {
    if (!isDrawing) return;

    ctx.lineWidth = 5;  // Adjust line width as per your requirement
    ctx.lineCap = 'round';  // This gives a rounded end to the line for smoother drawing

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    
    // Move the path's starting point to the current mouse position for continuous lines
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}
