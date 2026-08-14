export const canvas = document.getElementById('ringCanvas');
export const ctx = canvas.getContext('2d');

canvas.width = canvas.height = 500;
const ringCenter = 250, baseRadius = 100;      
let currentOrbitRadius = baseRadius; 

// LOSOWANIE MOCNIEJSZEJ RĘKI (50% szans: 'left' lub 'right')
export const strongHand = Math.random() < 0.5 ? 'left' : 'right';

// KIERUNEK RUCHU: Bokser kręci się w osi przeciwnej do swojej mocniejszej ręki.
// Jeśli mocniejsza jest lewa, orbitSpeed jest dodatni (krąży w prawo / zgodnie z zegarem).
// Jeśli mocniejsza jest prawa, orbitSpeed jest ujemny (krąży w lewo / przeciwnie do zegara).
const chosenOrbitSpeed = strongHand === 'left' ? 0.023 : -0.023;

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
    y: 350
};

export const boxerBlue = { x: ringCenter, y: ringCenter, radius: 24, color: '#2980b9', number: '2', animTimer: 0, rx: ringCenter, ry: ringCenter };

export function updatePhysics() {
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

    if (boxerRed.isMovingThisJump && currentSin > 0) {
        // Ruch wykorzystuje wyliczony wcześniej kierunek (dodatni lub ujemny)
        boxerRed.angle -= boxerRed.orbitSpeed * currentSin; 
    }

    if (!boxerRed.isPunching && boxerRed.punchTimer > 60 && Math.random() < 0.03) {
        boxerRed.isPunching = true;
        boxerRed.punchProgress = 0;
        boxerRed.punchTimer = 0;
        boxerRed.punchType = Math.random() < 0.5 ? 'straight' : 'hook';
        boxerRed.hasHit = false; 
    }

    if (boxerRed.isPunching) {
        boxerRed.punchProgress += 0.146; 
        if (boxerRed.punchProgress >= Math.PI) boxerRed.isPunching = false;
    }

    // OBLICZANIE MOCY ODEPCHNIĘCIA: Jeśli cios jest zadawany mocniejszą ręką, odepchnięcie (impactPower) jest o 10% silniejsze
    let basePower = 45;
    if (boxerRed.isPunching) {
        // Pobieramy informację o ręce z rendera przez stan globalny lub domyślny podział 70/30 (obsługiwany niżej w pętli)
        const currentHand = window.currentActivePunchHand || 'left';
        if (currentHand === strongHand) {
            basePower = 50; // Bonus +10% do siły odepchnięcia ringu dla silniejszej ręki
        }
    }

    let impactPower = (boxerRed.isPunching && Math.sin(boxerRed.punchProgress) > 0.75) ? (Math.sin(boxerRed.punchProgress) - 0.75) * basePower : 0;
    const dx = ringCenter - boxerRed.x, dy = ringCenter - boxerRed.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    boxerBlue.rx = ringCenter + (dx / dist) * impactPower;
    boxerBlue.ry = ringCenter + (dy / dist) * impactPower;
}
