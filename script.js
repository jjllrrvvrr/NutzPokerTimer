// --- NAVIGATION MOBILE ---
function openTab(tabName, btn) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-mobile'));
    document.getElementById('tab-' + tabName).classList.add('active-mobile');
    if(btn) { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
}

// --- STATE & AUDIO ---
let state = { theme: 'dark', name: 'NUTZ POKER', buyin: 20, duration: 15, level: 0, timeLeft: 900, playing: false, mode: 'qty', paidMode: 'auto', customPaidStr: "", players: [], structure: [], isPause: false, rebuyPrice: 20, tableSize: 0, bountyEnabled: false, bountyAmount: 0, pkoEnabled: false, pkoKillerShare: 50 };
let clock = null;
let confettiIntervals = []; // Track confetti intervals pour éviter les fuites mémoire
let isToggling = false; // Flag pour éviter race condition sur toggleTimer
let bountyModalOpen = false; // Flag pour empêcher éliminations multiples

// SON AMONG US
const alarmSound = new Audio("https://www.myinstants.com/media/sounds/among.mp3");

function unlockAudio() {
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(() => {});
}

function playTone() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log("Audio blocked", e));
}

function toggleTheme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; render(); }
function toggleFS() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else if (document.exitFullscreen) document.exitFullscreen(); }

// --- EFFETS CONFETTI ---
function confettiSmall() {
    // Petit effet pour les places payées (3e, 4e, etc.)
    confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
    });
    confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
    });
}

function confettiMedium() {
    // Effet moyen pour la 2e place
    const duration = 2000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
        try {
            if (Date.now() > end) {
                clearInterval(interval);
                confettiIntervals = confettiIntervals.filter(id => id !== interval);
                return;
            }

            confetti({
                particleCount: 100,
                angle: 60,
                spread: 70,
                origin: { x: 0.3 },
                colors: ['#C0C0C0', '#E8E8E8', '#A9A9A9', '#FFD700']
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 70,
                origin: { x: 0.7 },
                colors: ['#C0C0C0', '#E8E8E8', '#A9A9A9', '#FFD700']
            });
        } catch(e) {
            console.error('[confettiMedium] Error:', e);
            clearInterval(interval);
            confettiIntervals = confettiIntervals.filter(id => id !== interval);
        }
    }, 250);
    confettiIntervals.push(interval);
}

function confettiBig(winnerName) {
    // Afficher le nom du gagnant
    if(winnerName) {
        showWinner(winnerName);
    }

    // Gros effet pour la 1ère place - PLUS INTENSE
    const duration = 5000; // Durée augmentée
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 45, // Vitesse augmentée
        spread: 360,
        ticks: 80, // Durée de vie des confettis augmentée
        zIndex: 9998,
        gravity: 0.8, // Gravité réduite pour qu'ils restent plus longtemps
        scalar: 1.2 // Taille augmentée
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
        try {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                confettiIntervals = confettiIntervals.filter(id => id !== interval);
                return;
            }

            const particleCount = 100 * (timeLeft / duration); // Plus de particules

            // Explosions depuis plusieurs points pour plus de densité
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FF4500', '#FFD700', '#FFFF00', '#FF6347']
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FF4500', '#FFD700', '#FFFF00', '#FF6347']
            }));
            confetti(Object.assign({}, defaults, {
                particleCount: particleCount * 0.5,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#FFD700', '#FFA500', '#FF4500', '#FFD700', '#FFFF00', '#FF6347']
            }));
        } catch(e) {
            console.error('[confettiBig] Error:', e);
            clearInterval(interval);
            confettiIntervals = confettiIntervals.filter(id => id !== interval);
        }
    }, 200); // Intervalle réduit pour plus de continuité
    confettiIntervals.push(interval);
}

// Fonction pour nettoyer tous les confetti intervals (évite les fuites mémoire)
function clearAllConfetti() {
    confettiIntervals.forEach(interval => clearInterval(interval));
    confettiIntervals = [];
}

function showWinner(name) {
    const overlay = document.getElementById('winner-overlay');
    const nameElement = document.getElementById('winner-name');

    nameElement.textContent = name;
    overlay.classList.add('show');

    // Fermer uniquement au clic/touch
    const closeOverlay = () => {
        overlay.classList.remove('show');
        overlay.onclick = null;
        overlay.ontouchstart = null;
    };

    overlay.onclick = closeOverlay;
    overlay.ontouchstart = closeOverlay;

    // Auto-close après 10 secondes
    setTimeout(closeOverlay, 10000);
}

function triggerAlert() {
    playTone();
    let count = 0;
    const originalTheme = state.theme;
    const flash = setInterval(() => {
        const current = document.body.getAttribute('data-theme');
        document.body.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
        count++;
        if(count > 5) { clearInterval(flash); document.body.setAttribute('data-theme', originalTheme); }
    }, 150);
}

function toggleCustomPaid() {
    const isCustom = document.getElementById('in-paid-select').value === 'custom';
    document.getElementById('in-paid-custom-str').style.display = isCustom ? 'block' : 'none';
}

function setMode(m) {
    state.mode = m;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    if(m === 'qty') document.getElementById('btn-mode-qty').classList.add('active');
    else document.getElementById('btn-mode-list').classList.add('active');
    document.getElementById('box-qty').style.display = m==='qty'?'block':'none';
    document.getElementById('box-list').style.display = m==='list'?'block':'none';
}

function toggleMultiTableInput() {
    const toggle = document.getElementById('in-multitable-toggle');
    const inputGroup = document.getElementById('multitable-input-group');
    inputGroup.style.display = toggle.checked ? 'block' : 'none';
}


function toggleBountyInput() {
    const toggle = document.getElementById('in-bounty-toggle');
    const inputGroup = document.getElementById('bounty-input-group');
    const pkoSwitchGroup = document.getElementById('pko-switch-group');
    inputGroup.style.display = toggle.checked ? 'block' : 'none';
    pkoSwitchGroup.style.display = toggle.checked ? 'flex' : 'none';
    
    // Si on désactive bounty, désactiver aussi PKO
    if (!toggle.checked) {
        document.getElementById('in-pko-toggle').checked = false;
        togglePKOInput();
    }
}

function togglePKOInput() {
    const toggle = document.getElementById('in-pko-toggle');
    const inputGroup = document.getElementById('pko-input-group');
    inputGroup.style.display = toggle.checked ? 'block' : 'none';
}

function updatePKOLabel() {
    const slider = document.getElementById('in-pko-slider');
    const label = document.getElementById('pko-value-label');
    label.textContent = slider.value + '%';
}
function toggleAntesStruct() {
    const chk = document.getElementById('in-antes-toggle');
    const txt = document.getElementById('in-blinds');
    let lines = txt.value.split('\n');
    const newLines = lines.map(line => {
        let cleanLine = line.trim();
        if(!cleanLine) return "";
        let pausePart = "";
        let blindsPart = cleanLine;
        const pIdx = cleanLine.toUpperCase().indexOf('PAUSE');
        if(pIdx !== -1) {
            blindsPart = cleanLine.substring(0, pIdx);
            if(blindsPart.endsWith('/')) blindsPart = blindsPart.slice(0, -1);
            pausePart = cleanLine.substring(pIdx);
        }

        // BUG-016 FIX: Si la ligne ne contient que PAUSE, la retourner sans modification
        if (!blindsPart.trim()) {
            return pausePart || "";
        }

        let parts = blindsPart.split('/');
        if(parts.length >= 2) {
            const sb = parts[0];
            const bb = parts[1];
            parts = chk.checked ? [sb, bb, bb] : [sb, bb];
            blindsPart = parts.join('/');
        }
        if(blindsPart && pausePart) return blindsPart + "/" + pausePart;
        if(pausePart) return pausePart;
        return blindsPart;
    });
    txt.value = newLines.join('\n');
}

