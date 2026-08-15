export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas.getContext('2d');

canvas.width = canvas.height = 500;
const ringCenter = 250, baseRadius = 100;      
let currentOrbitRadius = baseRadius; 

export const strongHand = Math.random() < 0.5 ? 'left' : 'right';
const chosenOrbitSpeed = strongHand === 'left' ? 0.023 : -0.023;

export const boxerRed = {
    angle: Math.PI / 2, orbitSpeed: chosenOrbitSpeed, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350,
    punchRoll: 1,
    totalSixes: 0 
};

export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0,
    blockCount: 0,
    // Trzy niezależne poziomy kontuzji (0=brak, 1=lekka, 2=double, 3=triple)
    eyeLevel: 0,
    lipLevel: 0,
    liverLevel: 0
};

export function updatePhysics() {
    boxerRed.animTimer += 0.133;
    boxerRed.punchTimer += 0.66; 
    
    if (boxerBlue.stunTimer > 0) {
        boxerBlue.animTimer += 0.35; 
        boxerBlue.stunTimer--; 
    } else {
        boxerBlue.animTimer += 0.133;
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

    if (!boxerRed.isPunching && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        boxerRed.isPunching = true;
        boxerRed.punchProgress = 0;
        boxerRed.punchTimer = 0;
        boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
        boxerRed.hasHit = false; 
    }

    let calculatedImpact = 0;

    if (boxerRed.isPunching) {
        if (boxerRed.punchType === 'straight') {
            boxerRed.punchProgress += 0.155; 
        } else {
            boxerRed.punchProgress += 0.132; 
        }

        const pVal = Math.sin(boxerRed.punchProgress);
        
        // MOMENT TRAFIENIA LUB BLOKU
        if (pVal > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1; 
            const isCurrentlyBlockingGarda = window.isCurrentlyBlockingGarda || false;

            if (!isCurrentlyBlockingGarda) {
                if (boxerRed.punchRoll === 6) {
                    boxerRed.totalSixes += 1; 

                    // Wywołanie co 3 trafione szóstki (3, 6, 9, 12, 15...)
                    if (boxerRed.totalSixes % 3 === 0) {
                        // CIĄGŁE LOSOWANIE: Losujemy kategorię za każdym razem od nowa
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

            // WPŁYW KONTUZJI WARGI (Zależny od lipLevel)
            if (boxerBlue.lipLevel === 1) {
                calculatedImpact *= 0.90; 
            } else if (boxerBlue.lipLevel >= 2) {
                calculatedImpact *= 0.80; 
            }

            // WPŁYW KONTUZJI OKA (Zależny od eyeLevel)
            if (boxerBlue.eyeLevel === 1) {
                if (Math.random() < 0.10) calculatedImpact = 0;
            } else if (boxerBlue.eyeLevel >= 2) {
                if (Math.random() < 0.20) calculatedImpact = 0;
            }
        }

        if (boxerRed.punchProgress >= Math.PI) boxerRed.isPunching = false;
    }

    const dx = ringCenter - boxerRed.x, dy = ringCenter - boxerRed.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    boxerBlue.rx = ringCenter + (dx / dist) * calculatedImpact;
    boxerBlue.ry = ringCenter + (dy / dist) * calculatedImpact;
}
