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
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350
};

// boxerBlue zyskuje liczniki serii ciosów, rejestr kontuzji oraz statystyki pod debuffy
export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, 
    stunTimer: 0,
    punchStreak: 0,            // Liczy ciosy z rzędu na "6" bez bloku
    injury: "none",            // Aktywna kontuzja: "none", "eye", "liver", "lip"
    blockCount: 0,             // Liczy udane bloki pod kontuzję wątroby
    fatigueMultiplier: 1.0,    // Mnożnik zmęczenia (+3% przy spuchniętej wardze)
    weakPunchChance: 0.0       // Szansa na słabszy cios (10% przy podbitym oku)
};

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

// Funkcja losująca i aplikująca jedną z trzech drobnych kontuzji
function applyMinorInjury() {
    const roll = Math.floor(Math.random() * 3) + 1; // 1, 2 lub 3
    if (roll === 1) {
        boxerBlue.injury = "eye"; // Podbite oko
        boxerBlue.weakPunchChance = 0.10; // 10% szansy na ciosy słabsze o 50%
        console.log("KONTUZJA: Podbite oko! 10% szans na ciosy o 50% słabsze.");
    } else if (roll === 2) {
        boxerBlue.injury = "liver"; // Strzał w wątrobę
        boxerBlue.blockCount = 0;
        console.log("KONTUZJA: Strzał w wątrobę! Co 10 blok przestanie działać.");
    } else if (roll === 3) {
        boxerBlue.injury = "lip"; // Spuchnięta warga
        boxerBlue.fatigueMultiplier = 1.03; // Szybsze męczenie o 3%
        console.log("KONTUZJA: Spuchnięta warga! Zawodnik męczy się o 3% szybciej.");
    }
}

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

    // Wyważony system mnożników siły z rzutu kostką
    let diceRoll = rollDice();
    let diceMultiplier = 0.5; 
    if (diceRoll >= 3 && diceRoll <= 5) {
        diceMultiplier = 0.9; 
    } else if (diceRoll === 6) {
        diceMultiplier = 1.15; 
    }

    if (boxerRed.isPunching) {
        boxerRed.punchProgress += 0.146; 

        const pVal = Math.sin(boxerRed.punchProgress);
        if (pVal > 0.75 && !boxerRed.hasHit) {
            
            // Sprawdzamy czy niebieski zablokował cios (pobrane z gardy w rendererze)
            const isBlocked = window.isCurrentlyBlockingGarda || false;

            if (isBlocked) {
                // Udany blok przerywa niebezpieczną serię celnych ciosów "na szóstce"
                boxerBlue.punchStreak = 0;
            } else {
                // Czyste trafienie: Jeśli padła "szóstka", zwiększamy licznik serii
                if (diceRoll === 6) {
                    boxerBlue.punchStreak += 1;
                    // Drugi cios z rzędu na 6 bez bloku pomiędzy nimi = drobna kontuzja
                    if (boxerBlue.punchStreak >= 2 && boxerBlue.injury === "none") {
                        applyMinorInjury();
                    }
                }

                // Logika stuna dla czystego sierpa pozostała nienaruszona
                if (boxerRed.punchType === 'hook' && boxerBlue.stunTimer === 0) {
                    if (Math.random() < 0.20) {
                        boxerBlue.stunTimer = 300; 
                    }
                }
            }
            boxerRed.hasHit = true;
        }

        if (boxerRed.punchProgress >= Math.PI) boxerRed.isPunching = false;
    }

    let basePower = (boxerRed.punchType === 'hook' ? 54 : 45) * diceMultiplier; 
    if (boxerRed.isPunching) {
        const currentHand = window.currentActivePunchHand || 'left';
        if (currentHand === strongHand) {
            basePower *= 1.1; 
        }
    }

    let impactPower = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.75) ? (Math.sin(boxerRed.punchProgress) - 0.75) * basePower : 0;
    const dx = ringCenter - boxerRed.x, dy = ringCenter - boxerRed.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    boxerBlue.rx = ringCenter + (dx / dist) * impactPower;
    boxerBlue.ry = ringCenter + (dy / dist) * impactPower;
}
