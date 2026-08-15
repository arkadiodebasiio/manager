// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawRing() {
    if (!ctx) return;
    
    // 1. Oryginalna, ładna, retro-szara mata ringu (wypełnienie całego kwadratu)
    ctx.fillStyle = '#3a4454'; 
    ctx.fillRect(0, 0, 500, 500);

    // 2. Wewnętrzny cień maty (dodaje głębi ringu retro)
    ctx.fillStyle = '#2e3643';
    ctx.fillRect(50, 50, 400, 400);

    // 3. Profesjonalny niebieski narożnik (lewy górny) - wypełniony trójkąt
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(50, 50); ctx.lineTo(110, 50); ctx.lineTo(50, 110);
    ctx.fill();

    // 4. Profesjonalny czerwony narożnik (prawy dolny) - wypełniony trójkąt
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(450, 450); ctx.lineTo(390, 450); ctx.lineTo(450, 390);
    ctx.fill();

    // 5. Białe narożniki neutralne (lewy dolny i prawy górny)
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(450, 50); ctx.lineTo(390, 50); ctx.lineTo(450, 110); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 450); ctx.lineTo(110, 450); ctx.lineTo(50, 390); ctx.fill();

    // 6. Główne, grube liny ringu (zewnętrzne)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 400, 400);
    
    // 7. Wewnętrzne liny ringu (dodatkowe, dla lepszego efektu 3D)
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 388, 388);
    ctx.strokeRect(62, 62, 376, 376);
}

function gameLoop() {
    // 1. Obliczenie fizyki ruchu
    updatePhysics();

    // 2. Rysowanie pięknego ringu ze wszystkimi detalami
    drawRing();

    // 3. Rysowanie bokserów na ringu
    drawBlueBoxer();
    drawRedBoxer();

    requestAnimationFrame(gameLoop);
}

// Uruchomienie pętli gry
requestAnimationFrame(gameLoop);
