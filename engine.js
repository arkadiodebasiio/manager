export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 500;
    canvas.height = 500;
}

const ringCenter = 250, baseRadius = 100;      
let currentOrbitRadius = baseRadius; 

export const strongHand = Math.random() < 0.5 ? 'left' : 'right';
const chosenOrbitSpeed = strongHand === 'left' ? 0.023 : -0.023;

export const boxerRed = {
    angle: Math.PI / 2, orbitSpeed: chosenOrbitSpeed, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350,
    punchRoll: 1, totalSixes: 0, punchQueue: [], punchCooldown: 0, hp: 100,
    
    // STAN SUPER CIOSU
    isSuperPunching: false,
    superPunchTimer: 0,
    superPunchProgress: 0,
    isSuperPunchStriking: false
};

export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0, blockCount: 0,
    isBlockingNow: false, 
    
    // SYSTEM KONTUZJI I LICZNIK TRZECH "SZÓSTEK"
    eyeLevel: 0, 
    lipLevel: 0, 
    liverLevel: 0, 
    sixHitCount: 0, 
    hp: 100,
    
    consecutiveSixes: 0,  
    isKnockedDown: false  
};

export function updatePhysics() {
    const isInComboInFight = boxerRed.isPunching || boxerRed.punchQueue.length > 0 || boxerRed.punchCooldown > 0;
    let targetRadius = isInComboInFight ? (boxerRed.punchType === 'hook' ? 54 : 62) : baseRadius;
    
    if (boxerRed.isSuperPunching) {
        targetRadius = 55; 
    }
    
    currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;

    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;
    boxerBlue.rx += (ringCenter - boxerBlue.rx) * 0.2;
    boxerBlue.ry += (ringCenter - boxerBlue.ry) * 0.2;

    if (boxerBlue.isKnockedDown) return; 

    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.80 : 1.0;

    boxerRed.animTimer += 0.133;
    if (boxerRed.punchCooldown > 0) boxerRed.punchCooldown--;

    if (!boxerRed.isPunching && !boxerRed.isSuperPunching && boxerRed.punchQueue.length === 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchTimer += 0.66; 
    }
    
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;
    if (boxerBlue.stunTimer > 0) {
        boxerBlue.stunTimer -= blueSpeedModifier; 
        if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0;
    }

    // OBSŁUGA SUPER CIOSU
    if (boxerRed.isSuperPunching) {
        if (!boxerRed.isSuperPunchStriking) {
            boxerRed.superPunchTimer++;

            if (boxerRed.superPunchTimer === 170) {
                boxerBlue.isBlockingNow = Math.random() < 0.50;
            }

            if (boxerRed.superPunchTimer >= 180) {
                boxerRed.isSuperPunchStriking = true;
                boxerRed.superPunchProgress = 0;
            }
        } else {
            boxerRed.superPunchProgress += 0.18; 
            const spVal = Math.sin(boxerRed.superPunchProgress);

            if (spVal > 0.75 && !boxerRed.hasHit) {
                if (boxerBlue.isBlockingNow) {
                    boxerBlue.consecutiveSixes = 0;
                } else {
                    if (Math.random() < 0.70) {
                        boxerBlue.isKnockedDown = true;
                        boxerRed.punchQueue = [];
                    } else {
                        boxerBlue.hp = Math.max(0, boxerBlue.hp - 40);
                    }
                }
                boxerRed.hasHit = true;
            }

            if (boxerRed.superPunchProgress >= Math.PI) {
                boxerRed.isSuperPunching = false;
                boxerRed.isSuperPunchStriking = false;
                boxerRed.superPunchTimer = 0;
                boxerRed.superPunchProgress = 0;
                boxerRed.hasHit = false;
                boxerBlue.isBlockingNow = false;
            }
        }
        return; 
    }

    const currentSin = Math.sin(boxerRed.animTimer);
    if (currentSin > 0 && !boxerRed.wasAboveZero) boxerRed.isMovingThisJump = Math.random() < 0.30;
    boxerRed.wasAboveZero = (currentSin > 0);

    if (boxerRed.isMovingThisJump && currentSin > 0) boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 

    if (!boxerRed.isPunching) {
        let shouldPunch = false;

        if (boxerRed.punchQueue.length === 0 && !boxerRed.isSuperPunching && Math.random() < (1 / 4000)) {
            boxerRed.isSuperPunching = true;
            boxerRed.superPunchTimer = 0;
            boxerRed.isSuperPunchStriking = false;
            return;
        }

        // NAPRAWIONY WARUNEK: Czyste sprawdzenie czasu odnowienia ciosu
        if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
            boxerRed.punchType = boxerRed.punchQueue.shift(); 
            shouldPunch = true;
        } else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
            boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
            shouldPunch = true;

            const comboRoll = Math.random();
            if (comboRoll < 0.01) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook', Math.random() < 0.70 ? 'straight' : 'hook', Math.random() < 0.70 ? 'straight' : 'hook');
            } else if (comboRoll < 0.06) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook', Math.random() < 0.70 ? 'straight' : 'hook');
            } else if (comboRoll < 0.21) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            }
        }

        if (shouldPunch) {
            if (boxerBlue.stunTimer > 0 && boxerRed.punchQueue.length >= 2) {
                boxerBlue.isKnockedDown = true; 
                boxerRed.punchQueue = [];
                boxerRed.isPunching = false;
                boxerBlue.stunTimer = 0;
                return; 
            }

            boxerRed.isPunching = true;
            boxerRed.punchProgress = 0;
            boxerRed.punchTimer = 0;
            boxerRed.hasHit = false; 
            boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;
        }
    }

    if (boxerRed.isPunching) {
        boxerRed.punchProgress += (boxerRed.punchType === 'straight' ? 0.155 : 0.132);
        const pVal = Math.sin(boxerRed.punchProgress);
        
        if (pVal > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 

            if (boxerBlue.isBlockingNow) {
                boxerBlue.consecutiveSixes = 0; 
            } else {
                // SIKX MECHANIKA: Liczenie szóstek do kontuzji (co 3 udane trafienia za "6")
                if (boxerRed.punchRoll === 6) {
                    boxerBlue.sixHitCount += 1;
                    
                    if (boxerBlue.sixHitCount >= 3) {
                        const injuryType = Math.floor(Math.random() * 3);
                        if (injuryType === 0 && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
                        if (injuryType === 1 && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
                        if (injuryType === 2 && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
                        
                        boxerBlue.sixHitCount = 0; 
                    }
                }

                if (boxerRed.punchRoll === 5 || boxerRed.punchRoll === 6) {
                    boxerBlue.consecutiveSixes += 1; 
                    if (boxerBlue.consecutiveSixes >= 2) {
                        boxerBlue.isKnockedDown = true; 
                        boxerRed.isPunching = false;
                        boxerRed.punchQueue = [];
                    }
                }

                if (!boxerBlue.isKnockedDown) {
                    let dmg = boxerRed.punchType === 'hook' ? 5 : 3; 
                    if (boxerRed.punchRoll === 6) dmg *= 2.0;       
                    else if (boxerRed.punchRoll === 5) dmg *= 1.3;
                    boxerBlue.hp = Math.max(0, boxerBlue.hp - dmg);
                }
            }
            boxerRed.hasHit = true;
        }

        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false;
            boxerBlue.isBlockingNow = false; 
            if (boxerRed.punchQueue.length > 0 && !boxerBlue.isKnockedDown) {
                boxerRed.punchCooldown = 10;
            }
        }
    }
}
