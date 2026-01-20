// --- NAVIGATION MOBILE ---
function openTab(tabName, btn) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-mobile'));
    document.getElementById('tab-' + tabName).classList.add('active-mobile');
    if(btn) { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
}

// --- STATE & AUDIO ---
let state = { theme: 'dark', muted: false, name: 'NUTZ POKER', buyin: 20, duration: 15, level: 0, timeLeft: 900, playing: false, mode: 'qty', paidMode: 'auto', customPaidStr: "", players: [], structure: [], isPause: false, rebuyPrice: 20, tableSize: 0 };
let clock = null;

// SON AMONG US
const alarmSound = new Audio("https://www.myinstants.com/media/sounds/among.mp3");

function unlockAudio() {
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(() => {});
}

function playTone() {
    if(state.muted) return;
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log("Audio blocked", e));
}

function toggleTheme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; render(); }
function toggleFS() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else if (document.exitFullscreen) document.exitFullscreen(); }
function toggleMute() { state.muted = !state.muted; render(); }

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
        if (Date.now() > end) {
            clearInterval(interval);
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
    }, 250);
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
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
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
    }, 200); // Intervalle réduit pour plus de continuité
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
    state.buyin = parseInt(document.getElementById('in-buy').value) || 0;
    state.rebuyPrice = parseInt(document.getElementById('in-rebuy').value) || state.buyin;
    state.tableSize = parseInt(document.getElementById('in-table-size').value) || 0;
    state.duration = parseInt(document.getElementById('in-dur').value) || 15;
    state.paidMode = document.getElementById('in-paid-select').value;
    state.customPaidStr = document.getElementById('in-paid-custom-str').value;
    state.structure = document.getElementById('in-blinds').value.split('\n').filter(l => l.trim());

    if (state.mode === 'qty') {
        let count = parseInt(document.getElementById('in-qty').value) || 0;
        if(state.players.length !== count) {
             state.players = Array.from({length: count}, (_, i) => ({ name: `Joueur ${i+1}`, out: false, rank: null, rebuys: 0, table: null }));
        } else {
            // Garder les joueurs existants mais s'assurer qu'ils ont les propriétés nécessaires
            state.players.forEach(p => {
                if(p.rebuys === undefined) p.rebuys = 0;
                if(p.table === undefined) p.table = null;
            });
        }
    } else {
        state.players = document.getElementById('in-players').value.split(/[\n,;]+/).map(n => ({name: n.trim(), out: false, rank: null, rebuys: 0, table: null})).filter(p => p.name);
    }

    // Assigner les tables si multi-tables activé
    assignTables();

    state.timeLeft = state.duration * 60;
    state.playing = false;
    clearInterval(clock);
    save(); render(); closeSettings();
}

function getPayouts() {
    // Calcul du pot : buy-ins + rebuys
    const totalBuyins = state.players.length * state.buyin;
    const totalRebuys = state.players.reduce((sum, p) => sum + (p.rebuys || 0) * state.rebuyPrice, 0);
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

        if(nPaid === 1) weights = [100];
        else if(nPaid === 2) weights = [65, 35];
        else if(nPaid === 3) weights = [50, 30, 20];
        else if(nPaid === 4) weights = [45, 25, 20, 10];
        else {
            for(let i=0; i<nPaid; i++) weights.push(100/Math.pow(1.5, i));
        }
    }

    const totalWeight = weights.reduce((a,b) => a+b, 0);

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
            while(diff < 0) {
                 payouts[idx] -= step;
                 diff += step;
                 if(payouts[idx] < step) { payouts[idx] = step; diff -= step; idx--; if(idx<0) idx=0; } // Safety
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

    const listUI = document.getElementById('ui-player-list'); listUI.innerHTML = "";

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

    sortedPlayers.forEach((p) => {
        const idx = state.players.indexOf(p);
        const rebuyBadge = (p.rebuys || 0) > 0 ? `<span class="rebuy-badge">+${p.rebuys}</span>` : '';

        // Badge de table (uniquement si multi-tables activé et joueur actif)
        const tableBadge = (state.tableSize > 0 && !p.out && p.table)
            ? `<span class="table-badge">T${p.table}</span>`
            : '';

        // Bouton d'élimination rapide (uniquement pour les joueurs actifs)
        const eliminateBtn = !p.out
            ? `<span class="eliminate-btn" onclick="event.stopPropagation(); toggleOut(${idx});" title="Éliminer">✕</span>`
            : '';

        listUI.innerHTML += `
            <div class="player-row ${p.out ? 'out' : ''}" onclick="showPlayerMenu(event, ${idx})">
                <span>${tableBadge}${p.name} ${rebuyBadge} ${p.rank ? `<span class="rank-tag">${p.rank}e</span>` : ''}</span>
                <span>${p.out ? 'OUT' : eliminateBtn}</span>
            </div>`;
    });
    document.getElementById('ui-count').innerText = state.players.filter(p => !p.out).length + '/' + state.players.length;

    // Calcul du pot total avec rebuys
    const totalBuyins = state.players.length * state.buyin;
    const totalRebuys = state.players.reduce((sum, p) => sum + (p.rebuys || 0) * state.rebuyPrice, 0);
    document.getElementById('ui-total-pot').innerText = totalBuyins + totalRebuys;

    const payUI = document.getElementById('ui-payouts'); payUI.innerHTML = "";
    getPayouts().forEach(p => payUI.innerHTML += `<div class="row" style="cursor:default"><span>${p.label}</span><span>${p.val}€</span></div>`);

    const playBtn = document.getElementById('play-btn');
    playBtn.innerText = state.playing ? "PAUSE" : "DÉMARRER";
    playBtn.style.background = state.playing ? "var(--btn)" : "var(--accent)";
    playBtn.style.color = state.playing ? "var(--accent)" : "var(--bg)";

    document.getElementById('theme-icon').innerHTML = state.theme === 'dark' ?
        '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' :
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

    const muteIcon = document.getElementById('mute-icon');
    if (state.muted) {
        muteIcon.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        muteIcon.style.opacity = "0.5";
    } else {
        muteIcon.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        muteIcon.style.opacity = "1";
    }
}

