/**
 * @fileoverview Gestion de l'état global et de la persistance localStorage
 */

export const state = {
    theme: 'dark',
    muted: false,
    name: 'NUTZ POKER',
    buyin: 20,
    duration: 15,
    level: 0,
    timeLeft: 900,
    playing: false,
    mode: 'qty',
    paidMode: 'auto',
    customPaidStr: "",
    players: [],
    structure: [],
    isPause: false,
    rebuyPrice: 20,
    tableSize: 0,
    bountyEnabled: false,
    bountyAmount: 0
};

export let clock = null;

export function setClock(value) {
    clock = value;
}

const STORAGE_KEY = 'nutz_pro_v6';

/**
 * Sauvegarde l'état dans le localStorage
 */
export function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Charge l'état depuis le localStorage
 * @returns {boolean} true si l'état a été chargé, false sinon
 */
export function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(state, loaded);
            state.playing = false; // Toujours arrêter le timer au reload
            return true;
        } catch (e) {
            console.error('Erreur chargement état:', e);
            return false;
        }
    }
    return false;
}

/**
 * Réinitialise l'état à ses valeurs par défaut
 */
export function resetState() {
    const defaultStructure = [
        '25/50', '50/100', '75/150', '100/200',
        '100/200/200', '200/400/200', '300/600/300',
        '400/800/400', '500/1000/500', '600/1200/600',
        '800/1600/800', '1000/2000/1000', '1500/3000/1500',
        '2000/4000/2000', '3000/6000/3000', '5000/10000/5000'
    ];

    Object.assign(state, {
        theme: 'dark',
        muted: false,
        name: 'NUTZ POKER',
        buyin: 20,
        duration: 15,
        level: 0,
        timeLeft: 900,
        playing: false,
        mode: 'qty',
        paidMode: 'auto',
        customPaidStr: "",
        players: [],
        structure: defaultStructure,
        isPause: false,
        rebuyPrice: 20,
        tableSize: 0,
        bountyEnabled: false,
        bountyAmount: 0
    });

    state.players.forEach(p => {
        if (p.rebuys === undefined) p.rebuys = 0;
        if (p.table === undefined) p.table = null;
        if (p.bounties === undefined) p.bounties = 0;
    });

    save();
}
