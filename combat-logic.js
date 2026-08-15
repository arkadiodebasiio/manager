import { boxerRed, boxerBlue, strongHand } from './engine.js';

export function handleBotAttackDecisions(baseRadius) {
    if (boxerRed.isPunching || boxerRed.isChargingSuper) return;

    let shouldPunch = false;

    if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchType = boxerRed.punchQueue.shift(); 
        shouldPunch = true;
    } 
    else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        
        // Gwarancja uruchomienia TYLKO gdy licznik cooldownu jest całkowicie wyzerowany
        if (boxerRed.superCooldown <= 0 && Math.random() < 0.40) {
            boxerRed.isChargingSuper = true;
            boxerRed.superChargeTimer = 180; // 3 sekundy ładowania
            boxerRed.superCooldown = 5400;   // Twarda blokada na 1.5 minuty (5400 klatek)
            boxerRed.punchTimer = 0;
            return; 
        } 

        boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
        shouldPunch = true;

        const comboRoll = Math.random();
        const isStunnedNow = boxerBlue.stunTimer > 0;

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
        boxerRed.isPunching = true;
        boxerRed.punchProgress = 0;
        boxerRed.punchTimer = 0;
        boxerRed.hasHit = false; 

        boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;

        if (boxerBlue.isBlockingNow && boxerBlue.liverLevel > 0) {
            boxerBlue.blockCount += 1;
            const breakLimit = (boxerBlue.liverLevel >= 2) ? 5 : 10;
            if (boxerBlue.blockCount >= breakLimit) {
                boxerBlue.isBlockingNow = false; 
                boxerBlue.blockCount = 0;
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
                boxerBlue.hp -= 15; 
                if (boxerBlue.hp < 0) boxerBlue.hp = 0;
            }
        } else {
            if (boxerRed.punchType === 'super') {
                boxerBlue.hp -= 30;
                if (boxerBlue.hp < 0) boxerBlue.hp = 0;
                boxerBlue.pendingKnockdown = true; 
            } else {
                let dmg = boxerRed.punchType === 'hook' ? 5 : 3; 
                if (boxerRed.punchRoll === 6) dmg *= 2.0;       
                else if (boxerRed.punchRoll >= 3) dmg *= 1.3;   

                if (boxerBlue.lipLevel === 1) dmg *= 1.10;
                else if (boxerBlue.lipLevel >= 2) dmg *= 1.20;

                boxerBlue.hp -= dmg;
                if (boxerBlue.hp < 0) boxerBlue.hp = 0; 

                if (boxerRed.punchRoll === 5 || boxerRed.punchRoll === 6) {
                    boxerBlue.consecutiveBigHits += 1;
                    if (boxerBlue.consecutiveBigHits >= 2) {
                        boxerBlue.pendingKnockdown = true;
                        boxerRed.punchQueue = [];
                    }
                } else {
                    boxerBlue.consecutiveBigHits = 0; 
                }

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

                if (boxerRed.punchType === 'hook' && Math.random() < 0.20 && boxerBlue.stunTimer === 0 && !boxerBlue.pendingKnockdown) {
                    boxerBlue.stunTimer = 300; 
                }
            }
        }
        boxerRed.hasHit = true;
    }

    if (boxerRed.punchProgress >= Math.PI) {
        boxerRed.isPunching = false;
        boxerRed.punchProgress = 0;
        boxerRed.punchCooldown = boxerRed.punchType === 'super' ? 45 : (boxerRed.punchType === 'hook' ? 22 : 14);
    }
}

export function interruptRedSuper() {
    if (boxerRed.isChargingSuper) {
        boxerRed.isChargingSuper = false;
        boxerRed.superChargeTimer = 0;
        boxerRed.punchCooldown = 60; 
        return true;
    }
    return false;
}
