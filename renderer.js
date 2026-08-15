// renderer.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let redActivePunchHand = 'left', redWasPunchingLastFrame = false, blueBlackPulseTimer = 0, blueStarAngle = 0;

function drawRedBoxer() {
    const bounce = Math.sin(boxerRed.animTimer) * 4, pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const isCombo = boxerRed.isPunching && boxerRed.punchQueue && boxerRed.punchQueue.length > 0;
    if (boxerRed.isPunching && !redWasPunchingLastFrame) { redActivePunchHand = Math.random() < (boxerRed.orbitSpeed < 0 ? 0.30 : 0.70) ? 'left' : 'right'; boxerRed.currentHand = redActivePunchHand; }
    redWasPunchingLastFrame = boxerRed.isPunching;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2); ctx.fillStyle = isCombo ? 'rgba(46, 204, 113, 0.45)' : 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerRed.x, boxerRed.y + bounce); ctx.rotate(Math.atan2(boxerBlue.ry - boxerRed.y, boxerBlue.rx - boxerRed.x) + Math.PI / 2);

    ctx.beginPath(); ctx.arc(0, -pVal * 3, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill();
    ctx.lineWidth = boxerRed.isChargingSuper ? 5 : 2; ctx.strokeStyle = boxerRed.isChargingSuper ? `rgba(241, 196, 15, ${0.4 + Math.abs(Math.sin(boxerRed.superChargeFrames * 0.15)) * 0.6})` : '#fff'; ctx.stroke();

    // RĘCE CZERWONEGO
    let reach = strongHand === (redActivePunchHand === 'left' ? 'left' : 'right') ? 32 : 24; if (boxerRed.punchType === 'super') reach = 45;
    let lG = -12, rG = 12, gY = -boxerRed.radius + 4;
    if (boxerRed.isPunching) {
        gY -= pVal * reach;
        if (boxerRed.punchType === 'straight' || boxerRed.punchType === 'super') { if (redActivePunchHand === 'left') lG += pVal * 12; else rG -= pVal * 12; }
        else { if (redActivePunchHand === 'left') lG += Math.sin(boxerRed.punchProgress) * 22; else rG -= Math.sin(boxerRed.punchProgress) * 22; }
    }

    const gloveColor = boxerRed.isChargingSuper ? '#f1c40f' : '#d35400';
    // Lewa ręka
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(lG, redActivePunchHand === 'left' ? gY : -boxerRed.radius + 4); ctx.strokeStyle = boxerRed.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(lG, redActivePunchHand === 'left' ? gY : -boxerRed.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    // Prawa ręka
    const rPulse = redActivePunchHand === 'right' ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rG, redActivePunchHand === 'right' ? gY : -boxerRed.radius + 4 + rPulse); ctx.strokeStyle = boxerRed.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(rG, redActivePunchHand === 'right' ? gY : -boxerRed.radius + 4 + rPulse, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(Math.PI); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerRed.number, 0, pVal * 3); ctx.restore(); ctx.restore();
}

function drawBlueBoxer() {
    const down = isBlueKnockedDown(); if (down) blueBlackPulseTimer += 0.05;
    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3, isStun = boxerBlue.stunTimer > 0 && !down, isBlock = boxerBlue.isBlockingNow && !down;
    let c = down ? '#abc4d6' : (isStun && Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color);

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + (down ? boxerBlue.radius * 1.5 : boxerBlue.radius), boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce + (down ? 15 : 0)); ctx.rotate(Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI / 2);
    
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.85 && !isBlock) ? '#ffbebe' : c; ctx.fill();
    ctx.lineWidth = down ? 4 : 2; ctx.strokeStyle = down ? `rgba(0,0,0,${0.3 + Math.abs(Math.sin(blueBlackPulseTimer)) * 0.7})` : '#fff'; ctx.stroke();

    if (boxerBlue.eyeLevel > 0) { ctx.beginPath(); ctx.arc(-7, -8, boxerBlue.eyeLevel >= 2 ? 6.5 : 5, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.eyeLevel >= 2 ? '#641e82' : '#7d3cb6'; ctx.fill(); }
    if (boxerBlue.liverLevel > 0) { ctx.beginPath(); ctx.arc(10, 4, boxerBlue.liverLevel >= 2 ? 7.5 : 6, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.liverLevel >= 2 ? '#14783c' : '#27ae60'; ctx.fill(); }
    if (boxerBlue.lipLevel > 0) { ctx.beginPath(); ctx.ellipse(0, -14, boxerBlue.lipLevel >= 2 ? 7.5 : 6, boxerBlue.lipLevel >= 2 ? 4 : 3, 0, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.lipLevel >= 2 ? '#961e1e' : '#c0392b'; ctx.fill(); }

    // RĘCE NIEBIESKIEGO
    let gY = isBlock ? -boxerBlue.radius + 1 : -boxerBlue.radius + (isStun ? 12 : 4); if (down) gY = 0;
    let bLG = isBlock ? -3 : (down ? -boxerBlue.radius - 14 : -12);
    let bRG = isBlock ? 3 : (down ? boxerBlue.radius + 14 : 12);
    
    ctx.beginPath(); ctx.moveTo(isBlock ? -3 : -12, 0); ctx.lineTo(bLG, gY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = down ? '#000' : '#fff'; ctx.beginPath(); ctx.arc(bLG, gY, 7, 0, Math.PI * 2); ctx.fillStyle = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.85 && isBlock) ? '#f1c40f' : '#d35400'; ctx.fill(); ctx.stroke();
    
    ctx.beginPath(); ctx.moveTo(isBlock ? 3 : 12, 0); ctx.lineTo(bRG, gY + (isBlock || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2)); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(bRG, gY + (isBlock || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.85 && isBlock) ? '#f1c40f' : '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(Math.PI); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();

    if (isStun) {
        blueStarAngle += 0.15; ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(Math.cos(blueStarAngle + i * 2.09) * 16, Math.sin(blueStarAngle + i * 2.09) * 5, 3, 0, Math.PI * 2); ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.stroke(); }
        ctx.restore();
    }
}

function drawRing() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 500, 500);
    const size = baseRadius * 2, sX = ringCenter - baseRadius, sY = ringCenter - baseRadius;

    ctx.fillStyle = '#dbb374'; ctx.fillRect(sX, sY, size, size);
    ctx.fillStyle = '#d0a769'; 
    for(let r=0; r<size; r+=30) { for(let c=0; c<size; c+=30) { if((r+c)%60===0) ctx.fillRect(sX+c, sY+r, 30, 30); } }

    ctx.lineWidth = 12; ctx.strokeStyle = '#2c3e50'; ctx.strokeRect(sX + 6, sY + 6, size - 12, size - 12);
    ctx.lineWidth = 5; ctx.strokeStyle = '#e74c3c'; ctx.strokeRect(sX, sY, size, size);
    ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeRect(sX + 4, sY + 4, size - 8, size - 8);

    [{x:sX, y:sY, c:'#e74c3c'}, {x:sX+size, y:sY, c:'#fff'}, {x:sX+size, y:sY+size, c:'#2980b9'}, {x:sX, y:sY+size, c:'#fff'}].forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
    });

    drawBlueBoxer(); drawRedBoxer();
}

function gameLoop() { updatePhysics(); drawRing(); requestAnimationFrame(gameLoop); }
if (canvas) gameLoop();
