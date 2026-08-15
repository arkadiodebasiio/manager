import { handleBotAttackDecisions, processPunchExecution } from './combat-logic.js';
export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas) { canvas.width = 500; canvas.height = 500; }
const ringCenter = 250, baseRadius = 100;      
export const strongHand = Math.random() < 0.5 ? 'left' : 'right';
const redDir = strongHand === 'left' ? 1 : -1;
export const blueStrongHand = Math.random() < 0.5 ? 'left' : 'right';
const blueDir = Math.random() < 0.5 ? 1 : -1;
const BASE_SPEED = 0.023;

export const boxerRed = {
    angle: Math.PI / 2, orbitSpeed: BASE_SPEED * redDir, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350,
    punchRoll: 1, totalSixes: 0, punchQueue: [], punchCooldown: 0, hp: 100, isBlockingNow: false
};
export const boxerBlue = { 
    angle: Math.PI, orbitSpeed: BASE_SPEED * blueDir, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, x: 150, y: 250, stunTimer: 0, blockCount: 0, isBlockingNow: false, eyeLevel: 0, lipLevel: 0, liverLevel: 0, hp: 100,
    isKnockedDown: false, pendingKnockdown: false, consecutiveBigHits: 0, isMovingThisJump: false, wasAboveZero: true,
    punchTimer: 0, punchCooldown: 0, punchQueue: [], isPunching: false, punchProgress: 0, punchType: 'straight', hasHit: false
};

export function updatePhysics() {
    let r = boxerRed, b = boxerBlue;
    if (b.isKnockedDown) { b.x += (ringCenter - b.x) * 0.2; b.y += (ringCenter - b.y) * 0.2; return; }
    if (!r.isPunching) b.isBlockingNow = false;
    if (!b.isPunching) r.isBlockingNow = false;
    
    r.animTimer += 0.133;
    b.animTimer += 0.133;

    if (r.punchCooldown > 0) r.punchCooldown--; 
    if (b.punchCooldown > 0) b.punchCooldown--; 
    if (b.stunTimer > 0) { b.stunTimer--; if (b.stunTimer < 0) b.stunTimer = 0; }
    
    if (!r.isPunching) r.punchTimer += 0.66;
    if (!b.isPunching && b.stunTimer <= 0) b.punchTimer += 0.66;

    const redSin = Math.sin(r.animTimer); if (redSin > 0 && !r.wasAboveZero) r.isMovingThisJump = Math.random() < 0.30; r.wasAboveZero = (redSin > 0); if (r.isMovingThisJump && redSin > 0) r.angle -= r.orbitSpeed * redSin;
    const blueSin = Math.sin(b.animTimer); if (blueSin > 0 && !b.wasAboveZero && b.stunTimer <= 0) b.isMovingThisJump = Math.random() < 0.30; b.wasAboveZero = (blueSin > 0); if (b.isMovingThisJump && blueSin > 0 && b.stunTimer <= 0) b.angle -= b.orbitSpeed * blueSin;

    // REALIZM: Obaj boksery poruszają się i skaczą wyłącznie po stałym promieniu baseRadius
    r.x = ringCenter + Math.cos(r.angle) * baseRadius; r.y = ringCenter + Math.sin(r.angle) * baseRadius;
    b.x = ringCenter + Math.cos(b.angle) * baseRadius; b.y = ringCenter + Math.sin(b.angle) * baseRadius;

    handleBotAttackDecisions(); processPunchExecution();
    if (b.pendingKnockdown) { b.isKnockedDown = true; b.pendingKnockdown = false; }
}
export function isBlueKnockedDown() { return boxerBlue.isKnockedDown; }
