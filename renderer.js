import { canvas, ctx, boxerRed, boxerBlue, strongHand, updatePhysics } from './engine.js';

let isBlocking = false;
let blockDecisionMade = false;
let activePunchHand = 'left';
let wasPunchingLastFrame = false;
let starAngle = 0; 

function drawRing() {
    ctx.fillStyle = '#d4ac0d'; ctx.fillRect(50, 50, 400, 400);
    ctx.strokeStyle = '#b7950b'; ctx.lineWidth = 2;
    for (let i = 70; i < 450; i += 40) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, 450); ctx.stroke(); }

    for (let offset = 10; offset <= 30; offset += 10) {
        ctx.strokeStyle = offset === 10 ? '#fff' : (offset === 20 ? '#c0392b' : '#2980b9');
        ctx.lineWidth = 3; ctx.strokeRect(50 - offset/2, 50 - offset/2, 400 + offset, 400 + offset);
    }

    [{x: 50, y: 50, color: '#c0392b'}, {x: 450, y: 50, color: '#b91d29'}, {x: 50, y: 450, color: '#fff'}, {x: 450, y: 450, color: '#fff'}].forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fillStyle = c.color; ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    });
}

function drawBlueBoxer() {
    const bounce = Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;

    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const isStunned = boxerBlue.stunTimer > 0;
    
    if (boxerRed.isPunching && !blockDecisionMade) {
        if (isStunned) {
            isBlocking = false;
        } else {
            isBlocking = Math.random() < 0.50; 
            
            if (isBlocking && boxerBlue.injury === "liver") {
                boxerBlue.blockCount += 1;
                if (boxerBlue.blockCount >= 10) {
                    isBlocking = false; 
                    boxerBlue.blockCount = 0; 
                }
            }
        }
        blockDecisionMade = true;
        window.isCurrentlyBlockingGarda = isBlocking;
    }
    if (!boxerRed.isPunching) {
        isBlocking = false;
        blockDecisionMade = false;
    }

    let currentColor = boxerBlue.color;
    let gloveColor = '#d35400'; 

    if (boxerRed.isPunching && pVal > 0.85) {
        if (isBlocking) {
            gloveColor = '#f1c40f'; 
        } else {
            currentColor = '#ffbebe'; 
        }
    }

    if (isStunned && currentColor === boxerBlue.color) {
        currentColor = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;
    }

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + boxerBlue.radius, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();

    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce); ctx.rotate(angleToRed - Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); 
    ctx.fillStyle = currentColor; 
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    if (boxerBlue.injury === "eye") {
        ctx.beginPath(); ctx.arc(-7, -8, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125, 60, 152, 0.85)'; ctx.fill();
    } else if (boxerBlue.injury === "liver") {
        ctx.beginPath(); ctx.arc(10, 4, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(39, 174, 96, 0.85)'; ctx.fill();
    } else if (boxerBlue.injury === "lip") {
        ctx.beginPath(); ctx.ellipse(0, -14, 6, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192, 57, 43, 0.95)'; ctx.fill();
    }

    const gloveRadius = 7;
    let leftGloveX = isBlocking ? -3 : -12;
    let rightGloveX = isBlocking ? 3 : 12;
    let gloveY = -boxerBlue.radius + (isStunned ? 12 : 4);

    if (isBlocking) {
        gloveY = -boxerBlue.radius + 1;
    }

    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, gloveRadius, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY + (isBlocking ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), gloveRadius, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();

    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();

    if (isStunned) {
        starAngle += 0.15; 
        ctx.save();
        ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) {
            const currentAngle = starAngle + (i * (Math.PI * 2 / 3));
            const starX = Math.cos(currentAngle) * 16;
            const starY = Math.sin(currentAngle) * 5; 
            ctx.beginPath();
            ctx.arc(starX, starY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; 
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }
}

function drawRedBoxer() {
    const bounceOffset = Math.sin(boxerRed.animTimer) * 4, tiltOffset = Math.cos(boxerRed.animTimer) * 1.5;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, bodyLean = pVal * 15;

    if (boxerRed.isPunching && !wasPunchingLastFrame) {
        const isMovingLeft = boxerRed.orbitSpeed < 0;
        const leftHandChance = isMovingLeft ? 0.30 : 0.70;
        activePunchHand = Math.random() < leftHandChance ? 'left' : 'right';
        window.currentActivePunchHand = activePunchHand;
    }
    wasPunchingLastFrame = boxerRed.isPunching;

    ctx.beginPath(); ctx.ellipse(boxerRed.x, boxerRed.y + boxerRed.radius, boxerRed.radius - Math.abs(bounceOffset), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();

    ctx.save(); ctx.translate(boxerRed.x + tiltOffset, boxerRed.y + bounceOffset); ctx.rotate(boxerRed.angle - Math.PI / 2); 

    const currentY = -bodyLean * 0.2, currentX = 0;
    
    // 1. Rysujemy tułów jako bazę
    ctx.beginPath(); ctx.arc(currentX, currentY, boxerRed.radius, 0, Math.PI * 2); 
    ctx.fillStyle = boxerRed.color; 
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    // 2. Czysta matematyka pozycji rąk bazująca na czubku kuli (identycznie jak u niebieskiego)
    let leftGloveX = -12; 
    let leftGloveY = -boxerRed.radius + 4;
    let rightGloveX = 12;
    let rightGloveY = -boxerRed.radius + 4;

    const leftReach = strongHand === 'left' ? 53 : 48;
    const rightReach = strongHand === 'right' ? 53 : 48;

    if (boxerRed.isPunching) {
        if (activePunchHand === 'left') {
            if (boxerRed.punchType === 'straight') {
                leftGloveX = -12 + (pVal * 12);
                leftGloveY = (-boxerRed.radius + 4) - (pVal * leftReach);
            } else {
                leftGloveX = -12 + (Math.sin(boxerRed.punchProgress) * 22);
                leftGloveY = (-boxerRed.radius + 4) - (pVal * (leftReach - 6));
            }
        } else {
            if (boxerRed.punchType === 'straight') {
                rightGloveX = 12 - (pVal * 12);
                rightGloveY = (-boxerRed.radius + 4) - (pVal * rightReach);
            } else {
                rightGloveX = 12 - (Math.sin(boxerRed.punchProgress) * 22);
                rightGloveY = (-boxerRed.radius + 4) - (pVal * (rightReach - 6));
            }
        }
    }

    // 3. Rysujemy rękawice na samym wierzchu tułowia
    ctx.beginPath(); ctx.arc(leftGloveX, leftGloveY, 7, 0, Math.PI * 2); 
    ctx.fillStyle = '#d35400'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    const rightPulse = boxerRed.isPunching && activePunchHand === 'right' ? 0 : Math.sin(boxerRed.animTimer * 2) * 2;
    ctx.beginPath(); ctx.arc(rightGloveX, rightGloveY + rightPulse, 7, 0, Math.PI * 2); 
    ctx.fillStyle = '#d35400'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();

    // 4. Numerek na sam koniec
    ctx.save(); ctx.translate(currentX, currentY); ctx.rotate(-(boxerRed.angle - Math.PI / 2)); 
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerRed.number, 0, 0); ctx.restore(); ctx.restore(); 
}

function drawBlockShield() {
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    if (boxerRed.isPunching && pVal > 0.85 && isBlocking) {
        ctx.save();
        const shieldX = boxerBlue.rx;
        const shieldY = boxerBlue.ry - 36;
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#f1c40f'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(shieldX, shieldY, 12, 0, Math.PI, true); ctx.lineTo(shieldX, shieldY + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shieldX, shieldY); ctx.lineTo(shieldX, shieldY + 12); ctx.strokeStyle = '#d35400'; ctx.stroke();
        ctx.restore();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRing(); 
    updatePhysics(); 
    drawBlueBoxer(); 
    drawRedBoxer();
    drawBlockShield(); 
    requestAnimationFrame(loop);
}

loop();