function applySettings() {
    state.name = document.getElementById('in-name').value || "NUTZ POKER";
    // BUG-014 FIX: Empêcher les valeurs négatives avec Math.max(0, ...)
    state.buyin = Math.max(0, parseInt(document.getElementById('in-buy').value) || 0);
    state.rebuyPrice = Math.max(0, parseInt(document.getElementById('in-rebuy').value) || state.buyin);

    // Multi-tables : vérifier le toggle
    const multiTableEnabled = document.getElementById('in-multitable-toggle').checked;
    state.tableSize = multiTableEnabled ? Math.max(0, parseInt(document.getElementById('in-table-size').value) || 0) : 0;

    state.bountyEnabled = document.getElementById('in-bounty-toggle').checked;
    state.bountyAmount = Math.max(0, parseInt(document.getElementById('in-bounty-amount').value) || 0);
    state.pkoEnabled = document.getElementById('in-pko-toggle').checked;
    state.pkoKillerShare = Math.max(0, Math.min(100, parseInt(document.getElementById('in-pko-slider').value) || 50));

    // Validation: bounty ne peut pas dépasser le buy-in ou rebuy
    if (state.bountyEnabled) {
        if (state.bountyAmount > state.buyin) {
            showToast('⚠️ Bounty invalide', `Le bounty (${state.bountyAmount}€) ne peut pas dépasser le buy-in (${state.buyin}€)`, 5000);
            state.bountyAmount = state.buyin;
        }
        if (state.bountyAmount > state.rebuyPrice) {
            showToast('⚠️ Bounty invalide', `Le bounty (${state.bountyAmount}€) ne peut pas dépasser le rebuy (${state.rebuyPrice}€)`, 5000);
            state.bountyAmount = Math.min(state.bountyAmount, state.rebuyPrice);
        }
    }

    state.duration = Math.max(1, parseInt(document.getElementById('in-dur').value) || 15); // Minimum 1 minute
    state.paidMode = document.getElementById('in-paid-select').value;
    state.customPaidStr = document.getElementById('in-paid-custom-str').value;

    // Structure des blinds avec valeur par défaut
    const blindsValue = document.getElementById('in-blinds').value.trim();
    if (blindsValue) {
        const rawStructure = blindsValue.split('\n').filter(l => l.trim());

        // MINOR-02 FIX: Valider le format de chaque ligne
        const invalidLines = [];
        rawStructure.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed) {
                // Vérifier si c'est une pause
                if (trimmed.toUpperCase().includes('PAUSE')) {
                    return; // PAUSE est valide
                }

                // Vérifier si c'est un format de blinds valide (nombre/nombre ou nombre/nombre/nombre)
                const parts = trimmed.split('/');
                if (parts.length < 2 || parts.length > 3) {
                    invalidLines.push(`Ligne ${index + 1}: "${trimmed}"`);
                    return;
                }

                // Vérifier que chaque partie est un nombre
                const hasInvalidNumber = parts.some(p => isNaN(parseInt(p.trim())));
                if (hasInvalidNumber) {
                    invalidLines.push(`Ligne ${index + 1}: "${trimmed}"`);
                }
            }
        });

        if (invalidLines.length > 0) {
            showToast(
                '⚠️ Structure invalide',
                `Format attendu: SB/BB ou SB/BB/ANTE ou PAUSE XX<br><br>Lignes invalides:<br>${invalidLines.slice(0, 3).join('<br>')}${invalidLines.length > 3 ? '<br>...' : ''}`,
                8000
            );
            return; // Ne pas appliquer les settings
        }

        state.structure = rawStructure;
    } else {
        // Structure par défaut si le champ est vide
        state.structure = [
            '25/50',
            '50/100',
            '75/150',
            '100/200',
            '200/400/200',
            '300/600/300',
            '400/800/400',
            '500/1000/500',
            '600/1200/600',
            '800/1600/800',
            '1000/2000/1000',
            '1500/3000/1500',
            '2000/4000/2000',
            '3000/6000/3000',
            '5000/10000/5000'
        ];
    }

    if (state.mode === 'qty') {
        let count = Math.max(0, parseInt(document.getElementById('in-qty').value) || 0);
        if(state.players.length !== count) {
             state.players = Array.from({length: count}, (_, i) => ({ name: `Joueur ${i+1}`, out: false, rank: null, rebuys: 0, table: null, bounties: 0 }));
        } else {
            // Garder les joueurs existants mais s'assurer qu'ils ont les propriétés nécessaires
            state.players.forEach(p => {
                if(p.rebuys === undefined) p.rebuys = 0;
                if(p.table === undefined) p.table = null;
                if(p.bounties === undefined) p.bounties = 0;
            });
        }
    } else {
        // BUG-026 FIX: Split seulement sur \n pour permettre les noms avec virgules
        state.players = document.getElementById('in-players').value.split(/\n+/).map(n => ({name: n.trim(), out: false, rank: null, rebuys: 0, table: null, bounties: 0})).filter(p => p.name);
    }

    // BUG-015 FIX: Vérifier qu'il y a au moins 1 joueur
    if (state.players.length === 0) {
        showToast('⚠️ Aucun joueur', 'Vous devez ajouter au moins 1 joueur pour démarrer le tournoi', 5000);
        return;
    }

    // Assigner les tables si multi-tables activé
    assignTables();

    state.timeLeft = state.duration * 60;
    state.playing = false;
    clearInterval(clock);
    save(); render(); closeSettings();
}

function getPayouts() {
    // Edge cases
    if (state.players.length === 0) return [];
    const activePlayers = state.players.filter(p => !p.out);
    if (activePlayers.length === 0) return [];

    // Calcul du pot : buy-ins + rebuys
    // Si bounty activé, retirer la partie bounty du prize pool
    const buyinPrizePool = state.bountyEnabled ? (state.buyin - state.bountyAmount) : state.buyin;
    const rebuyPrizePool = state.bountyEnabled ? (state.rebuyPrice - state.bountyAmount) : state.rebuyPrice;

    const totalBuyins = state.players.length * buyinPrizePool;
    const totalRebuys = state.players.reduce((sum, p) => sum + (p.rebuys || 0) * rebuyPrizePool, 0);
    const pot = totalBuyins + totalRebuys;
    if(pot <= 0) return [];

    let weights = [];

    if(state.paidMode === 'custom') {
        // Parse format "50/30/20" ou "25/10/5"
        weights = state.customPaidStr.split(/\/|;|\,| /).map(s => parseFloat(s)).filter(n => !isNaN(n) && n > 0);
        if(weights.length === 0) weights = [1];
    } else {
        let nPaid;
        if(state.paidMode === 'auto') {
            const n = state.players.length;
            nPaid = n>40?10 : n>20?7 : n>10?5 : n>5?3 : 2;
        } else {
            nPaid = parseInt(state.paidMode);
        }
        if(nPaid > state.players.length) nPaid = state.players.length;
        if(nPaid === 0) nPaid = 1; // Au moins 1 place payée

        if(nPaid === 1) weights = [100];
        else if(nPaid === 2) weights = [65, 35];
        else if(nPaid === 3) weights = [50, 30, 20];
        else if(nPaid === 4) weights = [45, 25, 20, 10];
        else {
            for(let i=0; i<nPaid; i++) weights.push(100/Math.pow(1.5, i));
        }
    }

    const totalWeight = weights.reduce((a,b) => a+b, 0);

    // Protection contre division par zéro (répartition invalide)
    if (totalWeight === 0) return [];

    // Si le pot est petit (<100€), on arrondit à 1€ près. Sinon à 5€.
    let step = (pot < 100) ? 1 : 5;

    let rawPayouts = weights.map(w => (w / totalWeight) * pot);
    let payouts = rawPayouts.map(r => Math.max(step, Math.round(r / step) * step));

    let currentSum = payouts.reduce((a,b) => a+b, 0);
    let diff = pot - currentSum;

    // Ajustement pour correspondre pile au pot
    if(diff !== 0) {
        if(diff > 0) payouts[0] += diff; // On ajoute le reste au 1er
        else {
            // On retire le trop perçu au dernier, puis avant-dernier, etc.
            let idx = payouts.length - 1;
            let iterations = 0;
            const maxIterations = 1000; // Limite de sécurité
            while(diff < 0 && idx >= 0 && iterations < maxIterations) {
                 iterations++;
                 payouts[idx] -= step;
                 diff += step;
                 if(payouts[idx] < step) {
                     payouts[idx] = step;
                     diff -= step;
                     idx--;
                 }
            }
            // Si on ne peut toujours pas répartir, ajuster le premier
            if(diff < 0) {
                payouts[0] = Math.max(step, payouts[0] + diff);
            }
        }
    }

    // Lissage final : s'assurer que P(n) >= P(n+1)
    for(let i=0; i<payouts.length-1; i++) {
        if(payouts[i] < payouts[i+1]) {
            // Si le 2e gagne plus que le 1er (rare mais possible avec arrondi), on swap
            let total = payouts[i] + payouts[i+1];
            payouts[i] = Math.ceil(total/2/step)*step;
            payouts[i+1] = total - payouts[i];
        }
    }

    return payouts.map((val, i) => ({ label: (i+1) + (i===0?'er':'e'), val: val })).filter(p => p.val > 0);
}

