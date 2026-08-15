// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawRing() {
    if (!ctx) return;
    
    // 1. Główny retro-szary podkład pod ring
    ctx.fillStyle = '#3a4454'; 
    ctx.fillRect(0, 0, 500, 500);

    // 2. RYSOWANIE OREGINALNYCH DESECZEK (Drewniany parkiet wewnątrz ringu)
    ctx.save();
    // Ograniczamy rysowanie desek tylko do wnętrza lin (od 50 do 450)
    ctx.beginPath();
    ctx.rect(50, 50, 400, 400);
    ctx.clip();

    // Rysowanie pionowych deseczek co 16 pikseli
    for (let x = 50; x < 450; x += 16) {
        // Co druga deseczka jest minimalnie ciemniejsza dla kontrastu retro
        ctx.fillStyle = ((x / 16) % 2 === 0) ? '#2e3643' : '#333c4a';
        ctx.fillRect(x, 50, 14, 400);

        // Subtelna linia łączenia deseczek (fuga)
        ctx.fillStyle = '#242a35';
        ctx.fillRect(x + 14, 50, 2, 400);
    }
    ctx.restore();

    // 3. Profesjonalny niebieski narożnik (lewy górny)
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(50, 50); ctx.lineTo(110, 50); ctx.lineTo(50, 110);
    ctx.fill();

    // 4. Profesjonalny czerwony narożnik (prawy dolny)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(450, 450); ctx.lineTo(390, 450); ctx.lineTo(450, 390);
    ctx.fill();

    // 5. Białe narożniki neutralne
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(450, 50); ctx.lineTo(390, 50); ctx.lineTo(450, 110); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 450); ctx.lineTo(110, 450); ctx.lineTo(50, 390); ctx.fill();

    // 6. Główne, grube zewnętrzne liny ringu
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 400, 400);
    
    // 7. Wewnętrzne, potrójne liny dla pełnego efektu 3D
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 388, 388);
    ctx.strokeRect(62, 62, 376, 376);
}

function gameLoop() {
    updatePhysics();
    drawRing();
    drawBlueBoxer();
    drawRedBoxer();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
