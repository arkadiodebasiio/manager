// Importujemy ZMIENNĄ comboGlowTimer bezpośrednio z silnika gry
import { boxerRed, boxerBlue, strongHand, isBlueKnockedDown, comboGlowTimer } from './engine.js';

let activePunchHand = 'left', wasPunchingLastFrame = false, starAngle = 0;
let blackPulseTimer = 0; 

export function drawBlueBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerBlue || !boxerRed) return;

    const down = isBlueKnockedDown();

    if (down) {
        blackPulseTimer += 0.05;
    }

    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const isStunned = boxerBlue.stunTimer > 0 && !down;
    const isBlocking = boxerBlue.isBlockingNow && !down;

    let currentColor = boxerBlue.color, gloveColor = '#d35400'; 
    if (boxerRed.isPunching && pVal > 0.85) { if (isBlocking) gloveColor = '#f1c40f'; else currentColor = '#ffbebe'; }
    if (isStunned && currentColor === boxerBlue.color) currentColor = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;

    if (down) {
        currentColor = '#abc4d6';
    }

    ctx.beginPath(); 
    const shadowYOffset = down ? boxerBlue.radius * 1.5 : boxerBlue.radius;
    ctx.ellipse(boxerBlue.rx, boxerBlue.ry + shadowYOffset, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); 
    const fallY = down ? 15 : 0;
    ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce + fallY); 
    ctx.rotate(angleToRed - Math.PI / 2); 
    
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = currentColor; ctx.fill(); 

    if (down) {
        const pulseAlpha = 0.3 + Math.abs(Math.sin(blackPulseTimer)) * 0.7; 
        ctx.lineWidth = 4; 
        ctx.strokeStyle = `rgba(0, 0, 0, ${pulseAlpha})`;
    } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff'; 
    }
    ctx.stroke();

    if (boxerBlue.eyeLevel > 0) {
        const isMax = boxerBlue.eyeLevel >= 2;
        ctx.beginPath(); ctx.arc(-7, -8, isMax ? 6.5 : 5, 0, Math.PI * 2); 
        ctx.fillStyle = isMax ? 'rgba(100, 30, 130, 0.95)' : 'rgba(125, 60, 152, 0.85)'; 
        ctx.fill();
    }
    
    if (boxerBlue.liverLevel > 0) {
        const isMax = boxerBlue.liverLevel >= 2;
        ctx.beginPath(); ctx.arc(10, 4, isMax ? 7.5 : 6, 0, Math.PI * 2); 
        ctx.fillStyle = isMax ? 'rgba(20, 120, 60, 0.95)' : 'rgba(39, 174, 96, 0.85)'; 
        ctx.fill();
    }
    
    if (boxerBlue.lipLevel > 0) {
        const isMax = boxerBlue.lipLevel >= 2;
        ctx.beginPath(); ctx.ellipse(0, -14, isMax ? 7.5 : 6, isMax ? 4 : 3, 0, 0, Math.PI * 2); 
        ctx.fillStyle = isMax ? 'rgba(150, 30, 30, 0.98)' : 'rgba(192, 57, 43, 0.95)'; 
        ctx.fill();
    }

    let leftGloveX, rightGloveX, gloveY;

    if (down) {
        leftGloveX = -boxerBlue.radius - 14;  
        rightGloveX = boxerBlue.radius + 14; 
        gloveY = 0;                          
    } else {
        leftGloveX = isBlocking ? -3 : -12;
        rightGloveX = isBlocking ? 3 : 12;
        gloveY = -boxerBlue.radius + (isStunned ? 12 : 4);
        if (isBlocking) gloveY = -boxerBlue.radius + 1;
    }

    ctx.beginPath(); ctx.moveTo(isBlocking ? -3 : -12, 0); ctx.lineTo(leftGloveX, gloveY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(isBlocking ? 3 : 12, 0); ctx.lineTo(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2)); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();

    ctx.lineWidth = down ? 3 : 2;
    ctx.strokeStyle = down ? '#000' : '#fff';

    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); 
    ctx.restore(); 
    ctx.restore(); 

    if (isStunned) {
        starAngle += 0.15; ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(Math.cos(starAngle + i * (Math.PI * 2 / 3)) * 16, Math.sin(starAngle + i * (Math.PI * 2 / 3)) * 5, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
}

export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerRed || !boxerBlue) return;

    const bounceOffset = Math.sin(boxerRed.animTimer) * 4, angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right';
        if (typeof window !== 'undefined') {
            window.currentActivePunchHand = activePunchHand;
        }
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    // --- USUNĘLIŚMY STARY ROZJEŻDŻAJĄCY SIĘ WARUNEK IF ---
    // Plik graficzny teraz tylko sprawdza wartość z silnika i nie modyfikuje jej samoczynnie
    const isCurrentlyInCombo = comboGlowTimer > 0;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    const currentY = -bodyLean * 0.2;
    ctx.beginPath(); ctx.arc(0, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    
    ctx.lineWidth = isCurrentlyInCombo ? 4 : 2; 
    ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff'; 
    ctx.stroke();

    let leftGloveX = -12, rightGloveX = 12, gloveY = -boxerRed.radius + 4;
    const leftReach = strongHand === 'left' ? 32 : 24, rightReach = strongHand === 'right' ? 32 : 24;

    if (boxerRed.isPunching) {
        gloveY -= pVal * (activePunchHand === 'left' ? (boxerRed.punchType === 'straight' ? leftReach : leftReach - 4) : (boxerRed.punchType === 'straight' ? rightReach : rightReach - 4));
        if (boxerRed.punchType !== 'straight') {
            if (activePunchHand === 'left') leftGloveX = -12 + Math.sin(boxerRed.punchProgress) * 22;
            else rightGloveX = 12 - Math.sin(boxerRed.punchProgress) * 22;
        } else {
            if (activePunchHand === 'left') leftGloveX = -12 + pVal * 12;
            else rightGloveX = 12 - pVal * 12;
        }
    }

    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    const rightPulse = boxerRed.isPunching && activePunchHand === 'right' ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff';
    ctx.beginPath(); ctx.arc(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); 
    ctx.restore(); 
    ctx.restore(); 
}

export function drawBlockShield() {
    // Pusta funkcja bezpieczeństwa
}
