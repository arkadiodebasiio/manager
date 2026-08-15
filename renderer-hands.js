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

    // POPRAWKA: Świecenie odpala się TYLKO, gdy w kolejce czekają kolejne ciosy (seria/combo)
    if (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) {
        comboGlowTimer = 35; 
    }

    const isCurrentlyInCombo = comboGlowTimer > 0;
    if (comboGlowTimer > 0) comboGlowTimer--; 

    // Zmiana koloru na pulsujący pomarańczowy tylko podczas ładowania superciosu
    let finalColor = boxerRed.color;
    if (boxerRed.isSuperCharging) {
        finalColor = Math.floor(Date.now() / 150) % 2 === 0 ? '#f39c12' : '#e67e22';
    }

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    const currentY = -bodyLean * 0.2;
    ctx.beginPath(); ctx.arc(0, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = finalColor; ctx.fill(); 
    
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
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();
    
    ctx.lineWidth = 2; ctx.strokeStyle = isCurrentlyInCombo ? '#2ecc71' : '#fff';
    ctx.beginPath(); ctx.arc(rightGloveX, boxerRed.isPunching && activePunchHand === 'right' ? gloveY : -boxerRed.radius + 4 + rightPulse, 7, 0, Math.PI * 2); 
    ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, currentY); ctx.restore(); ctx.restore();
}
