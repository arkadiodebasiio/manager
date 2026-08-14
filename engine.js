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

export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, 
    stunTimer: 0,
    punchStreak: 0,            
    injury: "none",            // "none", "eye", "liver", "lip", "double_eye", "double_liver", "double_lip", "mixed"
    blockCount: 0,             
    fatigueMultiplier: 1.0,    
    weakPunchChance: 0.0,
    liverBlockInterval: 10     // Co ile bloków siada wątroba (domyślnie 10)
};

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

// Funkcja obsługująca kumulację lub nową kontuzję
function applyMinorInjury() {
    const roll = Math.floor(Math.random() * 3) + 1; // 1: oko, 2: wątroba, 3: warga
    let newInjuryType = roll === 1 ? "eye" : (roll === 2 ? "liver" : "lip");

    if (boxerBlue.injury === "none") {
        // Pierwsza kontuzja
        boxerBlue.injury = newInjuryType;
        if (newInjuryType === "eye") {
            boxerBlue.weakPunchChance = 0.10;
        } else if (newInjuryType === "liver") {
            boxerBlue.liverBlockInterval = 10;
        } else if (newInjuryType === "lip") {
            boxerBlue.fatigueMultiplier = 1.03;
        }
        console.log("KONTUZJA: Wylosowano " + newInjuryType);
    } else if (boxerBlue.injury === newInjuryType) {
        // Druga TA SAMA kontuzja -> podwójny debuff!
        if (newInjuryType === "eye") {
            boxerBlue.injury = "double_eye";
            boxerBlue.weakPunchChance = 0.20; // 20% szans na ciosy o 50% słabsze
            console.log("PODWÓJNA KONTUZJA: Podwójnie podbite oko! Szansa na słabsze ciosy wzrosła do 20%.");
        } else if (newInjuryType === "liver") {
            boxerBlue.injury = "double_liver";
            boxerBlue.liverBlockInterval = 5; // Co 5 blok nie działa zamiast 10
            console.log("PODWÓJNA KONTUZJA: Zmasakrowana wątroba! Co 5 blok nie działa.");
        } else if (newInjuryType === "lip") {
            boxerBlue.injury = "double_lip";
            boxerBlue.fatigueMultiplier = 1.06; // Męczy się o 6% szybciej
            console.log("PODWÓJNA KONTUZJA: Mocno rozcięta warga! Zmęczenie wzrosło do 6%.");
        }
    } else {
        // Inna kontuzja niż pierwsza -> stan mieszany
        boxerBlue.injury = "mixed";
        if (newInjuryType === "eye" || boxerBlue.weakPunchChance > 0) boxerBlue.weakPunchChance = Math.max(boxerBlue.weakPunchChance, 0.10);
        if (newInjuryType === "liver" || boxerBlue.liverBlockInterval < 10) boxerBlue.liverBlockInterval = Math.min(boxerBlue.liverBlockInterval, 10);
        if (newInjuryType === "lip" || boxerBlue.fatigueMultiplier > 1.0) boxerBlue.fatigueMultiplier = Math.max(boxerBlue.fatigueMultiplier, 1.03);
        console.log("KONTUZJA: Kolejny, inny uraz! Debuffy połączone.");
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
            const isBlocked = window.isCurrentlyBlockingGarda || false;

            if (isBlocked) {
                boxerBlue.punchStreak = 0;
            } else {
                if (diceRoll === 6) {
                    boxerBlue.punchStreak += 1;
                    if (boxerBlue.punchStreak >= 2) {
                        applyMinorInjury();
                        boxerBlue.punchStreak = 0; // Reset serii po naliczeniu urazu
                    }
                }

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
