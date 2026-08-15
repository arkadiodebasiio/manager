import { boxerRed, boxerBlue, isBlueKnockedDown } from './engine.js';
let bPT = 0, bVT = 0, sA = 0, bluePunchCount = 0;

export function handleBotAttackDecisions() {
    let r = boxerRed, b = boxerBlue;
    if (!r.isPunching && !r.isChargingSuper && r.punchCooldown === 0 && r.punchTimer > 60 && Math.random() < 0.03) {
        r.punchType = Math.random() < 0.7 ? 'straight' : 'hook'; r.isPunching = true; r.punchProgress = 0; r.hasHit = false; b.isBlockingNow = Math.random() < 0.5;
    }
    if (!b.isKnockedDown && b.stunTimer <= 0 && !b.isPunching && b.punchCooldown === 0 && b.punchTimer > 60 && Math.random() < 0.03) {
        b.punchType = Math.random() < 0.7 ? 'straight' : 'hook'; b.isPunching = true; b.punchProgress = 0; b.hasHit = false;
        bluePunchCount++; b.punchRoll = bluePunchCount; r.isBlockingNow = Math.random() < 0.5;
    }
}

export function processPunchExecution() {
    let r = boxerRed, b = boxerBlue;
    // OBLICZANIE FAKTYCZNEGO DYSTANSU MIĘDZY BOKSERAMI
    const dist = Math.sqrt(Math.pow(b.x - r.x, 2) + Math.pow(b.y - r.y, 2));
    const maxReach = r.radius + b.radius + 26; // Promień ciał + stała długość ramion

    if (r.isPunching) {
        r.punchProgress += r.punchType === 'straight' ? 0.155 : 0.132;
        if (Math.sin(r.punchProgress) > 0.75 && !r.hasHit) {
            // TRAFIA TYLKO, GDY SĄ REALNIE BLISKO
            if (dist <= maxReach && !b.isBlockingNow) b.hp = Math.max(0, b.hp - (r.punchType === 'hook' ? 5 : 3));
            r.hasHit = true;
        }
        if (r.punchProgress >= Math.PI) { r.isPunching = false; r.punchCooldown = 14; r.punchTimer = 0; }
    }
    if (b.isPunching) {
        b.punchProgress += b.punchType === 'straight' ? 0.155 : 0.132;
        if (Math.sin(b.punchProgress) > 0.75 && !b.hasHit) {
            // TRAFIA TYLKO, GDY SĄ REALNIE BLISKO
            if (dist <= maxReach && !r.isBlockingNow) r.hp = Math.max(0, r.hp - (b.punchType === 'hook' ? 5 : 3));
            b.hasHit = true;
        }
        if (b.punchProgress >= Math.PI) { b.isPunching = false; b.punchCooldown = 14; b.punchTimer = 0; }
    }
}

export function drawBlueBoxer() {
    const canvas = document.getElementById('ringCanvas'); if (!canvas || !boxerBlue || !boxerRed) return;
    const ctx = canvas.getContext('2d'), down = isBlueKnockedDown();
    const angle = Math.atan2(boxerBlue.y - boxerRed.y, boxerBlue.x - boxerRed.x);
    
    ctx.save(); ctx.translate(boxerBlue.x, boxerBlue.y); ctx.rotate(angle - Math.PI / 2);
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = down ? '#abc4d6' : boxerBlue.color; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    
    let leftY = -boxerBlue.radius + 4, rightY = -boxerBlue.radius + 4, pVal = boxerBlue.isPunching ? Math.sin(boxerBlue.punchProgress) : 0;
    if (boxerBlue.isPunching) {
        // SZTYWNY, LUDZKI ZASIĘG (Zamiast gumowych rąk do celu)
        let reach = boxerBlue.punchType === 'straight' ? 26 : 18;
        if (boxerBlue.punchRoll % 2 === 0) leftY -= (pVal * reach); else rightY -= (pVal * reach);
    }
    ctx.fillStyle = boxerBlue.isBlockingNow ? '#f1c40f' : '#d35400';
    ctx.beginPath(); ctx.arc(-12, leftY, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(12, rightY, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(-(angle - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();
}
export function interruptRedSuper() {}
