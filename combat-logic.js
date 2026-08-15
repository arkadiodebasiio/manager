import { boxerRed, boxerBlue, strongHand, blueStrongHand, isBlueKnockedDown } from './engine.js';
let bPT = 0, bVT = 0, sA = 0, bluePunchCount = 0;

export function handleBotAttackDecisions(bR) {
    let r = boxerRed, b = boxerBlue;
    if (!r.isPunching && !r.isChargingSuper) {
        if (r.punchQueue.length > 0 && r.punchCooldown === 0) { r.punchType = r.punchQueue.shift(); r.isPunching = true; r.punchProgress = 0; r.punchTimer = 0; r.hasHit = false; b.isBlockingNow = b.stunTimer > 0 ? false : Math.random() < 0.5; }
        else if (r.punchQueue.length === 0 && r.punchTimer > 60 && Math.random() < 0.03) {
            if (r.superCooldown <= 0 && Math.random() < 0.4) { r.isChargingSuper = true; r.superChargeTimer = 180; r.superCooldown = 5400; r.punchTimer = 0; return; }
            r.punchType = Math.random() < 0.7 ? 'straight' : 'hook'; r.isPunching = true; r.punchProgress = 0; r.punchTimer = 0; r.hasHit = false; b.isBlockingNow = b.stunTimer > 0 ? false : Math.random() < 0.5;
            let roll = Math.random(); if (roll < 0.01) { r.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); r.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); r.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); } else if (roll < 0.06) { r.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); r.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); } else if (roll < 0.21) { r.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); }
        }
    }
    if (!b.isKnockedDown && b.stunTimer <= 0 && !b.isPunching && !b.isChargingSuper) {
        if (b.punchQueue && b.punchQueue.length > 0 && b.punchCooldown === 0) { 
            b.punchType = b.punchQueue.shift(); b.isPunching = true; b.punchProgress = 0; b.punchTimer = 0; b.hasHit = false; 
            bluePunchCount++; b.punchRoll = bluePunchCount;
            r.isBlockingNow = Math.random() < 0.5; 
        }
        else if ((!b.punchQueue || b.punchQueue.length === 0) && b.punchTimer > 60 && Math.random() < 0.03) {
            if (b.superCooldown <= 0 && Math.random() < 0.4) { b.isChargingSuper = true; b.superChargeTimer = 180; b.superCooldown = 5400; b.punchTimer = 0; return; }
            b.punchType = Math.random() < 0.7 ? 'straight' : 'hook'; b.isPunching = true; b.punchProgress = 0; b.punchTimer = 0; b.hasHit = false;
            bluePunchCount++; b.punchRoll = bluePunchCount;
            r.isBlockingNow = Math.random() < 0.5;
            if (!b.punchQueue) b.punchQueue = []; let roll = Math.random(); if (roll < 0.01) { b.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); b.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); b.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); } else if (roll < 0.06) { b.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); b.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); } else if (roll < 0.21) { b.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook'); }
        }
    }
}

export function processPunchExecution() {
    let r = boxerRed, b = boxerBlue;
    if (r.isPunching) {
        r.punchProgress += r.punchType === 'straight' ? 0.155 : (r.punchType === 'super' ? 0.080 : 0.132);
        if (Math.sin(r.punchProgress) > 0.75 && !r.hasHit) {
            r.punchRoll = Math.floor(Math.random() * 6) + 1;
            if (b.isBlockingNow) { b.consecutiveBigHits = 0; if (r.punchType === 'super') b.hp = Math.max(0, b.hp - 15); }
            else {
                if (r.punchType === 'super') { b.hp = Math.max(0, b.hp - 30); b.pendingKnockdown = true; }
                else {
                    let d = r.punchType === 'hook' ? 5 : 3; d *= r.punchRoll === 6 ? 2 : (r.punchRoll >= 3 ? 1.3 : 1); b.hp = Math.max(0, b.hp - d);
                    if (r.punchRoll >= 5) { b.consecutiveBigHits++; if (b.consecutiveBigHits >= 2) { b.pendingKnockdown = true; r.punchQueue = []; } } else b.consecutiveBigHits = 0;
                    if (r.punchRoll === 6 && !b.pendingKnockdown) { r.totalSixes++; if (r.totalSixes % 3 === 0) { let o = ["eye", "lip", "liver"], c = o[Math.floor(Math.random() * o.length)]; if (c === "eye" && b.eyeLevel < 3) b.eyeLevel++; if (c === "lip" && b.lipLevel < 3) b.lipLevel++; if (c === "liver" && b.liverLevel < 3) b.liverLevel++; } }
                    if (r.punchType === 'hook' && Math.random() < 0.2 && !b.pendingKnockdown) b.stunTimer = 300;
                }
            }
            r.hasHit = true;
        }
        if (r.punchProgress >= Math.PI) { r.isPunching = false; r.punchProgress = 0; r.punchCooldown = r.punchType === 'super' ? 45 : 14; }
    }
    if (b.isPunching) {
        b.punchProgress += b.punchType === 'straight' ? 0.155 : (b.punchType === 'super' ? 0.080 : 0.132);
        if (Math.sin(b.punchProgress) > 0.75 && !b.hasHit) {
            if (r.isBlockingNow) { r.consecutiveBigHits = 0; if (b.punchType === 'super') r.hp = Math.max(0, r.hp - 15); }
            else {
                if (b.punchType === 'super') { r.hp = Math.max(0, r.hp - 30); }
                else {
                    let d = b.punchType === 'hook' ? 5 : 3; d *= (b.punchRoll % 6 === 0 ? 2 : 1); r.hp = Math.max(0, r.hp - d);
                    if (b.punchRoll % 6 === 0) { b.totalSixes = (b.totalSixes || 0) + 1; }
                }
            }
            b.hasHit = true;
        }
        if (b.punchProgress >= Math.PI) { b.isPunching = false; b.punchProgress = 0; b.punchCooldown = b.punchType === 'super' ? 45 : 14; }
    }
}

