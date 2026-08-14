const { canvas, ctx, boxerRed, boxerBlue, boomEffect, updatePhysics } = window.Game;
let lastPunchState = false;

function drawRing() {
    ctx.fillStyle = '#d4ac0d'; ctx.fillRect(50, 50, 400, 400);
    ctx.strokeStyle = '#b7950b'; ctx.lineWidth = 2;
    for (let i = 70; i < 450; i += 40) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, 450); ctx.stroke(); }

    for (let offset = 10; offset <= 30; offset += 10) {
        ctx.strokeStyle = offset === 10 ? '#fff' : (offset === 20 ? '#c0392b' : '#2980b9');
        ctx.lineWidth = 3; ctx.strokeRect(50 - offset/2, 50 - offset/2, 400 + offset, 400 + offset);
    }

    [{x: 50, y: 50, color: '#c0392b'}, {x: 450, y: 50, color: '#2980b9'}, {x: 50, y: 450, color: '#fff'}, {x: 450, y: 450, color: '#fff'}].forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fillStyle = c.color; ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    });
}

function drawBlueBoxer() {
    const bounce = Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + boxerBlue.radius, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();

    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce); ctx.rotate(angleToRed - Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.color; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    [-12, 12].forEach(gx => {
        ctx.beginPath(); ctx.arc(gx, -boxerBlue.radius + 4, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();
    });

    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();
}

function drawRedBoxer() {
    const bounceOffset = Math.sin(boxerRed.animTimer) * 4, tiltOffset = Math.cos(boxerRed.animTimer) * 1.5;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    // Bezpieczne sprawdzanie uderzenia – teraz działa idealnie, bo zmienne są połączone bezpośrednio
    if (boxerRed.isPunching && pVal > 0.85 && !lastPunchState) {
        boomEffect.x = boxerBlue.rx;
        boomEffect.y = boxerBlue.ry - 38;
        boomEffect.opacity = 1.0;
        boomEffect.scale = 0.5;
        boomEffect.active = true;
    }
    lastPunchState = boxerRed.isPunching && pVal > 0.5;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();

    ctx.save(); ctx.translate(boxerRed.x + tiltOffset, boxerRed.y + bounceOffset); ctx.rotate(boxerRed.angle - Math.PI / 2); 

    const currentY = -bodyLean * 0.2, currentX = 0;
    ctx.beginPath(); ctx.arc(currentX, currentY, boxerRed.radius, 0, Math.PI * 2); ctx.fillStyle = boxerRed.color; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; stroke();

    ctx.beginPath(); ctx.arc(currentX + 12, currentY - boxerRed.radius + 4 + Math.sin(boxerRed.animTimer * 2) * 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    let leftGloveX = currentX, leftGloveY = currentY - boxerRed.radius + 4;
    if (boxerRed.isPunching) {
        if (boxerRed.punchType === 'straight') leftGloveY -= pVal * 48;
        else { leftGloveX += Math.sin(boxerRed.punchProgress) * 10; leftGloveY -= pVal * 42; }
    }

    if (boxerRed.isPunching && Math.abs(leftGloveY - (currentY - boxerRed.radius + 4)) > 5) {
        ctx.beginPath(); ctx.moveTo(currentX - 6, currentY - 10); ctx.lineTo(leftGloveX, leftGloveY);
        ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
    }

    ctx.beginPath(); ctx.arc(leftGloveX, leftGloveY, 7, 0, Math.PI * 2); ctx.fillStyle = '#d35400'; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.translate(currentX, currentY); ctx.rotate(-(boxerRed.angle - Math.PI / 2)); 
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}

function drawBoomText() {
    if (boomEffect.active) {
        boomEffect.scale += (1.2 - boomEffect.scale) * 0.2; 
        boomEffect.y -= 0.4; 
        boomEffect.opacity -= 0.04; 
        if (boomEffect.opacity <= 0) { boomEffect.active = false; return; }
        
        ctx.save(); ctx.translate(boomEffect.x, boomEffect.y); ctx.scale(boomEffect.scale, boomEffect.scale);
        ctx.globalAlpha = boomEffect.opacity; ctx.font = 'italic bold 22px Arial, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = '#000';
        ctx.lineWidth = 4; ctx.strokeText('BOOM!', 0, 0); ctx.fillStyle = '#f1c40f';
        ctx.fillText('BOOM!', 0, 0); ctx.restore();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRing(); 
    updatePhysics(); 
    drawBlueBoxer(); 
    drawRedBoxer();
    drawBoomText();
    requestAnimationFrame(loop);
}

loop();