function toggleTimer() {
    unlockAudio();
    if(state.playing) { clearInterval(clock); state.playing = false; }
    else { state.playing = true; clock = setInterval(() => { state.timeLeft--; if(state.timeLeft < 0) handleLevelEnd(); render(); }, 1000); }
    render();
}

function handleLevelEnd() {
    triggerAlert();
    const line = state.structure[state.level] || "";
    if(!state.isPause && line.toUpperCase().includes("PAUSE")) {
        state.isPause = true; state.timeLeft = (parseInt(line.toUpperCase().split("PAUSE")[1]) || 5) * 60;
    } else {
        state.isPause = false; state.level++; state.timeLeft = state.duration * 60;
        if(state.level >= state.structure.length) { clearInterval(clock); state.playing = false; }
    }
}
function changeLvl(dir) {
    unlockAudio();
    state.level = Math.max(0, Math.min(state.structure.length - 1, state.level + dir));
    if(dir > 0) triggerAlert();
    state.isPause = false; state.timeLeft = state.duration * 60; render();
}
// --- NOTIFICATIONS TOAST ---
let toastTimeout = null;

function showToast(title, content, duration = 8000) {
    const toast = document.getElementById('toast-notification');
    const toastTitle = document.getElementById('toast-title');
    const toastContent = document.getElementById('toast-content');

    toastTitle.textContent = title;
    toastContent.innerHTML = content + '<div class="toast-dismiss-hint">Cliquez pour fermer</div>';

    toast.classList.add('show');

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

    // Calculer le nombre de tables nécessaires
    const numTables = Math.ceil(activePlayers.length / state.tableSize);

    // Mélanger les joueurs actifs aléatoirement
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
            const player = tableGroups[sourceTable].pop();
            player.table = targetTable;
            tableGroups[targetTable].push(player);

            if (oldTables[player.name] !== player.table) {
                changes.push({ name: player.name, from: oldTables[player.name], to: player.table });
            }

            needsRebalance = true;
        }

        // Si aucun déplacement nécessaire, on arrête
        if (!needsRebalance) {
            break;
        }
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
        alert("Le mode multi-tables n'est pas activé.");
        return;
    }

    const player = state.players[i];
    if (player.out) {
        alert("Impossible de changer la table d'un joueur éliminé.");
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
                save();
                render();
            }
        } else {
            alert(`Numéro de table invalide. Doit être entre 1 et ${numTables}.`);
        }
    }
}

function toggleOut(i) {
    const p = state.players[i];
    if(!p.out) {
        const alive = state.players.filter(x => !x.out).length;
        p.out = true;
        p.rank = alive;
        p.table = null; // Retirer de la table

        // Rééquilibrer les tables après élimination
        rebalanceTables();

        // Cas spécial : élimination de l'avant-dernier joueur (il reste 2 vivants)
        if(alive === 2) {
            // Le joueur éliminé est 2e place
            p.rank = 2;

            // Le joueur survivant devient 1er
            const winner = state.players.find(x => !x.out);
            if(winner) {
                winner.rank = 1;
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
function resetApp() { if(confirm("Supprimer toutes les données et recommencer ?")) { localStorage.removeItem('nutz_pro_v6'); location.reload(); } }

function openSettings() {
    unlockAudio();
    document.getElementById('in-name').value = state.name;
    document.getElementById('in-buy').value = state.buyin;
    document.getElementById('in-rebuy').value = state.rebuyPrice || state.buyin;
    document.getElementById('in-table-size').value = state.tableSize || '';
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
function save() { localStorage.setItem('nutz_pro_v6', JSON.stringify(state)); }

window.onload = () => {
    const saved = localStorage.getItem('nutz_pro_v6');
    if(saved) {
        state = JSON.parse(saved); state.playing = false;
        if(state.muted === undefined) state.muted = false;
        if(state.rebuyPrice === undefined) state.rebuyPrice = state.buyin;
        if(state.tableSize === undefined) state.tableSize = 0;
        // S'assurer que tous les joueurs ont les propriétés nécessaires
        state.players.forEach(p => {
            if(p.rebuys === undefined) p.rebuys = 0;
            if(p.table === undefined) p.table = null;
        });
        document.getElementById('in-name').value = state.name;
    } else { applySettings(); }
    setMode('qty');
    render();
};
