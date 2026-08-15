import { boxerRed, boxerBlue, strongHand } from './engine.js';
export { drawBlueBoxer } from './combat-logic.js'; 
let activePunchHand = 'left', wasPunchingLastFrame = false, comboGlowTimer = 0; 

export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas'); if (!canvas || !boxerRed || !boxerBlue) return;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bounceOffset = boxerRed.isChargingSuper ? 0 : Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.y - boxerRed.y, boxerBlue.x - boxerRed.x);

    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) activePunchHand = Math.random() < 0.5 ? 'left' : 'right';
    wasPunchingLastFrame = boxerRed.isPunching;
    if (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) comboGlowTimer = 35; if (comboGlowTimer > 0) comboGlowTimer--; 

    let strokeColor = '#fff', lineWidth = 2, shadowColor = comboGlowTimer > 0 ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)';
    if (boxerRed.isChargingSuper) { lineWidth = 4 + Math.sin(Date.now() * 0.02) * 2; strokeColor = '#e67e22'; shadowColor = `rgba(230, 126, 34, ${0.4 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.4})`; }
    else if (comboGlowTimer > 0) { lineWidth = 4; strokeColor = '#2ecc71'; }

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2); ctx.fillStyle = shadowColor; ctx.fill();
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue + Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, -bodyLean * 0.2, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); ctx.lineWidth = lineWidth; ctx.strokeStyle = strokeColor; ctx.stroke();

    let leftX = -12, leftY = -boxerRed.radius + 4, rightX = 12, rightY = -boxerRed.radius + 4;
    let gloveColor = '#d35400';

    if (boxerRed.isBlockingNow && !boxerRed.isPunching) {
        leftX = -6; leftY = -boxerRed.radius - 2;
        rightX = 6; rightY = -boxerRed.radius - 2;
        gloveColor = '#f1c40f';
    } 
    else if (boxerRed.isChargingSuper && !boxerRed.isPunching) { leftY = -boxerRed.radius - 2; rightY = -boxerRed.radius - 2; } 
    else if (boxerRed.isPunching) {
        let reach = boxerRed.punchType === 'super' ? 36 : 24; 
        let currentReach = pVal * reach;

        if (activePunchHand === 'left') {
            leftY = (-boxerRed.radius + 4) - currentReach;
            leftX = boxerRed.punchType === 'hook' ? (-12 + Math.sin(boxerRed.punchProgress) * 15) : -12;
            rightY = -boxerRed.radius + 6;
        } else {
            rightY = (-boxerRed.radius + 4) - currentReach;
            rightX = boxerRed.punchType === 'hook' ? (12 - Math.sin(boxerRed.punchProgress) * 15) : 12;
            leftY = -boxerRed.radius + 6;
        }
    }

    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftX, leftY); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = strokeColor;
    ctx.beginPath(); ctx.arc(leftX, leftY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightX, rightY); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; strokeColor; ctx.strokeStyle = strokeColor;
    ctx.beginPath(); ctx.arc(rightX, rightY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(-(angleToBlue + Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}
export function drawBlockShield() {}
