// boxer-stats.js

export const ringCenter = 250;
export const baseRadius = 100;

export const strongHand = Math.random() < 0.5 ? 'left' : 'right';
export const chosenOrbitSpeed = strongHand === 'left' ? 0.023 : -0.023;

export const boxerRed = {
    angle: Math.PI / 2, 
    orbitSpeed: chosenOrbitSpeed, 
    radius: 24, 
    color: '#e74c3c', 
    number: '1',
    animTimer: 0, 
    punchTimer: 0, 
    isPunching: false, 
    punchProgress: 0, 
    punchType: 'straight',
    isMovingThisJump: false, 
    wasAboveZero: true, 
    hasHit: false, 
    x: 250, 
    y: 350,
    punchRoll: 1,
    totalSixes: 0,
    punchQueue: [],    
    punchCooldown: 0,
    hp: 100,
    currentHand: 'left',
    isChargingSuper: false,
    superChargeFrames: 0,
    superPunchTimer: 0
};

export const boxerBlue = { 
    x: ringCenter, 
    y: ringCenter, 
    radius: 24, 
    color: '#2980b9', 
    number: '2', 
    animTimer: 0, 
    rx: ringCenter, 
    ry: ringCenter, 
    stunTimer: 0,
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
