export function drawBlueBoxer() {
    const canvas = document.getElementById('ringCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boxerBlue || !boxerRed) return;

    if (boxerBlue.isKnockedDown) pulseTimer += 0.15;

    const bounce = boxerBlue.isKnockedDown ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    
    // ŚRODEK ZOSTAJE NIEBIESKI: Kolor ciała nie zmienia się już na szary przy nokdaunie
    let currentColor = boxerBlue.color, gloveColor = '#d35400'; 
    
    if (boxerBlue.isKnockedDown) {
        gloveColor = '#7f8c8d'; // Tylko rękawice robią się szare/bezwładne
    } else {
        if (boxerRed.isPunching && pVal > 0.85 && !boxerBlue.isBlockingNow) currentColor = '#ffbebe';
    }

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + boxerBlue.radius, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce); ctx.rotate(angleToRed - Math.PI / 2); 
    
    // RYSOWANIE CIAŁA BOKSERA
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = currentColor; ctx.fill(); 
    
    // NOWA LOGIKA OBWÓDKI PRZY NOKDAUNIE:
    if (boxerBlue.isKnockedDown) {
        // Obwódka robi się grubsza i płynnie pulsuje od ciemnoszarego do czarnego
        ctx.lineWidth = 4 + Math.sin(pulseTimer) * 1.5; 
        ctx.strokeStyle = '#1a252f'; 
    } else {
        // Normalna biała obwódka podczas walki
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff'; 
    }
    ctx.stroke();

    // RĘCE ROZJECHANE NA BOKI PRZY LEŻENIU
    let leftGloveX = boxerBlue.isKnockedDown ? -32 : (boxerBlue.isBlockingNow ? -3 : -12);
    let rightGloveX = boxerBlue.isKnockedDown ? 32 : (boxerBlue.isBlockingNow ? 3 : 12);
    let gloveY = boxerBlue.isKnockedDown ? 4 : (-boxerBlue.radius + 4);

    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();
}
