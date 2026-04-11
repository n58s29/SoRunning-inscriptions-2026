# Audit Éco-conception — SoRunning Inscriptions 2026

> **Date** : 2026-04-11
> **Version analysée** : 1.10.0
> **Référentiel** : RGESN v2 (Référentiel Général d'Écoconception de Services Numériques)
> **Périmètre** : 9 pages HTML + 1 feuille CSS + 2 fichiers JS (7 266 lignes au total)
> **Hébergement** : GitHub Pages (site statique)
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique du code source)

---

## Résumé exécutif

Le site bénéficie d'une **architecture intrinsèquement sobre** : statique, sans framework JS, sans serveur applicatif, sans base de données, sans analytics. Ces choix structurels placent le service dans le tiers supérieur des sites en termes d'empreinte numérique.

**Le niveau de conformité RGESN est estimé à environ 65 %.**

Les points de friction principaux sont la dépendance à Google Fonts (requête externe non auto-hébergée), le logo non optimisé (PNG 65 Ko), l'anti-pattern de cache-busting systématique sur `config.json`, et les bibliothèques CDN lourdes chargées sur la page admin (xlsx ~1 Mo, html2canvas ~200 Ko).

### Tableau de synthèse par thème

| Thème RGESN | Conformité | Gravité |
|-------------|-----------|---------|
| 1. Stratégie | ✅ BON | Faible |
| 2. Spécifications | ⚠️ PARTIEL | Moyen |
| 3. Architecture | ✅ BON | Faible |
| 4. UX/UI | ⚠️ PARTIEL | Moyen |
| 5. Contenus | ⚠️ PARTIEL | Moyen |
| 6. Frontend | ❌ NON CONFORME | Élevé |
| 7. Backend | ✅ NA (site statique) | — |
| 8. Hébergement | ⚠️ PARTIEL | Faible |
| 9. Usage & fin de vie | ❌ NON CONFORME | Moyen |

---

## Table des matières

