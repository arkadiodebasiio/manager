import { handleBotAttackDecisions, processPunchExecution } from './combat-logic.js';
export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas) { canvas.width = 500; canvas.height = 500; }
const ringCenter = 250, baseRadius = 100;      
let currentOrbitRadius = baseRadius; 

export const strongHand = Math.random() < 0.5 ? 'left' : 'right';
const redDir = strongHand === 'left' ? 1 : -1;

export const blueStrongHand = Math.random() < 0.5 ? 'left' : 'right';
const blueDir = Math.random() < 0.5 ? 1 : -1;

const BASE_SPEED = 0.023;

export const boxerRed = {
    angle: Math.PI / 2, orbitSpeed: BASE_SPEED * redDir, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350,
    punchRoll: 1, totalSixes: 0, punchQueue: [], punchCooldown: 0, hp: 100,
    isChargingSuper: false, superChargeTimer: 0, superCooldown: Math.floor(Math.random() * 5400) 
};

export const boxerBlue = { 
    angle: Math.PI, orbitSpeed: BASE_SPEED * blueDir, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, x: 150, y: 250, stunTimer: 0, blockCount: 0, isBlockingNow: false, eyeLevel: 0, lipLevel: 0, liverLevel: 0, hp: 100,
    isKnockedDown: false, pendingKnockdown: false, consecutiveBigHits: 0, isMovingThisJump: false, wasAboveZero: true,
    // POPRAWKA: Inicjalizacja liczników ciosów dla niebieskiego, żeby mógł atakować!
    punchTimer: 0, punchCooldown: 0, punchQueue: [], superCooldown: Math.floor(Math.random() * 5400), isPunching: false, punchProgress: 0, punchType: 'straight', hasHit: false, isChargingSuper: false, superChargeTimer: 0
};

export function updatePhysics() {
    if (boxerBlue.isKnockedDown) { boxerBlue.x += (ringCenter - boxerBlue.x) * 0.2; boxerBlue.y += (ringCenter - boxerBlue.y) * 0.2; return; }
    if (!boxerRed.isPunching) boxerBlue.isBlockingNow = false;
    if (!boxerBlue.isPunching) boxerRed.isBlockingNow = false; // Symetryczny reset bloku czerwonego
    
    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.80 : 1.0;
    
    if (!boxerRed.isChargingSuper) boxerRed.animTimer += 0.133;
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;

    // Aktualizacja liczników cooldownów obydwu graczy
    if (boxerRed.punchCooldown > 0) boxerRed.punchCooldown--; if (boxerRed.superCooldown > 0) boxerRed.superCooldown--; 
    if (boxerBlue.punchCooldown > 0) boxerBlue.punchCooldown--; if (boxerBlue.superCooldown > 0) boxerBlue.superCooldown--; 
    
    if (boxerBlue.stunTimer > 0) { boxerBlue.stunTimer -= (1 * blueSpeedModifier); if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0; }
    
    // Ładowanie superciosu czerwonego
    if (boxerRed.isChargingSuper) {
        boxerRed.superChargeTimer--; currentOrbitRadius += (48 - currentOrbitRadius) * 0.03; 
        if (boxerRed.superChargeTimer <= 0) { boxerRed.isChargingSuper = false; boxerRed.punchType = 'super'; boxerRed.isPunching = true; boxerRed.punchProgress = 0; boxerRed.hasHit = false; boxerBlue.isBlockingNow = boxerBlue.stunTimer > 0 ? false : Math.random() < 0.50; }
    } else {
        let targetRadius = (boxerRed.isPunching || boxerRed.punchQueue.length > 0) ? (boxerRed.punchType === 'straight' ? 62 : 54) : baseRadius;
        currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;
    }
    
    // Ładowanie superciosu niebieskiego
    if (boxerBlue.isChargingSuper) {
        boxerBlue.superChargeTimer--;
        if (boxerBlue.superChargeTimer <= 0) { boxerBlue.isChargingSuper = false; boxerBlue.punchType = 'super'; boxerBlue.isPunching = true; boxerBlue.punchProgress = 0; boxerBlue.hasHit = false; boxerRed.isBlockingNow = Math.random() < 0.50; }
    }
    
    // Ruch obydwu zawodników
    const redSin = Math.sin(boxerRed.animTimer); if (redSin > 0 && !boxerRed.wasAboveZero && !boxerRed.isChargingSuper) boxerRed.isMovingThisJump = Math.random() < 0.30; boxerRed.wasAboveZero = (redSin > 0); if (boxerRed.isMovingThisJump && redSin > 0 && !boxerRed.isChargingSuper) boxerRed.angle -= boxerRed.orbitSpeed * redSin;
    const blueSin = Math.sin(boxerBlue.animTimer); if (blueSin > 0 && !boxerBlue.wasAboveZero && boxerBlue.stunTimer <= 0) boxerBlue.isMovingThisJump = Math.random() < 0.30; boxerBlue.wasAboveZero = (blueSin > 0); if (boxerBlue.isMovingThisJump && blueSin > 0 && boxerBlue.stunTimer <= 0) boxerBlue.angle -= boxerBlue.orbitSpeed * blueSin;

    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;
    boxerBlue.x = ringCenter + Math.cos(boxerBlue.angle) * baseRadius;
    boxerBlue.y = ringCenter + Math.sin(boxerBlue.angle) * baseRadius;

    handleBotAttackDecisions(baseRadius); processPunchExecution();
    if (boxerBlue.pendingKnockdown) { boxerBlue.isKnockedDown = true; boxerBlue.pendingKnockdown = false; }
}
export function isBlueKnockedDown() { return boxerBlue.isKnockedDown; }
