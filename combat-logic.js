import { boxerRed, boxerBlue, strongHand, isBlueKnockedDown } from './engine.js';

let blackPulseTimer = 0, blockVisualTimer = 0, starAngle = 0;

export function handleBotAttackDecisions(baseRadius) {
    if (boxerRed.isPunching || boxerRed.isChargingSuper) return;
    let shouldPunch = false;

    if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchType = boxerRed.punchQueue.shift(); 
        shouldPunch = true;
    } 
    else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        if (boxerRed.superCooldown <= 0 && Math.random() < 0.40) {
            boxerRed.isChargingSuper = true;
            boxerRed.superChargeTimer = 180; 
            boxerRed.superCooldown = 5400;   // 1,5 minuty blokady
            boxerRed.punchTimer = 0;
            return; 
        } 
        boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
        shouldPunch = true;

        const comboRoll = Math.random(), isStunnedNow = boxerBlue.stunTimer > 0;
        if (comboRoll < 0.01) {
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            if (isStunnedNow) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
        } else if (comboRoll < 0.06) {
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            if (isStunnedNow) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
        } else if (comboRoll < 0.21) {
            boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
        }
    }

    if (shouldPunch) {
        boxerRed.isPunching = true; boxerRed.punchProgress = 0; boxerRed.punchTimer = 0; boxerRed.hasHit = false; 
        boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;
        if (boxerBlue.isBlockingNow && boxerBlue.liverLevel > 0) {
            boxerBlue.blockCount += 1;
            if (boxerBlue.blockCount >= (boxerBlue.liverLevel >= 2 ? 5 : 10)) {
                boxerBlue.isBlockingNow = false; boxerBlue.blockCount = 0;
            }
        }
    }
}

