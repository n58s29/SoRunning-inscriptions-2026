# Audit RGAA 4.1 — SoRunning Inscriptions 2026

> **Date** : 2026-04-11
> **Version analysée** : 1.8.0
> **Référentiel** : RGAA 4.1 (Référentiel Général d'Amélioration de l'Accessibilité)
> **Niveaux couverts** : A et AA (obligations légales)
> **Périmètre** : 9 pages HTML publiques + feuille de style partagée
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique du code source)

---

## Résumé exécutif

L'application présente des **non-conformités importantes** au regard du RGAA 4.1, principalement sur les critères de structure, de navigation clavier et d'alternatives textuelles. Ces lacunes sont typiques d'un site développé sans intégration de l'accessibilité dès la conception.

**Le niveau de conformité global est estimé à environ 35 %** (critères A et AA combinés).

La bonne nouvelle : l'architecture statique du site et l'absence de composants tiers complexes rendent les corrections techniquement accessibles sans refonte majeure.

### Tableau de synthèse par thème

| Thème | Conformité | Niveau de gravité |
|-------|-----------|-------------------|
| 1. Images | ⚠️ PARTIEL | Moyen |
| 2. Cadres | ⚠️ PARTIEL | Faible |
| 3. Couleurs | ⚠️ PARTIEL | Moyen |
| 4. Multimédia | ✅ NA | — |
| 5. Tableaux | ⚠️ PARTIEL | Faible |
| 6. Liens | ⚠️ PARTIEL | Moyen |
| 7. Scripts | ❌ NON CONFORME | Élevé |
| 8. Éléments obligatoires | ⚠️ PARTIEL | Moyen |
| 9. Structuration | ❌ NON CONFORME | Élevé |
| 10. Présentation | ❌ NON CONFORME | Élevé |
| 11. Formulaires | ❌ NON CONFORME | Élevé |
| 12. Navigation | ❌ NON CONFORME | Élevé |
| 13. Consultation | ⚠️ PARTIEL | Moyen |

---

## Table des matières

