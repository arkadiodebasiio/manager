// combat-logic.js

export function initSuperPunch(boxerRed) {
    if (boxerRed.superPunchTimer === undefined || boxerRed.superPunchTimer === 0) {
        boxerRed.superPunchTimer = Math.floor(Math.random() * 5400) + 2700;
        boxerRed.isChargingSuper = false;
        boxerRed.superChargeFrames = 0;
    }
}

export function handleSuperPunchTiming(boxerRed, boxerBlue) {
    if (!boxerRed.isChargingSuper && !boxerRed.isPunching) {
        boxerRed.superPunchTimer--;
        if (boxerRed.superPunchTimer <= 0) {
            boxerRed.isChargingSuper = true;
            boxerRed.superChargeFrames = 180; // 3 sekundy ładowania przy 60 FPS
            boxerRed.punchQueue = []; 
        }
    }

    if (boxerRed.isChargingSuper) {
        boxerRed.superChargeFrames--;
        
        if (boxerRed.superChargeFrames <= 0) {
            boxerRed.isChargingSuper = false;
            boxerRed.isPunching = true;
            boxerRed.punchProgress = 0;
            boxerRed.punchType = 'super'; 
            boxerRed.hasHit = false;
            boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;
        }
        return true; 
    }
    return false;
}

export function executeSuperPunchHit(boxerRed, boxerBlue) {
    boxerBlue.hp -= 25; 
    if (boxerBlue.hp < 0) boxerBlue.hp = 0;

    if (Math.random() < 0.70) {
        boxerBlue.pendingKnockdown = true;
    }
}
