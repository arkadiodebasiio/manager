// engine.js
function isBlueKnockedDown() { return boxerBlue.isKnockedDown; }
function getSuperChargeState() { return { isCharging: boxerRed.isChargingSuper, frames: boxerRed.superChargeFrames }; }

function updatePhysics() {
    if (boxerBlue.isKnockedDown) {
        boxerBlue.rx += (ringCenter - boxerBlue.rx) * 0.2;
        boxerBlue.ry += (ringCenter - boxerBlue.ry) * 0.2;
        return; 
    }

    initSuperPunch();
    const isCharging = handleSuperPunchTiming();
    if (isCharging) { boxerRed.animTimer += 0.05; boxerBlue.animTimer += 0.133; return; }

    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.80 : 1.0;

    boxerRed.animTimer += 0.133;
    if (boxerRed.punchCooldown > 0) boxerRed.punchCooldown--;
    if (!boxerRed.isPunching && boxerRed.punchQueue.length === 0 && boxerRed.punchCooldown === 0) boxerRed.punchTimer += 0.66; 
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;

    if (boxerBlue.stunTimer > 0) {
        boxerBlue.stunTimer -= (1 * blueSpeedModifier); 
        if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0;
    }

    // MATEMATYKA Z SAMEGO POCZĄTKU: Promień zależy wprost od wysunięcia pięści
    let punchOffset = 0;
    if (boxerRed.isPunching) {
        const reachFactor = Math.sin(boxerRed.punchProgress);
        const maxReach = boxerRed.punchType === 'straight' ? 38 : (boxerRed.punchType === 'super' ? 46 : 24);
        punchOffset = reachFactor * maxReach;
    }
    const activeRadius = baseRadius - punchOffset;

    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * activeRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * activeRadius;

    const currentSin = Math.sin(boxerRed.animTimer);
    if (currentSin > 0 && !boxerRed.wasAboveZero) boxerRed.isMovingThisJump = Math.random() < 0.30;
    boxerRed.wasAboveZero = (currentSin > 0);
    if (boxerRed.isMovingThisJump && currentSin > 0) boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 

    if (!boxerRed.isPunching) {
        let shouldPunch = false;
        if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
            boxerRed.punchType = boxerRed.punchQueue.shift(); shouldPunch = true;
        } else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
            boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook'; shouldPunch = true;
            const comboRoll = Math.random();
            if (comboRoll < 0.01) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook', Math.random() < 0.70 ? 'straight' : 'hook', Math.random() < 0.70 ? 'straight' : 'hook');
                if (boxerBlue.stunTimer > 0) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
            } else if (comboRoll < 0.06) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook', Math.random() < 0.70 ? 'straight' : 'hook');
                if (boxerBlue.stunTimer > 0) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
            } else if (comboRoll < 0.21) { boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook'); }
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

    if (boxerRed.isPunching) {
        boxerRed.punchProgress += boxerRed.punchType === 'straight' ? 0.155 : (boxerRed.punchType === 'super' ? 0.100 : 0.132);
        if (Math.sin(boxerRed.punchProgress) > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 
            if (!boxerBlue.isBlockingNow) {
                if (boxerRed.punchType === 'super') { executeSuperPunchHit(); } else {
                    let dmg = boxerRed.punchType === 'hook' ? 5 : 3; 
                    if (boxerRed.punchRoll === 6) dmg *= 2.0; else if (boxerRed.punchRoll >= 3) dmg *= 1.3;   
                    if (boxerBlue.lipLevel === 1) dmg *= 1.10; else if (boxerBlue.lipLevel >= 2) dmg *= 1.20;
                    boxerBlue.hp -= dmg; if (boxerBlue.hp < 0) boxerBlue.hp = 0; 
                    if (boxerRed.punchRoll === 5 || boxerRed.punchRoll === 6) {
                        boxerBlue.consecutiveBigHits += 1; if (boxerBlue.consecutiveBigHits >= 2) { boxerBlue.pendingKnockdown = true; boxerRed.punchQueue = []; }
                    } else { boxerBlue.consecutiveBigHits = 0; }
                    if (boxerRed.punchRoll === 6 && !boxerBlue.pendingKnockdown) {
                        boxerRed.totalSixes += 1; 
                        if (boxerRed.totalSixes % 3 === 0) {
                            const opt = ["eye", "lip", "liver"]; const chosen = opt[Math.floor(Math.random() * opt.length)];
                            if (chosen === "eye" && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
                            if (chosen === "lip" && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
                            if (chosen === "liver" && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
                        }
                    }
                    if (boxerRed.punchType === 'hook' && Math.random() < 0.20 && boxerBlue.stunTimer === 0 && !boxerBlue.pendingKnockdown) boxerBlue.stunTimer = 300; 
                }
            } else { boxerBlue.consecutiveBigHits = 0; }
            boxerRed.hasHit = true;
        }
        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false; boxerBlue.isBlockingNow = false; 
            if (boxerRed.punchType === 'super') boxerRed.superPunchTimer = Math.floor(Math.random() * 5400) + 2700;
            if (boxerBlue.pendingKnockdown) { boxerBlue.isKnockedDown = true; boxerBlue.pendingKnockdown = false; }
            else { boxerRed.punchCooldown = boxerRed.punchQueue.length > 0 ? 10 : 30; }
        }
    }
}
