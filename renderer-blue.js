// renderer-blue.js
import { boxerRed, boxerBlue } from './boxer-stats.js';
import { isBlueKnockedDown } from './engine.js';

let blackPulseTimer = 0;
let starAngle = 0;

export function drawBlueBoxer(ctx) {
    if (!ctx || !boxerBlue || !boxerRed) return;

    const down = isBlueKnockedDown();

    if (down) {
        blackPulseTimer += 0.05;
    }

    const bounce = down ? 0 : Math.sin(boxerBlue.animTimer) * 3;
    const angleToRed = Math.atan2(boxerRed.y - boxerBlue.ry, boxerRed.x - boxerBlue.rx) + Math.PI;
    const pVal = boxerRed.isPunching ? Math.sin(boxerRed.punchProgress) : 0;
    const isStunned = boxerBlue.stunTimer > 0 && !down;
    const isBlocking = boxerBlue.isBlockingNow && !down;

    let currentColor = boxerBlue.color, gloveColor = '#d35400'; 
    if (boxerRed.isPunching && pVal > 0.85) { 
        if (isBlocking) gloveColor = '#f1c40f'; 
        else currentColor = '#ffbebe'; 
    }
    if (isStunned && currentColor === boxerBlue.color) {
        currentColor = Math.floor(boxerBlue.stunTimer / 10) % 2 === 0 ? '#1f618d' : boxerBlue.color;
    }

    if (down) {
        currentColor = '#abc4d6';
    }

    ctx.beginPath(); 
    const shadowYOffset = down ? boxerBlue.radius * 1.5 : boxerBlue.radius;
    ctx.ellipse(boxerBlue.rx, boxerBlue.ry + shadowYOffset, boxerBlue.radius - Math.abs(bounce), 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fill();
    
    ctx.save(); 
    const fallY = down ? 15 : 0;
    ctx.translate(boxerBlue.rx, boxerBlue.ry + bounce + fallY); 
    ctx.rotate(angleToRed - Math.PI / 2); 
    
    ctx.beginPath(); ctx.arc(0, 0, boxerBlue.radius, 0, Math.PI * 2); ctx.fillStyle = currentColor; ctx.fill(); 

    if (down) {
        const pulseAlpha = 0.3 + Math.abs(Math.sin(blackPulseTimer)) * 0.7; 
        ctx.lineWidth = 4; 
        ctx.strokeStyle = `rgba(0, 0, 0, ${pulseAlpha})`;
    } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff'; 
    }
    ctx.stroke();

    if (boxerBlue.eyeLevel > 0) {
        const isMax = boxerBlue.eyeLevel >= 2;
        ctx.beginPath(); ctx.arc(-7, -8, isMax ? 6.5 : 5, 0, Math.PI * 2); 
        ctx.fillStyle = isMax ? 'rgba(100, 30, 130, 0.95)' : 'rgba(125, 60, 152, 0.85)'; 
        ctx.fill();
    }
    
    if (boxerBlue.liverLevel > 0) {
        const isMax = boxerBlue.liverLevel >= 2;
        ctx.beginPath(); ctx.arc(10, 4, isMax ? 7.5 : 6, 0, Math.PI * 2); 
        ctx.fillStyle = isMax ? 'rgba(20, 120, 60, 0.95)' : 'rgba(39, 174, 96, 0.85)'; 
        ctx.fill();
    }
    
    if (boxerBlue.lipLevel > 0) {
        const isMax = boxerBlue.lipLevel >= 2;
        ctx.beginPath(); ctx.ellipse(0, -14, isMax ? 7.5 : 6, isMax ? 4 : 3, 0, 0, Math.PI * 2); 
        ctx.fillStyle = isMax ? 'rgba(150, 30, 30, 0.98)' : 'rgba(192, 57, 43, 0.95)'; 
        ctx.fill();
    }

    let leftGloveX, rightGloveX, gloveY;

    if (down) {
        leftGloveX = -boxerBlue.radius - 14;  
        rightGloveX = boxerBlue.radius + 14; 
        gloveY = 0;                          
    } else {
        leftGloveX = isBlocking ? -3 : -12;
        rightGloveX = isBlocking ? 3 : 12;
        gloveY = -boxerBlue.radius + (isStunned ? 12 : 4);
        if (isBlocking) gloveY = -boxerBlue.radius + 1;
    }

    ctx.beginPath(); ctx.moveTo(isBlocking ? -3 : -12, 0); ctx.lineTo(leftGloveX, gloveY); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(isBlocking ? 3 : 12, 0); ctx.lineTo(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2)); ctx.strokeStyle = boxerBlue.color; ctx.lineWidth = 5; ctx.stroke();

    ctx.lineWidth = down ? 3 : 2;
    ctx.strokeStyle = down ? '#000' : '#fff';

    ctx.beginPath(); ctx.arc(leftGloveX, gloveY, 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rightGloveX, gloveY + (isBlocking || down ? 0 : Math.sin(boxerBlue.animTimer * 2) * 2), 7, 0, Math.PI * 2); ctx.fillStyle = gloveColor; ctx.fill(); ctx.stroke();
    
    ctx.save(); ctx.rotate(-(angleToRed - Math.PI / 2)); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boxerBlue.number, 0, 0); ctx.restore(); ctx.restore();

    if (isStunned) {
        starAngle += 0.15; ctx.save(); ctx.translate(boxerBlue.rx, boxerBlue.ry - 38);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(Math.cos(starAngle + i * (Math.PI * 2 / 3)) * 16, Math.sin(starAngle + i * (Math.PI * 2 / 3)) * 5, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
}
