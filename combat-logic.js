import { boxerRed, boxerBlue } from './engine.js';

// Pierwszy supercios odpali się losowo w ciągu 1.5 minuty (5400 klatek przy 60 FPS)
let superPunchTimer = Math.random() * 5400; 

export function handleSuperPunch() {
    if (boxerBlue.isKnockedDown || boxerBlue.pendingKnockdown) return;

    // 1. Odliczanie do superciosu, gdy nikt aktualnie nie atakuje
    if (!boxerRed.isChargingSuper && !boxerRed.isSuperPunching && !boxerRed.isPunching) {
        superPunchTimer--;
        if (superPunchTimer <= 0) {
            boxerRed.isChargingSuper = true;
            boxerRed.superChargeProgress = 0;
        }
    }

    // 2. Trwające 3 sekundy (180 klatek) ładowanie potężnego ataku
    if (boxerRed.isChargingSuper) {
        boxerRed.superChargeProgress += 1;
        if (boxerRed.superChargeProgress >= 180) {
            boxerRed.isChargingSuper = false;
            boxerRed.isSuperPunching = true;
            boxerRed.punchProgress = 0;
            boxerRed.hasHit = false;
            boxerRed.punchType = 'hook'; // Nadpisujemy na mocny sierp
            boxerBlue.isBlockingNow = Math.random() < 0.50; // Losowanie obrony rywala
        }
    }

    // 3. Wyprowadzenie uderzenia i weryfikacja knockdownu
    if (boxerRed.isSuperPunching) {
        boxerRed.punchProgress += 0.08; // Nieco wolniejszy ruch pięści
        const pVal = Math.sin(boxerRed.punchProgress);

        if (pVal > 0.90 && !boxerRed.hasHit) {
            if (!boxerBlue.isBlockingNow) {
                // BRAK BLOKU = NATYCHMIASTOWY NOKDAUN
                boxerBlue.pendingKnockdown = true;
                boxerBlue.hp = 0;
                
                // POPRAWKA: Czyszczenie kolejek i liczników combo po udanym superciosie, aby zapobiec zielonemu kolorowi w nowej walce
                boxerRed.punchQueue = [];
                boxerRed.punchCooldown = 0;
            }
            boxerRed.hasHit = true;
        }

        if (boxerRed.punchProgress >= Math.PI) {
            boxerRed.isSuperPunching = false;
            boxerRed.punchProgress = 0;
            // Ponowne losowanie czasu do kolejnego superciosu (za około 1.5 minuty)
            superPunchTimer = 5400 + (Math.random() * 1800); 
        }
    }
}
