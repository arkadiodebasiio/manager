// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';

// Pobieramy Canvas i kontekst bezpośrednio tutaj, po pełnym załadowaniu strony
const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Gwarancja wymiarów ringu przy starcie
if (canvas) {
    canvas.width = 500;
    canvas.height = 500;
}

function drawRing() {
    if (!ctx) return; // Jeśli nadal nie ma kontekstu, przerywamy (zabezpieczenie)
    
    // 1. Szara mata ringu (wnętrze)
    ctx.fillStyle = '#2c3e50'; 
    ctx.fillRect(0, 0, 500, 500);

    // 2. Niebieski narożnik (lewy górny)
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(50, 50); ctx.lineTo(90, 50); ctx.lineTo(50, 90);
    ctx.fill();

    // 3. Czerwony narożnik (prawy dolny)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(450, 450); ctx.lineTo(410, 450); ctx.lineTo(450, 410);
    ctx.fill();

    // 4. Białe narożniki neutralne
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(450, 50); ctx.lineTo(410, 50); ctx.lineTo(450, 90); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 450); ctx.lineTo(90, 450); ctx.lineTo(50, 410); ctx.fill();

    // 5. Cztery liny ringu wokół pola walki
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 400, 400);
    
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(54, 54, 392, 392);
}

function gameLoop() {
    // 1. Obliczenie fizyki ruchu i ciosów
    updatePhysics();

    // 2. Czyszczenie i rysowanie planszy z pełnym ringiem
    drawRing();

    // 3. Rysowanie bokserów z osobnych plików
    drawBlueBoxer();
    drawRedBoxer();

    // Ponowne wywołanie pętli w kolejnej klatce (60 FPS)
    requestAnimationFrame(gameLoop);
}

// Uruchomienie gry po załadowaniu skryptu
requestAnimationFrame(gameLoop);
