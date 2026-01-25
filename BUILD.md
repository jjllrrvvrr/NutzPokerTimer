# 🛠️ Guide de Build

Ce document explique comment générer les fichiers optimisés pour la production.

## 📦 Processus de Build

Le projet maintient une **séparation claire** entre :
- **Fichiers sources** : Code lisible et facile à maintenir (`index.html`, `style.css`, `script.js`)
- **Fichiers de production** : Code minifié et optimisé (dans le dossier `dist/`)

## 🚀 Installation

Installer les dépendances de développement :

```bash
npm install
```

## ⚡ Build de Production

Générer les fichiers minifiés :

```bash
npm run build
```

Cette commande va :
1. ✅ Créer le dossier `dist/`
2. ✅ Minifier `script.js` → `dist/script.min.js`
3. ✅ Minifier `style.css` → `dist/style.min.css`
4. ✅ Minifier `index.html` → `dist/index.html`
5. ✅ Copier les fichiers nécessaires (`manifest.json`, `sw.js`, `screen.jpg`)
6. ✅ Afficher les statistiques de compression

## 📊 Résultats Attendus

Typiquement, la minification réduit la taille des fichiers de :
- **JavaScript** : -40 à -50%
- **CSS** : -30 à -40%
- **HTML** : -20 à -30%

## 📁 Structure du Projet

```
NutzPokerTimer/
├── index.html          # Source HTML (lisible)
├── style.css           # Source CSS (lisible)
├── script.js           # Source JavaScript (lisible)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── build.js            # Script de build
├── package.json        # Dépendances npm
└── dist/               # Fichiers de production (générés)
    ├── index.html      # HTML minifié
    ├── style.min.css   # CSS minifié
    ├── script.min.js   # JavaScript minifié
    ├── manifest.json   # Copié
    ├── sw.js           # Copié
    └── screen.jpg      # Copié
```

## 🔧 Workflow de Développement

1. **Développement** : Modifier les fichiers sources (`index.html`, `style.css`, `script.js`)
2. **Test** : Ouvrir `index.html` directement dans le navigateur
3. **Build** : Lancer `npm run build` pour générer les fichiers de production
4. **Déploiement** : Déployer le contenu du dossier `dist/` sur le serveur

## 🌐 Déploiement GitHub Pages

Pour déployer la version optimisée sur GitHub Pages :

```bash
# Build des fichiers
npm run build

# Copier les fichiers du dossier dist vers la racine pour GitHub Pages
# (ou configurer GitHub Pages pour servir depuis le dossier dist/)
```

## 💡 Notes Importantes

- **Ne jamais éditer** les fichiers dans `dist/` - ils sont regénérés à chaque build
- **Toujours travailler** sur les fichiers sources à la racine du projet
- Le dossier `dist/` est ignoré par Git (voir `.gitignore`)
- Les fichiers sources restent **lisibles et commentés** pour faciliter la maintenance

## 🔍 Outils Utilisés

- **Terser** : Minification JavaScript avec compression et mangling
- **CSSO** : Minification CSS avec optimisations structurelles
- **html-minifier-terser** : Minification HTML avec optimisation des ressources inline