function render() {
    document.body.setAttribute('data-theme', state.theme);
    document.getElementById('ui-tourney-name').innerText = state.name.toUpperCase();

    const m = Math.floor(state.timeLeft / 60); const s = state.timeLeft % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;

    const line = state.structure[state.level] || "FIN";

    let blindsText = "PAUSE";
    if(!state.isPause) {
        let parts = line.split('/');
        parts = parts.filter(p => !p.toUpperCase().includes('PAUSE'));
        if(parts.length === 3) blindsText = `${parts[0]} / ${parts[1]} (${parts[2]})`;
        else blindsText = parts.join(' / ');
    }
    document.getElementById('ui-blinds').innerText = blindsText;
    document.getElementById('ui-level-num').innerText = `Niveau ${state.level + 1}`;

    const nextL = state.structure[state.level + 1];
    let nextText = "—";
    if(nextL) {
        if(nextL.toUpperCase().includes("PAUSE")) nextText = "PAUSE";
        else {
            let np = nextL.split('/');
            np = np.filter(p => !p.toUpperCase().includes('PAUSE'));
            nextText = np.length===3 ? `${np[0]}/${np[1]}(${np[2]})` : np.join('/');
        }
    }
    document.getElementById('ui-next').innerText = "Suivant: " + nextText;
    document.getElementById('ui-pause-notif').style.display = state.isPause ? "block" : "none";

    const listUI = document.getElementById('ui-player-list');
    const fragment = document.createDocumentFragment();

    // Trier les joueurs : actifs d'abord (par table si multi-tables), puis éliminés
    const sortedPlayers = [...state.players].sort((a, b) => {
        // Éliminés à la fin
        if (a.out !== b.out) return a.out ? 1 : -1;

        // Si multi-tables activé, trier par numéro de table
        if (state.tableSize > 0 && !a.out && !b.out) {
            if (a.table !== b.table) return (a.table || 0) - (b.table || 0);
        }

        // Sinon, ordre d'origine
        return 0;
    });

    let currentTable = null;
    sortedPlayers.forEach((p) => {
        const idx = state.players.indexOf(p);
        const rebuyBadge = (p.rebuys || 0) > 0 ? `<span class="rebuy-badge">+${p.rebuys}</span>` : '';

        // Badge bounty (si bounty activé et joueur a des bounties)
        let bountyBadge = '';
        if (state.bountyEnabled) {
            if (state.pkoEnabled) {
                // Mode PKO : afficher les deux valeurs séparées
                const earned = p.bountiesEarned || 0;
                const onHead = p.bountiesOnHead || 0;
                if (earned > 0 || onHead > 0) {
                    bountyBadge = `<span class="bounty-badge" title="Gagné: ${earned}€ | Sur la tête: ${onHead}€">💵${earned}€ 🎯${onHead}€</span>`;
                }
            } else {
                // Mode classique : afficher le nombre
                if ((p.bounties || 0) > 0) {
                    bountyBadge = `<span class="bounty-badge">🎯${p.bounties}</span>`;
                }
            }
        }

        // Afficher séparateur de table si nécessaire
        if (state.tableSize > 0 && !p.out && p.table !== currentTable) {
            if (currentTable !== null) {
                const separator = document.createElement('div');
                separator.className = 'table-separator';
                fragment.appendChild(separator);
            }
            // Compter les joueurs de cette table
            const tablePlayerCount = sortedPlayers.filter(pl => !pl.out && pl.table === p.table).length;

            const tableHeader = document.createElement('div');
            tableHeader.className = 'table-header';
            tableHeader.innerHTML = `
                <span class="table-header-text">Table ${p.table}</span>
                <span class="table-header-count">${tablePlayerCount} joueur${tablePlayerCount > 1 ? 's' : ''}</span>`;
            fragment.appendChild(tableHeader);
            currentTable = p.table;
        }

        // Bouton d'élimination rapide (uniquement pour les joueurs actifs)
        const eliminateBtn = !p.out
            ? `<span class="eliminate-btn" onclick="event.stopPropagation(); toggleOut(${idx});" title="Éliminer">✕</span>`
            : '';

        const playerRow = document.createElement('div');
        playerRow.className = `player-row ${p.out ? 'out' : ''}`;
        playerRow.onclick = (e) => showPlayerMenu(e, idx);
        playerRow.innerHTML = `
            <span>${p.name} ${rebuyBadge} ${bountyBadge} ${p.rank ? `<span class="rank-tag">${p.rank}e</span>` : ''}</span>
            <span>${p.out ? 'OUT' : eliminateBtn}</span>`;
        fragment.appendChild(playerRow);
    });

    listUI.innerHTML = "";
    listUI.appendChild(fragment);
    document.getElementById('ui-count').innerText = state.players.filter(p => !p.out).length + '/' + state.players.length;

    // Calcul du pot total avec rebuys
    const totalBuyins = state.players.length * state.buyin;
    const totalRebuys = state.players.reduce((sum, p) => sum + (p.rebuys || 0) * state.rebuyPrice, 0);
    const grandTotal = totalBuyins + totalRebuys;

    // Si bounty activé, afficher le prize pool (sans bounties)
    if (state.bountyEnabled) {
        const buyinPrizePool = state.buyin - state.bountyAmount;
        const rebuyPrizePool = state.rebuyPrice - state.bountyAmount;
        const prizePoolTotal = state.players.length * buyinPrizePool + state.players.reduce((sum, p) => sum + (p.rebuys || 0) * rebuyPrizePool, 0);
        const bountyTotal = grandTotal - prizePoolTotal;
        document.getElementById('ui-total-pot').innerText = prizePoolTotal + '€ prix + ' + bountyTotal + '€ bounties';
    } else {
        document.getElementById('ui-total-pot').innerText = grandTotal;
    }

    const payUI = document.getElementById('ui-payouts');
    const payoutFragment = document.createDocumentFragment();
    getPayouts().forEach(p => {
        const row = document.createElement('div');
        row.className = 'row';
        row.style.cursor = 'default';
        row.innerHTML = `<span>${p.label}</span><span>${p.val}€</span>`;
        payoutFragment.appendChild(row);
    });
    payUI.innerHTML = "";
    payUI.appendChild(payoutFragment);

    const playBtn = document.getElementById('play-btn');
    playBtn.innerText = state.playing ? "PAUSE" : "DÉMARRER";
    playBtn.style.background = state.playing ? "var(--btn)" : "var(--accent)";
    playBtn.style.color = state.playing ? "var(--accent)" : "var(--bg)";

    document.getElementById('theme-icon').innerHTML = state.theme === 'dark' ?
        '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' :
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

    // Désactiver le bouton précédent si on est au niveau 0
    const prevBtn = document.getElementById('prev-level-btn');
    const nextBtn = document.getElementById('next-level-btn');
    if (prevBtn) prevBtn.disabled = state.level === 0;
    if (nextBtn) nextBtn.disabled = state.level >= state.structure.length;
}

// Update rapide du timer sans re-render complet
function updateTimer() {
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
}

