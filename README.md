# ♠️ NUTZ POKER PRO

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vibe](https://img.shields.io/badge/Vibe-Coded-purple.svg)
![Platform](https://img.shields.io/badge/web-responsive-success.svg)

**Le gestionnaire de tournoi de poker ultime, ultra-léger et stylé.**

Nutz Poker Timer est une application web tout-en-un ("Single File") conçue pour gérer vos soirées poker entre amis sans prise de tête. Pas d'installation, pas de base de données, juste du pur plaisir de jeu.

🔗 **[DÉMO LIVE ICI](https://poker.jlrvr.be)**

![Screenshot]([https://via.placeholder.com/800x400.png?text=Capture+d%27écran+de+Nutz+Poker](https://github.com/jjllrrvvrr/NutzPokerTimer/blob/main/screen.jpg?raw=true)]) 


## ✨ Fonctionnalités "Vibe Coded"

Ce projet a été codé avec une seule priorité : **l'expérience utilisateur fluide** et une ambiance immersive.

*   **⏱ Chronomètre Pro** : Gestion précise du temps, pauses automatiques et structure de blindes entièrement personnalisable.
*   **🚨 Alertes Immanquables** :
    *   **Visuel** : Effet "Stroboscope" (flash écran) au changement de niveau. Impossible de rater la montée des blindes.
    *   **Sonore** : Alerte audio (Son *Among Us*) pour signaler la fin du round.
*   **💰 Gestionnaire de Prix** : Calcul automatique du Payout (Winner takes all, Top 3, ou personnalisé) selon le nombre d'inscrits et le Buy-in.
*   **💀 Suivi des Joueurs** : Liste des survivants, gestion des éliminations (OUT) et classement final.
*   **📱 100% Responsive** : Interface optimisée pour Mobile (avec onglets), Tablette et Desktop.
*   **💾 Sauvegarde Auto** : Tout est enregistré en local. Vous fermez l'onglet par erreur ? Rechargez, le chrono est toujours là.
*   **🎨 Thèmes** : Mode Sombre (Dark) par défaut pour ne pas éblouir, et Mode Clair (Light).

## 🚀 Comment l'utiliser ?

C'est du **Vanilla JS** pur. Pas de `npm install`, pas de `build`, pas de serveur complexe.

### Option 1 : Utilisation directe
1.  Téléchargez le fichier `index.html`.
2.  Ouvrez-le dans n'importe quel navigateur (Chrome, Safari, Firefox).
3.  Jouez !

### Option 2 : Hébergement (Recommandé)
Activez **GitHub Pages** dans les paramètres de ce dépôt (`Settings > Pages > Branch: main`). Votre tournoi sera accessible via une URL web pour tous vos potes.

## ⚙️ Personnalisation

Cliquez sur la roue dentée ⚙️ pour tout régler :
*   Nom du tournoi & Buy-in.
*   Durée des niveaux.
*   Structure des blindes (texte éditable).
*   Ajout rapide des blindes "Ante".
*   Gestion des joueurs (Nombre ou Liste de noms).

## 🛠️ Tech Stack

*   **HTML5 / CSS3** : Grid & Flexbox pour le layout.
*   **JavaScript (ES6+)** : Toute la logique dans un seul fichier.
*   **Canvas Confetti** : Pour célébrer le Heads-up finale.
*   **Audio API** : Gestion du son pour les navigateurs mobiles.

## 🤝 Contribuer

C'est un projet **Open Source**. Vous avez une idée pour améliorer le vibe ?
1.  Forkez le projet.
2.  Créez votre feature branch (`git checkout -b feature/AmazingFeature`).
3.  Committez vos changements.
4.  Push et ouvrez une Pull Request.

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
