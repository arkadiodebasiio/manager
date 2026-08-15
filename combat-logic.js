/**
 * Oblicza końcowe obrażenia na podstawie rzutu kością i ran niebieskiego boksera.
 */
export function calculateDamage(punchType, punchRoll, lipLevel) {
    let dmg = punchType === 'hook' ? 5 : 3; 
    
    if (punchRoll === 6) {
        dmg *= 2.0;       
    } else if (punchRoll >= 3) {
        dmg *= 1.3;   
    }

    if (lipLevel === 1) {
        dmg *= 1.10;
    } else if (lipLevel >= 2) {
        dmg *= 1.20;
    }

    return dmg;
}

/**
 * Losowo nakłada osłabienie (oko, warga lub wątroba) po zebraniu serii szóstek.
 */
export function applyRandomInjury(boxerBlue) {
    const options = ["eye", "lip", "liver"];
    const chosen = options[Math.floor(Math.random() * options.length)];

    if (chosen === "eye" && boxerBlue.eyeLevel < 3) boxerBlue.eyeLevel++;
    if (chosen === "lip" && boxerBlue.lipLevel < 3) boxerBlue.lipLevel++;
    if (chosen === "liver" && boxerBlue.liverLevel < 3) boxerBlue.liverLevel++;
}

