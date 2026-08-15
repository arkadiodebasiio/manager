import { boxerRed, boxerBlue } from './engine.js';
export { drawBlueBoxer } from './combat-logic.js'; 
let activePunchHand = 'left', wasPunchingLastFrame = false; 

export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas'); if (!canvas || !boxerRed || !boxerBlue) return;
    const ctx = canvas.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bounce = boxerRed.isChargingSuper ? 0 : Math.sin(boxerRed.animTimer) * 4;
    const angle = Math.atan2(boxerBlue.y - boxerRed.y, boxerBlue.x - boxerRed.x);
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;

    if (boxerRed.isPunching && !wasPunchingLastFrame) activePunchHand = Math.random() < 0.5 ? 'left' : 'right';
    wasPunchingLastFrame = boxerRed.isPunching;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounce); ctx.rotate(angle + Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    let leftX = -12, leftY = -boxerRed.radius + 4, rightX = 12, rightY = -boxerRed.radius + 4, gCol = '#d35400';
    if (boxerRed.isBlockingNow && !boxerRed.isPunching) { leftX = -6; rightX = 6; leftY = -boxerRed.radius - 2; rightY = -boxerRed.radius - 2; gCol = '#f1c40f'; } 
    else if (boxerRed.isPunching) {
        // STAŁY, KRÓTKI REALISTYCZNY ZASIĘG (26px)
        let reach = boxerRed.punchType === 'straight' ? 26 : 18;
        if (activePunchHand === 'left') { leftY -= (pVal * reach); leftX = boxerRed.punchType === 'hook' ? (-12 + Math.sin(boxerRed.punchProgress) * 15) : (-12 + pVal * 6); } 
        else { rightY -= (pVal * reach); rightX = boxerRed.punchType === 'hook' ? (12 - Math.sin(boxerRed.punchProgress) * 15) : (12 - pVal * 6); }
    }
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftX, leftY); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightX, rightY); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(leftX, leftY, 7, 0, Math.PI * 2); ctx.fillStyle = gCol; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightX, rightY, 7, 0, Math.PI * 2); ctx.fillStyle = gCol; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(-(angle + Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}
export function drawBlockShield() {}
