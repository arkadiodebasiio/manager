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

// boxerBlue zyskuje licznik ogłuszenia stunTimer (w klatkach)
export const boxerBlue = { 
    x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', 
    animTimer: 0, rx: ringCenter, ry: ringCenter, stunTimer: 0 
};

export function updatePhysics() {
    boxerRed.animTimer += 0.133;
    boxerRed.punchTimer += 0.66; 
    
    // Jeśli niebieski jest ogłuszony, jego własny licznik animacji (oddychania) zwalnia lub drży
    if (boxerBlue.stunTimer > 0) {
        boxerBlue.animTimer += 0.35; // Efekt szybkiego drżenia ze strachu/oszołomienia
        boxerBlue.stunTimer--; // Odliczanie 3 sekund (1 klatka = ~16.6ms)
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

    if (boxerRed.isPunching) {
        const prevProgress = boxerRed.punchProgress;
        boxerRed.punchProgress += 0.146; 

        // Wykrywanie momentu uderzenia (szczyt sinusa ciosu)
        if (Math.sin(boxerRed.punchProgress) > 0.90 && Math.sin(prevProgress) <= 0.90 && !boxerRed.hasHit) {
            // SPRAWDZANIE OGŁUSZENIA: Tylko przy sierpowym ('hook') i gdy niebieski nie zablokował (obsługiwane też w renderze)
            if (boxerRed.punchType === 'hook') {
                const isBlockedNow = window.isCurrentlyBlockingGarda || false;
                if (!isBlockedNow && Math.random() < 0.20) { // 20% szansy na czystym sierpie
                    boxerBlue.stunTimer = 180; // 180 klatek = równe 3 sekundy ogłuszenia
                }
            }
            boxerRed.hasHit = true;
        }

        if (boxerRed.punchProgress >= Math.PI) boxerRed.isPunching = false;
    }

    let basePower = boxerRed.punchType === 'hook' ? 54 : 45; 
    if (boxerRed.isPunching) {
        const currentHand = window.currentActivePunchHand || 'left';
        if (currentHand === strongHand) {
            basePower = boxerRed.punchType === 'hook' ? 60 : 50; 
        }
    }

    let impactPower = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.75) ? (Math.sin(boxerRed.punchProgress) - 0.75) * basePower : 0;
    const dx = ringCenter - boxerRed.x, dy = ringCenter - boxerRed.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    boxerBlue.rx = ringCenter + (dx / dist) * impactPower;
    boxerBlue.ry = ringCenter + (dy / dist) * impactPower;
}
