// renderer.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let redActivePunchHand = 'left';
let redWasPunchingLastFrame = false;
let blueBlackPulseTimer = 0;
let blueStarAngle = 0;

// --- 1. RYSOWANIE CZERWONEGO BOKSERA ---
function drawRedBoxer() {
    const bounceOffset = Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const bodyLean = pVal * 15;

    if (boxerRed.isPunching && !redWasPunchingLastFrame) {
        redActivePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right';
        boxerRed.currentHand = redActivePunchHand;
    }
    redWasPunchingLastFrame = boxerRed.isPunching;

    const isRealComboActive = boxerRed.isPunching && boxerRed.punchQueue && boxerRed.punchQueue.length > 0;

    // Cień zawodnika
    ctx.beginPath(); 
    ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isRealComboActive ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; 
    ctx.fill();
    
    ctx.save(); 
    ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); 
    ctx.rotate(angleToBlue - Math.PI / 2); 

    const currentY = -bodyLean * 0.2;
    ctx.beginPath(); ctx.arc(0, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    
    if (boxerRed.isChargingSuper) {
        const pulseSuper = 0.4 + Math.abs(Math.sin(boxerRed.superChargeFrames * 0.15)) * 0.6;
        ctx.lineWidth = 5; ctx.strokeStyle = `rgba(241, 196, 15, ${pulseSuper})`;
    } else {
        ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; 
    }
    ctx.stroke();

    let leftGloveX = -12, rightGloveX = 12, gloveY = -boxerRed.radius + 4;
    let leftReach = strongHand === 'left' ? 32 : 24, rightReach = strongHand === 'right' ? 32 : 24;
    if (boxerRed.punchType === 'super') { leftReach = 45; rightReach = 45; } 

    if (boxerRed.isPunching) {
        gloveY -= pVal * (redActivePunchHand === 'left' ? (boxerRed.punchType === 'straight' || boxerRed.punchType === 'super' ? leftReach : leftReach - 4) : (boxerRed.punchType === 'straight' || boxerRed.punchType === 'super' ? rightReach : rightReach - 4));
        if (boxerRed.punchType !== 'straight' && boxerRed.punchType !== 'super') {
            if (redActivePunchHand === 'left') leftGloveX = -12 + Math.sin(boxerRed.punchProgress) * 22;
            else rightGloveX = 12 - Math.sin(boxerRed.punchProgress) * 22;
        } else {
            if (redActivePunchHand === 'left') leftGloveX = -12 + pVal * 12;
            else rightGloveX = 12 - pVal * 12;
        }
    }

    const superGloveColor = boxerRed.isChargingSuper ? '#f1c40f' : '#d35400';

    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftGloveX, boxerRed.isPunching && redActivePunchHand === 'left' ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, boxerRed.isPunching && redActivePunchHand === 'left' ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = superGloveColor; ctx.fill(); ctx.stroke();

    const rightPulse = boxerRed.isPunching && redActivePunchHand === 'right' ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightGloveX, boxerRed.isPunching && redActivePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(rightGloveX, boxerRed.isPunching && redActivePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse, 7, 0, Math.PI * 2); ctx.fillStyle = superGloveColor; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, currentY); ctx.restore(); ctx.restore(); 
}