function toggleTimer() {
    // Protection contre les clics multiples rapides
    if (isToggling) return;
    isToggling = true;

    unlockAudio();

    // TOUJOURS nettoyer l'interval existant d'abord (évite les race conditions)
    if (clock) {
        clearInterval(clock);
        clock = null;
    }

    if(state.playing) {
        // Arrêter le timer
        state.playing = false;
    } else {
        // Démarrer le timer
        state.playing = true;
        clock = setInterval(() => {
            state.timeLeft--;
            if(state.timeLeft < 0) handleLevelEnd();
            else updateTimer();
        }, 1000);
    }
    render();

    // Réactiver après un court délai
    setTimeout(() => { isToggling = false; }, 100);
}

// --- GÉNÉRATION AUTOMATIQUE DES BLINDS ---
let lastGenerationLevel = -1; // Pour éviter de générer plusieurs fois

function generateNextBlinds() {
    // BUG-021 FIX: Vérifier que structure existe
    if (!state.structure || !Array.isArray(state.structure)) return;

    // Éviter de générer plusieurs fois pour le même niveau
    if (lastGenerationLevel === state.level) return;
    lastGenerationLevel = state.level;

    // Filtrer les niveaux de blinds (sans les pauses)
    const blindLevels = state.structure.filter(l => !l.toUpperCase().includes('PAUSE'));

    // Protection: s'assurer qu'il y a au moins 2 niveaux pour détecter un pattern
    if (blindLevels.length === 0 || blindLevels.length < 2) return;

    // Analyser les derniers niveaux pour détecter le pattern
    const lastLevel = blindLevels[blindLevels.length - 1];
    const secondLastLevel = blindLevels[blindLevels.length - 2];

    // Parser le dernier niveau
    const parseBlinds = (str) => {
        // BUG-019 FIX: Valider que parseInt() ne retourne pas NaN
        const parts = str.split('/').map(p => {
            const val = parseInt(p.trim());
            return isNaN(val) ? 0 : val;
        });
        return {
            sb: parts[0] || 0,
            bb: parts[1] || 0,
            ante: parts[2] || 0
        };
    };

    const last = parseBlinds(lastLevel);
    const secondLast = parseBlinds(secondLastLevel);

    // Calculer le ratio de progression (typiquement entre 1.5 et 2)
    const ratio = last.bb / secondLast.bb;
    const hasAntes = last.ante > 0;

    // Générer 5 nouveaux niveaux
    const newLevels = [];
    let currentSB = last.sb;
    let currentBB = last.bb;
    let currentAnte = last.ante;

    for (let i = 0; i < 5; i++) {
        // Appliquer le ratio et arrondir intelligemment
        currentBB = Math.ceil(currentBB * ratio);
        currentSB = Math.ceil(currentBB / 2);

        // Arrondir aux valeurs "propres" (multiples de 100, 500, 1000, etc.)
        if (currentBB >= 10000) {
            currentBB = Math.round(currentBB / 1000) * 1000;
            currentSB = Math.round(currentSB / 1000) * 1000;
        } else if (currentBB >= 1000) {
            currentBB = Math.round(currentBB / 100) * 100;
            currentSB = Math.round(currentSB / 100) * 100;
        } else if (currentBB >= 100) {
            currentBB = Math.round(currentBB / 25) * 25;
            currentSB = Math.round(currentSB / 25) * 25;
        }

        if (hasAntes) {
            currentAnte = currentBB; // Ante = BB
            newLevels.push(`${currentSB}/${currentBB}/${currentAnte}`);
        } else {
            newLevels.push(`${currentSB}/${currentBB}`);
        }
    }

    // Ajouter les nouveaux niveaux à la structure
    state.structure.push(...newLevels);
    save();

    // Notifier l'utilisateur
    showToast(
        `📈 Blinds générées automatiquement`,
        `5 nouveaux niveaux ajoutés automatiquement pour continuer le tournoi`,
        5000
    );
}

function handleLevelEnd() {
    // BUG-021 FIX: Vérifier que structure existe
    if (!state.structure || !Array.isArray(state.structure) || state.structure.length === 0) {
        clearInterval(clock);
        state.playing = false;
        render();
        return;
    }

    triggerAlert();

    // Protection: si on a dépassé la structure, arrêter le timer
    if (state.level >= state.structure.length) {
        clearInterval(clock);
        state.playing = false;
        render();
        return;
    }

    const line = state.structure[state.level] || "";
    if(!state.isPause && line.toUpperCase().includes("PAUSE")) {
        state.isPause = true;
        // Parser la durée avec regex (plus robuste)
        const pauseMatch = line.toUpperCase().match(/PAUSE\s*(\d+)/);
        const pauseDuration = pauseMatch ? parseInt(pauseMatch[1]) : 5;
        state.timeLeft = pauseDuration * 60;
    } else {
        state.isPause = false; state.level++; state.timeLeft = state.duration * 60;

        // Générer automatiquement de nouveaux niveaux si on approche de la fin
        if(state.level >= state.structure.length - 2) {
            generateNextBlinds();
        }

        if(state.level >= state.structure.length) { clearInterval(clock); state.playing = false; }
    }
    render();
}
function changeLvl(dir) {
    // BUG-021 FIX: Vérifier que structure existe
    if (!state.structure || !Array.isArray(state.structure) || state.structure.length === 0) {
        return;
    }

    unlockAudio();
    state.level = Math.max(0, Math.min(state.structure.length - 1, state.level + dir));

    // BUG-012 FIX: Réinitialiser le flag de génération lors d'un changement manuel
    // pour permettre la génération si on revient à ce niveau plus tard
    if (dir !== 0) {
        lastGenerationLevel = -1;
    }

    if(dir > 0) {
        triggerAlert();

        // Générer automatiquement de nouveaux niveaux si on approche de la fin
        if(state.level >= state.structure.length - 2) {
            generateNextBlinds();
        }
    }
    state.isPause = false; state.timeLeft = state.duration * 60; render();
}
// --- NOTIFICATIONS TOAST ---
let toastTimeout = null;