1. [Images](#1-images)
2. [Cadres](#2-cadres)
3. [Couleurs](#3-couleurs)
4. [Multimédia](#4-multimédia)
5. [Tableaux](#5-tableaux)
6. [Liens](#6-liens)
7. [Scripts](#7-scripts)
8. [Éléments obligatoires](#8-éléments-obligatoires)
9. [Structuration de l'information](#9-structuration-de-linformation)
10. [Présentation de l'information](#10-présentation-de-linformation)
11. [Formulaires](#11-formulaires)
12. [Navigation](#12-navigation)
13. [Consultation](#13-consultation)
14. [Plan de remédiation priorisé](#14-plan-de-remédiation-priorisé)

---

## 1. Images

### Critère 1.1 — Alternative textuelle sur les images porteuses d'information

**Statut** : ⚠️ PARTIEL

**Fichiers concernés** : toutes les pages

**Constat** : Le logo `logo.png` est présent sur toutes les pages avec `alt="CC"`. L'alternative est trop succincte — elle ne restitue pas le nom complet de l'application.

```html
<!-- Actuel — insuffisant -->
<img class="logo-img" src="logo.png" alt="CC" ...>

<!-- Attendu -->
<img class="logo-img" src="logo.png" alt="Challenge Connecté 2026" ...>
```

### Critère 1.2 — Images décoratives sans alternative

**Statut** : ⚠️ PARTIEL

**Constat** : Les icônes emoji utilisées comme éléments décoratifs dans les cartes (`📝`, `🔍`, `📤`, `🔒`, `🏆`, `⚙️`) et dans les séparateurs (`🏃`, `🔒`) ne sont pas masquées aux technologies d'assistance. Un lecteur d'écran lira "emoji bulletin with pencil", "emoji magnifying glass tilted left", etc., ce qui génère du bruit inutile.

```html
<!-- Actuel — lu par les AT -->
<div class="user-card-icon">📝</div>

<!-- Attendu — caché des AT quand purement décoratif -->
<div class="user-card-icon" aria-hidden="true">📝</div>
```

**Pages concernées** : [index.html](../index.html), [depot.html](../depot.html), [verify.html](../verify.html)

### Critère 1.3 — Images SVG porteuses d'information

**Statut** : ⚠️ PARTIEL

**Constat** : Les SVG des liens communauté (Strava, WhatsApp, Viva Engage) sont purement décoratifs puisqu'un libellé textuel est présent dans le lien. Cependant ils ne sont pas marqués `aria-hidden="true"`.

```html
<!-- Actuel -->
<svg viewBox="0 0 24 24"><path .../></svg>
Strava

<!-- Attendu -->
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path .../></svg>
Strava
```

---

## 2. Cadres

### Critère 2.1 — Titre des iframes

**Statut** : ⚠️ PARTIEL

**Fichiers concernés** : [inscription.html](../inscription.html), [depot.html](../depot.html)

**Constat** :
- `inscription.html` : `title="Formulaire d'inscription — Challenge Connecté 2026"` ✅
- `depot.html` : `title="🩷 La Vie en Rose - Dépôt de preuve 🩷"` — le titre contient des emoji qui seront épelés par certains lecteurs d'écran ("pink heart", "pink heart"). À corriger.

```html
<!-- depot.html — actuel -->
<iframe ... title="🩷 La Vie en Rose - Dépôt de preuve 🩷">

<!-- Attendu -->
<iframe ... title="Formulaire de dépôt de preuve — Challenge Connecté 2026">
```

**Remarque** : Le titre de la page `depot.html` (`<title>`) contient également ces emoji — voir section 8.

---

## 3. Couleurs

### Critère 3.1 — Contraste des textes

**Statut** : ⚠️ PARTIEL

**Fichier concerné** : [style.css](../style.css)

Les rapports de contraste ont été calculés selon la formule WCAG 2.1 (seuil AA : 4,5:1 pour le texte normal, 3:1 pour le texte de grande taille).

#### Mode sombre (défaut)

| Couleur texte | Fond | Ratio | Seuil AA | Statut |
|--------------|------|-------|----------|--------|
| `#f0f2f8` (texte) | `#0f1117` (bg) | ~17:1 | 4,5:1 | ✅ |
| `#7a7f96` (muted) | `#0f1117` (bg) | ~4,9:1 | 4,5:1 | ✅ |
| `#f773b4` (accent) | `#0f1117` (bg) | ~7,4:1 | 4,5:1 | ✅ |
| `#7a7f96` (muted) | `#1a1d27` (surface) | ~4,3:1 | 4,5:1 | ❌ |

#### Mode clair

| Couleur texte | Fond | Ratio | Seuil AA | Statut |
|--------------|------|-------|----------|--------|
| `#1a1d27` (texte) | `#f0f1f5` (bg) | ~13:1 | 4,5:1 | ✅ |
| `#6b7085` (muted) | `#f0f1f5` (bg) | ~4,0:1 | 4,5:1 | ❌ |
| `#e0559a` (accent) | `#f0f1f5` (bg) | ~3,0:1 | 4,5:1 | ❌ |
| `#e0559a` (accent) | `#ffffff` (surface) | ~2,9:1 | 4,5:1 | ❌ |

**Impacts principaux** :
- En mode clair, le texte `--muted` (`#6b7085`) utilisé pour les descriptions de cartes et les métadonnées ne satisfait pas le seuil AA.
- La couleur `--accent` (`#e0559a`) en mode clair est utilisée pour les numéros d'étapes ("Étape 1", "Étape 2") en police 12 px — ratio insuffisant.
- Les liens du footer en `--muted` en mode clair sont potentiellement non conformes.

### Critère 3.2 — Information non transmise par la couleur seule

**Statut** : ✅ CONFORME

Les cartes verrouillées utilisent à la fois une opacité réduite, un emoji 🔒 et un curseur `not-allowed`. L'état n'est pas transmis par la couleur seule.

---

## 4. Multimédia

**Statut** : ✅ NA

Aucun contenu audio ou vidéo n'est présent dans le site. Ce thème est non applicable.

---

## 5. Tableaux

### Critère 5.1 — En-têtes de tableau

**Statut** : ⚠️ PARTIEL

**Fichier concerné** : [cgu.html](../cgu.html)

Le tableau de la politique de confidentialité (§ 2) utilise des éléments `<th>` pour les en-têtes de colonnes, ce qui est correct. En revanche, l'attribut `scope` n'est pas renseigné.

```html
<!-- Actuel -->
<th>Donnée</th>

<!-- Attendu -->
<th scope="col">Donnée</th>
```

**Fichier concerné** : [resultats.html](../resultats.html)

Les tableaux de classements générés dynamiquement par JavaScript nécessitent une vérification similaire lors de leur rendu. Non vérifié en analyse statique.

---

## 6. Liens

### Critère 6.1 — Intitulé explicite des liens

**Statut** : ⚠️ PARTIEL

**Constat** :

1. **Lien URL brut** dans [cgu.html](../cgu.html) :
   ```html
   <!-- Non explicite pour un lecteur d'écran qui liste les liens -->
   <a href="https://www.cnil.fr/fr/plaintes" ...>www.cnil.fr/fr/plaintes</a>

   <!-- Attendu -->
   <a href="https://www.cnil.fr/fr/plaintes" ...>Déposer une plainte sur le site de la CNIL</a>
   ```

2. **Lien "← Accueil"** — le caractère `←` sera lu "flèche vers la gauche" par certains lecteurs d'écran. Ajouter un `aria-label` explicite :
   ```html
   <a href="index.html" class="btn-back" aria-label="Retour à l'accueil">← Accueil</a>
   ```

3. **Lien "Administration"** dans [verify.html](../verify.html) — libellé explicite, conforme ✅.

### Critère 6.2 — Liens ouvrant dans un nouvel onglet

**Statut** : ❌ NON CONFORME

**Fichiers concernés** : [index.html](../index.html), [verify.html](../verify.html), [cgu.html](../cgu.html)

Plusieurs liens utilisent `target="_blank"` (Strava, WhatsApp, Viva Engage, CNIL) sans avertir l'utilisateur de l'ouverture dans un nouvel onglet/fenêtre.

```html
<!-- Actuel -->
<a href="..." target="_blank" rel="noopener">Strava</a>

<!-- Attendu — option 1 : mention dans l'intitulé -->
<a href="..." target="_blank" rel="noopener">Strava (nouvel onglet)</a>

<!-- Attendu — option 2 : via aria-label -->
<a href="..." target="_blank" rel="noopener" aria-label="Strava (s'ouvre dans un nouvel onglet)">Strava</a>
```

---

## 7. Scripts

### Critère 7.1 — Accessibilité des composants JavaScript

**Statut** : ❌ NON CONFORME

#### Modale de confirmation (index.html)

La modale `#confirmOverlay` a `role="dialog"` et `aria-modal="true"`, ce qui est un bon début. Cependant :

- **Pas d'`aria-labelledby`** — le titre de la modale n'est pas associé au rôle `dialog` ❌
- **Pas de gestion du focus** — à l'ouverture, le focus n'est pas déplacé dans la modale ❌
- **Pas de piège de focus** — la navigation clavier sort librement de la modale ❌
- **Pas de fermeture par Échap** — aucun handler sur `keydown` ❌

```html
<!-- Actuel -->
<div id="confirmOverlay" role="dialog" aria-modal="true">
  <div class="confirm-box">
    <h2 class="confirm-title" ...>Dépôt <span>pris en compte !</span></h2>
    ...
  </div>
</div>

<!-- Attendu -->
<div id="confirmOverlay" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
  <div class="confirm-box">
    <h2 id="confirmTitle" class="confirm-title" ...>Dépôt <span>pris en compte !</span></h2>
    ...
  </div>
</div>
```

```javascript
// À ajouter lors de l'ouverture de la modale
function openConfirmModal() {
  const overlay = document.getElementById('confirmOverlay');
  overlay.classList.add('visible');
  // Déplacer le focus sur le premier élément focusable
  overlay.querySelector('a, button').focus();
  // Fermer avec Échap
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeConfirmModal();
  });
}
```

#### Zone de résultat de vérification (verify.html)

Le résultat de la recherche d'inscription (`#verifyStatus`) est affiché par JavaScript mais n'est pas annoncé par les lecteurs d'écran.

```html
<!-- Actuel -->
<div class="verify-status" id="verifyStatus" style="display:none"></div>

<!-- Attendu -->
<div class="verify-status" id="verifyStatus" aria-live="polite" aria-atomic="true" style="display:none"></div>
```

#### Message d'erreur de connexion (admin.html)

```html
<!-- Actuel -->
<div id="loginError" style="... display:none;">Mot de passe incorrect.</div>

<!-- Attendu -->
<div id="loginError" role="alert" style="... display:none;">Mot de passe incorrect.</div>
```

#### Bouton de changement de thème

```html
<!-- Actuel — title non fiable pour tous les AT -->
<button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" title="Basculer mode clair / sombre">

<!-- Attendu -->
<button class="theme-toggle" id="themeToggle" onclick="toggleTheme()"
        aria-label="Basculer en mode clair" aria-pressed="false">
```

#### Cartes verrouillées (index.html)

Quand une carte est verrouillée, son attribut `href` est supprimé par JavaScript, mais l'élément reste un `<a>`. Un lecteur d'écran le présentera comme un lien sans destination.

```javascript
// Actuel
card.removeAttribute('href');
card.classList.add('user-card--locked');

// Attendu
card.setAttribute('aria-disabled', 'true');
card.setAttribute('aria-label', card.querySelector('.user-card-title').textContent + ' — pas encore disponible');
card.removeAttribute('href');
card.setAttribute('tabindex', '-1'); // optionnel, retire du tab order
```

### Critère 7.3 — Accessibilité clavier des scripts

**Statut** : ❌ NON CONFORME

Aucune des interactions JavaScript (ouverture modale, résultat de vérification) n'est testée et documentée pour la navigation clavier.

---

## 8. Éléments obligatoires

### Critère 8.1 — Déclaration de langue

**Statut** : ✅ CONFORME

Toutes les pages ont `<html lang="fr">`. ✅

### Critère 8.2 — Encodage des caractères

**Statut** : ✅ CONFORME

Toutes les pages ont `<meta charset="UTF-8">`. ✅

### Critère 8.3 — Titre des pages

**Statut** : ⚠️ PARTIEL

| Page | Titre | Statut |
|------|-------|--------|
| index.html | `Challenge Connecté 2026` | ⚠️ Générique, ne précise pas la nature de la page |
| inscription.html | `S'inscrire — Challenge Connecté 2026` | ✅ |
| verify.html | `Vérification d'inscription — Challenge Connecté 2026` | ✅ |
| depot.html | `🩷 La Vie en Rose - Dépôt de preuve 🩷` | ❌ Emoji dans le titre |
| resultats.html | À vérifier | — |
| admin.html | `Administration — Challenge Connecté 2026` | ✅ |
| reglement.html | `Règlement — Challenge Connecté 2026` | ✅ |
| cgu.html | `CGU & Confidentialité — Challenge Connecté 2026` | ✅ |

**Correctif pour depot.html** :
```html
<!-- Actuel -->
<title>🩷 La Vie en Rose - Dépôt de preuve 🩷</title>

<!-- Attendu -->
<title>Dépôt de preuve — Challenge Connecté 2026</title>
```

### Critère 8.4 — Cohérence des balises de structure

**Statut** : ⚠️ PARTIEL — voir section 9.

---

## 9. Structuration de l'information

### Critère 9.1 — Structure par titres

**Statut** : ❌ NON CONFORME

**Fichier concerné** : [index.html](../index.html)

La page d'accueil ne contient **aucun `<h1>`**. Le nom de l'application est dans un `<div class="logo-text">`, invisible aux technologies d'assistance qui parcourent la structure de titres.

```html
<!-- Actuel — div non sémantique -->
<div class="logo-text">Challenge <span>Connecté</span> 2026</div>

<!-- Correctif minimal — un h1 visuellement masqué mais présent pour les AT -->
<h1 class="sr-only">Challenge Connecté 2026</h1>
```

**Fichiers concernés** : [verify.html](../verify.html), [cgu.html](../cgu.html), [reglement.html](../reglement.html)

Ces pages ont un `<h1>` correct. ✅

**Vérifier la hiérarchie** : dans [cgu.html](../cgu.html), la section "Politique de confidentialité" utilise `<h2 class="doc-section-header-title">` mais les paragraphes suivants utilisent aussi `<h2 class="doc-article-title">` — la hiérarchie est plate, il faudrait que les § de la politique soient des `<h3>` si le document a déjà des `<h2>` pour les articles CGU.

### Critère 9.2 — Structure par landmarks

**Statut** : ❌ NON CONFORME

**Constat** sur toutes les pages :

- Aucune page ne possède de balise `<main>` — le contenu principal est dans des `<div>` ❌
- Le `<header>` est présent et implicitement reconnu ✅
- Aucune page n'utilise `<nav>` pour les liens de navigation ❌
- Le `<footer>` est présent ✅

```html
<!-- Actuel — pas de landmark main -->
<div class="home-page"> ... </div>
<div class="verify-page"> ... </div>
<div class="doc-page"> ... </div>

<!-- Attendu -->
<main class="home-page"> ... </main>
<main class="verify-page"> ... </main>
<main class="doc-page"> ... </main>
```

```html
<!-- Actuel — navigation non balisée -->
<footer class="site-footer">
  <a href="reglement.html">Règlement</a>
  ...
</footer>

<!-- Attendu -->
<footer class="site-footer">
  <nav aria-label="Liens légaux">
    <a href="reglement.html">Règlement</a>
    ...
  </nav>
</footer>
```

### Critère 9.3 — Listes

**Statut** : ✅ CONFORME

Les listes à puces dans les documents légaux utilisent des `<ul>/<li>` sémantiques. ✅

---

## 10. Présentation de l'information

### Critère 10.1 — Séparateurs graphiques

**Statut** : ✅ CONFORME

Les séparateurs cosmétiques utilisent des pseudo-éléments CSS (`::before`/`::after`), absents du DOM et donc invisibles aux AT. ✅

### Critère 10.2 — Styles CSS désactivés

**Statut** : ⚠️ PARTIEL (à vérifier manuellement)

Non testé en analyse statique. À vérifier en désactivant le CSS dans le navigateur.

### Critère 10.3 — Visibilité du focus clavier

**Statut** : ❌ NON CONFORME

**Fichier concerné** : [style.css](../style.css)

Plusieurs éléments ont `outline: none` sans indicateur de focus alternatif suffisant :

```css
/* Actuel — outline supprimé sans remplacement visible */
.list-search { outline: none; }
.settings-input { outline: none; }
.settings-cat-row input, .settings-cat-row select { outline: none; }
.verify-input { outline: none; }
```

Pour `.verify-input`, un `border-color: var(--accent)` est appliqué au focus, ce qui constitue un indicateur partiel mais ne respecte pas pleinement le critère (le changement de bordure doit avoir un ratio de contraste suffisant).

**Aucun indicateur de focus visible n'est défini pour** :
- `.theme-toggle` (bouton de thème)
- `.verify-btn` (bouton "Vérifier")
- `.btn-back` (lien "← Accueil")
- `.user-card` (cartes de navigation)
- `.community-pill` (liens communauté)
- `.admin-card` (cartes admin)

**Correctif recommandé** (à ajouter dans style.css) :
```css
/* Focus visible global — non-regression sur les éléments qui gèrent leur propre focus */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Suppression ciblée uniquement sur les éléments avec indicateur alternatif */
.verify-input:focus-visible,
.list-search:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}
```

### Critère 10.4 — Redimensionnement des textes

**Statut** : ⚠️ PARTIEL

La plupart des tailles de texte sont en `px`. À 200 % de zoom, les mises en page peuvent se dégrader. Non critique mais à surveiller. Le double zoom est assuré par le navigateur pour les pages qui ne bloquent pas le zoom (voir critère 13.9).

---

## 11. Formulaires

### Critère 11.1 — Champs de formulaire avec étiquette

**Statut** : ❌ NON CONFORME

#### Page de vérification (verify.html) — ✅ CONFORME

```html
<label class="verify-label" for="idInput">Numéro d'inscription reçu par mail</label>
<input ... id="idInput" ...>
```
Association `for`/`id` correcte. ✅

#### Formulaire de connexion admin (admin.html) — ❌ NON CONFORME

```html
<!-- Actuel — aucune étiquette -->
<input type="password" id="loginInput" placeholder="Mot de passe" ...>

<!-- Attendu -->
<label for="loginInput" style="...">Mot de passe</label>
<input type="password" id="loginInput" placeholder="Mot de passe" ...>

<!-- Ou, si l'étiquette visible n'est pas souhaitée -->
<input type="password" id="loginInput" aria-label="Mot de passe" placeholder="Mot de passe" ...>
```

**Note** : `placeholder` seul ne constitue pas une étiquette accessible (disparaît à la saisie, contraste souvent insuffisant).

### Critère 11.2 — Champs obligatoires signalés

**Statut** : ❌ NON CONFORME

Aucun champ ne comporte `aria-required="true"` ou `required`.

### Critère 11.3 — Messages d'erreur associés aux champs

**Statut** : ❌ NON CONFORME

Le message d'erreur du formulaire de connexion (`#loginError`) est affiché par `display:none → display:block` sans mécanisme d'annonce pour les lecteurs d'écran. Ajouter `role="alert"` (voir section 7).

### Critère 11.4 — Autocomplete sur les champs de données personnelles

**Statut** : ⚠️ PARTIEL

Le formulaire de connexion admin est un formulaire interne — l'absence d'`autocomplete` est acceptable. Les formulaires d'inscription sont hébergés sur Microsoft Forms / Tally (hors périmètre direct).

---

## 12. Navigation

### Critère 12.1 — Lien d'évitement

**Statut** : ❌ NON CONFORME

**Constat** : Aucune page ne propose de lien "Aller au contenu principal" permettant aux utilisateurs de clavier et de lecteurs d'écran de passer le header répété sur chaque page.

**Correctif** (à ajouter dans le `<body>` de chaque page, avant le `<header>`) :
```html
<a href="#main-content" class="skip-link">Aller au contenu principal</a>
```

Et dans style.css :
```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--accent);
  color: #fff;
  padding: 8px 16px;
  font-weight: 700;
  z-index: 1000;
  text-decoration: none;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
```

Et ajouter `id="main-content"` sur l'élément `<main>` (voir critère 9.2).

### Critère 12.2 — Plan du site

**Statut** : NA pour ce type de site (9 pages, navigation directe depuis l'accueil)

### Critère 12.3 — Page d'accueil accessible

**Statut** : ✅ CONFORME (toutes les pages sont accessibles depuis l'accueil ou le footer)

### Critère 12.4 — Cohérence de la navigation

**Statut** : ✅ CONFORME

Le footer légal est présent et cohérent sur toutes les pages publiques (même structure, mêmes liens). ✅

### Critère 12.5 — Raccourcis clavier

**Statut** : ✅ NA

Aucun raccourci clavier personnalisé n'est implémenté.

### Critère 12.6 — Cohérence de l'ordre de tabulation

**Statut** : ⚠️ PARTIEL

L'ordre de tabulation est généralement logique (suit l'ordre visuel), mais :
- Le bouton "← Accueil" positionné en `position: fixed` sur certaines pages peut perturber l'ordre attendu.
- La modale (#confirmOverlay) n'a pas de piège de focus — voir section 7.

---

## 13. Consultation

### Critère 13.1 — Actualisation automatique

**Statut** : ✅ CONFORME

Aucune actualisation automatique ni redirection sans interaction utilisateur. ✅

### Critère 13.2 — Ouverture dans un nouvel onglet sans avertissement

**Statut** : ❌ NON CONFORME — voir section 6.2.

### Critère 13.3 — Contenu clignotant ou animé

**Statut** : ✅ CONFORME

Les animations présentes (`fadeIn`, `slideUp`, `confetti` dans resultats.html) sont déclenchées par interaction utilisateur ou sont suffisamment courtes pour ne pas constituer un risque de crise épileptique. Aucun contenu ne clignote plus de 3 fois par seconde. ✅

**Amélioration recommandée** : respecter la préférence `prefers-reduced-motion` :
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Critère 13.4 — Documents en téléchargement

**Statut** : ✅ NA

Aucun document bureautique n'est proposé en téléchargement depuis le site public.

### Critère 13.9 — Zoom et agrandissement

**Statut** : ❌ NON CONFORME

**Fichiers concernés** : [inscription.html](../inscription.html), [depot.html](../depot.html)

```html
<!-- Actuel — bloque le zoom sur mobile -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">

<!-- Attendu — autorise le zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

`user-scalable=0` et `maximum-scale=1.0` empêchent les utilisateurs malvoyants de zoomer sur la page. C'est une non-conformité RGAA et une violation du critère WCAG 1.4.4 (Resize text, AA).

---

## 14. Plan de remédiation priorisé

### Priorité 1 — Corrections à fort impact, sans refonte (1–3 jours)

| # | Correction | Fichier(s) | Critère RGAA |
|---|-----------|-----------|-------------|
| P1.1 | Supprimer `user-scalable=0` et `maximum-scale=1.0` | inscription.html, depot.html | 13.9 |
| P1.2 | Ajouter `:focus-visible` global dans le CSS | style.css | 10.3 |
| P1.3 | Ajouter `aria-live="polite"` sur `#verifyStatus` | verify.html | 7.1 |
| P1.4 | Ajouter `role="alert"` sur `#loginError` | admin.html | 7.1 |
| P1.5 | Ajouter `aria-hidden="true"` sur les emoji décoratifs | index.html, depot.html | 1.2 |
| P1.6 | Ajouter `aria-hidden="true"` et `focusable="false"` sur les SVG décoratifs | index.html | 1.3 |
| P1.7 | Corriger `alt` du logo : `alt="CC"` → `alt="Challenge Connecté 2026"` | Toutes les pages | 1.1 |
| P1.8 | Corriger le titre de `depot.html` (supprimer les emoji) | depot.html | 8.3 |
| P1.9 | Ajouter `scope="col"` sur les `<th>` du tableau RGPD | cgu.html | 5.1 |

### Priorité 2 — Structuration et navigation (3–5 jours)

| # | Correction | Fichier(s) | Critère RGAA |
|---|-----------|-----------|-------------|
| P2.1 | Remplacer les `<div class="*-page">` par `<main>` | Toutes les pages | 9.2 |
| P2.2 | Ajouter un lien d'évitement "Aller au contenu principal" | Toutes les pages + style.css | 12.1 |
| P2.3 | Ajouter `<h1>` sur la page d'accueil (peut être visuellement masqué) | index.html | 9.1 |
| P2.4 | Ajouter `<nav aria-label="...">` autour des footers | Toutes les pages | 9.2 |
| P2.5 | Ajouter `aria-label` sur le bouton thème | Toutes les pages | 7.1 |
| P2.6 | Ajouter `aria-label` (ou mention textuelle) sur les liens `target="_blank"` | index.html, verify.html, cgu.html | 6.2 |
| P2.7 | Ajouter `aria-label` sur le lien "← Accueil" | verify.html, cgu.html, reglement.html | 6.1 |

### Priorité 3 — Formulaires et composants JS (5–10 jours)

| # | Correction | Fichier(s) | Critère RGAA |
|---|-----------|-----------|-------------|
| P3.1 | Ajouter `aria-label` (ou `<label>`) sur le champ mot de passe admin | admin.html | 11.1 |
| P3.2 | Ajouter `aria-labelledby` + gestion du focus sur la modale | index.html | 7.1 |
| P3.3 | Implémenter le piège de focus et la fermeture Échap sur la modale | index.html | 7.3 |
| P3.4 | Corriger l'état des cartes verrouillées (aria-disabled) | index.html | 7.1 |
| P3.5 | Revoir la hiérarchie des titres dans cgu.html (articles CGU = h2, § confidentialité = h3) | cgu.html | 9.1 |

### Priorité 4 — Contraste des couleurs (révision graphique)

| # | Correction | Critère RGAA |
|---|-----------|-------------|
| P4.1 | Renforcer `--muted` en mode clair (`#6b7085` → valeur plus sombre, ratio ≥ 4,5:1) | 3.1 |
| P4.2 | Renforcer `--accent` en mode clair ou ne pas l'utiliser pour du texte < 18pt bold | 3.1 |
| P4.3 | Ajouter `@media (prefers-reduced-motion: reduce)` dans le CSS | 13.3 |

---

## Annexe — Checklist de conformité rapide

### Critères A — Bloquants

- [ ] `user-scalable=0` supprimé (inscription.html, depot.html)
- [ ] `:focus-visible` visible sur tous les éléments interactifs
- [ ] `aria-live` sur les zones de résultat dynamique (verifyStatus, loginError)
- [ ] Lien d'évitement présent sur chaque page
- [ ] `<main>` présent sur chaque page
- [ ] `<h1>` présent sur chaque page

### Critères AA — Importants

- [ ] Contraste ≥ 4,5:1 pour tout le texte normal en mode clair
- [ ] Alternatives textuelles des emoji décoratifs masquées (`aria-hidden`)
- [ ] Modale avec `aria-labelledby` + piège de focus
- [ ] Liens `target="_blank"` avertissent l'utilisateur
- [ ] `<nav>` sur les zones de navigation
- [ ] `aria-label` sur le bouton de thème
- [ ] `scope="col"` sur les en-têtes de tableau

---

*Rapport généré le 2026-04-11 — Analyse statique du code source*
*Ce rapport ne remplace pas un test avec des technologies d'assistance réelles (NVDA, JAWS, VoiceOver) ni une évaluation avec des utilisateurs en situation de handicap.*
*Référentiel utilisé : RGAA 4.1 — https://accessibilite.numerique.gouv.fr*