export function processPunchExecution() {
    if (!boxerRed.isPunching) return;

    if (boxerRed.punchType === 'straight') boxerRed.punchProgress += 0.155; 
    else if (boxerRed.punchType === 'super') boxerRed.punchProgress += 0.080; 
    else boxerRed.punchProgress += 0.132; 

    const pVal = Math.sin(boxerRed.punchProgress);
    
    if (pVal > 0.75 && !boxerRed.hasHit) {
        boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 

        if (boxerBlue.isBlockingNow) {
            boxerBlue.consecutiveBigHits = 0; 
            if (boxerRed.punchType === 'super') {
                boxerBlue.hp -= 15; if (boxerBlue.hp < 0) boxerBlue.hp = 0;
            }
        } else {
            if (boxerRed.punchType === 'super') {
                boxerBlue.hp -= 30; if (boxerBlue.hp < 0) boxerBlue.hp = 0;
                boxerBlue.pendingKnockdown = true; 
            } else {
                let dmg = boxerRed.punchType === 'hook' ? 5 : 3; 
                if (boxerRed.punchRoll === 6) dmg *= 2.0;       
                else if (boxerRed.punchRoll >= 3) dmg *= 1.3;   

                if (boxerBlue.lipLevel === 1) dmg *= 1.10;
                else if (boxerBlue.lipLevel >= 2) dmg *= 1.20;

                boxerBlue.hp -= dmg; if (boxerBlue.hp < 0) boxerBlue.hp = 0; 

                if (boxerRed.punchRoll === 5 || boxerRed.punchRoll === 6) {
                    boxerBlue.consecutiveBigHits += 1;
                    if (boxerBlue.consecutiveBigHits >= 2) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
                } else { boxerBlue.consecutiveBigHits = 0; }

                if (boxerRed.punchRoll === 6 && !boxerBlue.pendingKnockdown) {
                    boxerRed.totalSixes += 1; 
                    if (boxerRed.totalSixes % 3 === 0) {
                        const options = ["eye", "lip", "liver"];
                        const chosen = options[Math.floor(Math.random() * options.length)];
                        if (chosen === "eye" && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
                        if (chosen === "lip" && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
                        if (chosen === "liver" && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
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
    const canvas = document.getElementById('ringCanvas');
    if (!canvas || !boxerBlue || !boxerRed) return;
    const ctx = canvas.getContext('2d'), down = isBlueKnockedDown();
    if (down) blackPulseTimer += 0.05;

    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0, isStunned = boxerBlue.stunTimer > 0 && !down;

    if (boxerBlue.isBlockingNow && !down && blockVisualTimer <= 0 && boxerRed.isPunching) blockVisualTimer = 20; 
    if (blockVisualTimer > 0) blockVisualTimer--;
    const isBlocking = boxerBlue.isBlockingNow && blockVisualTimer > 0 && !down;

    let currentColor = boxerBlue.color, gloveColor = '#d35400'; 
    if (boxerRed.isPunching && pVal > 0.85) { if (isBlocking) gloveColor = '#f1c40f'; else currentColor = '#ffbebe'; }
    if (isStunned && currentColor === boxerBlue.color) currentColor = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;
    if (down) currentColor = '#abc4d6';

    ctx.beginPath(); ctx.ellipse(boxerBlue.rx, boxerBlue.ry + (down ? boxerBlue.radius * 1.5 : boxerBlue.radius), boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce + (down ? 15 : 0)); ctx.rotate(angleToRed - Math.PI / 2); 
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = currentColor; ctx.fill(); 
    ctx.lineWidth = down ? 4 : 2; ctx.strokeStyle = down ? `rgba(0, 0, 0, ${0.3 + Math.abs(Math.sin(blackPulseTimer)) * 0.7})` : '#fff'; ctx.stroke();

    if (boxerBlue.eyeLevel > 0) {
        ctx.beginPath(); ctx.arc(-7, -8, boxerBlue.eyeLevel >= 2 ? 6.5 : 5, 0, Math.PI * 2); 
        ctx.fillStyle = boxerBlue.eyeLevel >= 2 ? 'rgba(100, 30, 130, 0.95)' : 'rgba(125, 60, 152, 0.85)'; ctx.fill();
    }
    if (boxerBlue.liverLevel > 0) {
        ctx.beginPath(); ctx.arc(10, 4, boxerBlue.liverLevel >= 2 ? 7.5 : 6, 0, Math.PI * 2); 
        ctx.fillStyle = boxerBlue.liverLevel >= 2 ? 'rgba(20, 120, 60, 0.95)' : 'rgba(39, 174, 96, 0.85)'; ctx.fill();
    }
    if (boxerBlue.lipLevel > 0) {
        ctx.beginPath(); ctx.ellipse(0, -14, boxerBlue.lipLevel >= 2 ? 7.5 : 6, boxerBlue.lipLevel >= 2 ? 4 : 3, 0, 0, Math.PI * 2); 
        ctx.fillStyle = boxerBlue.lipLevel >= 2 ? 'rgba(150, 30, 30, 0.98)' : 'rgba(192, 57, 43, 0.95)'; ctx.fill();
    }

    let leftGloveX = down ? -boxerBlue.radius - 14 : (isBlocking ? -3 : -12);
    let rightGloveX = down ? boxerBlue.radius + 14 : (isBlocking ? 3 : 12);
    let gloveY = down ? 0 : (-boxerBlue.radius + (isBlocking ? 1 : (isStunned ? 12 : 4)));

    ctx.beginPath(); ctx.moveTo(isBlocking ? -3 : -12, 0); ctx.lineTo(leftGloveX, gloveY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(isBlocking ? 3 : 12, 0); ctx.lineTo(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2)); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();

    ctx.lineWidth = down ? 3 : 2; ctx.strokeStyle = down ? '#000' : '#fff';
    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore(); 

    if (isStunned) {
        starAngle += 0.15; ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(Math.cos(starAngle + i * (Math.PI * 2 / 3)) * 16, Math.sin(starAngle + i * (Math.PI * 2 / 3)) * 5, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
}

export function interruptRedSuper() {
    if (boxerRed.isChargingSuper) { boxerRed.isChargingSuper = false; boxerRed.superChargeTimer = 0; boxerRed.punchCooldown = 60; return true; }
    return false;
}
