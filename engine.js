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
    
    // ZMIENNE SUPER PUNCH
    isSuperPunching: false,
    superPunchTimer: 0
};

export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0, blockCount: 0,
    isBlockingNow: false, eyeLevel: 0, lipLevel: 0, liverLevel: 0, hp: 100,
    consecutiveSixes: 0, isKnockedDown: false  
};

export function updatePhysics() {
    // Jeśli niebieski leży, zamrażamy akcje
    if (boxerBlue.isKnockedDown) {
        boxerBlue.rx += (ringCenter - boxerBlue.rx) * 0.2;
        boxerBlue.ry += (ringCenter - boxerBlue.ry) * 0.2;
        return;
    }

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

    // OBSŁUGA AKTYWNEGO ŁADOWANIA SUPER PUNCH
    if (boxerRed.isSuperPunching) {
        boxerRed.superPunchTimer++;
        
        // W połowie ładowania niebieski decyduje o bloku
        if (boxerRed.superPunchTimer === 90) {
            boxerBlue.isBlockingNow = Math.random() < 0.50; 
        }

        // Koniec ładowania (3 sekundy = 180 klatek) -> Odpalenie ciosu!
        if (boxerRed.superPunchTimer >= 180) {
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
            boxerRed.isSuperPunching = false;
            boxerRed.superPunchTimer = 0;
            boxerBlue.isBlockingNow = false;
        }
    }

    // Poruszanie się i orbita działają normalnie (chyba że trwa Super Punch, wtedy czerwony zastyga w zamachu)
    if (!boxerRed.isSuperPunching) {
        const isInComboInFight = boxerRed.isPunching || boxerRed.punchQueue.length > 0 || boxerRed.punchCooldown > 0;
        let targetRadius = isInComboInFight ? (boxerRed.punchType === 'straight' ? 62 : 54) : baseRadius;
        currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;

        boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
        boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;

        const currentSin = Math.sin(boxerRed.animTimer);
        if (currentSin > 0 && !boxerRed.wasAboveZero) boxerRed.isMovingThisJump = Math.random() < 0.30;
        boxerRed.wasAboveZero = (currentSin > 0);

        if (boxerRed.isMovingThisJump && currentSin > 0) boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 
    }

    // Inicjacja zwykłych ciosów lub losowanie Super Puncha
    if (!boxerRed.isPunching && !boxerRed.isSuperPunching) {
        let shouldPunch = false;

        // Szansa na Super Punch (raz na ok. 2 minuty walki przy 60fps)
        if (boxerRed.punchQueue.length === 0 && Math.random() < (1 / 4500)) { 
            boxerRed.isSuperPunching = true;
            boxerRed.superPunchTimer = 0;
        } 
        else if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
            boxerRed.punchType = boxerRed.punchQueue.shift(); 
            shouldPunch = true;
        } 
        else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
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
            // Nokdaun z przemęczenia, jeśli wróg jest ogłuszony, a wchodzi seria 3 lub 4 ciosów
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

    let calculatedImpact = 0;

    // Obsługa zwykłego uderzenia
    if (boxerRed.isPunching) {
        boxerRed.punchProgress += (boxerRed.punchType === 'straight' ? 0.155 : 0.132);
        const pVal = Math.sin(boxerRed.punchProgress);
        
        if (pVal > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 

            if (boxerBlue.isBlockingNow) {
                boxerBlue.consecutiveSixes = 0; 
            } else {
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

        if (pVal > 0.75 && !boxerBlue.isKnockedDown) {
            let basePower = boxerRed.punchType === 'hook' ? 54 : 45; 
            if (boxerRed.punchRoll === 6 || boxerRed.punchRoll === 5) calculatedImpact = (pVal - 0.75) * basePower * 0.7;  
            else calculatedImpact = (pVal - 0.75) * basePower * 0.15; 
        }

        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false;
            boxerBlue.isBlockingNow = false; 
            if (boxerRed.punchQueue.length > 0 && !boxerBlue.isKnockedDown) {
                boxerRed.punchCooldown = 10;
            }
        }
    }

    // Płynny powrót i reakcja na ciosy niebieskiego boksera
    boxerBlue.rx += (ringCenter - boxerBlue.rx) * 0.2;
    boxerBlue.ry += (ringCenter - boxerBlue.ry) * 0.2;
}