function showToast(title, content, duration = 8000) {
    const toast = document.getElementById('toast-notification');
    const toastTitle = document.getElementById('toast-title');
    const toastContent = document.getElementById('toast-content');

    // BUG-022 FIX: Si une toast est déjà visible, la retirer brièvement pour réinitialiser l'animation
    if (toast.classList.contains('show')) {
        toast.classList.remove('show');
        // Petit délai pour forcer le reflow et redéclencher l'animation
        setTimeout(() => {
            toastTitle.textContent = title;
            toastContent.innerHTML = content + '<div class="toast-dismiss-hint">Cliquez pour fermer</div>';
            toast.classList.add('show');
        }, 50);
    } else {
        toastTitle.textContent = title;
        toastContent.innerHTML = content + '<div class="toast-dismiss-hint">Cliquez pour fermer</div>';
        toast.classList.add('show');
    }

    // Fermer au clic
    toast.onclick = () => {
        toast.classList.remove('show');
        if (toastTimeout) clearTimeout(toastTimeout);
    };

    // Auto-fermer après la durée
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// --- GESTION DES TABLES ---
function assignTables() {
    if (!state.tableSize || state.tableSize <= 0) {
        // Pas de multi-tables, retirer les assignations
        state.players.forEach(p => p.table = null);
        return;
    }

    const activePlayers = state.players.filter(p => !p.out);

    if (activePlayers.length === 0) return;

    // Vérifier si des tables sont déjà assignées (ne pas ré-assigner si déjà fait)
    const hasExistingTables = activePlayers.some(p => p.table !== null && p.table !== undefined);
    if (hasExistingTables) return; // Les tables sont déjà assignées, ne pas re-mélanger

    // Calculer le nombre de tables nécessaires
    const numTables = Math.ceil(activePlayers.length / state.tableSize);

    // Mélanger les joueurs actifs aléatoirement (seulement à la première assignation)
    const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);

    // Assigner les tables de manière équilibrée
    shuffled.forEach((player, idx) => {
        player.table = (idx % numTables) + 1;
    });

    // Les joueurs éliminés n'ont pas de table
    state.players.filter(p => p.out).forEach(p => p.table = null);

    // Notification de l'assignation initiale
    if (numTables > 1) {
        const tableStats = {};
        activePlayers.forEach(p => {
            if (!tableStats[p.table]) tableStats[p.table] = 0;
            tableStats[p.table]++;
        });
        let content = '';
        Object.keys(tableStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(table => {
            content += `Table ${table} : <span class="player-change">${tableStats[table]} joueurs</span><br>`;
        });
        showToast(`🎲 Tables assignées aléatoirement`, content, 10000);
    }
}

function rebalanceTables() {
    if (!state.tableSize || state.tableSize <= 0) return;

    const activePlayers = state.players.filter(p => !p.out);
    if (activePlayers.length === 0) return;

    // Calculer le nombre de tables nécessaires
    const numTables = Math.ceil(activePlayers.length / state.tableSize);

    // Si une seule table, tout le monde va à la table 1
    if (numTables === 1) {
        activePlayers.forEach(p => p.table = 1);
        return;
    }

    // Regrouper les joueurs par table
    const tableGroups = {};
    for (let i = 1; i <= numTables; i++) {
        tableGroups[i] = [];
    }

    activePlayers.forEach(p => {
        if (!p.table || p.table > numTables) p.table = 1;
        if (!tableGroups[p.table]) tableGroups[p.table] = [];
        tableGroups[p.table].push(p);
    });

    // Calculer la répartition idéale
    const idealMin = Math.floor(activePlayers.length / numTables);
    const idealMax = Math.ceil(activePlayers.length / numTables);

    // Calculer le déséquilibre
    const tableCounts = Object.keys(tableGroups).map(t => tableGroups[t].length);
    const maxPlayers = Math.max(...tableCounts);
    const minPlayers = Math.min(...tableCounts);
    const imbalance = maxPlayers - minPlayers;

    // TOLÉRANCE : Ne rééquilibrer que si la différence est >= 3 joueurs
    if (imbalance < 3) {
        return;
    }

    // Sauvegarder les tables actuelles pour détecter les changements
    const oldTables = {};
    activePlayers.forEach(p => {
        oldTables[p.name] = p.table;
    });

    // Algorithme de déplacement minimal
    const changes = [];
    const movedPlayers = new Set(); // BUG-013 FIX: Suivre les joueurs déjà déplacés

    // Boucle jusqu'à équilibre (avec limite de sécurité)
    let iterations = 0;
    const maxIterations = 100;

    while (iterations < maxIterations) {
        iterations++;

        // Identifier les tables avec trop/pas assez de joueurs
        let needsRebalance = false;
        let sourceTable = null;
        let targetTable = null;

        for (let tableNum = 1; tableNum <= numTables; tableNum++) {
            const count = tableGroups[tableNum].length;

            // Table surchargée (au-dessus de idealMax)
            if (count > idealMax && !sourceTable) {
                sourceTable = tableNum;
            }

            // Table sous-chargée (en-dessous de idealMin)
            if (count < idealMin && !targetTable) {
                targetTable = tableNum;
            }
        }

        // Si on a trouvé une source et une cible, déplacer un joueur
        if (sourceTable && targetTable) {
            // BUG-013 FIX: Trouver un joueur qui n'a pas encore été déplacé
            const availablePlayers = tableGroups[sourceTable].filter(p => !movedPlayers.has(p.name));

            if (availablePlayers.length > 0) {
                // Déplacer le dernier joueur non-encore-déplacé
                const player = availablePlayers[availablePlayers.length - 1];

                // Retirer le joueur de la table source
                const indexInSource = tableGroups[sourceTable].indexOf(player);
                tableGroups[sourceTable].splice(indexInSource, 1);

                // Ajouter à la table cible
                player.table = targetTable;
                tableGroups[targetTable].push(player);
                movedPlayers.add(player.name);

                if (oldTables[player.name] !== player.table) {
                    changes.push({ name: player.name, from: oldTables[player.name], to: player.table });
                }

                needsRebalance = true;
            }
        }

        // Si aucun déplacement nécessaire, on arrête
        if (!needsRebalance) {
            break;
        }
    }

    // Log si on a atteint la limite (debug)
    if (iterations >= maxIterations) {
        console.warn('[rebalanceTables] Limite d\'itérations atteinte, l\'équilibre parfait n\'a peut-être pas été atteint');
    }

    // Afficher les changements
    if (changes.length > 0) {
        let content = '';
        changes.forEach(change => {
            content += `<span class="player-change">${change.name}</span> : T${change.from} → T${change.to}<br>`;
        });
        showToast(`🔄 Rééquilibrage (${changes.length})`, content, 10000);
    }
}

function getTableStats() {
    if (!state.tableSize || state.tableSize <= 0) return null;

    const activePlayers = state.players.filter(p => !p.out);
    const tables = {};

    activePlayers.forEach(p => {
        if (!tables[p.table]) tables[p.table] = 0;
        tables[p.table]++;
    });

    return tables;
}

// --- MENU CONTEXTUEL JOUEUR ---
function showPlayerMenu(event, playerIndex) {
    event.stopPropagation();
    const menu = document.getElementById('player-context-menu');
    const player = state.players[playerIndex];

    // Construire le menu
    let menuHTML = '';

    // Option : Marquer OUT / Réactiver
    if (!player.out) {
        menuHTML += `<div class="context-menu-item danger" onclick="toggleOut(${playerIndex}); hidePlayerMenu();"><span class="icon">❌</span> Marquer OUT</div>`;
    } else {
        menuHTML += `<div class="context-menu-item" onclick="toggleOut(${playerIndex}); hidePlayerMenu();"><span class="icon">✓</span> Réactiver</div>`;
    }

    menuHTML += `<div class="context-menu-divider"></div>`;

    // Option : Éditer nom
    menuHTML += `<div class="context-menu-item" onclick="editPlayerName(${playerIndex}); hidePlayerMenu();"><span class="icon">✏️</span> Modifier le nom</div>`;

    // Options Rebuy (uniquement si pas OUT)
    if (!player.out) {
        menuHTML += `<div class="context-menu-divider"></div>`;
        menuHTML += `<div class="context-menu-item" onclick="addRebuy(${playerIndex}); hidePlayerMenu();"><span class="icon">➕</span> Ajouter rebuy</div>`;
        if ((player.rebuys || 0) > 0) {
            menuHTML += `<div class="context-menu-item" onclick="removeRebuy(${playerIndex}); hidePlayerMenu();"><span class="icon">➖</span> Retirer rebuy</div>`;
        }

        // Option changement de table si multi-tables activé
        if (state.tableSize > 0) {
            menuHTML += `<div class="context-menu-divider"></div>`;
            menuHTML += `<div class="context-menu-item" onclick="changePlayerTable(${playerIndex}); hidePlayerMenu();"><span class="icon">🔄</span> Changer de table</div>`;
        }
    }

    menu.innerHTML = menuHTML;

    // Positionner le menu
    const x = event.clientX || event.touches?.[0]?.clientX || 0;
    const y = event.clientY || event.touches?.[0]?.clientY || 0;

    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('show');

    // Ajuster la position si le menu sort de l'écran
    setTimeout(() => {
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
    }, 0);
}

function hidePlayerMenu() {
    const menu = document.getElementById('player-context-menu');
    menu.classList.remove('show');
}

// Fermer le menu en cliquant ailleurs
document.addEventListener('click', (e) => {
    const menu = document.getElementById('player-context-menu');
    if (menu && !menu.contains(e.target)) {
        hidePlayerMenu();
    }
});

// --- GESTION DES JOUEURS ---
function editPlayerName(i) {
    const player = state.players[i];
    const newName = prompt(`Modifier le nom du joueur :`, player.name);
    if(newName && newName.trim()) {
        player.name = newName.trim();
        save();
        render();
    }
}

function addRebuy(i) {
    const player = state.players[i];
    if(player.rebuys === undefined) player.rebuys = 0;

    // BUG-018 FIX: Limite de 10 rebuys par joueur
    const MAX_REBUYS = 10;
    if (player.rebuys >= MAX_REBUYS) {
        showToast('⚠️ Limite atteinte', `Le joueur ${player.name} a déjà atteint la limite de ${MAX_REBUYS} rebuys`, 3000);
        return;
    }

    player.rebuys++;
    save();
    render();
}

function removeRebuy(i) {
    const player = state.players[i];
    if(player.rebuys > 0) {
        player.rebuys--;
        save();
        render();
    }
}

function changePlayerTable(i) {
    if (!state.tableSize || state.tableSize <= 0) {
        // MINOR-04 FIX: Utiliser toast au lieu d'alert
        showToast('⚠️ Multi-tables désactivé', "Le mode multi-tables n'est pas activé.", 3000);
        return;
    }

    const player = state.players[i];
    if (player.out) {
        showToast('⚠️ Joueur éliminé', "Impossible de changer la table d'un joueur éliminé.", 3000);
        return;
    }

    const activePlayers = state.players.filter(p => !p.out);
    const numTables = Math.ceil(activePlayers.length / state.tableSize);
    const oldTable = player.table;

    const newTable = prompt(`Changer la table de ${player.name}\n(Tables disponibles: 1 à ${numTables})`, player.table || 1);

    if (newTable !== null) {
        const tableNum = parseInt(newTable);
        if (tableNum > 0 && tableNum <= numTables) {
            if (tableNum !== oldTable) {
                player.table = tableNum;
                showToast(`✋ Changement manuel`, `<span class="player-change">${player.name}</span> : T${oldTable} → T${tableNum}`, 6000);

                // BUG-025 FIX: Rééquilibrer les tables après un changement manuel
                rebalanceTables();

                save();
                render();
            }
        } else {
            showToast('⚠️ Table invalide', `Numéro de table invalide. Doit être entre 1 et ${numTables}.`, 3000);
        }
    }
}

// --- BOUNTY MODAL ---
let bountyModalData = { eliminatedPlayerIndex: -1, eliminatedPlayerTable: null };

function showBountyModal(eliminatedPlayerIndex, eliminatedPlayerTable) {
    bountyModalOpen = true; // Empêcher d'autres éliminations pendant la modal

    // Sauvegarder les données pour le filtrage
    bountyModalData = { eliminatedPlayerIndex, eliminatedPlayerTable };

    const eliminatedPlayer = state.players[eliminatedPlayerIndex];

    // Titre de la modal
    document.getElementById('bounty-modal-title').textContent = `Qui a éliminé ${eliminatedPlayer.name} ?`;

    // Réinitialiser la recherche
    document.getElementById('bounty-search').value = '';

    // Afficher la modal
    document.getElementById('bounty-modal').style.display = 'flex';

    // Rendre les joueurs
    renderBountyPlayers();

    // Focus sur la barre de recherche
    setTimeout(() => {
        document.getElementById('bounty-search').focus();
    }, 100);
}

function renderBountyPlayers(searchQuery = '') {
    const { eliminatedPlayerIndex, eliminatedPlayerTable } = bountyModalData;
    const activePlayers = state.players.filter((p, idx) => !p.out && idx !== eliminatedPlayerIndex);

    // Filtrer selon la recherche
    let filteredPlayers = activePlayers;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredPlayers = activePlayers.filter(p => {
            const playerIndex = state.players.indexOf(p);
            const playerNumber = (playerIndex + 1).toString();
            return p.name.toLowerCase().includes(query) || playerNumber.includes(query);
        });
    }

    // Séparer les joueurs par table
    const sameTable = filteredPlayers.filter(p => p.table === eliminatedPlayerTable && eliminatedPlayerTable !== null);
    const otherTables = filteredPlayers.filter(p => p.table !== eliminatedPlayerTable || eliminatedPlayerTable === null);

    // Section même table
    const sameTableSection = document.getElementById('bounty-same-table-section');
    const sameTableList = document.getElementById('bounty-same-table-list');
    const sameTableFragment = document.createDocumentFragment();

    if (sameTable.length > 0) {
        sameTableSection.style.display = 'block';
        sameTable.forEach(p => {
            const idx = state.players.indexOf(p);
            const playerNumber = idx + 1;

            // Affichage bounty adapté au mode
            let bountyInfo = '';
            if (state.pkoEnabled) {
                const earned = p.bountiesEarned || 0;
                const onHead = p.bountiesOnHead || 0;
                if (earned > 0 || onHead > 0) {
                    bountyInfo = `💵${earned}€ 🎯${onHead}€`;
                }
            } else {
                bountyInfo = (p.bounties || 0) > 0 ? `🎯${p.bounties}` : '';
            }

            const tableInfo = state.tableSize > 0 ? `T${p.table}` : '';

            const card = document.createElement('div');
            card.className = 'bounty-player-card';
            card.onclick = () => assignBounty(eliminatedPlayerIndex, idx);
            card.dataset.playerName = p.name.toLowerCase();
            card.dataset.playerNumber = playerNumber;
            card.innerHTML = `
                <div class="bounty-player-name">#${playerNumber} ${p.name}</div>
                <div class="bounty-player-info">
                    ${tableInfo ? `<span>${tableInfo}</span>` : ''}
                    ${bountyInfo ? `<span>${bountyInfo}</span>` : ''}
                </div>`;
            sameTableFragment.appendChild(card);
        });
    } else {
        sameTableSection.style.display = 'none';
    }
    sameTableList.innerHTML = '';
    sameTableList.appendChild(sameTableFragment);

    // Section autres tables
    const otherTablesSection = document.getElementById('bounty-other-tables-section');
    const otherTablesList = document.getElementById('bounty-other-tables-list');
    const otherTablesFragment = document.createDocumentFragment();

    if (otherTables.length > 0) {
        otherTablesSection.style.display = 'block';
        otherTables.forEach(p => {
            const idx = state.players.indexOf(p);
            const playerNumber = idx + 1;

            // Affichage bounty adapté au mode
            let bountyInfo = '';
            if (state.pkoEnabled) {
                const earned = p.bountiesEarned || 0;
                const onHead = p.bountiesOnHead || 0;
                if (earned > 0 || onHead > 0) {
                    bountyInfo = `💵${earned}€ 🎯${onHead}€`;
                }
            } else {
                bountyInfo = (p.bounties || 0) > 0 ? `🎯${p.bounties}` : '';
            }

            const tableInfo = state.tableSize > 0 ? `T${p.table}` : '';

            const card = document.createElement('div');
            card.className = 'bounty-player-card';
            card.onclick = () => assignBounty(eliminatedPlayerIndex, idx);
            card.dataset.playerName = p.name.toLowerCase();
            card.dataset.playerNumber = playerNumber;
            card.innerHTML = `
                <div class="bounty-player-name">#${playerNumber} ${p.name}</div>
                <div class="bounty-player-info">
                    ${tableInfo ? `<span>${tableInfo}</span>` : ''}
                    ${bountyInfo ? `<span>${bountyInfo}</span>` : ''}
                </div>`;
            otherTablesFragment.appendChild(card);
        });
    } else {
        otherTablesSection.style.display = 'none';
    }
    otherTablesList.innerHTML = '';
    otherTablesList.appendChild(otherTablesFragment);

    // Afficher message "Aucun résultat" si nécessaire
    const noResults = document.getElementById('bounty-no-results');
    if (filteredPlayers.length === 0) {
        noResults.style.display = 'block';
        sameTableSection.style.display = 'none';
        otherTablesSection.style.display = 'none';
    } else {
        noResults.style.display = 'none';
    }
}

