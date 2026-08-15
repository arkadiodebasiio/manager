import { canvas, ctx, updatePhysics, boxerRed, boxerBlue } from './engine.js';
import { drawBlueBoxer, drawRedBoxer, drawBlockShield } from './renderer-hands.js';

if (!window.currentActivePunchHand) {
    window.currentActivePunchHand = 'left';
}

// LOGIKA SUPERCIOSU - w 100% odseparowana od zmiennych ruchu silnika
let superTimer = Math.random() * 5400; 
let superProgress = 0;
let isSuperCharging = false;
let isSuperPunching = false;
let superHit = false;

function handleSuper() {
    if (boxerBlue.isKnockedDown || boxerBlue.pendingKnockdown) return;

    if (!isSuperCharging && !isSuperPunching && !boxerRed.isPunching) {
        superTimer--;
        if (superTimer <= 0) {
            isSuperCharging = true;
            boxerRed.isSuperCharging = true; 
            superProgress = 0;
        }
    }

    if (isSuperCharging) {
        superProgress++;
        if (superProgress >= 180) {
            isSuperCharging = false;
            boxerRed.isSuperCharging = false;
            isSuperPunching = true;
            boxerRed.isSuperPunchingAnim = true; // Bezpieczna flaga tylko dla grafiki ręki
            boxerRed.superPunchProgress = 0;    // Własny, niezależny postęp ciosu
            superHit = false;
            boxerBlue.isBlockingNow = Math.random() < 0.50; 
        }
    }

    if (isSuperPunching) {
        boxerRed.superPunchProgress += 0.132; // Prędkość uderzenia

        const pVal = Math.sin(boxerRed.superPunchProgress);
        if (pVal > 0.90 && !superHit) {
            if (!boxerBlue.isBlockingNow) {
                boxerBlue.pendingKnockdown = true;
                boxerBlue.isKnockedDown = true;
                boxerBlue.hp = 0;
            }
            superHit = true;
        }

        if (boxerRed.superPunchProgress >= Math.PI) {
            isSuperPunching = false;
            boxerRed.isSuperPunchingAnim = false;
            superTimer = 5400 + (Math.random() * 1800); 
        }
    }
}

function drawRing() {
    ctx.fillStyle = '#d4ac0d'; ctx.fillRect(50, 50, 400, 400);
    ctx.strokeStyle = '#b7950b'; ctx.lineWidth = 2;
    for (let i = 70; i < 450; i += 40) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, 450); ctx.stroke(); }
    for (let offset = 10; offset <= 30; offset += 10) {
        ctx.strokeStyle = offset === 10 ? '#fff' : (offset === 20 ? '#c0392b' : '#2980b9');
        ctx.lineWidth = 3; ctx.strokeRect(50 - offset/2, 50 - offset/2, 400 + offset, 400 + offset);
    }
    [{x: 50, y: 50, color: '#c0392b'}, {x: 450, y: 50, color: '#b91d29'}, {x: 50, y: 450, color: '#fff'}, {x: 450, y: 450, color: '#fff'}].forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fillStyle = c.color; ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    });
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRing(); 
    updatePhysics(); 
    handleSuper(); 
    drawBlueBoxer(); 
    drawRedBoxer();
    drawBlockShield(); 
    requestAnimationFrame(loop);
}

loop();
