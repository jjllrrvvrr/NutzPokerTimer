# ♠️ NUTZ POKER PRO

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vibe](https://img.shields.io/badge/Vibe-Coded-purple.svg)
![Platform](https://img.shields.io/badge/web-responsive-success.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)

**Le gestionnaire de tournoi de poker ultime, ultra-léger et stylé.**

Nutz Poker Timer est une Progressive Web App (PWA) conçue pour gérer vos soirées poker entre amis sans prise de tête. Installable, fonctionne hors ligne, et optimisée pour des performances maximales.

🔗 **[DÉMO LIVE ICI](https://jjllrrvvrr.github.io/NutzPokerTimer/)**
![Screenshot](https://github.com/jjllrrvvrr/NutzPokerTimer/blob/main/screen.jpg) 

## ✨ Fonctionnalités "Vibe Coded"

Ce projet a été codé avec une seule priorité : **l'expérience utilisateur fluide** et une ambiance immersive.

*   **📲 PWA Installable** : Installez l'app sur votre téléphone/ordinateur comme une vraie app native. Fonctionne hors ligne après la première visite.
*   **⏱ Chronomètre Pro** : Gestion précise du temps, pauses automatiques et structure de blindes entièrement personnalisable.
*   **🚨 Alertes Immanquables** :
    *   **Visuel** : Effet "Stroboscope" (flash écran) au changement de niveau. Impossible de rater la montée des blindes.
    *   **Sonore** : Alerte audio (Son *Among Us*) pour signaler la fin du round.
*   **🎯 Mode Bounty** : Activez les bounties avec attribution automatique au killer lors des éliminations. Recherche rapide et interface intuitive.
*   **🃏 Multi-Tables** : Gérez plusieurs tables simultanément avec auto-balancing intelligent. Déplacements minimaux et fusion automatique des tables.
*   **🔄 Génération Auto Blinds** : Plus jamais à court de niveaux ! L'app détecte le pattern et génère automatiquement 5 nouveaux niveaux quand nécessaire.
*   **💰 Gestionnaire de Prix** : Calcul automatique du Payout (Winner takes all, Top 2, Top 3, ou personnalisé) selon le nombre d'inscrits et le Buy-in.
*   **💀 Suivi des Joueurs** : Liste des survivants, gestion des éliminations (OUT), rebuys, bounties gagnés et classement final.
*   **📱 100% Responsive** : Interface optimisée pour Mobile (avec onglets), Tablette et Desktop. Touch targets adaptés.
*   **💾 Sauvegarde Auto** : Tout est enregistré en local. Vous fermez l'onglet par erreur ? Rechargez, le chrono est toujours là.
*   **🎨 Thèmes** : Mode Sombre (Dark) par défaut pour ne pas éblouir, et Mode Clair (Light).
*   **⚡ Ultra Performant** : Optimisations de rendering avec DocumentFragment. Interface ultra-fluide même avec 100+ joueurs.

## 🚀 Comment l'utiliser ?

C'est du **Vanilla JS** pur. Pas de frameworks lourds, juste du code natif ultra-rapide.

### Option 1 : Utilisation directe
1.  Téléchargez les fichiers `index.html`, `style.css`, `script.js`, `manifest.json` et `sw.js`.
2.  Ouvrez `index.html` dans n'importe quel navigateur (Chrome, Safari, Firefox).
3.  Jouez !

### Option 2 : Hébergement Web (Recommandé)
Activez **GitHub Pages** dans les paramètres de ce dépôt (`Settings > Pages > Branch: main`). Votre tournoi sera accessible via une URL web pour tous vos potes.

### Option 3 : Installer comme App
1.  Visitez la [démo live](https://jjllrrvvrr.github.io/NutzPokerTimer/)
2.  Cliquez sur le bouton "Installer" dans votre navigateur (Chrome/Edge/Safari)
3.  L'app s'installe sur votre appareil et fonctionne hors ligne !

## ⚙️ Personnalisation

Cliquez sur la roue dentée ⚙️ pour tout régler :
*   **Général** : Nom du tournoi, Durée des niveaux
*   **Buy-in & Prix** : Buy-in, Rebuy, Mode de paiement (Auto, Winner Takes All, Top 2/3, Personnalisé)
*   **Bounty** : Activez le mode bounty et définissez le montant prélevé sur chaque buy-in
*   **Joueurs** : Nombre fixe ou Liste de noms personnalisée
*   **Multi-Tables** : Activez le mode multi-tables et définissez la taille max par table (ex: 9)
*   **Structure des Blinds** : Texte éditable avec ajout rapide des "BB Antes"
*   **Génération Auto** : Les blinds manquantes sont générées automatiquement si le tournoi se prolonge

## 🛠️ Tech Stack

*   **HTML5 / CSS3** : Grid & Flexbox pour le layout responsive.
*   **JavaScript (ES6+)** : Vanilla JS pur, architecture modulaire, optimisé avec DocumentFragment.
*   **PWA** : Service Worker avec stratégie Cache First pour le mode hors ligne.
*   **LocalStorage** : Persistance automatique de l'état du tournoi.
*   **Canvas Confetti** : Effets visuels pour célébrer les vainqueurs.
*   **Audio API** : Gestion du son pour les navigateurs mobiles.

## 📦 Build & Production

Pour les contributeurs et le déploiement optimisé :

```bash
# Installer les dépendances de build
npm install

# Générer les fichiers minifiés (dist/)
npm run build
```

Les fichiers de production minifiés sont générés dans le dossier `dist/` avec une réduction typique de :
- **JavaScript** : -40 à -50%
- **CSS** : -30 à -40%
- **HTML** : -20 à -30%

📖 **Consultez [BUILD.md](BUILD.md)** pour plus de détails sur le processus de build.

## 🏗️ Architecture

Le code est organisé en **14 modules logiques** pour une maintenance optimale :
- État & LocalStorage
- Audio
- Timer & Niveaux
- Joueurs & Multi-Tables
- Système Bounty
- Calcul des Prix
- Interface & Rendering
- Et plus...

📖 **Consultez [ARCHITECTURE.md](ARCHITECTURE.md)** pour la documentation complète de l'architecture.

## ⚡ Performances

Cette app est **ultra-optimisée** pour des performances maximales :

*   **DocumentFragment** : Les listes utilisent DocumentFragment au lieu de innerHTML pour un rendering 3-5x plus rapide
*   **Update Partiel** : Le timer se met à jour sans re-render complet de l'interface (0.1ms au lieu de 10-20ms)
*   **Service Worker** : Cache intelligent pour un chargement quasi-instantané après la première visite
*   **Minification** : Fichiers compressés pour un déploiement optimal (-40% de taille)
*   **Responsive natif** : Pas de framework lourd, juste du CSS Grid/Flexbox optimisé

Résultat : Interface fluide même avec **100+ joueurs** sur mobile.

## 🐛 Version 5.2 - Corrections de Bugs

Cette version corrige **33 bugs majeurs** identifiés (70% des bugs répertoriés):
- **11 BLOCKER/CRITICAL** : Race conditions, memory leaks, validations manquantes
- **15 MAJOR** : Validations inputs, gestion tables, optimisations algorithmes
- **7 MINOR/TRIVIAL** : UX, messages d'erreur, touches raccourcis (ESC)

**Highlights**:
- ✅ Protection contre race conditions timer
- ✅ Validation complète des inputs utilisateur
- ✅ Memory leak confetti corrigé
- ✅ Génération blinds optimisée
- ✅ Rééquilibrage tables amélioré
- ✅ Meilleure gestion des erreurs avec toasts
- ✅ Touche ESC pour fermer les modales

📖 **Consultez [CHANGELOG.md](CHANGELOG.md)** pour la liste complète des corrections.

## 🤝 Contribuer

C'est un projet **Open Source**. Vous avez une idée pour améliorer le vibe ?
1.  Forkez le projet.
2.  Créez votre feature branch (`git checkout -b feature/AmazingFeature`).
3.  Committez vos changements.
4.  Push et ouvrez une Pull Request.

**Note** : Travaillez toujours sur les fichiers sources (`index.html`, `style.css`, `script.js`), pas sur les fichiers dans `dist/`.

## ❤️ Support

Si cette app a sauvé votre tournoi du chaos ou si vous aimez simplement le code :

**⭐ DONNEZ UNE ÉTOILE À CE REPO ! ⭐**

C'est gratuit et ça fait toujours plaisir.

## ⚙️ Exemple de Structure
```text
25/50
50/100
75/150
100/200
100/200/200
200/400/200
300/600/300
400/800/400
500/1000/500
600/1200/600
800/1600/800
1000/2000/1000
1500/3000/1500
2000/4000/2000
3000/6000/3000
5000/10000/5000

---
*Fait avec passion pour la communauté Poker.*
