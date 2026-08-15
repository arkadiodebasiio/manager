export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;

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
    comboLeft: 0,      // Ile ciosów zostało w serii combo
    comboDelay: 0      // Odliczanie krótkiej przerwy między ciosami w serii, aby pięść wróciła!
};

export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0,
    blockCount: 0,
    isBlockingNow: false, 
    eyeLevel: 0,
    lipLevel: 0,
    liverLevel: 0
};

export function updatePhysics() {
    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.80 : 1.0;

    boxerRed.animTimer += 0.133;
    
    // Zwiększamy licznik standardowego czasu między niezależnymi atakami
    if (!boxerRed.isPunching && boxerRed.comboLeft === 0) {
        boxerRed.punchTimer += 0.66; 
    }
    
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;

    if (boxerBlue.stunTimer > 0) {
        boxerBlue.stunTimer -= (1 * blueSpeedModifier); 
        if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0;
    }

    let targetRadius = boxerRed.isPunching ? (boxerRed.punchType === 'straight' ? 62 : 54) : baseRadius;
    currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;

    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;

    const currentSin = Math.sin(boxerRed.animTimer);
    if (currentSin > 0 && !boxerRed.wasAboveZero) boxerRed.isMovingThisJump = Math.random() < 0.30;
    boxerRed.wasAboveZero = (currentSin > 0);

    if (boxerRed.isMovingThisJump && currentSin > 0) {
        boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 
    }

    // Obsługa krótkiej przerwy w serii combo (pięść musi na chwilę wrócić do tułowia)
    if (boxerRed.comboLeft > 0 && !boxerRed.isPunching) {
        boxerRed.comboDelay--;
        if (boxerRed.comboDelay <= 0) {
            // Odpalamy kolejny cios z serii combo!
            boxerRed.isPunching = true;
            boxerRed.punchProgress = 0;
            boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook'; 
            boxerRed.hasHit = false; 
            boxerRed.comboLeft--; // Zmniejszamy kolejkę combo

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

    // Standardowe rozpoczęcie ataku (gdy nie ma aktywnej serii combo)
    if (!boxerRed.isPunching && boxerRed.comboLeft === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        boxerRed.isPunching = true;
        boxerRed.punchProgress = 0;
        boxerRed.punchTimer = 0;
        boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
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
            const currentHand = window.currentActivePunchHand || 'left';
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

        // KONIEC ANIMACJI CIOSU
        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false;
            boxerBlue.isBlockingNow = false; 

            // Losowanie nowej serii combo aktywuje się tylko przy standardowym, pojedynczym ciosie bazowym
            if (boxerRed.comboLeft === 0) {
                const rand = Math.random();
                if (rand < 0.05) {
                    boxerRed.comboLeft = 2;   // Szansa 5% na SERIĘ POTRÓJNĄ (2 dodatkowe ciosy)
                    boxerRed.comboDelay = 8;  // 8 klatek przerwy na powrót gardy
                } else if (rand < 0.35) {     // 0.05 + 0.30 = 0.35 -> Szansa 30% na SERIĘ PODWÓJNĄ (1 dodatkowy cios)
                    boxerRed.comboLeft = 1;   
                    boxerRed.comboDelay = 8;  
                }
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