function filterBountyPlayers() {
    // BUG-023 FIX: Trim la recherche pour éviter les espaces parasites
    const searchQuery = document.getElementById('bounty-search').value.trim();
    renderBountyPlayers(searchQuery);
}

function closeBountyModal() {
    bountyModalOpen = false; // Ré-autoriser les éliminations

    document.getElementById('bounty-modal').style.display = 'none';
    document.getElementById('bounty-search').value = '';

    // Assigner le rank au joueur éliminé seulement s'il n'a pas déjà été assigné
    const { eliminatedPlayerIndex } = bountyModalData;
    if (eliminatedPlayerIndex !== undefined && eliminatedPlayerIndex >= 0) {
        const eliminatedPlayer = state.players[eliminatedPlayerIndex];
        if (eliminatedPlayer.rank === null || eliminatedPlayer.rank === undefined) {
            const alive = state.players.filter(x => !x.out).length;
            eliminatedPlayer.rank = alive;
        }
    }

    // Continuer le traitement de l'élimination sans bounty
    rebalanceTables();
    save();
    render();
}

function assignBounty(eliminatedPlayerIndex, killerPlayerIndex) {
    const eliminatedPlayer = state.players[eliminatedPlayerIndex];
    const killer = state.players[killerPlayerIndex];

    // BUG-020 FIX: Assigner le rank seulement s'il n'a pas déjà été assigné
    const alive = state.players.filter(x => !x.out).length;
    if (eliminatedPlayer.rank === null || eliminatedPlayer.rank === undefined) {
        eliminatedPlayer.rank = alive;
    }

    let killerEarnings = 0;
    let killerHeadIncrease = 0;
    let totalBountyValue = 0;

    if (state.pkoEnabled) {
        // MODE PKO : Progressive Knockout avec tracking séparé
        // Initialiser les champs PKO si nécessaire
        if (!killer.bountiesEarned) killer.bountiesEarned = 0;
        if (!killer.bountiesOnHead) killer.bountiesOnHead = 0;
        if (!eliminatedPlayer.bountiesEarned) eliminatedPlayer.bountiesEarned = 0;
        if (!eliminatedPlayer.bountiesOnHead) eliminatedPlayer.bountiesOnHead = 0;

        // Le bounty du joueur éliminé = son bounty initial + tout ce qu'il a accumulé sur sa tête
        const initialBounty = (1 + (eliminatedPlayer.rebuys || 0)) * state.bountyAmount;
        const accumulatedOnHead = eliminatedPlayer.bountiesOnHead; // Ce qui était sur sa tête
        totalBountyValue = initialBounty + accumulatedOnHead;

        // Répartir selon le pourcentage
        killerEarnings = Math.floor(totalBountyValue * (state.pkoKillerShare / 100));
        killerHeadIncrease = totalBountyValue - killerEarnings;

        // Mettre à jour les valeurs du killer
        killer.bountiesEarned += killerEarnings; // Cash gagné directement
        killer.bountiesOnHead += killerHeadIncrease; // Ajouté sur sa tête

        // Notif avec détails clairs
        if (state.pkoKillerShare === 100) {
            showToast(`💰 Bounty PKO`,
                `<span class="player-change">${killer.name}</span> empoche ${killerEarnings}€<br>` +
                `💵 Total gagné: ${killer.bountiesEarned}€`, 6000);
        } else if (state.pkoKillerShare === 0) {
            showToast(`💰 Bounty PKO`,
                `<span class="player-change">${killer.name}</span> accumule +${killerHeadIncrease}€<br>` +
                `🎯 Sur sa tête: ${killer.bountiesOnHead}€`, 6000);
        } else {
            showToast(`💰 Bounty PKO`,
                `<span class="player-change">${killer.name}</span> élimine ${eliminatedPlayer.name}<br>` +
                `💵 Gagne: ${killerEarnings}€ (total: ${killer.bountiesEarned}€)<br>` +
                `🎯 Sur sa tête: +${killerHeadIncrease}€ (total: ${killer.bountiesOnHead}€)`, 8000);
        }
    } else {
        // MODE BOUNTY CLASSIQUE : compter les bounties de base + ceux accumulés par l'éliminé
        const bountiesWon = 1 + (eliminatedPlayer.rebuys || 0) + (eliminatedPlayer.bounties || 0);
        killer.bounties += bountiesWon;
        totalBountyValue = bountiesWon * state.bountyAmount;

        showToast(`💰 Bounty`, `<span class="player-change">${killer.name}</span> gagne ${bountiesWon} bounty(s) (${totalBountyValue}€) pour avoir éliminé ${eliminatedPlayer.name}`, 6000);
    }

    // Fermer la modal
    document.getElementById('bounty-modal').style.display = 'none';
    document.getElementById('bounty-search').value = '';
    bountyModalOpen = false; // Ré-autoriser les éliminations

    // Continuer le traitement de l'élimination
    rebalanceTables();

    // Gérer les confetti si nécessaire (alive est déjà calculé plus haut)
    if (alive === 1) {
        // Cas spécial du heads-up
        const nbPaidPlaces = getPayouts().length;
        if(2 <= nbPaidPlaces) {
            confettiMedium(); // 2e place
        }
        setTimeout(() => {
            const winner = state.players.find(x => !x.out);
            winner.rank = 1;

            // En mode PKO, le gagnant récupère aussi son propre bounty
            if (state.pkoEnabled) {
                const onHead = winner.bountiesOnHead || 0;
                if (onHead > 0) {
                    // Le gagnant récupère ce qui était sur sa tête
                    if (!winner.bountiesEarned) winner.bountiesEarned = 0;
                    winner.bountiesEarned += onHead;
                    winner.finalPKOBonus = onHead;
                    showToast(`🏆 Victoire PKO`,
                        `<span class="player-change">${winner.name}</span> récupère son bounty !<br>` +
                        `💵 +${onHead}€ (total gagné: ${winner.bountiesEarned}€)`, 7000);
                }
            }
            
            confettiBig(winner.name);
        }, 800);
    } else {
        // Logique normale pour les autres éliminations
        const nbPaidPlaces = getPayouts().length;
        if(eliminatedPlayer.rank <= nbPaidPlaces) {
            if(eliminatedPlayer.rank === 3) {
                confettiSmall();
            } else if(eliminatedPlayer.rank > 3) {
                confettiSmall();
            }
        }
    }

    save();
    render();
}

