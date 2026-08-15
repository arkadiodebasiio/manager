// renderer-red.js
import { boxerRed, boxerBlue, strongHand } from './boxer-stats.js';
import { getSuperChargeState } from './engine.js';

let activePunchHand = 'left', wasPunchingLastFrame = false;
let comboGlowTimer = 0; 

export function drawRedBoxer(ctx) {
    if (!ctx || !boxerRed || !boxerBlue) return;

    const superState = getSuperChargeState();
    const bounceOffset = Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right';
        boxerRed.currentHand = activePunchHand;
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    if ((boxerRed.punchQueue && boxerRed.punchQueue.length > 0) || boxerRed.punchCooldown > 0) {
        comboGlowTimer = 35; 
    }

    const isCurrentlyInCombo = comboGlowTimer > 0;
    if (comboGlowTimer > 0) comboGlowTimer--; 

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    const currentY = -bodyLean * 0.2;
    ctx.beginPath(); ctx.arc(0, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    
    if (superState.isCharging) {
        const pulseSuper = 0.4 + Math.abs(Math.sin(superState.frames * 0.15)) * 0.6;
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgba(241, 196, 15, ${pulseSuper})`;
    } else {
        ctx.lineWidth = isCurrentlyInCombo ? 4 : 2; 
        ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff'; 
    }
    ctx.stroke();

    let leftGloveX = -12, rightGloveX = 12, gloveY = -boxerRed.radius + 4;
    let leftReach = strongHand === 'left' ? 32 : 24, rightReach = strongHand === 'right' ? 32 : 24;
    if (boxerRed.punchType === 'super') { leftReach = 45; rightReach = 45; } 

    if (boxerRed.isPunching) {
        gloveY -= pVal * (activePunchHand === 'left' ? (boxerRed.punchType === 'straight' || boxerRed.punchType === 'super' ? leftReach : leftReach - 4) : (boxerRed.punchType === 'straight' || boxerRed.punchType === 'super' ? rightReach : rightReach - 4));
        if (boxerRed.punchType !== 'straight' && boxerRed.punchType !== 'super') {
            if (activePunchHand === 'left') leftGloveX = -12 + Math.sin(boxerRed.punchProgress) * 22;
            else rightGloveX = 12 - Math.sin(boxerRed.punchProgress) * 22;
        } else {
            if (activePunchHand === 'left') leftGloveX = -12 + pVal * 12;
            else rightGloveX = 12 - pVal * 12;
        }
    }

    const superGloveColor = superState.isCharging ? '#f1c40f' : '#d35400';

    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, boxerRed.isPunching && activePunchHand === 'left' ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = superGloveColor; ctx.fill(); ctx.stroke();

    const rightPulse = boxerRed.isPunching && activePunchHand === 'right' ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff';
    ctx.beginPath(); ctx.arc(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse, 7, 0, Math.PI * 2); ctx.fillStyle = superGloveColor; ctx.fill(); stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, currentY); ctx.restore(); ctx.restore(); 
}

export function drawBlockShield() {}
