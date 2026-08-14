const canvas = document.getElementById('ringCanvas');
const ctx = canvas.getContext('2d');

const ringCenter = 250, baseRadius = 100;      
let currentOrbitRadius = baseRadius; 

const boxerRed = {
    angle: Math.PI / 2, orbitSpeed: 0.023, radius: 24, color: '#e74c3c', number: '1',
    animTimer: 0, punchTimer: 0, isPunching: false, punchProgress: 0, punchType: 'straight',
    isMovingThisJump: false, wasAboveZero: true, hasHit: false, x: 250, y: 350
};

const boxerBlue = { x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', animTimer: 0, rx: ringCenter, ry: ringCenter };

const hitEvent = { shake: 0 };

function updatePhysics() {
    boxerRed.animTimer += 0.133;
    boxerRed.punchTimer += 0.66; 
    boxerBlue.animTimer += 0.133;

    let targetRadius = boxerRed.isPunching ? (boxerRed.punchType === 'straight' ? 62 : 54) : baseRadius;
    currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.16;

    boxerRed.x = ringCenter + Math.cos(boxerRed.angle) * currentOrbitRadius;
    boxerRed.y = ringCenter + Math.sin(boxerRed.angle) * currentOrbitRadius;

    const currentSin = Math.sin(boxerRed.animTimer);
    if (currentSin > 0 && !boxerRed.wasAboveZero) boxerRed.isMovingThisJump = Math.random() < 0.30;
    boxerRed.wasAboveZero = (currentSin > 0);

    if (boxerRed.isMovingThisJump && currentSin > 0) boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 

    if (!boxerRed.isPunching && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        boxerRed.isPunching = true;
        boxerRed.punchProgress = 0;
        boxerRed.punchTimer = 0;
        boxerRed.punchType = Math.random() < 0.5 ? 'straight' : 'hook';
        boxerRed.hasHit = false; 
    }

    if (boxerRed.isPunching) {
        boxerRed.punchProgress += 0.146; 
        if (Math.sin(boxerRed.punchProgress) > 0.85 && !boxerRed.hasHit) {
            hitEvent.shake = 6;
            boxerRed.hasHit = true;
        }
        if (boxerRed.punchProgress >= Math.PI) boxerRed.isPunching = false;
    }

    if (hitEvent.shake > 0) hitEvent.shake--;

    let impactPower = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.75) ? (Math.sin(boxerRed.punchProgress) - 0.75) * 45 : 0;
    const dx = ringCenter - boxerRed.x, dy = ringCenter - boxerRed.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    boxerBlue.rx = ringCenter + (dx / dist) * impactPower;
    boxerBlue.ry = ringCenter + (dy / dist) * impactPower;
}

// Udostępniamy bezpiecznie w globalnym obiekcie okna
window.GameEngine = { canvas, ctx, boxerRed, boxerBlue, hitEvent, updatePhysics };
