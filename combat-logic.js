import { boxerRed, boxerBlue, strongHand, isBlueKnockedDown } from './engine.js';
let blackPulseTimer = 0, blockVisualTimer = 0, starAngle = 0, firstRun = true;

export function handleBotAttackDecisions(baseRadius) {
    if (firstRun) { boxerRed.superCooldown = 5400; firstRun = false; }
    if (boxerRed.isPunching || boxerRed.isChargingSuper) return;
    let shouldPunch = false;

    if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchType = boxerRed.punchQueue.shift(); shouldPunch = true;
    } else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        if (boxerRed.superCooldown <= 0 && Math.random() < 0.40) {
            boxerRed.isChargingSuper = true; boxerRed.superChargeTimer = 180; 
            boxerRed.superCooldown = 5400; boxerRed.punchTimer = 0; return; 
        } 
        boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook'; shouldPunch = true;
        const roll = Math.random(), isStun = boxerBlue.stunTimer > 0;
        if (roll < 0.01) {
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            if (isStun) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
        } else if (roll < 0.06) {
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            if (isStun) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
        } else if (roll < 0.21) { boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook'); }
    }
    if (shouldPunch) {
        boxerRed.isPunching = true; boxerRed.punchProgress = 0; boxerRed.punchTimer = 0; boxerRed.hasHit = false; 
        boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;
        if (boxerBlue.isBlockingNow && boxerBlue.liverLevel > 0) {
            boxerBlue.blockCount += 1;
            if (boxerBlue.blockCount >= (boxerBlue.liverLevel >= 2 ? 5 : 10)) { boxerBlue.isBlockingNow = false; boxerBlue.blockCount = 0; }
        }
    }
}