function toggleOut(i) {
    // Empêcher éliminations multiples pendant qu'une bounty modal est ouverte
    if (bountyModalOpen) {
        showToast('⚠️ Attendez', 'Sélectionnez d\'abord le killer du joueur précédent', 3000);
        return;
    }

    const p = state.players[i];
    if(!p.out) {
        // Calculer alive AVANT l'élimination
        const aliveBefore = state.players.filter(x => !x.out).length;

        // Éliminer le joueur
        p.out = true;

        // Calculer alive APRÈS l'élimination
        const aliveAfter = aliveBefore - 1;
        p.rank = aliveAfter;

        const eliminatedPlayerTable = p.table;
        p.table = null; // Retirer de la table

        // Si bounty activé ET qu'il reste au moins 1 joueur, ouvrir la modal de sélection
        // (si aliveAfter === 0, c'est le dernier joueur, pas de bounty à assigner)
        if (state.bountyEnabled && aliveAfter >= 1) {
            showBountyModal(i, eliminatedPlayerTable);
            return; // On sort de la fonction, rebalanceTables() sera appelé après sélection
        }

        // Rééquilibrer les tables après élimination
        rebalanceTables();

        // Cas spécial : élimination de l'avant-dernier joueur (aliveBefore était 2)
        if(aliveBefore === 2) {
            // Le joueur éliminé est 2e place
            p.rank = 2;

            // Le joueur survivant devient 1er
            const winner = state.players.find(x => !x.out);
            if(winner) {
                winner.rank = 1;

            // En mode PKO, le gagnant récupère aussi son propre bounty
            if (state.pkoEnabled) {
                const onHead = winner.bountiesOnHead || 0;
                if (onHead > 0) {
                    // Le gagnant récupère ce qui était sur sa tête
                    if (!winner.bountiesEarned) winner.bountiesEarned = 0;
                    winner.bountiesEarned += onHead;
                    showToast(`🏆 Victoire PKO`,
                        `<span class="player-change">${winner.name}</span> récupère son bounty !<br>` +
                        `💵 +${onHead}€ (total gagné: ${winner.bountiesEarned}€)`, 7000);
                }
            }
            }

            // Déclencher les confetti pour les deux places
            const nbPaidPlaces = getPayouts().length;
            if(2 <= nbPaidPlaces) {
                confettiMedium(); // 2e place
            }
            // Petit délai avant le confetti du gagnant pour un effet progressif
            setTimeout(() => {
                const winnerName = winner ? winner.name : 'CHAMPION';
                confettiBig(winnerName); // 1ère place avec nom du gagnant
            }, 800);
        } else {
            // Logique normale pour les autres éliminations
            const nbPaidPlaces = getPayouts().length;
            if(p.rank <= nbPaidPlaces) {
                // Le joueur finit dans les places payées
                if(p.rank === 3) {
                    confettiSmall(); // 3e place : petit effet
                } else if(p.rank > 3) {
                    confettiSmall(); // Autres places payées : petit effet
                }
            }
        }
    } else {
        // Réactiver un joueur
        p.out = false;
        p.rank = null;

        // En mode PKO, reset les bounties accumulés (il repart de zéro)
        if (state.pkoEnabled) {
            p.bountiesEarned = 0;
            p.bountiesOnHead = 0;
        }

        // Réassigner à une table
        rebalanceTables();

        // Si on réactive un joueur et qu'il y avait un gagnant solo, on retire son rang
        const soloWinner = state.players.find(x => !x.out && x.rank === 1);
        if(soloWinner && state.players.filter(x => !x.out).length > 1) {
            soloWinner.rank = null;
        }
    }
    save();
    render();
}
function resetApp() {
    // MINOR-03 FIX: Confirmation plus explicite
    const message = "⚠️ RÉINITIALISATION DU TOURNOI\n\n" +
                    "Cette action va:\n" +
                    "• Remettre le timer au niveau 1\n" +
                    "• Réactiver tous les joueurs éliminés\n" +
                    "• Effacer tous les rebuys et bounties\n" +
                    "• Réinitialiser le classement\n\n" +
                    "Les paramètres (buy-in, structure, etc.) seront conservés.\n\n" +
                    "Confirmer la réinitialisation ?";

    if(confirm(message)) {
        // Début de la réinitialisation du tournoi

        // Arrêter le timer s'il tourne
        if(state.playing) {
            clearInterval(clock);
            state.playing = false;
        }

        // Nettoyer tous les confetti intervals (évite les fuites mémoire)
        clearAllConfetti();

        // Remettre le tournoi au début
        state.level = 0;
        state.timeLeft = state.duration * 60;
        state.isPause = false;

        // Timer remis à zéro

        // Réinitialiser tous les joueurs
        const beforeReset = state.players.filter(p => p.out).length;
        state.players.forEach(p => {
            p.out = false;
            p.rank = null;
            p.rebuys = 0;
            p.bounties = 0; // Mode classique
            p.bountiesEarned = 0; // Mode PKO: cash gagné
            p.bountiesOnHead = 0; // Mode PKO: sur la tête
            p.table = null; // Réinitialiser l'assignation de table
        });
        const afterReset = state.players.filter(p => p.out).length;
        // Joueurs réinitialisés

        // Réassigner les tables si multi-table activé
        if(state.tableSize > 0) {
            assignTables();
            // Tables réassignées
        }

        // Sauvegarder et recharger la page pour garantir la mise à jour
        save();
        render(); // Mettre à jour l'affichage avant reload (évite timer négatif visible)
        // État sauvegardé, rechargement de la page
        location.reload();
    }
}

