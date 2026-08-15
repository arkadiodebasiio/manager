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
    
    // PARAMETRY REAKTYWNEGO SKOKU:
    jumpSpeed: 16.5,       // Ekstremalna prędkość fazy wybicia (w przód i w tył)
    directionSign: 1,      // 1 = doskok do przodu, -1 = błyskawiczny odskok w tył
};

export const boxerBlue = { 
    x: 350, y: 250, rx: 350, ry: 250, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, stunTimer: 0, blockCount: 0, isBlockingNow: false, 
    eyeLevel: 0, lipLevel: 0, liverLevel: 0, hp: 100,
    isKnockedDown: false, pendingKnockdown: false, consecutiveBigHits: 0,
    escapeAngle: 0, speed: 2.2
};

export function isBlueKnockedDown() {
    return boxerBlue.isKnockedDown;
}

export function updatePhysics() {
    if (boxerBlue.isKnockedDown) return;

    const hasTriple = boxerBlue.eyeLevel === 3 || boxerBlue.lipLevel === 3 || boxerBlue.liverLevel === 3;
    const blueSpeedModifier = hasTriple ? 0.70 : 1.0;

    // Przyspieszony licznik animacji dla zachowania szarpanego tempa
    boxerRed.animTimer += 0.22; 
    boxerBlue.animTimer += 0.15 * blueSpeedModifier;

    if (boxerRed.punchCooldown > 0) boxerRed.punchCooldown--;
    if (!boxerRed.isPunching && boxerRed.punchQueue.length === 0 && boxerRed.punchCooldown === 0) {
        boxerRed.punchTimer += 1.2;
    }
    if (boxerBlue.stunTimer > 0) {
        boxerBlue.stunTimer -= blueSpeedModifier;
        if (boxerBlue.stunTimer < 0) boxerBlue.stunTimer = 0;
    }

    const dx = boxerBlue.x - boxerRed.x;
    const dy = boxerBlue.y - boxerRed.y;
    const distance = Math.hypot(dx, dy);

    // --- PRZEBUDOWANA MATEMATYKA BŁYSKAWICZNYCH SKOKÓW ---
    const currentSin = Math.sin(boxerRed.animTimer);
    
    // Reset i losowanie nowej fazy w punkcie zero sinusa
    if (currentSin > 0 && !boxerRed.wasAboveZero) {
        boxerRed.isMovingThisJump = Math.random() < 0.65; // Częstsze próby ataku
        
        // Decyzja: jeśli jest blisko, odskakuje. Jeśli daleko, doskakuje.
        if (distance < 70) {
            boxerRed.directionSign = -1.5; // Agresywny, ultraszybki odskok wsteczny po walce
        } else {
            boxerRed.directionSign = 1.0;  // Błyskawiczna szarża do przodu
        }
    }
    boxerRed.wasAboveZero = (currentSin > 0);

    // Wykorzystanie kwadratu sinusa gwarantuje ostry, dynamiczny start i hamowanie skoku (styl retro-zryw)
    if (!boxerRed.isPunching && boxerRed.isMovingThisJump && currentSin > 0) {
        const jumpForce = boxerRed.jumpSpeed * (currentSin * currentSin) * boxerRed.directionSign;
        
        // Wykonaj przesunięcie tylko jeśli nie spowoduje to zbytniego oddalenia przy doskoku
        if (boxerRed.directionSign < 0 || distance > 48) {
            boxerRed.x += (dx / distance) * jumpForce;
            boxerRed.y += (dy / distance) * jumpForce;
        }
    }

    // Niebieski krąży defensywnie i próbuje utrzymać dystans
    if (boxerBlue.stunTimer === 0) {
        if (Math.random() < 0.03) {
            boxerBlue.escapeAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI;
        }
        if (distance < 110) {
            boxerBlue.x += Math.cos(boxerBlue.escapeAngle) * boxerBlue.speed * blueSpeedModifier;
            boxerBlue.y += Math.sin(boxerBlue.escapeAngle) * boxerBlue.speed * blueSpeedModifier;
        }
    }

    // Sztywne granice ringu bokserskiego
    const padding = 75;
    boxerRed.x = Math.max(padding, Math.min(500 - padding, boxerRed.x));
    boxerRed.y = Math.max(padding, Math.min(500 - padding, boxerRed.y));
    boxerBlue.x = Math.max(padding, Math.min(500 - padding, boxerBlue.x));
    boxerBlue.y = Math.max(padding, Math.min(500 - padding, boxerBlue.y));

    boxerBlue.rx = boxerBlue.x;
    boxerBlue.ry = boxerBlue.y;

    // --- LOGIKA WYPROWADZANIA CIOSÓW ---
    if (!boxerRed.isPunching && distance <= 68) {
        let shouldPunch = false;

        if (boxerRed.punchQueue.length > 0 && boxerRed.punchCooldown === 0) {
            boxerRed.punchType = boxerRed.punchQueue.shift();
            shouldPunch = true;
        } else if (boxerRed.punchQueue.length === 0 && boxerRed.punchTimer > 45 && Math.random() < 0.06) {
            boxerRed.punchType = Math.random() < 0.70 ? 'straight' : 'hook';
            shouldPunch = true;

            const comboRoll = Math.random();
            if (comboRoll < 0.02) {
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
            } else if (comboRoll < 0.08) {
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
                boxerRed.punchQueue.push(Math.random() < 0.7 ? 'straight' : 'hook');
            } else if (comboRoll < 0.25) {
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

    // --- REALIZACJA HITBOXÓW ---
    if (boxerRed.isPunching) {
        boxerRed.punchProgress += (boxerRed.punchType === 'straight' ? 0.185 : 0.155);
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
            boxerRed.punchCooldown = 8; // Szybsza gotowość do następnego ataku

            if (boxerBlue.hp <= 0) {
                boxerBlue.isKnockedDown = true;
            }
        }
    }
}
