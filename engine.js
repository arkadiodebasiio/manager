import { calculateDamage, applyRandomInjury } from './combat-logic.js';

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
    punchRoll: 1,
    totalSixes: 0,
    punchQueue: [],    
    punchCooldown: 0,
    hp: 100 
};

export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0,
    blockCount: 0,
    isBlockingNow: false, 
    eyeLevel: 0,
    lipLevel: 0,
    liverLevel: 0,
    hp: 100,
    isKnockedDown: false,
    pendingKnockdown: false,
    consecutiveBigHits: 0 
};

export function isBlueKnockedDown() {
    return boxerBlue.isKnockedDown;
}

export function updatePhysics() {
    // Trwała przerwa w meczu po zaliczeniu nokdaunu
    if (boxerBlue.isKnockedDown) {
        boxerBlue.rx += (ringCenter - boxerBlue.rx) * 0.2;
        boxerBlue.ry += (ringCenter - boxerBlue.ry) * 0.2;
        return; 
    }

    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.80 : 1.0;

    boxerRed.animTimer += 0.133;
    
    if (boxerRed.punchCooldown > 0) {
        boxerRed.punchCooldown--;
    }

    if (!boxerRed.isPunching && boxerRed.punchQueue.length === 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchTimer += 0.66; 
    }
    
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;

    if (boxerBlue.stunTimer > 0) {
        boxerBlue.stunTimer -= (1 * blueSpeedModifier); 
        if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0;
    }

    const isInComboInFight = boxerRed.isPunching || boxerRed.punchQueue.length > 0 || boxerRed.punchCooldown > 0;
    let targetRadius = isInComboInFight ? (boxerRed.punchType === 'straight' ? 62 : 54) : baseRadius;
    currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;

    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;

    const currentSin = Math.sin(boxerRed.animTimer);
    if (currentSin > 0 && !boxerRed.wasAboveZero) boxerRed.isMovingThisJump = Math.random() < 0.30;
    boxerRed.wasAboveZero = (currentSin > 0);

    if (boxerRed.isMovingThisJump && currentSin > 0) {
        boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 
    }

    if (!boxerRed.isPunching) {
        let shouldPunch = false;

        if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
            boxerRed.punchType = boxerRed.punchQueue.shift(); 
            shouldPunch = true;
        } 
        else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
            boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
            shouldPunch = true;

            const comboRoll = Math.random();
            const isStunnedNow = boxerBlue.stunTimer > 0;

            if (comboRoll < 0.01) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                
                if (isStunnedNow) {
                    boxerBlue.pendingKnockdown = true;
                    boxerRed.punchQueue = []; 
                }
            } else if (comboRoll < 0.06) {
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                
                if (isStunnedNow) {
                    boxerBlue.pendingKnockdown = true;
                    boxerRed.punchQueue = []; 
                }
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

    if (boxerRed.isPunching) {
        if (boxerRed.punchType === 'straight') {
            boxerRed.punchProgress += 0.155; 
        } else {
            boxerRed.punchProgress += 0.132; 
        }

        const pVal = Math.sin(boxerRed.punchProgress);
        
        if (pVal > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 

            if (boxerBlue.isBlockingNow) {
                boxerBlue.consecutiveBigHits = 0; 
            } else {
                let finalDmg = calculateDamage(boxerRed.punchType, boxerRed.punchRoll, boxerBlue.lipLevel);
                boxerBlue.hp -= finalDmg;
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
                        applyRandomInjury(boxerBlue);
                    }
                }

                if (boxerRed.punchType === 'hook' && Math.random() < 0.20 && boxerBlue.stunTimer === 0 && !boxerBlue.pendingKnockdown) {
                    boxerBlue.stunTimer = 300; 
                }
            }
            boxerRed.hasHit = true;
        }

        // Kończenie fazy ciosu po pełnym cyklu sinusa
        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false;
            boxerRed.punchProgress = 0;
            boxerRed.punchCooldown = boxerRed.punchType === 'hook' ? 22 : 14;
        }
    }

    if (boxerBlue.pendingKnockdown || boxerBlue.hp <= 0) {
        boxerBlue.isKnockedDown = true;
        boxerBlue.pendingKnockdown = false;
        boxerBlue.hp = 0;
    }
}