function openSettings() {
    unlockAudio();
    document.getElementById('in-name').value = state.name;
    document.getElementById('in-buy').value = state.buyin;
    document.getElementById('in-rebuy').value = state.rebuyPrice || state.buyin;

    // Multi-tables
    const multiTableEnabled = state.tableSize > 0;
    document.getElementById('in-multitable-toggle').checked = multiTableEnabled;
    document.getElementById('in-table-size').value = state.tableSize || '';
    document.getElementById('multitable-input-group').style.display = multiTableEnabled ? 'block' : 'none';

    // Bounty
    const bountyEnabled = state.bountyEnabled || false;
    document.getElementById('in-bounty-toggle').checked = bountyEnabled;
    document.getElementById('in-bounty-amount').value = state.bountyAmount || '';
    document.getElementById('bounty-input-group').style.display = bountyEnabled ? 'block' : 'none';

    // PKO - avec vérification d'existence
    const pkoToggle = document.getElementById('in-pko-toggle');
    const pkoSlider = document.getElementById('in-pko-slider');
    const pkoSwitchGroup = document.getElementById('pko-switch-group');
    const pkoInputGroup = document.getElementById('pko-input-group');
    
    if (pkoToggle && pkoSlider && pkoSwitchGroup && pkoInputGroup) {
        const pkoEnabled = state.pkoEnabled || false;
        pkoToggle.checked = pkoEnabled;
        pkoSlider.value = state.pkoKillerShare || 50;
        pkoSwitchGroup.style.display = bountyEnabled ? 'flex' : 'none';
        pkoInputGroup.style.display = pkoEnabled ? 'block' : 'none';
        updatePKOLabel();
    } else {
        // Log si éléments PKO manquants (debug)
        console.warn('[openSettings] Éléments PKO manquants dans le DOM');
    }

    document.getElementById('in-dur').value = state.duration;
    document.getElementById('in-blinds').value = state.structure.join('\n');
    const hasAnte = state.structure.some(l => {
        let parts = l.split('/');
        return parts.length >= 3 && !parts[2].toUpperCase().includes('PAUSE');
    });
    document.getElementById('in-antes-toggle').checked = hasAnte;

    // Restore Custom String
    document.getElementById('in-paid-select').value = state.paidMode;
    document.getElementById('in-paid-custom-str').value = state.customPaidStr || "";
    toggleCustomPaid();

    document.getElementById('modal').style.display = 'flex';
}
function closeSettings() { document.getElementById('modal').style.display = 'none'; }
function save() {
    try {
        localStorage.setItem('nutz_pro_v6', JSON.stringify(state));
    } catch(e) {
        console.error('[save] Impossible de sauvegarder:', e);
        // Si quota dépassé, afficher un avertissement
        if (e.name === 'QuotaExceededError') {
            showToast('⚠️ Sauvegarde impossible', 'Stockage local plein. Videz le cache du navigateur.', 8000);
        }
    }
}

window.onload = () => {
    const saved = localStorage.getItem('nutz_pro_v6');
    if(saved) {
        // MINOR-05 FIX: Protection contre données corrompues
        try {
            state = JSON.parse(saved);
            state.playing = false;
        } catch(e) {
            console.error('[load] Données corrompues, utilisation des paramètres par défaut:', e);
            showToast('⚠️ Erreur de chargement', 'Les données sauvegardées sont corrompues. Paramètres par défaut utilisés.', 6000);
            applySettings();
            render();
            return;
        }
        if(state.rebuyPrice === undefined) state.rebuyPrice = state.buyin;
        if(state.tableSize === undefined) state.tableSize = 0;
        if(state.bountyEnabled === undefined) state.bountyEnabled = false;
        if(state.bountyAmount === undefined) state.bountyAmount = 0;
        if(state.pkoEnabled === undefined) state.pkoEnabled = false;
        if(state.pkoKillerShare === undefined) state.pkoKillerShare = 50;
        if(state.mode === undefined) state.mode = 'qty';
        // S'assurer que la structure des blinds existe
        if(!state.structure || state.structure.length === 0) {
            state.structure = [
                '25/50',
                '50/100',
                '75/150',
                '100/200',
                '200/400/200',
                '300/600/300',
                '400/800/400',
                '500/1000/500',
                '600/1200/600',
                '800/1600/800',
                '1000/2000/1000',
                '1500/3000/1500',
                '2000/4000/2000',
                '3000/6000/3000',
                '5000/10000/5000'
            ];
        }
        // S'assurer que tous les joueurs ont les propriétés nécessaires
        state.players.forEach(p => {
            if(p.rebuys === undefined) p.rebuys = 0;
            if(p.table === undefined) p.table = null;
            if(p.bounties === undefined) p.bounties = 0;
        });
        document.getElementById('in-name').value = state.name;
    } else { applySettings(); }
    setMode('qty');
    render();

    // MINOR FIX: Gestionnaire touche ESC pour fermer les modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Fermer la modal de settings si ouverte
            const settingsModal = document.getElementById('modal');
            if (settingsModal && settingsModal.style.display === 'flex') {
                closeSettings();
            }

            // Fermer la modal de bounty si ouverte
            const bountyModal = document.getElementById('bounty-modal');
            if (bountyModal && bountyModal.style.display === 'flex') {
                closeBountyModal();
            }
        }
    });

    // Enregistrement du Service Worker pour PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('[PWA] Service Worker enregistré', reg))
            .catch(err => console.log('[PWA] Erreur Service Worker', err));
    }
};
