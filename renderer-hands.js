import { boxerRed, boxerBlue, strongHand } from './engine.js';

let activePunchHand = 'left', wasPunchingLastFrame = false;
let pulseTimer = 0; 

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
    
    let currentColor = boxerBlue.color;
    let gloveColor = '#d35400'; 
    
    if (boxerBlue.isKnockedDown) {
        gloveColor = '#7f8c8d'; 
    }

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + boxerBlue.radius, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce); ctx.rotate(angleToRed - Math.PI / 2); 
    
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); 
    ctx.fillStyle = currentColor; 
    ctx.fill(); 
    
    if (boxerBlue.isKnockedDown) {
        ctx.lineWidth = 4 + Math.sin(pulseTimer) * 1.5; 
        ctx.strokeStyle = '#1a252f'; 
    } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff'; 
    }
    ctx.stroke();

    let leftGloveX = boxerBlue.isKnockedDown ? -32 : (boxerBlue.isBlockingNow ? -3 : -12);
    let rightGloveX = boxerBlue.isKnockedDown ? 32 : (boxerBlue.isBlockingNow ? 3 : 12);
    let gloveY = boxerBlue.isKnockedDown ? 4 : (-boxerBlue.radius + 4);

    ctx.beginPath();
    ctx.moveTo(boxerBlue.isBlockingNow ? -3 : -12, 0);
    ctx.lineTo(leftGloveX, gloveY);
    ctx.strokeStyle = boxerBlue.color;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boxerBlue.isBlockingNow ? 3 : 12, 0);
    ctx.lineTo(rightGloveX, gloveY);
    ctx.strokeStyle = boxerBlue.color;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = boxerBlue.isKnockedDown ? '#1a252f' : '#fff';
    
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

    const bounceOffset = boxerRed.isSuperPunching ? 0 : Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    
    // Obliczanie wysunięcia super ciosu w fazie uderzenia
    const spVal = boxerRed.isSuperPunchStriking ? Math.sin(boxerRed.superPunchProgress) : 0;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < 0.5 ? 'left' : 'right';
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    const isCurrentlyInCombo = (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) || boxerRed.punchCooldown > 0;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    ctx.beginPath(); ctx.arc(0, 0, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    
    ctx.lineWidth = (isCurrentlyInCombo || boxerRed.isSuperPunching) ? 4 : 2; 
    ctx.strokeStyle = boxerRed.isSuperPunching ? '#f1c40f' : (isCurrentlyInCombo ? '#2ecc71' : '#fff'); 
    ctx.stroke();

    let leftGloveX = -12, rightGloveX = 12, gloveY = -boxerRed.radius + 4;
    let leftGloveColor = '#d35400', rightGloveColor = '#d35400';

    // Pozycja rąk przy zwykłym uderzeniu
    if (boxerRed.isPunching) {
        gloveY -= pVal * 28;
        if (activePunchHand === 'left') leftGloveX = -12 + pVal * 12;
        else rightGloveX = 12 - pVal * 12;
    }

    // FIZYCZNY WYSTRZAŁ RĘKAWICY W KIERUNKU PRZECIWNIKA PRZY SUPER PUNCHU
    if (boxerRed.isSuperPunching) {
        if (strongHand === 'right') {
            rightGloveColor = '#f1c40f';
            if (boxerRed.isSuperPunchStriking) {
                gloveY -= spVal * 32;       // Ręka wystrzeliwuje głęboko w przód do głowy rywala
                rightGloveX = 12 - spVal * 12; // Zbiega się do środka w stronę celu
            } else {
                rightGloveX = 16;            // Faza ładowania: ręka wycofana w tył
                gloveY = -boxerRed.radius + 12;
            }
        } else {
            leftGloveColor = '#f1c40f';
            if (boxerRed.isSuperPunchStriking) {
                gloveY -= spVal * 32;       // Ręka wystrzeliwuje głęboko w przód do głowy rywala
                leftGloveX = -12 + spVal * 12; // Zbiega się do środka w stronę celu
            } else {
                leftGloveX = -16;            // Faza ładowania: ręka wycofana w tył
                gloveY = -boxerRed.radius + 12;
            }
        }
    }

    // Ramiona czerwonego boksera
    ctx.beginPath(); 
    ctx.moveTo(-12, 0); 
    ctx.lineTo(leftGloveX, (boxerRed.isPunching && activePunchHand === 'left') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();

    ctx.beginPath(); 
    ctx.moveTo(12, 0); 
    ctx.lineTo(rightGloveX, (boxerRed.isPunching && activePunchHand === 'right') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();

    // Sam wygląd rękawic
    ctx.lineWidth = 2; 
    ctx.strokeStyle = boxerRed.isSuperPunching ? '#f1c40f' : (isCurrentlyInCombo ? '#2ecc71' : '#fff');
    
    ctx.beginPath(); ctx.arc(leftGloveX, (boxerRed.isPunching && activePunchHand === 'left') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = leftGloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, (boxerRed.isPunching && activePunchHand === 'right') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = rightGloveColor; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}

export function drawBlockShield() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerRed || !boxerBlue) return;

    // Tarcza sprawdza stan zwykłego uderzenia lub wystrzału super uderzenia
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const spVal = boxerRed.isSuperPunchStriking ? Math.sin(boxerRed.superPunchProgress) : 0;
    
    const isStrikingNow = (boxerRed.isPunching && pVal > 0.85) || (boxerRed.isSuperPunchStriking && spVal > 0.85);

    if (isStrikingNow && boxerBlue.isBlockingNow) {
        ctx.save();
        const shieldX = boxerBlue.rx;
        const shieldY = boxerBlue.ry - 38;
        const currentProgress = boxerRed.isSuperPunchStriking ? spVal : pVal;
        const pulse = Math.sin(currentProgress * 10) * 3;
        const shieldRadius = 16 + pulse;

        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 4; 
        ctx.strokeStyle = '#fff'; 
        ctx.fillStyle = 'rgba(241, 196, 15, 0.35)'; 

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f1c40f'; 

        ctx.beginPath();
        ctx.arc(shieldX, shieldY, shieldRadius, Math.PI, 0, false);
        ctx.lineTo(shieldX + shieldRadius - 4, shieldY + 12);
        ctx.lineTo(shieldX - shieldRadius + 4, shieldY + 12);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
