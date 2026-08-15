// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 500;
    canvas.height = 500;
}

function drawRing() {
    if (!ctx) return;
    
    ctx.fillStyle = '#111'; 
    ctx.fillRect(0, 0, 500, 500);

    ctx.fillStyle = '#3a4454'; 
    ctx.fillRect(50, 50, 400, 400);

    ctx.fillStyle = '#2e3643';
    ctx.fillRect(70, 50, 15, 400);
    ctx.fillRect(110, 50, 15, 400);
    ctx.fillRect(150, 50, 15, 400);
    ctx.fillRect(190, 50, 15, 400);
    ctx.fillRect(230, 50, 15, 400);
    ctx.fillRect(270, 50, 15, 400);
    ctx.fillRect(310, 50, 15, 400);
    ctx.fillRect(350, 50, 15, 400);
    ctx.fillRect(390, 50, 15, 400);
    ctx.fillRect(430, 50, 15, 400);

    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(50, 50); ctx.lineTo(110, 50); ctx.lineTo(50, 110);
    ctx.fill();

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(450, 450); ctx.lineTo(390, 450); ctx.lineTo(450, 390);
    ctx.fill();

    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(450, 50); ctx.lineTo(390, 50); ctx.lineTo(450, 110); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 450); ctx.lineTo(110, 450); ctx.lineTo(50, 390); ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 400, 400);
    
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 388, 388);
    ctx.strokeRect(62, 62, 376, 376);
}

function gameLoop() {
    if (!ctx) return;
    updatePhysics();
    drawRing();
    drawBlueBoxer(ctx);
    drawRedBoxer(ctx);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
