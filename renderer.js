// renderer.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawRing() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 500, 500);

    ctx.beginPath();
    ctx.arc(ringCenter, ringCenter, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawBlueBoxer(ctx);
    drawRedBoxer(ctx);
}

function gameLoop() {
    updatePhysics();
    drawRing();
    requestAnimationFrame(gameLoop);
}

if (canvas) {
    gameLoop();
}
