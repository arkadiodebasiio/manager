// renderer.js
import { updatePhysics } from './engine.js';
import { drawRedBoxer } from './renderer-red.js';
import { drawBlueBoxer } from './renderer-blue.js';

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawRing() {
    if (!ctx) return;
    
    // Przezroczyste czyszczenie ekranu (odsłania szary kolor z index.html)
    ctx.clearRect(0, 0, 500, 500);

    // 1. Niebieski narożnik (lewy górny)
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(50, 50); ctx.lineTo(90, 50); ctx.lineTo(50, 90);
    ctx.fill();

    // 2. Czerwony narożnik (prawy dolny)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(450, 450); ctx.lineTo(410, 450); ctx.lineTo(450, 410);
    ctx.fill();

    // 3. Białe narożniki neutralne
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(450, 50); ctx.lineTo(410, 50); ctx.lineTo(450, 90); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 450); ctx.lineTo(90, 450); ctx.lineTo(50, 410); ctx.fill();

    // 4. Cztery liny ringu wokół pola walki
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 400, 400);
    
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(54, 54, 392, 392);
}

function gameLoop() {
    // 1. Fizyka ruchu i ciosów
    updatePhysics();

    // 2. Rysowanie ringu (narożniki i liny)
    drawRing();

    // 3. Rysowanie bokserów
    drawBlueBoxer();
    drawRedBoxer();

    requestAnimationFrame(gameLoop);
}

// Start gry
requestAnimationFrame(gameLoop);
