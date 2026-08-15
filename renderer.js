// renderer.js
import { ringCenter, baseRadius } from './boxer-stats.js';
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

export function drawRing() {
    if (!ctx) return;

    // Czyszczenie tła ringu
    ctx.clearRect(0, 0, 500, 500);

    // IDEALNY RING CO DO PIKSELA: Promień pobierany z baseRadius (100)
    ctx.beginPath();
    ctx.arc(ringCenter, ringCenter, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rysowanie postaci
    drawBlueBoxer(ctx);
    drawRedBoxer(ctx);
}

function gameLoop() {
    updatePhysics();
    drawRing();
    requestAnimationFrame(gameLoop);
}

// Uruchomienie pętli gry po załadowaniu skryptu
if (canvas) {
    gameLoop();
}
