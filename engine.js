export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 500;
    canvas.height = 500;
}

export const strongHand = Math.random() < 0.5 ? 'left' : 'right';

export const boxerRed = {
    x: 150, y: 250, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, punchRoll: 1, 
    totalSixes: 0, punchQueue: [], punchCooldown: 0, hp: 100,
    jumpSpeed: 4.5 // Prędkość / siła dynamicznego doskoku
};

export const boxerBlue = { 
    x: 350, y: 250, rx: 350, ry: 250, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, stunTimer: 0, blockCount: 0, isBlockingNow: false, 
    eyeLevel: 0, lipLevel: 0, liverLevel: 0, hp: 100,
    isKnockedDown: false, pendingKnockdown: false, consecutiveBigHits: 0,
    escapeAngle: 0, speed: 1.2
};

export function isBlueKnockedDown() {
    return boxerBlue.isKnockedDown;
}

export function updatePhysics() {
    if (boxerBlue.isKnockedDown) return;

    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.70 : 1.0;

    // Szybka animacja timera Czerwonego dla dynamicznych skoków
    boxerRed.animTimer += 0.133;
    boxerBlue.animTimer += 0.133 * blueSpeedModifier;

    if (boxerRed.punchCooldown > 0) boxerRed.punchCooldown--;
    if (!boxerRed.isPunching && boxerRed.punchQueue.length === 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchTimer += 0.66;
    }
    if (boxerBlue.stunTimer > 0) {
        boxerBlue.stunTimer -= blueSpeedModifier;
        if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0;
    }

    const dx = boxerBlue.x - boxerRed.x;
    const dy = boxerBlue.y - boxerRed.y;
    const distance = Math.hypot(dx, dy);

    // --- ORYGINALNA LOGIKA SKOKU CZERWONEGO (Dostosowana do pogoni) ---
    const currentSin = Math.sin(boxerRed.animTimer);
    
    // Sprawdzamy moment przejścia przez zero (początek nowego skoku)
    if (currentSin > 0 && !boxerRed.wasAboveZero) {
        // 30% szans na to, że ten konkretny skok będzie doskokiem do rywala
        boxerRed.isMovingThisJump = Math.random() < 0.30;
    }
    boxerRed.wasAboveZero = (currentSin > 0);

    // Dynamiczny skok następuje tylko w fazie dodatniej sinusa i gdy wylosowano ruch
    if (!boxerRed.isPunching && boxerRed.isMovingThisJump && currentSin > 0 && distance > 52) {
        // Czerwony gwałtownie przyśpiesza w locie w stronę Niebieskiego
        boxerRed.x += (dx / distance) * boxerRed.jumpSpeed * currentSin;
        boxerRed.y += (dy / distance) * boxerRed.jumpSpeed * currentSin;
    }

    // Niebieski krąży i ucieka powoli
    if (boxerBlue.stunTimer === 0) {
        if (Math.random() < 0.015) {
            boxerBlue.escapeAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI;
        }
        if (distance < 90) {
            boxerBlue.x += Math.cos(boxerBlue.escapeAngle) * boxerBlue.speed * blueSpeedModifier;
            boxerBlue.y += Math.sin(boxerBlue.escapeAngle) * boxerBlue.speed * blueSpeedModifier;
        }
    }

    // Granice ringu
    const padding = 75;
    boxerRed.x = Math.max(padding, Math.min(500 - padding, boxerRed.x));
    boxerRed.y = Math.max(padding, Math.min(500 - padding, boxerRed.y));
    boxerBlue.x = Math.max(padding, Math.min(500 - padding, boxerBlue.x));
    boxerBlue.y = Math.max(padding, Math.min(500 - padding, boxerBlue.y));

    boxerBlue.rx = boxerBlue.x;
    boxerBlue.ry = boxerBlue.y;

    // --- LOGIKA ATAKU ---
    if (!boxerRed.isPunching && distance <= 62) {
        let shouldPunch = false;

        if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
            boxerRed.punchType = boxerRed.punchQueue.shift();
            shouldPunch = true;
        } else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
            boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
            shouldPunch = true;

            const comboRoll = Math.random();
            if (comboRoll < 0.01) {
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
            } else if (comboRoll < 0.06) {
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
            } else if (comboRoll < 0.21) {
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
            }
        }

        if (shouldPunch) {
            boxerRed.isPunching = true;
            boxerRed.punchProgress = 0;
            boxerRed.punchTimer = 0;
            boxerRed.hasHit = false;
            boxerBlue.isBlockingNow = (boxerBlue.stunTimer > 0) ? false : Math.random() < 0.50;
        }
    }

    // --- REALIZACJA CIOSU ---
    if (boxerRed.isPunching) {
        boxerRed.punchProgress += (boxerRed.punchType === 'straight' ? 0.155 : 0.132);
        const pVal = Math.sin(boxerRed.punchProgress);

        if (pVal > 0.75 && !boxerRed.hasHit) {
            boxerRed.punchRoll = Math.floor(Math.random() * 6) + 1;

            if (!boxerBlue.isBlockingNow) {
                let dmg = boxerRed.punchType === 'hook' ? 5 : 3;
                if (boxerRed.punchRoll === 6) dmg *= 2.0;
                else if (boxerRed.punchRoll >= 3) dmg *= 1.3;

                if (boxerBlue.lipLevel === 1) dmg *= 1.10;
                else if (boxerBlue.lipLevel >= 2) dmg *= 1.20;

                boxerBlue.hp = Math.max(0, boxerBlue.hp - dmg);

                if (boxerRed.punchRoll === 6) {
                    boxerRed.totalSixes++;
                    if (boxerRed.totalSixes % 3 === 0) {
                        const opts = ["eye", "lip", "liver"];
                        const chosen = opts[Math.floor(Math.random() * opts.length)];
                        if (chosen === "eye" && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
                        if (chosen === "lip" && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
                        if (chosen === "liver" && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
                    }
                }

                if (boxerRed.punchType === 'hook' && Math.random() < 0.20) {
                    boxerBlue.stunTimer = 300;
                }
            }
            boxerRed.hasHit = true;
        }

        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isPunching = false;
            boxerRed.punchProgress = 0;
            boxerRed.punchCooldown = 12;

            if (boxerBlue.hp <= 0) {
                boxerBlue.isKnockedDown = true;
            }
        }
    }
}
