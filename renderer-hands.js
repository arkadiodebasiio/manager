import { boxerRed, boxerBlue, strongHand } from './engine.js';
export { drawBlueBoxer } from './combat-logic.js'; 

let activePunchHand = 'left', wasPunchingLastFrame = false, comboGlowTimer = 0; 

export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas || !boxerRed || !boxerBlue) return;
    const ctx = canvas.getContext('2d');

    const bounceOffset = boxerRed.isChargingSuper ? 0 : Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right';
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    if (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) comboGlowTimer = 35; 
    if (comboGlowTimer > 0) comboGlowTimer--; 

    let strokeColor = '#fff', lineWidth = 2;
    let shadowColor = comboGlowTimer > 0 ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)';

    if (boxerRed.isChargingSuper) {
        lineWidth = 4 + Math.sin(Date.now() * 0.02) * 2; 
        strokeColor = '#e67e22'; 
        shadowColor = `rgba(230, 126, 34, ${0.4 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.4})`;
    } else if (comboGlowTimer > 0) {
        lineWidth = 4; strokeColor = '#2ecc71';
    }

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = shadowColor; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, -bodyLean * 0.2, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    ctx.lineWidth = lineWidth; ctx.strokeStyle = strokeColor; ctx.stroke();

    // --- CAŁKOWICIE NOWA LOGIKA SEPARACJI RĄK ---
    // Bazowe, czyste pozycje spoczynkowe przy tułowiu
    let leftGloveX = -12, leftGloveY = -boxerRed.radius + 4;
    let rightGloveX = 12, rightGloveY = -boxerRed.radius + 4;

    const leftReach = strongHand === 'left' ? 32 : 24;
    const rightReach = strongHand === 'right' ? 32 : 24;

    if (boxerRed.isChargingSuper && !boxerRed.isPunching) {
        // Obie ręce wysuwają się symetrycznie do przodu podczas ładowania
        leftGloveY = -boxerRed.radius - 2;
        rightGloveY = -boxerRed.radius - 2;
    } else if (boxerRed.isPunching) {
        // Jeśli bot aktywnie wyprowadza cios, bije tylko jedna ręka! Druga wraca na pozycję obronną (-boxerRed.radius + 4)
        if (activePunchHand === 'left') {
            let reach = boxerRed.punchType === 'super' ? 42 : leftReach;
            leftGloveY = (-boxerRed.radius + 4) - (pVal * reach);
            leftGloveX = boxerRed.punchType === 'hook' ? (-12 + Math.sin(boxerRed.punchProgress) * 22) : (-12 + pVal * 12);
        } else {
            let reach = boxerRed.punchType === 'super' ? 42 : rightReach;
            rightGloveY = (-boxerRed.radius + 4) - (pVal * reach);
            rightGloveX = boxerRed.punchType === 'hook' ? (12 - Math.sin(boxerRed.punchProgress) * 22) : (12 - pVal * 12);
        }
    }

    // Rysowanie lewej ręki
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftGloveX, leftGloveY);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = strokeColor;
    ctx.beginPath(); ctx.arc(leftGloveX, leftGloveY, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    // Rysowanie prawej ręki (dodajemy lekkie pulsowanie ruchu tylko gdy bot odpoczywa)
    const rightIdlePulse = (boxerRed.isPunching || boxerRed.isChargingSuper) ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightGloveX, rightGloveY + rightIdlePulse);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = strokeColor;
    ctx.beginPath(); ctx.arc(rightGloveX, rightGloveY + rightIdlePulse, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}

export function drawBlockShield() {}
