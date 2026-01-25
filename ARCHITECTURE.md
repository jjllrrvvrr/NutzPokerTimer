# 🏗️ Architecture du Projet

Ce document décrit l'organisation modulaire du code de Nutz Poker Timer.

## 📋 Vue d'ensemble

Le projet utilise une **architecture modulaire conceptuelle** pour maintenir un code organisé et maintenable, tout en conservant la simplicité d'un projet single-file vanilla JavaScript.

## 🗂️ Organisation du Code

Le fichier `script.js` est organisé en modules logiques distincts :

### 1. **Configuration & Navigation Mobile**
- `openTab()` - Gestion des onglets mobile (Joueurs/Chrono/Prix)

### 2. **État Global & LocalStorage**
- `state` - Objet contenant tout l'état de l'application
- `save()` - Sauvegarde dans localStorage
- `load()` - Chargement depuis localStorage
- `resetState()` - Réinitialisation complète

**Structure de l'état** :
```javascript
{
    theme: 'dark|light',
    name: string,
    buyin: number,
    duration: number,
    level: number,
    timeLeft: number,
    playing: boolean,
    mode: 'qty|list',
    paidMode: 'auto|1|2|3|custom',
    customPaidStr: string,
    players: Array<Player>,
    structure: Array<string>,
    isPause: boolean,
    rebuyPrice: number,
    tableSize: number,
    bountyEnabled: boolean,
    bountyAmount: number
}
```

### 3. **Gestion Audio**
- `alarmSound` - Instance Audio pour l'alerte de fin de niveau
- `unlockAudio()` - Déverrouillage audio mobile
- `playTone()` - Lecture du son d'alerte

### 4. **Effets Visuels (Confetti)**
- `confettiSmall()` - Effet pour places payées (3e+)
- `confettiMedium()` - Effet pour 2e place
- `confettiBig()` - Effet intense pour le vainqueur
- `showWinner()` - Overlay de célébration du vainqueur

### 5. **Gestion du Timer**
- `clock` - Référence au setInterval
- `toggleTimer()` - Démarrer/Pause le chronomètre
- `updateTimer()` - Mise à jour légère du timer (optimisée)
- `handleLevelEnd()` - Gestion de la fin de niveau
- `changeLvl()` - Navigation manuelle des niveaux
- `triggerAlert()` - Alerte visuelle + sonore

### 6. **Génération Automatique des Blinds**
- `generateNextBlinds()` - Détecte le pattern et génère 5 nouveaux niveaux
- Analyse les derniers niveaux pour détecter le ratio de progression
- Arrondit intelligemment aux valeurs "propres"
- Préserve la structure des antes si présente

### 7. **Système de Notifications**
- `showToast()` - Affiche une notification temporaire
- `dismissToast()` - Ferme la notification

### 8. **Gestion des Joueurs**
- `toggleOut()` - Éliminer/Réactiver un joueur
- `showPlayerMenu()` - Menu contextuel des actions joueur
- `closePlayerMenu()` - Ferme le menu contextuel
- `addRebuy()` - Ajouter un rebuy
- `undoRank()` - Annuler le classement d'un joueur

### 9. **Système Multi-Tables**
- `autoBalanceTables()` - Rééquilibrage automatique des tables
- Déplace un minimum de joueurs pour équilibrer
- Gère la fermeture automatique des tables vides
- Considère les petites inégalités comme acceptables

### 10. **Système Bounty**
- `bountyModalData` - Données temporaires du modal bounty
- `showBountyModal()` - Affiche le modal de sélection du killer
- `closeBountyModal()` - Ferme le modal bounty
- `renderBountyPlayers()` - Rendu des joueurs filtrés (optimisé avec DocumentFragment)
- `filterBountyPlayers()` - Recherche en temps réel
- `assignBounty()` - Attribution du bounty au killer

### 11. **Calcul des Prix**
- `getPayouts()` - Calcule la répartition selon le mode sélectionné
- Supporte : Auto (10-15% payés), Winner Takes All, Top 2, Top 3, Custom
- Intègre automatiquement les bounties dans les totaux

