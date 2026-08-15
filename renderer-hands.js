export function drawRedBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerRed || !boxerBlue) return;

    const bounceOffset = boxerRed.isSuperPunching ? 0 : Math.sin(boxerRed.animTimer) * 4;
    const angleToBlue = Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        activePunchHand = Math.random() < 0.5 ? 'left' : 'right';
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    const isCurrentlyInCombo = (boxerRed.punchQueue && boxerRed.punchQueue.length > 0) || boxerRed.punchCooldown > 0;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentlyInCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounceOffset); ctx.rotate(angleToBlue - Math.PI / 2); 

    ctx.beginPath(); ctx.arc(0, 0, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill(); 
    
    // Obwódka: zielona przy combo, złota przy super punchu, biała standardowo
    ctx.lineWidth = (isCurrentlyInCombo || boxerRed.isSuperPunching) ? 4 : 2; 
    ctx.strokeStyle = boxerRed.isSuperPunching ? '#f1c40f' : (isCurrentlyInCombo ? '#2ecc71' : '#fff'); 
    ctx.stroke();

    let leftGloveX = -12, rightGloveX = 12, gloveY = -boxerRed.radius + 4;
    let leftGloveColor = '#d35400', rightGloveColor = '#d35400';

    // Obsługa pozycji i koloru przy zwykłym punchu
    if (boxerRed.isPunching) {
        gloveY -= pVal * 28;
        if (activePunchHand === 'left') leftGloveX = -12 + pVal * 12;
        else rightGloveX = 12 - pVal * 12;
    }

    // OBSŁUGA POZYCJI I ŻÓŁTEGO KOLORU PRZY SUPER PUNCHU
    if (boxerRed.isSuperPunching) {
        // Ładowanie potężnego ciosu z prawej lub lewej ręki (zależnie od strongHand)
        if (strongHand === 'right') {
            rightGloveColor = '#f1c40f'; // Rękawica robi się żółta
            rightGloveX = 16;            // Odwodzi rękę lekko w bok/tył do zamachu
            gloveY = -boxerRed.radius + 12; 
        } else {
            leftGloveColor = '#f1c40f';  // Rękawica robi się żółta
            leftGloveX = -16;            // Odwodzi rękę lekko w bok/tył do zamachu
            gloveY = -boxerRed.radius + 12;
        }
    }

    // Rysowanie ramion (patyczków)
    ctx.beginPath(); 
    ctx.moveTo(-12, 0); 
    ctx.lineTo(leftGloveX, (boxerRed.isPunching && activePunchHand === 'left') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();

    ctx.beginPath(); 
    ctx.moveTo(12, 0); 
    ctx.lineTo(rightGloveX, (boxerRed.isPunching && activePunchHand === 'right') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke();

    // Rysowanie samych rękawic
    ctx.lineWidth = 2; 
    ctx.strokeStyle = boxerRed.isSuperPunching ? '#f1c40f' : (isCurrentlyInCombo ? '#2ecc71' : '#fff');
    
    ctx.beginPath(); ctx.arc(leftGloveX, (boxerRed.isPunching && activePunchHand === 'left') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = leftGloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, (boxerRed.isPunching && activePunchHand === 'right') || boxerRed.isSuperPunching ? gloveY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = rightGloveColor; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToBlue - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}
