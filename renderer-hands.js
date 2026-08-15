import { ctx, boxerRed, boxerBlue, strongHand } from './engine.js';

let isBlocking = false, blockDecisionMade = false, activePunchHand = 'left', wasPunchingLastFrame = false, starAngle = 0;

export function drawBlueBoxer() {
    const bounce = Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const isStunned = boxerBlue.stunTimer > 0;
    
    if (boxerRed.isPunching && !blockDecisionMade) {
        isBlocking = isStunned ? false : Math.random() < 0.50; 
        // Ból wątroby jako lekka kontuzja wpływa na zmęczenie gardy
        if (isBlocking && (boxerBlue.lightInjury === "liver" || boxerBlue.lightInjury === "double_liver")) {
            boxerBlue.blockCount += 1;
            if (boxerBlue.blockCount >= (boxerBlue.lightInjury === "double_liver" ? 5 : 10)) { isBlocking = false; boxerBlue.blockCount = 0; }
        }
        blockDecisionMade = true; window.isCurrentlyBlockingGarda = isBlocking;
    }
    if (!boxerRed.isPunching) { isBlocking = false; blockDecisionMade = false; }

    let currentColor = boxerBlue.color, gloveColor = '#d35400'; 
    if (boxerRed.isPunching && pVal > 0.85) { if (isBlocking) gloveColor = '#f1c40f'; else currentColor = '#ffbebe'; }
    if (isStunned && currentColor === boxerBlue.color) currentColor = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + boxerBlue.radius, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce); ctx.rotate(angleToRed - Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = currentColor; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    // Wizualizacja lekkich kontuzji
    if (boxerBlue.lightInjury === "eye" || boxerBlue.lightInjury === "double_eye") {
        ctx.beginPath(); ctx.arc(-7, -8, boxerBlue.lightInjury === "double_eye" ? 6.5 : 5, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.lightInjury === "double_eye" ? 'rgba(100, 30, 130, 0.95)' : 'rgba(125, 60, 152, 0.85)'; ctx.fill();
    } else if (boxerBlue.lightInjury === "liver" || boxerBlue.lightInjury === "double_liver") {
        ctx.beginPath(); ctx.arc(10, 4, boxerBlue.lightInjury === "double_liver" ? 7.5 : 6, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.lightInjury === "double_liver" ? 'rgba(20, 120, 60, 0.95)' : 'rgba(39, 174, 96, 0.85)'; ctx.fill();
    } else if (boxerBlue.lightInjury === "lip" || boxerBlue.lightInjury === "double_lip") {
        ctx.beginPath(); ctx.ellipse(0, -14, boxerBlue.lightInjury === "double_lip" ? 7.5 : 6, boxerBlue.lightInjury === "double_lip" ? 4 : 3, 0, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.lightInjury === "double_lip" ? 'rgba(150, 30, 30, 0.98)' : 'rgba(192, 57, 43, 0.95)'; ctx.fill();
    }

    let leftGloveX = isBlocking ? -3 : -12, rightGloveX = isBlocking ? 3 : 12, gloveY = -boxerBlue.radius + (isStunned ? 12 : 4);
    if (isBlocking) gloveY = -boxerBlue.radius + 1;
    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY + (isBlocking ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();

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
    const bounceOffset = Math.sin(boxerRed.animTimer) * 4, angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right';
        window.currentActivePunchHand = activePunchHand;
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    const currentY = -bodyLean * 0.2;
    ctx.beginPath(); ctx.arc(0, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

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
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    const rightPulse = boxerRed.isPunching && activePunchHand === 'right' ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, currentY); ctx.restore(); ctx.restore(); 
}

export function drawBlockShield() {
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    if (boxerRed.isPunching && pVal > 0.85 && isBlocking) {
        ctx.save(); const shieldX = boxerBlue.rx, shieldY = boxerBlue.ry - 36;
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#f1c40f'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(shieldX, shieldY, 12, 0, Math.PI, true); ctx.lineTo(shieldX, shieldY + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shieldX, shieldY); ctx.lineTo(shieldX, shieldY + 12); ctx.strokeStyle = '#d35400'; ctx.stroke();
        ctx.restore();
    }
}
