// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';
import { ctx } from './boxer-stats.js';

function drawRing() {
    if (!ctx) return;
    // Czyszczenie ringu na czarno
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 500, 500);

    // Szare linie ringu ( liny )
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 400, 400);
}

function gameLoop() {
    // 1. Obliczenie fizyki ruchu i ciosów
    updatePhysics();

    // 2. Czyszczenie i rysowanie planszy
    drawRing();

    // 3. Rysowanie bokserów z osobnych plików
    drawBlueBoxer();
    drawRedBoxer();

    // Ponowne wywołanie pętli w kolejnej klatce (60 FPS)
    requestAnimationFrame(gameLoop);
}

// Uruchomienie gry po załadowaniu skryptu
requestAnimationFrame(gameLoop);
