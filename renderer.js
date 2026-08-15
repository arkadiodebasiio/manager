// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';
import { boxerRed, boxerBlue } from './boxer-stats.js';

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 500;
    canvas.height = 500;
}

function drawRing() {
    if (!ctx) return;
    
    // 1. Czyszczenie ekranu (czarne tło wokół)
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = '#111'; 
    ctx.fillRect(0, 0, 500, 500);

    // 2. Szary kwadrat jako mata ringu
    ctx.fillStyle = '#3a4454'; 
    ctx.fillRect(50, 50, 400, 400);

    // 3. Białe liny ringu wokół maty
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 400, 400);

    // 4. PROSTE PASKI ŻYCIA (HUD) NA SAMEJ GÓRZE
    // Czerwone tło dla paska zdrowia gracza 1
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(20, 15, 150, 15);
    // Zielony pasek zdrowia (zależny od hp)
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(20, 15, (boxerRed.hp / 100) * 150, 15);

    // Czerwone tło dla paska zdrowia gracza 2
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(330, 15, 150, 15);
    // Zielony pasek zdrowia (zależny od hp)
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(330, 15, (boxerBlue.hp / 100) * 150, 15);

    // Prosty tekst na środku
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("ROUND 1", 250, 27);
}

function gameLoop() {
    if (!ctx) {
        requestAnimationFrame(gameLoop);
        return;
    }
    updatePhysics();
    drawRing();
    drawBlueBoxer(ctx);
    drawRedBoxer(ctx);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