// --- 2. RYSOWANIE NIEBIESKIEGO BOKSERA ---
function drawBlueBoxer() {
    const down = boxerBlue.isKnockedDown;
    if (down) blueBlackPulseTimer += 0.05;

    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const isStunned = boxerBlue.stunTimer > 0 && !down;
    const isBlocking = boxerBlue.isBlockingNow && !down;

    let currentColor = boxerBlue.color, gloveColor = '#d35400'; 
    if (boxerRed.isPunching && pVal > 0.85) { 
        if (isBlocking) gloveColor = '#f1c40f'; 
        else currentColor = '#ffbebe'; 
    }
    if (isStunned && currentColor === boxerBlue.color) {
        currentColor = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;
    }
    if (down) currentColor = '#abc4d6';

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
        const pulseAlpha = 0.3 + Math.abs(Math.sin(blueBlackPulseTimer)) * 0.7; 
        ctx.lineWidth = 4; ctx.strokeStyle = `rgba(0, 0, 0, ${pulseAlpha})`;
    } else {
        ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; 
    }
    ctx.stroke();

    if (boxerBlue.eyeLevel > 0) {
        ctx.beginPath(); ctx.arc(-7, -8, boxerBlue.eyeLevel >= 2 ? 6.5 : 5, 0, Math.PI * 2); 
        ctx.fillStyle = boxerBlue.eyeLevel >= 2 ? 'rgba(100, 30, 130, 0.95)' : 'rgba(125, 60, 152, 0.85)'; ctx.fill();
    }
    if (boxerBlue.liverLevel > 0) {
        ctx.beginPath(); ctx.arc(10, 4, boxerBlue.liverLevel >= 2 ? 7.5 : 6, 0, Math.PI * 2); 
        ctx.fillStyle = boxerBlue.liverLevel >= 2 ? 'rgba(20, 120, 60, 0.95)' : 'rgba(39, 174, 96, 0.85)'; ctx.fill();
    }
    if (boxerBlue.lipLevel > 0) {
        ctx.beginPath(); ctx.ellipse(0, -14, boxerBlue.lipLevel >= 2 ? 7.5 : 6, boxerBlue.lipLevel >= 2 ? 4 : 3, 0, 0, Math.PI * 2); 
        ctx.fillStyle = boxerBlue.lipLevel >= 2 ? 'rgba(150, 30, 30, 0.98)' : 'rgba(192, 57, 43, 0.95)'; ctx.fill();
    }

    let leftGloveX = isBlocking ? -3 : -12;
    let rightGloveX = isBlocking ? 3 : 12;
    let gloveY = -boxerBlue.radius + (isStunned ? 12 : 4);
    if (isBlocking) gloveY = -boxerBlue.radius + 1;
    if (down) { leftGloveX = -boxerBlue.radius - 14; rightGloveX = boxerBlue.radius + 14; gloveY = 0; }

    ctx.beginPath(); ctx.moveTo(isBlocking ? -3 : -12, 0); ctx.lineTo(leftGloveX, gloveY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(isBlocking ? 3 : 12, 0); ctx.lineTo(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2)); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();

    ctx.lineWidth = down ? 3 : 2; ctx.strokeStyle = down ? '#000' : '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();

    if (isStunned) {
        blueStarAngle += 0.15; ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(Math.cos(blueStarAngle + i * (Math.PI * 2 / 3)) * 16, Math.sin(blueStarAngle + i * (Math.PI * 2 / 3)) * 5, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
}

// --- 3. GŁÓWNA FUNKCJA ARENY I PĘTLI ---
function drawRing() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, 500, 500);

    // Mata ringu
    ctx.beginPath(); ctx.arc(ringCenter, ringCenter, baseRadius, 0, Math.PI * 2); ctx.fillStyle = '#2c3e50'; ctx.fill();

    // Grube liny
    ctx.beginPath(); ctx.arc(ringCenter, ringCenter, baseRadius, 0, Math.PI * 2); ctx.strokeStyle = '#34495e'; ctx.lineWidth = 8; ctx.stroke();

    // Białe linie pomocnicze
    ctx.beginPath(); ctx.arc(ringCenter, ringCenter, baseRadius - 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 2; ctx.stroke();

    // Słupki w narożnikach
    const corners = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    corners.forEach((angle, index) => {
        const postX = ringCenter + Math.cos(angle) * baseRadius;
        const postY = ringCenter + Math.sin(angle) * baseRadius;
        ctx.beginPath(); ctx.arc(postX, postY, 6, 0, Math.PI * 2);
        if (index === 0) ctx.fillStyle = '#e74c3c';
        else if (index === 2) ctx.fillStyle = '#2980b9';
        else ctx.fillStyle = '#ecf0f1';
        ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    // Wywołanie rysowania postaci z jednego miejsca
    drawBlueBoxer();
    drawRedBoxer();
}

function gameLoop() {
    updatePhysics();
    drawRing();
    requestAnimationFrame(gameLoop);
}

if (canvas) {
    gameLoop();
}
