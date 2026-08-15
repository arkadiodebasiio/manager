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
    hp: 100 
};

export function updatePhysics() {
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

            // POWRÓT DO TWOICH PROPORCJI
            const comboRoll = Math.random();
            if (comboRoll < 0.01) {
                // 1% na serię POCZWÓRNĄ (3 dodatkowe ciosy)
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            } else if (comboRoll < 0.06) {
                // 5% na serię POTRÓJNĄ (2 dodatkowe ciosy)
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.70 ? 'straight' : 'hook');
            } else if (comboRoll < 0.21) {
                // 15% na serię PODWÓJNĄ (1 dodatkowy cios)
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

    let calculatedImpact = 0;

    if (boxerRed.isPunching) {
        if (boxerRed.punchType === 'straight') {
            boxerRed.punchProgress += 0.155; 
        } else {
            boxerRed.punchProgress += 0.132; 
        }

        const pVal = Math.sin(boxerRed.punchProgress);
        
        if (pVal > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 

            if (!boxerBlue.isBlockingNow) {
                let dmg = boxerRed.punchType === 'hook' ? 5 : 3; 
                if (boxerRed.punchRoll === 6) dmg *= 2.0;       
                else if (boxerRed.punchRoll >= 3) dmg *= 1.3;   

                if (boxerBlue.lipLevel === 1) dmg *= 1.10;
                else if (boxerBlue.lipLevel >= 2) dmg *= 1.20;

                boxerBlue.hp -= dmg;
                if (boxerBlue.hp < 0) boxerBlue.hp = 0; 

                if (boxerRed.punchRoll === 6) {
                    boxerRed.totalSixes += 1; 

                    if (boxerRed.totalSixes % 3 === 0) {
                        const options = ["eye", "lip", "liver"];
                        const chosen = options[Math.floor(Math.random() * options.length)];

                        if (chosen === "eye" && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
                        if (chosen === "lip" && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
                        if (chosen === "liver" && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
                    }
                }

                if (boxerRed.punchType === 'hook' && Math.random() < 0.20 && boxerBlue.stunTimer === 0) {
                    boxerBlue.stunTimer = 300; 
                }
            }
            boxerRed.hasHit = true;
        }

        if (pVal > 0.75) {
            let basePower = boxerRed.punchType === 'hook' ? 54 : 45; 
            
            const currentHand = (typeof window !== 'undefined' && window.currentActivePunchHand) ? window.currentActivePunchHand : 'left';
            
            if (currentHand === strongHand) {
                basePower = boxerRed.punchType === 'hook' ? 60 : 50; 
            }

            if (boxerRed.punchRoll === 6) {
                calculatedImpact = (pVal - 0.75) * basePower * 0.7;  
            } else if (boxerRed.punchRoll >= 3 && boxerRed.punchRoll <= 5) {
                calculatedImpact = (pVal - 0.75) * basePower * 0.4;  
            } else {
                calculatedImpact = (pVal - 0.75) * basePower * 0.15; 
            }

            if (boxerBlue.lipLevel === 1) {
                calculatedImpact *= 0.90; 
            } else if (boxerBlue.lipLevel >= 2) {
                calculatedImpact *= 0.80; 
            }

            if (boxerBlue.eyeLevel === 1) {
                if (Math.random() < 0.10) calculatedImpact = 0;
            } else if (boxerBlue.eyeLevel >= 2) {
                if (Math.random() < 0.20) calculatedImpact = 0;
            }
        }

        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false;
            boxerBlue.isBlockingNow = false; 
            
            if (boxerRed.punchQueue.length > 0) {
                boxerRed.punchCooldown = 10;
            }
        }
    }

    const dx = ringCenter - boxerRed.x;
    const dy = ringCenter - boxerRed.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const targetRx = ringCenter + (dx / dist) * calculatedImpact;
    const targetRy = ringCenter + (dy / dist) * calculatedImpact;

    boxerBlue.rx += (targetRx - boxerBlue.rx) * 0.2;
    boxerBlue.ry += (targetRy - boxerBlue.ry) * 0.2;
}
