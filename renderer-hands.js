import { boxerRed, boxerBlue } from './engine.js';
export { drawBlueBoxer } from './combat-logic.js'; 
let activePunchHand = 'left', wasPunchingLastFrame = false; 

export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const angle = Math.atan2(boxerBlue.y - boxerRed.y, boxerBlue.x - boxerRed.x);
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;

    if (boxerRed.isPunching && !wasPunchingLastFrame) activePunchHand = Math.random() < 0.5 ? 'left' : 'right';
    wasPunchingLastFrame = boxerRed.isPunching;

    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y); ctx.rotate(angle + Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); ctx.stroke();

    let leftX = -12, leftY = -boxerRed.radius + 4, rightX = 12, rightY = -boxerRed.radius + 4;
    if (boxerRed.isBlockingNow && !boxerRed.isPunching) { leftX = -6; rightX = 6; } 
    else if (boxerRed.isPunching) {
        let reach = boxerRed.punchType === 'straight' ? 26 : 20;
        if (activePunchHand === 'left') leftY -= (pVal * reach); else rightY -= (pVal * reach);
    }
    ctx.fillStyle = boxerRed.isBlockingNow ? '#f1c40f' : '#d35400';
    ctx.beginPath(); ctx.arc(leftX, leftY, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightX, rightY, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore(); 
}
export function drawBlockShield() {}