1. [Stratégie](#1-stratégie)
2. [Spécifications](#2-spécifications)
3. [Architecture](#3-architecture)
4. [UX/UI](#4-uxui)
5. [Contenus](#5-contenus)
6. [Frontend](#6-frontend)
7. [Backend](#7-backend)
8. [Hébergement](#8-hébergement)
9. [Usage & fin de vie](#9-usage--fin-de-vie)
10. [Plan de remédiation priorisé](#10-plan-de-remédiation-priorisé)

---

## 1. Stratégie

**Conformité : ✅ BON**

### Points positifs

- **Sobriété fonctionnelle** : le service couvre exactement le besoin — inscription, vérification, dépôt de preuve, résultats. Aucune fonctionnalité superflue n'a été identifiée.
- **Durée de vie définie** : le service est lié à un événement borné dans le temps (Challenge 2026), ce qui implique une décommission naturelle.
- **Absence de dark patterns** : pas de push notifications, pas de cookie wall inutile, pas de gamification addictive.

### Points d'attention

- Il n'existe pas de document décrivant la stratégie d'éco-conception (pas de charte, pas de document d'engagement). Acceptable pour un projet interne de cette taille.

---

## 2. Spécifications

**Conformité : ⚠️ PARTIEL**

### Points positifs

- Le périmètre fonctionnel est clairement délimité (9 pages, rôles utilisateur/admin distincts).
- Les services tiers sont documentés dans les CGU (Tally, Microsoft Forms).

### Non-conformités

| Critère | Constat |
|---------|---------|
| Mesure de l'impact environnemental | Aucune mesure de l'empreinte carbone ou des Core Web Vitals documentée |
| Indicateurs de sobriété | Pas d'objectif de poids de page, de nombre de requêtes HTTP, ou de budget performance |
| Tests sur appareils bas de gamme | Non documenté — le site cible potentiellement des agents SNCF sur matériel standard |

---

## 3. Architecture

**Conformité : ✅ BON**

### Points positifs

- **Site 100 % statique** : aucun serveur applicatif, aucune base de données, aucun runtime serveur. C'est le choix architectural le plus sobre possible pour ce type de service.
- **Pas de framework JS** : Vanilla JS uniquement → pas de React/Vue/Angular, pas de bundler, pas de `node_modules` en production.
- **Pas d'analytics** : aucun Google Analytics, aucun pixel de tracking. Zéro requête de télémétrie côté client.
- **Séparation des responsabilités** : la logique admin (`admin.html` + `script.js`) est isolée des pages utilisateurs.
- **Mise en cache native** : les assets statiques (CSS, JS, images) bénéficient du cache GitHub Pages par défaut.

### Points d'attention

- 3 services tiers actifs : **Google Fonts** (CSS), **Tally.so** (iframe dépôt), **Microsoft Forms** (iframe inscription). Chaque service tiers introduit une dépendance de disponibilité et un transfert de données vers des tiers.
- Les bibliothèques xlsx et html2canvas sont chargées depuis **cdnjs.cloudflare.com** sur `admin.html` — voir section Frontend.

---

## 4. UX/UI

**Conformité : ⚠️ PARTIEL**

### Points positifs

- **Mode sombre par défaut** : économie d'énergie significative sur les écrans OLED/AMOLED, qui représentent la majorité des smartphones modernes.
- **Respect de `prefers-color-scheme`** : le thème s'adapte automatiquement aux préférences système, sans JS bloquant.
- **Interface épurée** : pas de carrousel, pas de vidéo en autoplay, pas de publicité, pas de pop-up intrusif.
- **Design responsive** : media queries pour mobile, pas besoin de deux versions du site.

### Non-conformités

| Critère | Constat | Impact |
|---------|---------|--------|
| Animations décoractives | 48 occurrences de `animation`/`@keyframes`/`transition` dans `style.css` + 8 dans `index.html`. Aucune ne respecte `prefers-reduced-motion` | Moyen |
| Icônes émojis | Utilisation intensive d'émojis (🏆📝🔍📤⚙️🔒🏃…) en lieu et place d'icônes SVG → les émojis sont rendus par la police système, leur rendu varie selon l'OS et ils ne sont pas contrôlables en taille/couleur | Faible |

**Correction recommandée pour les animations :**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Contenus

**Conformité : ⚠️ PARTIEL**

### Points positifs

- **Pas de vidéo** : aucun contenu vidéo embarqué.
- **Peu d'images** : une seule image (`logo.png`) sur l'ensemble du site.
- **SVG inline** pour les icônes des réseaux sociaux sur `index.html` → pas de requête HTTP supplémentaire.

### Non-conformités

| Critère | Constat | Impact |
|---------|---------|--------|
| Format d'image | `logo.png` = **65 Ko** en PNG. Format non optimisé — WebP ou AVIF réduirait le poids de 60-80 % (→ ~13-25 Ko) | Moyen |
| Attribut `loading="lazy"` | Absent sur le logo (bien que l'image soit dans le header et donc above-the-fold, bonne pratique à documenter) | Faible |
| Dimensions explicites | Pas d'attributs `width`/`height` sur `<img class="logo-img">` → risque de layout shift (CLS) | Faible |

---

## 6. Frontend

**Conformité : ❌ NON CONFORME**

C'est le thème avec le plus fort potentiel d'amélioration.

### 6.1 Google Fonts — requête externe non maîtrisée

**Gravité : Élevée**

```css
/* style.css — ligne 1 */
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;600&display=swap');
```

Constat :
- À chaque visite, 2 requêtes DNS + TCP/TLS sont établies vers `fonts.googleapis.com` et `fonts.gstatic.com`.
- Les polices sont téléchargées depuis des serveurs Google hors UE (impact RGPD + éco-conception).
- Le chargement est **bloquant** (le navigateur doit résoudre DNS avant de rendre la page).

Recommandation : auto-héberger les polices Barlow depuis GitHub Pages.

```bash
# Télécharger les fichiers WOFF2 depuis Google Fonts et les placer dans /fonts/
```

```css
/* Remplacer l'@import par des @font-face locaux */
@font-face {
  font-family: 'Barlow Condensed';
  src: url('./fonts/barlow-condensed-700.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

Gain estimé : **-2 requêtes HTTP** par visite, réduction de 100-300 ms sur la connexion initiale.

---

### 6.2 Cache-busting systématique sur config.json

**Gravité : Moyenne**

```js
/* index.html — script inline */
const res = await fetch('./config.json?t=' + Date.now());
```

Constat : le paramètre `?t=Date.now()` invalide le cache navigateur à **chaque chargement de page**. `config.json` (4 lignes) est donc re-téléchargé à chaque visite, inutilement.

Recommandation :

```js
// Utiliser un cache court (ex: 60 secondes) via Cache-Control, ou simplement :
const res = await fetch('./config.json');
// Le cache navigateur gérera la fraîcheur selon les en-têtes HTTP de GitHub Pages
```

Si une fraîcheur garantie est requise, préférer un cache-busting basé sur la version du fichier (hash), pas sur le timestamp.

---

### 6.3 Bibliothèques lourdes en CDN sur admin.html

**Gravité : Moyenne**

```html
<!-- admin.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

| Bibliothèque | Poids estimé | Usage |
|--------------|-------------|-------|
| xlsx.full.min.js | ~1 Mo (non compressé) | Export Excel des inscrits |
| html2canvas.min.js | ~200 Ko | Génération des dossards en image |

Constat : ces deux bibliothèques sont chargées de manière **synchrone et inconditionnelle** dès l'ouverture de `admin.html`, même si l'utilisateur n'exporte rien.

Recommandations :
1. Charger en **lazy loading** (import dynamique uniquement au clic sur "Exporter") :

```js
// Au clic sur le bouton export
async function exportExcel() {
  const { utils, writeFile } = await import('https://cdn.jsdelivr.net/...');
  // ...
}
```

2. À terme : envisager des alternatives plus légères (ex : `exceljs` en mode minimal, ou export CSV natif sans bibliothèque).

---

### 6.4 Minification CSS/JS absente

**Gravité : Faible**

- `style.css` : 2 021 lignes non minifiées
- `script.js` : 2 420 lignes non minifiées

GitHub Pages ne minifie pas automatiquement. Un pipeline de build léger (ex: `lightningcss` + `terser`) réduirait le poids de ~30-40 %. Pour un site de cette taille, l'impact reste modéré (la compression gzip/brotli de GitHub Pages compense partiellement).

---

## 7. Backend

**Conformité : ✅ NA**

Le service est entièrement statique. Il n'existe pas de backend applicatif. Cette section ne s'applique pas — c'est en soi un excellent choix d'éco-conception.

---

## 8. Hébergement

**Conformité : ⚠️ PARTIEL**

### Points positifs

- **GitHub Pages** : hébergement via CDN mondial, infrastructure mutualisée entre des millions de projets → empreinte par projet très faible.
- **Pas de serveur dédié allumé 24h/24** : contrairement à un hébergement VPS/cloud traditionnel.
- **HTTPS natif** : pas de couche proxy supplémentaire.

### Points d'attention

| Critère | Constat |
|---------|---------|
| Mix énergétique du datacenter | GitHub (Microsoft Azure) publie des rapports de durabilité mais l'hébergement est mutualisé sans choix de région spécifique. La région des serveurs n'est pas paramétrable sur GitHub Pages Free. |
| En-têtes `Cache-Control` | GitHub Pages applique des en-têtes de cache par défaut mais ne permet pas de les personnaliser (ex: `Cache-Control: public, max-age=31536000` pour les assets versionnés) |

---

## 9. Usage & fin de vie

**Conformité : ❌ NON CONFORME**

### Non-conformités

| Critère | Constat | Recommandation |
|---------|---------|----------------|
| Plan de décommission | Aucun plan documenté pour la suppression du site après le Challenge 2026 | Prévoir une date d'archivage et de suppression du dépôt GitHub |
| Données résiduelless | Les données Excel téléchargées par les admins peuvent persister localement après l'événement | Mentionner dans les CGU la durée de conservation et la procédure de suppression |
| Formulaires tiers | Les données soumises via Tally.so et Microsoft Forms ont une durée de rétention propre aux plateformes — non maîtrisée | Programmer la suppression des formulaires tiers après la fin de l'événement |
| localStorage | Des données de configuration persistent en `localStorage` (`challenge2026_config`, `challenge2026_theme`) sans expiration | Acceptable pour la préférence de thème. La config admin devrait être purgée en fin d'événement. |

---

## 10. Plan de remédiation priorisé

### Priorité 1 — Faible effort, fort impact

| Action | Fichier | Gain estimé |
|--------|---------|-------------|
| Auto-héberger les polices Barlow | `style.css` | -2 requêtes HTTP/visite, -150 ms |
| Optimiser logo en WebP | `logo.png` → `logo.webp` | -50 Ko par visite |
| Supprimer le cache-busting `Date.now()` | `index.html` | -1 requête réseau/visite |

### Priorité 2 — Effort moyen, impact moyen

| Action | Fichier | Gain estimé |
|--------|---------|-------------|
| Ajouter `prefers-reduced-motion` | `style.css` | Conformité RGESN + accessibilité |
| Charger xlsx et html2canvas en lazy | `admin.html`, `script.js` | -1,2 Mo au chargement initial admin |
| Ajouter `width`/`height` sur `<img>` logo | Tous les HTML | Suppression du CLS (layout shift) |

### Priorité 3 — Préparation de fin de vie

| Action | Responsable | Échéance suggérée |
|--------|-------------|-------------------|
| Documenter la date de décommission | Organisateurs | Avant fin challenge |
| Supprimer formulaires Tally et MS Forms | Organisateurs | J+30 après le challenge |
| Archiver ou supprimer le dépôt GitHub | Organisateurs | J+60 après le challenge |

---

## Bilan global

| Catégorie | Résultat |
|-----------|---------|
| **Conformité estimée** | ~65 % |
| **Empreinte structurelle** | Très faible (site statique, vanilla JS, 0 analytics) |
| **Principal levier d'amélioration** | Supprimer la dépendance à Google Fonts + optimiser le logo |
| **Effort de remédiation total** | Faible à moyen (2-4 heures de travail) |

> L'architecture statique du projet est le meilleur choix possible d'éco-conception pour ce type de service. Les améliorations identifiées sont des optimisations de second niveau — le site part d'une base saine.