### 12. **Modal Réglages**
- `openSettings()` - Ouvre le modal de configuration
- `closeSettings()` - Ferme sans sauvegarder
- `applySettings()` - Valide et applique les paramètres
- `setMode()` - Bascule Nombre/Liste de noms
- `toggleCustomPaid()` - Affiche/masque le champ custom payout
- `toggleAntesStruct()` - Active/désactive la structure avec antes
- `toggleBountyInput()` - Affiche/masque les paramètres bounty
- `toggleMultiTableInput()` - Affiche/masque les paramètres multi-tables
- `resetApp()` - Reset complet de l'application

### 13. **Rendering (Interface)**
- `render()` - Rendu complet de l'interface (optimisé avec DocumentFragment)
- Met à jour :
  - Thème visuel
  - Nom du tournoi
  - Timer
  - Blinds actuelles et suivantes
  - Liste des joueurs (avec tri par table)
  - Compteur de survivants
  - Prize pool et répartition
  - Boutons et icônes

**Optimisations de performance** :
- Utilisation de `DocumentFragment` pour les listes
- Fonction `updateTimer()` légère pour les updates chaque seconde
- Tri intelligent des joueurs (actifs/éliminés, par table)
- Séparation visuelle automatique des tables

### 14. **Utilitaires & Helpers**
- `toggleTheme()` - Bascule Dark/Light mode
- `toggleFS()` - Plein écran
- `toggleMute()` - Mute/Unmute audio

## 🔄 Flux de Données

```
User Action → Update State → Save to localStorage → Render UI
                ↓
          Play Sound / Show Toast / Trigger Animation
```

## 📊 Diagramme de Dépendances

```
main.js (window.onload)
├── state.js (load/save)
├── audio.js (unlockAudio)
└── ui.js (render)
    ├── state.js (read state)
    ├── audio.js (playTone)
    ├── players.js (manage players)
    ├── timer.js (manage timer)
    └── modal.js (settings, bounty)
```

## 🎯 Principes de Design

1. **Single Source of Truth** : L'objet `state` contient tout l'état
2. **Persistance Automatique** : Chaque changement est sauvegardé
3. **Rendering Déclaratif** : `render()` reconstruit l'UI depuis l'état
4. **Performance** : Optimisations ciblées (DocumentFragment, update partiel du timer)
5. **Responsive** : Media queries pour mobile/tablet/desktop
6. **Progressive Enhancement** : PWA avec Service Worker

## 🚀 Version Modulaire ES6 (src/)

Le dossier `src/` contient une version modulaire optionnelle utilisant ES6 modules :

```
src/
├── state.js       # Gestion de l'état et localStorage
├── audio.js       # Gestion audio
├── ui.js          # Rendering et mise à jour UI
├── timer.js       # Logique timer et niveaux
├── players.js     # Gestion joueurs et tables
├── bounty.js      # Système bounty
├── modal.js       # Modaux (settings, bounty)
├── confetti.js    # Effets visuels
└── main.js        # Point d'entrée
```

**Note** : La version modulaire est en cours de développement. Le fichier `script.js` reste la version de référence.

## 📝 Conventions de Code

- **Nommage** : camelCase pour les fonctions et variables
- **Commentaires** : Sections séparées par `// --- SECTION ---`
- **État** : Toujours passer par l'objet `state`, jamais de variables globales dispersées
- **Side Effects** : Toujours appeler `save()` après modification de `state`
- **Rendering** : Toujours appeler `render()` après changement visuel

## 🔧 Extension du Code

Pour ajouter une nouvelle fonctionnalité :

1. Ajouter les propriétés nécessaires dans `state`
2. Créer les fonctions de logique métier
3. Ajouter le rendering dans `render()`
4. Ajouter les contrôles UI dans le HTML
5. Tester et sauvegarder

## 🎨 Optimisations Futures

- ✅ DocumentFragment pour les listes (FAIT)
- ✅ Update partiel du timer (FAIT)
- ✅ Service Worker PWA (FAIT)
- ⏳ Lazy loading des confetti
- ⏳ Web Workers pour les calculs lourds
- ⏳ IndexedDB pour l'historique des tournois
- ⏳ Export des résultats (CSV, JSON)