export function drawBlueBoxer() {
    const canvas = document.getElementById('ringCanvas'); if (!canvas || !boxerBlue || !boxerRed) return;
    const ctx = canvas.getContext('2d'), down = isBlueKnockedDown(); if (down) bPT += 0.05;
    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angle = Math.atan2(boxerBlue.y - boxerRed.y, boxerBlue.x - boxerRed.x);
    if (boxerBlue.isBlockingNow && !down && bVT <= 0 && boxerRed.isPunching) bVT = 20; if (bVT > 0) bVT--;
    const isBlk = boxerBlue.isBlockingNow && bVT > 0 && !down, isStun = boxerBlue.stunTimer > 0 && !down;
    let col = boxerBlue.color, gCol = '#d35400';
    if (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.85) { if (isBlk) gCol = '#f1c40f'; else col = '#ffbebe'; }
    if (isStun && col === boxerBlue.color) col = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;
    if (down) col = '#abc4d6';
    ctx.beginPath(); ctx.ellipse(boxerBlue.x, boxerBlue.y + (down ? boxerBlue.radius * 1.5 : boxerBlue.radius), boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.save(); ctx.translate(boxerBlue.x, boxerBlue.y + bounce + (down ? 15 : 0)); ctx.rotate(angle - Math.PI / 2);
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = down ? 4 : 2; ctx.strokeStyle = down ? `rgba(0,0,0,${0.3 + Math.abs(Math.sin(bPT)) * 0.7})` : '#fff'; ctx.stroke();
    
    let leftX = -12, leftY = -boxerBlue.radius + 4, rightX = 12, rightY = -boxerBlue.radius + 4, pValB = boxerBlue.isPunching ? Math.sin(boxerBlue.punchProgress) : 0;
    if (boxerBlue.isChargingSuper && !boxerBlue.isPunching) { leftY = -boxerBlue.radius - 2; rightY = -boxerBlue.radius - 2; }
    else if (boxerBlue.isPunching) {
        // ZASIĘG DOKŁADNIE DO CIAŁA PRZECIWNIKA
        const dx = boxerRed.x - boxerBlue.x, dy = boxerRed.y - boxerBlue.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let dynamicReach = dist - boxerBlue.radius; 

        if (boxerBlue.punchRoll % 2 === 0) { 
            leftY = (-boxerBlue.radius + 4) - (pValB * dynamicReach); 
            leftX = boxerBlue.punchType === 'hook' ? (-12 + Math.sin(boxerBlue.punchProgress) * 20) : (-12 + pValB * 10); 
            rightY = -boxerBlue.radius + 6; 
        } else { 
            rightY = (-boxerBlue.radius + 4) - (pValB * dynamicReach); 
            rightX = boxerBlue.punchType === 'hook' ? (12 - Math.sin(boxerBlue.punchProgress) * 20) : (12 - pValB * 10); 
            leftY = -boxerBlue.radius + 6; 
        }
    }
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(leftX, leftY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(rightX, rightY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.lineWidth = down ? 3 : 2; ctx.strokeStyle = down ? '#000' : '#fff';
    ctx.beginPath(); ctx.arc(leftX, leftY, 7, 0, Math.PI * 2); ctx.fillStyle = gCol; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightX, rightY, 7, 0, Math.PI * 2); ctx.fillStyle = gCol; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(-(angle - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();
    if (isStun) { sA += 0.15; ctx.save(); ctx.translate(boxerBlue.x, boxerBlue.y - 38); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(Math.cos(sA + i * (Math.PI * 2 / 3)) * 16, Math.sin(sA + i * (Math.PI * 2 / 3)) * 5, 3, 0, Math.PI * 2); ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); } ctx.restore(); }
}
export function interruptRedSuper() { if (boxerRed.isChargingSuper) { boxerRed.isChargingSuper = false; boxerRed.superChargeTimer = 0; boxerRed.punchCooldown = 60; return true; } return false; }
