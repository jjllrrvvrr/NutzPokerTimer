/**
 * @fileoverview Gestion du son et des alertes audio
 */

import { state } from './state.js';

// Son d'alerte Among Us
const alarmSound = new Audio("https://www.myinstants.com/media/sounds/among.mp3");

/**
 * Déverrouille l'audio pour les navigateurs mobiles
 * Nécessaire car la plupart des navigateurs bloquent l'autoplay audio
 */
export function unlockAudio() {
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(() => {});
}

/**
 * Joue le son d'alerte si non muté
 */
export function playTone() {
    if (state.muted) return;
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log("Audio blocked", e));
}
