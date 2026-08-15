import { boxerRed, boxerBlue, strongHand, isBlueKnockedDown } from './engine.js';

let activePunchHand = 'left', wasPunchingLastFrame = false, starAngle = 0;
let comboGlowTimer = 0; 
let blackPulseTimer = 0; 
let blockVisualTimer = 0;

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

    if (boxerBlue.isBlockingNow && !down) {
        if (blockVisualTimer <= 0 && boxerRed.isPunching) {
            blockVisualTimer = 20; 
        }
    }

    if (blockVisualTimer > 0) {
        blockVisualTimer--;
    }

    const isBlocking = boxerBlue.isBlockingNow && blockVisualTimer > 0 && !down;

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

    const bounceOffset = boxerRed.isChargingSuper ? 0 : Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right';
        if (typeof window !== 'undefined') {
            window.currentActivePunchHand = activePunchHand;
        }
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    if (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) {
        comboGlowTimer = 35; 
    }

    const isCurrentlyInCombo = comboGlowTimer > 0;
    if (comboGlowTimer > 0) comboGlowTimer--; 

    let strokeColor = '#fff';
    let lineWidth = 2;
    let shadowColor = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)';

    if (boxerRed.isChargingSuper) {
        lineWidth = 4 + Math.sin(Date.now() * 0.02) * 2; 
        strokeColor = '#e67e22'; 
        shadowColor = `rgba(230, 126, 34, ${0.4 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.4})`;
    } else if (isCurrentlyInCombo) {
        lineWidth = 4;
        strokeColor = '#2ecc71';
    }

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = shadowColor; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    const currentY = -bodyLean * 0.2;
    ctx.beginPath(); ctx.arc(0, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    
    ctx.lineWidth = lineWidth; 
    ctx.strokeStyle = strokeColor; 
    ctx.stroke();

    // --- POPRAWIONE WYPRZEDZANIE RĄK (Jedna bije, druga chroni twarz) ---
    // Pozycja spoczynkowa / ładowania
    let leftGloveY = -boxerRed.radius + (boxerRed.isChargingSuper ? -2 : 4);
    let rightGloveY = -boxerRed.radius + (boxerRed.isChargingSuper ? -2 : 4);
    let leftGloveX = -12;
    let rightGloveX = 12;

    const leftReach = strongHand === 'left' ? 32 : 24;
    const rightReach = strongHand === 'right' ? 32 : 24;

    if (boxerRed.isPunching) {
        // Jeśli zadaje cios, sprawdzamy zasięg wybranego uderzenia
        let reachModifier = boxerRed.punchType === 'super' ? 40 : (boxerRed.punchType === 'straight' ? leftReach : leftReach - 4);
        let rightReachModifier = boxerRed.punchType === 'super' ? 40 : (boxerRed.punchType === 'straight' ? rightReach : rightReach - 4);

        if (activePunchHand === 'left') {
            leftGloveY -= pVal * reachModifier;
            if (boxerRed.punchType !== 'straight') {
                leftGloveX = -12 + Math.sin(boxerRed.punchProgress) * 22; // Sierpowy
            } else {
                leftGloveX = -12 + pVal * 12; // Prosty
            }
        } else {
            rightGloveY -= pVal * rightReachModifier;
            if (boxerRed.punchType !== 'straight') {
                rightXGloveX = 12 - Math.sin(boxerRed.punchProgress) * 22; // Sierpowy
            } else {
                rightGloveX = 12 - pVal * 12; // Prosty
            }
        }
    }

    // Rysowanie lewej ręki
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftGloveX, leftGloveY);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = strokeColor;
    ctx.beginPath(); ctx.arc(leftGloveX, leftGloveY, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    // Rysowanie prawej ręki (z pulsowaniem tylko, gdy bot odpoczywa)
    const rightIdlePulse = (boxerRed.isPunching || boxerRed.isChargingSuper) ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightGloveX, rightGloveY + rightIdlePulse);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = strokeColor;
    ctx.beginPath(); ctx.arc(rightGloveX, rightGloveY + rightIdlePulse, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); 
    ctx.restore(); 
    ctx.restore(); 
}

export function drawBlockShield() {
    // Pusta funkcja bezpieczeństwa
}