export function processPunchExecution() {
    if (!boxerRed.isPunching) return;
    boxerRed.punchProgress += boxerRed.punchType === 'straight' ? 0.155 : (boxerRed.punchType === 'super' ? 0.080 : 0.132); 
    const pVal = Math.sin(boxerRed.punchProgress);
    
    if (pVal > 0.75 && !boxerRed.hasHit) {
        boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 
        if (boxerBlue.isBlockingNow) {
            boxerBlue.consecutiveBigHits = 0; 
            if (boxerRed.punchType === 'super') { boxerBlue.hp -= 15; if (boxerBlue.hp < 0) boxerBlue.hp = 0; }
        } else {
            if (boxerRed.punchType === 'super') {
                boxerBlue.hp -= 30; if (boxerBlue.hp < 0) boxerBlue.hp = 0; boxerBlue.pendingKnockdown = true; 
            } else {
                let dmg = boxerRed.punchType === 'hook' ? 5 : 3; 
                dmg *= boxerRed.punchRoll === 6 ? 2.0 : (boxerRed.punchRoll >= 3 ? 1.3 : 1.0);
                dmg *= boxerBlue.lipLevel === 1 ? 1.10 : (boxerBlue.lipLevel >= 2 ? 1.20 : 1.0);
                boxerBlue.hp -= dmg; if (boxerBlue.hp < 0) boxerBlue.hp = 0; 
                if (boxerRed.punchRoll >= 5) {
                    boxerBlue.consecutiveBigHits += 1;
                    if (boxerBlue.consecutiveBigHits >= 2) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
                } else { boxerBlue.consecutiveBigHits = 0; }
                if (boxerRed.punchRoll === 6 && !boxerBlue.pendingKnockdown) {
                    boxerRed.totalSixes += 1; 
                    if (boxerRed.totalSixes % 3 === 0) {
                        const opt = ["eye", "lip", "liver"], chs = opt[Math.floor(Math.random() * opt.length)];
                        if (chs === "eye" && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
                        if (chs === "lip" && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
                        if (chs === "liver" && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
                    }
                }
                if (boxerRed.punchType === 'hook' && Math.random() < 0.20 && boxerBlue.stunTimer === 0 && !boxerBlue.pendingKnockdown) boxerBlue.stunTimer = 300; 
            }
        }
        boxerRed.hasHit = true;
    }
    if (boxerRed.punchProgress >= Math.PI) {
        boxerRed.isPunching = false; boxerRed.punchProgress = 0;
        boxerRed.punchCooldown = boxerRed.punchType === 'super' ? 45 : (boxerRed.punchType === 'hook' ? 22 : 14);
    }
}

export function drawBlueBoxer() {
    const canvas = document.getElementById('ringCanvas'); if (!canvas || !boxerBlue || !boxerRed) return;
    const ctx = canvas.getContext('2d'), down = isBlueKnockedDown(); if (down) blackPulseTimer += 0.05;
    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3, angle = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    if (boxerBlue.isBlockingNow && !down && blockVisualTimer <= 0 && boxerRed.isPunching) blockVisualTimer = 20; 
    if (blockVisualTimer > 0) blockVisualTimer--;
    const isBlk = boxerBlue.isBlockingNow && blockVisualTimer > 0 && !down, isStun = boxerBlue.stunTimer > 0 && !down;
    let col = boxerBlue.color, gCol = '#d35400'; 
    if (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.85) { if (isBlk) gCol = '#f1c40f'; else col = '#ffbebe'; }
    if (isStun && col === boxerBlue.color) col = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;
    if (down) col = '#abc4d6';
    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + (down ? boxerBlue.radius * 1.5 : boxerBlue.radius), boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce + (down ? 15 : 0)); ctx.rotate(angle - Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); 
    ctx.lineWidth = down ? 4 : 2; ctx.strokeStyle = down ? `rgba(0,0,0,${0.3 + Math.abs(Math.sin(blackPulseTimer)) * 0.7})` : '#fff'; ctx.stroke();
    if (boxerBlue.eyeLevel > 0) { ctx.beginPath(); ctx.arc(-7, -8, boxerBlue.eyeLevel >= 2 ? 6.5 : 5, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.eyeLevel >= 2 ? 'rgba(100,30,130,0.95)' : 'rgba(125,60,152,0.85)'; ctx.fill(); }
    if (boxerBlue.liverLevel > 0) { ctx.beginPath(); ctx.arc(10, 4, boxerBlue.liverLevel >= 2 ? 7.5 : 6, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.liverLevel >= 2 ? 'rgba(20,120,60,0.95)' : 'rgba(39,174,96,0.85)'; ctx.fill(); }
    if (boxerBlue.lipLevel > 0) { ctx.beginPath(); ctx.ellipse(0, -14, boxerBlue.lipLevel >= 2 ? 7.5 : 6, boxerBlue.lipLevel >= 2 ? 4 : 3, 0, 0, Math.PI * 2); ctx.fillStyle = boxerBlue.lipLevel >= 2 ? 'rgba(150,30,30,0.98)' : 'rgba(192,57,43,0.95)'; ctx.fill(); }
    let lX = down ? -boxerBlue.radius - 14 : (isBlk ? -3 : -12), rX = down ? boxerBlue.radius + 14 : (isBlk ? 3 : 12), gY = down ? 0 : (-boxerBlue.radius + (isBlk ? 1 : (isStun ? 12 : 4)));
    ctx.beginPath(); ctx.moveTo(isBlk ? -3 : -12, 0); ctx.lineTo(lX, gY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(isBlk ? 3 : 12, 0); ctx.lineTo(rX, gY + (isBlk || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2)); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.lineWidth = down ? 3 : 2; ctx.strokeStyle = down ? '#000' : '#fff';
    ctx.beginPath(); ctx.arc(lX, gY, 7, 0, Math.PI * 2); ctx.fillStyle = gCol; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rX, gY + (isBlk || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = gCol; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(-(angle - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore(); 
    if (isStun) {
        starAngle += 0.15; ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(Math.cos(starAngle + i * (Math.PI * 2 / 3)) * 16, Math.sin(starAngle + i * (Math.PI * 2 / 3)) * 5, 3, 0, Math.PI * 2); ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.restore();
    }
}
export function interruptRedSuper() {
    if (boxerRed.isChargingSuper) { boxerRed.isChargingSuper = false; boxerRed.superChargeTimer = 0; boxerRed.punchCooldown = 60; return true; }
    return false;
}
