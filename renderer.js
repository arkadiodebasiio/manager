// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';
import { boxerRed, boxerBlue } from './boxer-stats.js'; // Dodane do rysowania p体力 HP

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 500;
    canvas.height = 500;
}

function drawRing() {
    if (!ctx) return;
    
    // 1. Czyszczenie ekranu i ciemne tło widowni wokół ringu
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = '#0f111a'; 
    ctx.fillRect(0, 0, 500, 500);

    // 2. Efekt retro błysków reflektorów w rogach ekranu (klimat hali)
    let gradient = ctx.createRadialGradient(250, 250, 100, 250, 250, 300);
    gradient.addColorStop(0, 'rgba(46, 54, 71, 1)');
    gradient.addColorStop(1, 'rgba(15, 17, 26, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(40, 40, 420, 420);

    // 3. Główna retro deska / obramowanie ringu (drewniane krawędzie)
    ctx.fillStyle = '#1c1f2b';
    ctx.fillRect(40, 40, 420, 420);

    // 4. Klasyczna, niebiesko-szara retro mata ringu
    ctx.fillStyle = '#2c3247'; 
    ctx.fillRect(50, 50, 400, 400);

    // 5. Stylizowane pasy na macie ringu (Tekstura desek / retro scanlines)
    ctx.fillStyle = '#252a3d';
    for (let i = 65; i < 450; i += 30) {
        ctx.fillRect(50, i, 400, 12);
    }

    // 6. Cienie pod linami (Budowanie głębi 3D)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(44, 44, 412, 10);
    ctx.fillRect(44, 44, 10, 412);

    // 7. Niebieski narożnik mistrzowski (Lewy Górny)
    ctx.fillStyle = '#1e3d59';
    ctx.beginPath(); ctx.moveTo(50, 50); ctx.lineTo(120, 50); ctx.lineTo(50, 120); ctx.fill();
    ctx.fillStyle = '#17b978'; // Poduszka narożnika
    ctx.fillRect(42, 42, 16, 16);

    // 8. Czerwony narożnik pretendenta (Prawy Dolny)
    ctx.fillStyle = '#ff6e6e';
    ctx.beginPath(); ctx.moveTo(450, 450); ctx.lineTo(380, 450); ctx.lineTo(450, 380); ctx.fill();
    ctx.fillStyle = '#ff2e93'; // Poduszka narożnika
    ctx.fillRect(442, 442, 16, 16);

    // 9. Białe narożniki neutralne
    ctx.fillStyle = '#e8ecef';
    ctx.beginPath(); ctx.moveTo(450, 50); ctx.lineTo(390, 50); ctx.lineTo(450, 110); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 450); ctx.lineTo(110, 450); ctx.lineTo(50, 390); ctx.fill();

    // 10. POTRÓJNE RETRO LINY (Efekt 3D wokół ringu z naciągami)
    const ropeColors = ['#ff4b4b', '#ffffff', '#4b7bff']; // Czerwona, biała, niebieska lina
    const offsets =;

    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = ropeColors[i];
        ctx.lineWidth = 2;
        ctx.strokeRect(offsets[i], offsets[i], 500 - offsets[i]*2, 500 - offsets[i]*2);
    }

    // 11. Słupki w rogach ringu (Trzymające liny)
    ctx.fillStyle = '#d1d8e0';
    ctx.fillRect(46, 46, 8, 8);
    ctx.fillRect(446, 46, 8, 8);
    ctx.fillRect(46, 446, 8, 8);
    ctx.fillRect(446, 446, 8, 8);

    // 12. RETRO INTERFEJS (HUD) - Paski Życia i Status Walki
    // Tło pod statystyki na samej górze
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, 500, 35);
    ctx.strokeStyle = '#3a4454';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 35, 500, 1);

    // Pasek zdrowia Czerwonego Boksera (Gracz 1)
    ctx.fillStyle = '#c0392b'; // Tło paska (brak zdrowia)
    ctx.fillRect(20, 10, 160, 14);
    ctx.fillStyle = '#2ecc71'; // Zielone zdrowie
    ctx.fillRect(20, 10, (boxerRed.hp / 100) * 160, 14);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(20, 10, 160, 14);

    // Pasek zdrowia Niebieskiego Boksera (Gracz 2)
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(320, 10, 160, 14);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(320, 10, (boxerBlue.hp / 100) * 160, 14);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(320, 10, 160, 14);

    // Napisy na środku HUD (ROUND 1 / Retro Styl)
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("ROUND 1", 250, 16);
    
    ctx.fillStyle = '#fff';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText("FIGHT!", 250, 28);
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
