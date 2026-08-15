import { boxerRed, boxerBlue, strongHand } from './engine.js';

let activePunchHand = 'left', wasPunchingLastFrame = false;
let pulseTimer = 0; // Globalna zmienna do płynnego pulsu obwódki

export function drawBlueBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerBlue || !boxerRed) return;

    if (boxerBlue.isKnockedDown) {
        pulseTimer += 0.15;
    }

    const bounce = boxerBlue.isKnockedDown ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    
    // TUŁÓW ZAWSZE NIEBIESKI – usunięte jakiekolwiek miganie i zmiana koloru środka!
    let currentColor = boxerBlue.color;
    let gloveColor = '#d35400'; 
    
    if (boxerBlue.isKnockedDown) {
        gloveColor = '#7f8c8d'; // Tylko rękawice stają się bezwładnie szare
    }

    // Cień pod zawodnikiem
    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + boxerBlue.radius, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce); ctx.rotate(angleToRed - Math.PI / 2); 
    
    // Rysowanie tułowia (zawsze niebieski)
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); 
    ctx.fillStyle = currentColor; 
    ctx.fill(); 
    
    // PULSUJĄCA OBWÓDKA: Tylko ona reaguje na nokdaun
    if (boxerBlue.isKnockedDown) {
        ctx.lineWidth = 4 + Math.sin(pulseTimer) * 1.5; // Płynna zmiana grubości
        ctx.strokeStyle = '#1a252f'; // Ciemnoszary / czarny kolor obwódki
    } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff'; // Klasyczna biała obwódka w walce
    }
    ctx.stroke();

    // Ręce rozjechane na boki przy leżeniu
    let leftGloveX = boxerBlue.isKnockedDown ? -32 : (boxerBlue.isBlockingNow ? -3 : -12);
    let rightGloveX = boxerBlue.isKnockedDown ? 32 : (boxerBlue.isBlockingNow ? 3 : 12);
    let gloveY = boxerBlue.isKnockedDown ? 4 : (-boxerBlue.radius + 4);

    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();
}

export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerRed || !boxerBlue) return;

    const bounceOffset = Math.sin(boxerRed.animTimer) * 4, angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < 0.5 ? 'left' : 'right';
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    const isCurrentlyInCombo = (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) || boxerRed.punchCooldown > 0;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    ctx.beginPath(); ctx.arc(0, 0, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    ctx.lineWidth = isCurrentlyInCombo ? 4 : 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff'; ctx.stroke();

    // WYLICZANIE POZYCJI RĘKAWIC CZERWONEGO
    let leftGloveX = -12, rightGloveX = 12, gloveY = -boxerRed.radius + 4;
    if (boxerRed.isPunching) {
        gloveY -= pVal * 28;
        if (activePunchHand === 'left') leftGloveX = -12 + pVal * 12;
        else rightGloveX = 12 - pVal * 12;
    }

    // RYSOWANIE PATYCZKÓW (RAMION) DLA CZERWONEGO – PRZYWRÓCONE!
    ctx.beginPath(); 
    ctx.moveTo(-12, 0); 
    ctx.lineTo(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();

    ctx.beginPath(); 
    ctx.moveTo(12, 0); 
    ctx.lineTo(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();

    // Rysowanie samych rękawic na końcach patyczków
    ctx.lineWidth = 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}

export function drawBlockShield() {}
