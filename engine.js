import { handleBotAttackDecisions, processPunchExecution } from './combat-logic.js';
export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas) { canvas.width = 500; canvas.height = 500; }
const ringCenter = 250, baseRadius = 100;      
let currentOrbitRadius = baseRadius; 

// --- PARAMETRY CZERWONEGO (Losowane niezależnie) ---
export const strongHand = Math.random() < 0.5 ? 'left' : 'right';
const chosenOrbitSpeed = strongHand === 'left' ? 0.023 : -0.023;

// --- PARAMETRY NIEBIESKIEGO (Losowane na identycznych prawach) ---
export const blueStrongHand = Math.random() < 0.5 ? 'left' : 'right';
// Niebieski losuje swój kierunek krążenia w 100% niezależnie od czerwonego (50% szans na lewo lub prawo)
const blueChosenOrbitSpeed = Math.random() < 0.5 ? 0.023 : -0.023;

export const boxerRed = {
    angle: Math.PI / 2, orbitSpeed: chosenOrbitSpeed, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350,
    punchRoll: 1, totalSixes: 0, punchQueue: [], punchCooldown: 0, hp: 100,
    isChargingSuper: false, superChargeTimer: 0, superCooldown: Math.floor(Math.random() * 5400) 
};

export const boxerBlue = { 
    angle: Math.PI, orbitSpeed: blueChosenOrbitSpeed, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0, blockCount: 0,
    isBlockingNow: false, eyeLevel: 0, lipLevel: 0, liverLevel: 0, hp: 100,
    isKnockedDown: false, pendingKnockdown: false, consecutiveBigHits: 0 
};

export function updatePhysics() {
    if (boxerBlue.isKnockedDown) {
        boxerBlue.rx += (ringCenter - boxerBlue.rx) * 0.2; boxerBlue.ry += (ringCenter - boxerBlue.ry) * 0.2; return; 
    }
    if (!boxerRed.isPunching) boxerBlue.isBlockingNow = false;
    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.80 : 1.0;
    
    if (!boxerRed.isChargingSuper) boxerRed.animTimer += 0.133;
    if (boxerRed.punchCooldown > 0) boxerRed.punchCooldown--;
    if (boxerRed.superCooldown > 0) boxerRed.superCooldown--; 
    if (!boxerRed.isPunching && boxerRed.punchQueue.length === 0 && boxerRed.punchCooldown === 0 && !boxerRed.isChargingSuper) {
        boxerRed.punchTimer += 0.66; 
    }
    
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;
    if (boxerBlue.stunTimer > 0) { boxerBlue.stunTimer -= (1 * blueSpeedModifier); if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0; }
    
    if (boxerRed.isChargingSuper) {
        boxerRed.superChargeTimer--; currentOrbitRadius += (48 - currentOrbitRadius) * 0.03; 
        if (boxerRed.superChargeTimer <= 0) {
            boxerRed.isChargingSuper = false; boxerRed.punchType = 'super'; boxerRed.isPunching = true;
            boxerRed.punchProgress = 0; boxerRed.hasHit = false;
            boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;
        }
    } else {
        let targetRadius = (boxerRed.isPunching || boxerRed.punchQueue.length > 0) ? (boxerRed.punchType === 'straight' ? 62 : 54) : baseRadius;
        currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;
    }
    
    // --- LUSTRZANY RUCH OBU STRON ---
    // Niebieski skacze i krąży na identycznych zasadach algorytmicznych co czerwony
    if (!boxerBlue.isKnockedDown && boxerBlue.stunTimer <= 0) {
        const blueSin = Math.sin(boxerBlue.animTimer);
        if (blueSin > 0 && Math.random() < 0.30) {
            boxerBlue.angle += boxerBlue.orbitSpeed * blueSin;
        }
    }
    
    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;
    
    boxerBlue.rx = ringCenter + Math.cos(boxerBlue.angle) * baseRadius;
    boxerBlue.ry = ringCenter + Math.sin(boxerBlue.angle) * baseRadius;

    const currentSin = Math.sin(boxerRed.animTimer);
    if (currentSin > 0 && !boxerRed.wasAboveZero && !boxerRed.isChargingSuper) boxerRed.isMovingThisJump = Math.random() < 0.30;
    boxerRed.wasAboveZero = (currentSin > 0);
    if (boxerRed.isMovingThisJump && currentSin > 0 && !boxerRed.isChargingSuper) boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 
    
    handleBotAttackDecisions(baseRadius); processPunchExecution();
    if (boxerBlue.pendingKnockdown) { boxerBlue.isKnockedDown = true; boxerBlue.pendingKnockdown = false; }
}
export function isBlueKnockedDown() { return boxerBlue.isKnockedDown; }
