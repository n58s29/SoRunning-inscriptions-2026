# Audit RGPD & Cybersécurité — SoRunning Inscriptions 2026

> **Date** : 2026-04-11  
> **Périmètre** : Revue complète du code source (7 113 lignes, 23 fichiers)  
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique automatisée)  
> **Révision** : Niveaux de risque recalibrés après analyse du modèle de données réel

---

## Résumé exécutif

L'application **SoRunning Inscriptions 2026** est un site statique (HTML/CSS/JS) hébergé sur GitHub Pages pour la gestion des inscriptions au Challenge Connecté 2026.

### Modèle de données — point clé pour l'évaluation des risques

L'application suit un modèle **"données éphémères côté client"** :

- Les données PII (noms, emails, âge, région, société) **ne sont jamais persistées** — elles transitent uniquement en mémoire JavaScript pendant la durée d'une session admin, via un fichier Excel uploadé manuellement, que seul l'administrateur possède.
- Ce qui est persisté dans `localStorage` se limite aux **assignations ID → N° dossard** et aux compteurs — sans aucune donnée nominative.
- **Un attaquant qui bypasse l'interface admin sans avoir le fichier Excel ne peut accéder à aucune PII.**

Ce constat change significativement les niveaux de risque par rapport à une première lecture du code.

### Tableau de risque révisé

| Domaine | Niveau de risque | Note |
|---------|-----------------|------|
| CSV public (verify.html) | 🔴 CRITIQUE | Seul vrai vecteur d'exposition de données |
| Conformité RGPD | 🟠 ÉLEVÉ | Indépendant de la sécurité technique |
| Authentification admin | 🟡 MOYEN | Risque limité sans fichier Excel |
| Dépendances externes (SRI) | 🟡 MOYEN | Risque théorique supply chain |
| localStorage | 🟢 FAIBLE | Aucune PII persistée |
| Validation des entrées | 🟡 MOYEN | XSS mitigé par escapeHtml() |
| Gestion des erreurs | 🟢 FAIBLE | Messages génériques suffisants |

**Score de conformité RGPD estimé : ~20 %** (principalement des manques documentaires, non des failles techniques majeures)

---

## Table des matières

1. [Structure du projet](#1-structure-du-projet)
2. [Modèle de données et flux](#2-modèle-de-données-et-flux)
3. [Inventaire des données personnelles](#3-inventaire-des-données-personnelles)
4. [Vulnérabilité principale — CSV public](#4-vulnérabilité-principale--csv-public)
5. [Authentification — risque recalibré](#5-authentification--risque-recalibré)
6. [localStorage — risque recalibré](#6-localstorage--risque-recalibré)
7. [Services tiers et intégrations externes](#7-services-tiers-et-intégrations-externes)
8. [Cookies et traceurs](#8-cookies-et-traceurs)
9. [Validation des entrées et sanitisation](#9-validation-des-entrées-et-sanitisation)
10. [Dépendances et bibliothèques externes](#10-dépendances-et-bibliothèques-externes)
11. [Conformité RGPD article par article](#11-conformité-rgpd-article-par-article)
12. [Documents légaux et politique de confidentialité](#12-documents-légaux-et-politique-de-confidentialité)
13. [Scénarios d'attaque réalistes](#13-scénarios-dattaque-réalistes)
14. [Évaluation fichier par fichier](#14-évaluation-fichier-par-fichier)
15. [Plan de remédiation priorisé](#15-plan-de-remédiation-priorisé)

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

## 2. Modèle de données et flux

### Cycle de vie des données PII

```
Participant remplit Microsoft Forms
        │
        ▼
Serveurs Microsoft (USA)
        │
        ▼ Export manuel (.xlsx) — seul l'admin possède ce fichier
Admin uploade le fichier dans admin.html
        │
        ▼ Traitement en mémoire JS uniquement (session courante)
Noms, emails, âge, région, société...
        │                       │
        │                       ▼ PII NON persistées
        │               Disparaissent au refresh/fermeture
        │
        ▼ Seul ce qui est persisté dans localStorage :
ID → N° dossard (pas de noms)
Compteurs par catégorie (pas de noms)
        │
        ▼ Export par l'admin
CSV anonymisé → GitHub Pages (PUBLIC) ← seul vecteur de risque réel
```

### Ce qui n'est PAS stocké côté client

| Donnée | localStorage | sessionStorage | Mémoire JS |
|--------|:------------:|:--------------:|:----------:|
| Noms, prénoms | ❌ | ❌ | ✅ (session) |
| Emails | ❌ | ❌ | ✅ (session) |
| Âge, sexe, région | ❌ | ❌ | ✅ (session) |
| ID → N° dossard | ✅ | ❌ | ✅ |
| Compteurs | ✅ | ❌ | ✅ |
| Flag auth admin | ❌ | ✅ (session) | ❌ |

---

## 3. Inventaire des données personnelles

| Catégorie | Champs | Où stocké | Rétention | Risque |
|-----------|--------|-----------|-----------|--------|
| **Identité** | Nom, prénom | Mémoire JS (session) + Excel admin | Excel : chez l'admin | 🟡 MOYEN |
| **Contact** | Email professionnel | Mémoire JS (session) + Microsoft Forms | Microsoft + Excel admin | 🟠 ÉLEVÉ |
| **Identifiants** | ID participant, N° dossard | localStorage (ID→dossard sans nom) | Indéfinie | 🟢 FAIBLE |
| **Démographie** | Âge, sexe, région, société | Mémoire JS (session) + Excel admin | Excel : chez l'admin | 🟡 MOYEN |
| **Inférence santé** | Catégorie de course (5/10/21 km) | CSV anonymisé public | Indéfinie | 🟡 MOYEN |
| **Résultats** | Temps, classements | Mémoire JS (session) | Session uniquement | 🟢 FAIBLE |
| **Biométrique** | Photos (preuves) | Tally.so uniquement | Inconnue (Tally) | 🟠 ÉLEVÉ |

**Volume estimé** : 795 à 900 participants

> ℹ️ Le fichier Excel source avec les PII complètes reste sous la responsabilité directe de l'administrateur (stockage local, non exposé sur le web). Le risque principal porte sur le CSV anonymisé publié sur GitHub Pages.

---

## 4. Vulnérabilité principale — CSV public

### 🔴 CRITIQUE — Accès public sans authentification au CSV participants

**Fichier** : [data/participants_anonymises_Challenge_Connecté_2026.csv](data/participants_anonymises_Challenge_Connecté_2026.csv) (52 Ko)  
**Chargé par** : [verify.js](verify.js) ligne 8, via `fetch()` sans aucun token

**Structure exposée :**
```
"ID";"NOM";"PRÉNOM";"EMAIL";"Course 5 km";"Course 10 km";...
"188";"A*****";"L*****";"l***.a****@sncf.fr";"";"1126";"2048";...
```

### Problème 1 — Anonymisation insuffisante

La troncature (première lettre + astérisques + domaine email) est réversible par croisement :

```
Données CSV : "A*****" / "l***.a****@sncf.fr" / Région "IDF" / 5 km
Croisement annuaire SNCF + réseaux sociaux → identification en quelques minutes
```

Les données ne sont pas anonymisées au sens CNIL/RGPD — elles sont simplement **pseudonymisées de façon faible**, et ne bénéficient donc pas de l'exemption RGPD pour les données anonymes.

### Problème 2 — Énumération triviale

Les IDs sont séquentiels (1 → 795). Un script peut collecter l'intégralité des données en quelques secondes, sans aucune limite de débit :

```python
# Attaque triviale — aucun rate limiting côté serveur (site statique)
import requests, csv
resp = requests.get('https://.../data/participants_anonymises_....csv')
# → 795 profils collectés en 1 requête
```

### Problème 3 — Historique Git

Les versions précédentes du CSV (potentiellement moins anonymisées) sont accessibles via l'API GitHub, même après modification.

### Articles RGPD concernés

- **Article 25** — Protection des données dès la conception : anonymisation non conforme
- **Article 5(1)(e)** — Limitation de la conservation : pas de date d'expiration
- **Article 32** — Sécurité : accès public non contrôlé à des données pseudonymisées

### Remédiation

**Court terme (sans changer d'architecture) :**
- Supprimer le fichier du dépôt public et purger l'historique Git (`git filter-repo`)
- Remplacer la vérification publique par un système basé sur un token individuel envoyé par email à chaque participant (lien unique `verify.html?token=XYZ`)

**Moyen terme :**
- Passer la vérification derrière une API authentifiée (Netlify/Vercel Functions)
- Utiliser un hachage salé côté serveur pour la recherche par ID

---

## 5. Authentification — risque recalibré

### 🟡 MOYEN — Mot de passe côté client (risque limité par le modèle de données)

**Fichiers** : [admin.html](admin.html) ligne 54, [resultats.html](resultats.html) ligne 291

```javascript
const MDP = 'cc2026admin';
// Contournable via DevTools : sessionStorage.setItem('admin_ok', '1')
```

### Pourquoi le risque est plus faible qu'il n'y paraît

Un attaquant qui bypasse ce mot de passe **sans avoir le fichier Excel** ne peut accéder à aucune PII :

| Ce qu'il peut faire | Impact réel |
|--------------------|-------------|
| Voir l'interface admin vide | Nul |
| Lire localStorage (ID → dossard, sans noms) | Faible |
| Générer de faux dossards avec un faux Excel | Très faible (fraude interne improbable) |
| Voir les résultats (si uploadés) | Dépend du contenu uploadé |

### Ce qui reste problématique

- Le mot de passe est visible sur GitHub → **n'importe quel collaborateur du dépôt le connaît**
- Pas de journal d'accès → impossible de savoir si quelqu'un a consulté les résultats
- Pour `resultats.html` : si des résultats nominatifs sont uploadés, le risque remonte

### Remédiation proportionnée

Le risque ne justifie pas une refonte complète en OAuth2. Une mesure simple et suffisante :

```javascript
// Remplacer le mot de passe hardcodé par une variable d'environnement
// via un build step (ex: Vite, Parcel) ou une Netlify Function
// Ou simplement : mot de passe aléatoire long, communiqué hors-bande
// et changé après chaque événement
const MDP = process.env.ADMIN_PASSWORD; // si build step disponible
```

À minima : **changer le mot de passe** pour un token aléatoire non devinable (`openssl rand -base64 24`) et ne pas le committer dans le dépôt.

---

## 6. localStorage — risque recalibré

### 🟢 FAIBLE — Aucune PII persistée

**Constat** : Les données nominatives (noms, emails, âge, région) ne sont **jamais écrites** dans `localStorage`. Elles existent uniquement en mémoire JS pendant la session admin, et disparaissent au refresh ou fermeture de l'onglet.

**Ce qui est effectivement dans localStorage :**
```javascript
// challenge2026_assignments
{ "123": { number: "A0042", cat: "5km" }, "124": { number: "A0043", cat: "5km" }, ... }

// challenge2026_counters
{ "5km": 43, "10km": 31, "21km": 12 }
```

Aucune de ces données ne permet d'identifier une personne directement. Le risque résiduel (mapping ID → dossard lisible par une extension) est négligeable dans ce contexte.

---

## 7. Services tiers et intégrations externes

### Tableau des services

| Service | Usage | Données transmises | DPA | SRI | Risque |
|---------|-------|-------------------|-----|-----|--------|
| **Microsoft Forms** | Formulaire d'inscription | Noms, emails, démographie | ❌ Non visible | ❌ Non | 🟠 ÉLEVÉ |
| **Tally.so** | Dépôt de preuves | Photos, email, catégorie | ❌ Non visible | ❌ Non | 🟠 ÉLEVÉ |
| **cdnjs.cloudflare.com** | SheetJS, html2canvas | Aucune (CDN statique) | N/A | ❌ Non | 🟡 MOYEN |
| **Google Fonts** | Typographie | Aucune (navigateur) | N/A | N/A | 🟢 FAIBLE |
| **Strava / Viva Engage** | Liens communauté | Aucune (liens externes) | N/A | N/A | 🟢 FAIBLE |

### Absence de Subresource Integrity (SRI)

**admin.html:7-8 :**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

En l'absence de hash SRI, une compromission du CDN permettrait d'injecter du code exécuté lors du traitement des fichiers Excel. Risque théorique mais existant.

**Remédiation :**
```bash
curl -s https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<script src="..." integrity="sha384-HASH" crossorigin="anonymous"></script>
```

### En-têtes HTTP de sécurité manquants

GitHub Pages ne permet pas de configurer des en-têtes personnalisés. Via Cloudflare (plan gratuit) :

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdnjs.cloudflare.com tally.so; frame-src forms.office.com tally.so
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 8. Cookies et traceurs

| Type | Émetteur | Consentement demandé |
|------|---------|---------------------|
| Cookies Microsoft Forms | Microsoft | ❌ Non |
| Cookies Tally.so | Tally | ❌ Non |
| localStorage (thème, config) | Application | ❌ Non (mais non traceur) |

**Problème principal** : Aucune bannière de consentement. Les iframes Microsoft et Tally peuvent déposer des traceurs sans que l'utilisateur en soit informé.

**Remédiation** : Ajouter une bannière de consentement conforme CNIL avant l'affichage des iframes (chargement conditionnel après acceptation).

---

## 9. Validation des entrées et sanitisation

### État actuel

| Entrée | Validation | Sanitisation | Risque |
|--------|-----------|--------------|--------|
| Recherche ID (verify.js:127) | `trim()` + `toLowerCase()` | `escapeHtml()` | 🟢 FAIBLE |
| Upload Excel (script.js:345) | Extension `.xlsx/.xls` | `XLSX.read()` | 🟡 MOYEN |
| Mot de passe (admin.html:59) | Comparaison chaîne | N/A | 🟡 MOYEN |

### XSS — Analyse

`escapeHtml()` est correctement implémenté dans [verify.js](verify.js) :

```javascript
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

Son usage via `innerHTML` (verify.js:117) reste un pattern risqué si le code évolue, mais il est actuellement sûr.

### Injection Excel

Les formules Excel (`=cmd|'/c calc'!A1`) ne sont pas exécutées par SheetJS en JavaScript. Le risque existe uniquement si les données exportées sont ouvertes dans Excel/Google Sheets sans sanitisation préalable.

**Remédiation minimale** : préfixer les valeurs commençant par `=`, `+`, `-`, `@` avec une apostrophe lors de l'export CSV.

---

## 10. Dépendances et bibliothèques externes

| Bibliothèque | Version | Vulnérabilités connues | SRI |
|-------------|---------|----------------------|-----|
| SheetJS (xlsx) | 0.18.5 | Aucune critique connue | ❌ |
| html2canvas | 1.4.1 | Aucune critique connue | ❌ |
| Google Fonts | Latest | Aucune | N/A |
| Tally Embed | Latest | Inconnue | ❌ |

Action recommandée : ajouter les hashes SRI (voir section 7).

---

## 11. Conformité RGPD article par article

| Article | Intitulé | Statut | Problème |
|---------|---------|--------|---------|
| **Art. 5** | Principes | ⚠️ PARTIEL | Limitation conservation non respectée (CSV sans expiration) |
| **Art. 6** | Licéité | ❌ NON | Base légale non documentée formellement |
| **Art. 13/14** | Information | ❌ NON | Pas de politique de confidentialité dédiée |
| **Art. 15** | Droit d'accès | ⚠️ PARTIEL | Email fourni, pas de procédure formelle |
| **Art. 17** | Droit à l'effacement | ❌ NON | Aucun mécanisme de suppression |
| **Art. 20** | Portabilité | ❌ NON | Pas d'export pour les personnes |
| **Art. 25** | Privacy by design | ❌ NON | Anonymisation CSV insuffisante |
| **Art. 28** | Sous-traitant | ❌ NON | Pas de DPA visible avec Microsoft ni Tally |
| **Art. 30** | Registre des traitements | ❌ NON | Non constitué |
| **Art. 32** | Sécurité | ⚠️ PARTIEL | CSV public sans auth (corrigé si section 4 traité) |
| **Art. 33** | Notification violation | ❌ NON | Pas de procédure documentée |
| **Art. 35** | AIPD | ❌ NON | Non réalisée |

> ℹ️ La majorité des non-conformités sont **documentaires** (politique de confidentialité, registre, DPA) et ne reflètent pas nécessairement des pratiques incorrectes — elles ne sont simplement pas formalisées.

---

## 12. Documents légaux et politique de confidentialité

### CGU existantes (cgu.html) — lacunes

- ✅ Mentionne le RGPD et fournit un email de contact
- ❌ Ne liste pas tous les champs collectés (âge, sexe, région, société absents)
- ❌ Ne précise pas la durée de conservation
- ❌ Ne mentionne pas les sous-traitants (Microsoft, Tally)
- ❌ Ne mentionne pas les cookies tiers

### Documents manquants

| Document | Obligatoire | Priorité |
|---------|------------|---------|
| Politique de confidentialité dédiée | ✅ Art. 13/14 | 🟠 ÉLEVÉ |
| DPA avec Microsoft | ✅ Art. 28 | 🟠 ÉLEVÉ |
| DPA avec Tally | ✅ Art. 28 | 🟠 ÉLEVÉ |
| Registre des traitements | ✅ Art. 30 | 🟡 MOYEN |
| Politique de cookies | ✅ LCEN + RGPD | 🟡 MOYEN |
| Plan de réponse aux incidents | ✅ Art. 33 | 🟡 MOYEN |

---

## 13. Scénarios d'attaque réalistes

### Scénario 1 — Exfiltration CSV (Probabilité : ÉLEVÉE / Impact : ÉLEVÉ)

```
1. Accès direct à l'URL du CSV (publique, aucune auth)
2. Téléchargement en 1 requête HTTP
3. Croisement annuaire SNCF → réidentification partielle des 795 participants
```
**C'est le seul scénario vraiment réaliste avec impact sur des données personnelles.**

---

### Scénario 2 — Bypass admin (Probabilité : ÉLEVÉE / Impact : FAIBLE)

```
1. DevTools → sessionStorage.setItem('admin_ok', '1')
2. Interface admin accessible
3. Sans fichier Excel → aucune PII visible
4. Seules données lisibles : ID → dossard en localStorage (non nominatif)
```
**Impact réel quasi nul sans le fichier Excel.**

---

### Scénario 3 — Supply chain CDN (Probabilité : FAIBLE / Impact : ÉLEVÉ)

```
1. Compromission de cdnjs.cloudflare.com
2. Code malveillant injecté dans xlsx.full.min.js
3. Lors d'une session admin avec Excel uploadé : exfiltration des PII en mémoire
```
**Mitigé par l'ajout de SRI.**

---

### Scénario 4 — Injection Excel (Probabilité : TRÈS FAIBLE / Impact : FAIBLE)

```
1. Fichier Excel piégé fourni à l'admin (ingénierie sociale)
2. Upload dans admin.html
3. SheetJS ne les exécute pas → risque uniquement si réexport CSV ouvert dans Excel
```
**Risque négligeable dans ce contexte.**

---

## 14. Évaluation fichier par fichier

| Fichier | Risque | Problèmes |
|---------|--------|----------|
| [index.html](index.html) | 🟢 FAIBLE | Liens externes, URL Viva Engage expose ID groupe |
| [inscription.html](inscription.html) | 🟡 MOYEN | Iframe Microsoft sans bannière consentement |
| [verify.html](verify.html) | 🔴 CRITIQUE | Charge le CSV public sans auth |
| [admin.html](admin.html) | 🟡 MOYEN | Mot de passe client-side, SRI absent |
| [depot.html](depot.html) | 🟡 MOYEN | Tally sans SRI, sans bannière consentement |
| [resultats.html](resultats.html) | 🟡 MOYEN | Même auth faible qu'admin ; risque si résultats nominatifs uploadés |
| [reglement.html](reglement.html) | 🟢 FAIBLE | Document statique, aucun problème |
| [cgu.html](cgu.html) | 🟡 MOYEN | Incomplète (voir section 12) |
| [script.js](script.js) | 🟡 MOYEN | innerHTML, pas de validation schéma Excel |
| [verify.js](verify.js) | 🟡 MOYEN | escapeHtml OK mais innerHTML, CSV sans auth |
| [style.css](style.css) | 🟢 FAIBLE | Aucun problème |
| [config.json](config.json) | 🟢 FAIBLE | Feature flags publics, pas de secrets |

---

## 15. Plan de remédiation priorisé

### Phase 1 — Urgent (1 à 2 semaines)

#### 1.1 Sécuriser ou supprimer le CSV public

**Priorité absolue — seul vrai risque de fuite de données.**

Option A (la plus simple) : **supprimer le CSV du dépôt public** et remplacer la vérification par un lien individuel envoyé par email à chaque participant.

```
Email participant : "Votre lien de vérification : https://sorunning.../verify?token=abc123xyz"
→ Token unique, non devinable, non énumérable
→ Plus besoin de CSV public
```

Option B : passer le CSV derrière une Netlify/Vercel Function qui demande l'ID + une clé de session.

**Nettoyer l'historique Git :**
```bash
# Supprimer le CSV de tout l'historique Git
git filter-repo --path data/participants_anonymises_Challenge_Connecté_2026.csv --invert-paths
git push origin --force
```

#### 1.2 Changer le mot de passe admin

Remplacer `cc2026admin` par un token aléatoire long, communiqué hors du dépôt Git :

```bash
openssl rand -base64 24
# → Ex : "k7Hq2mXpL9vRnT4wBcYeJd8sAz"
```

Ne pas committer ce token. Le changer après chaque événement.

---

### Phase 2 — Court terme (1 mois)

#### 2.1 Politique de confidentialité

Créer une page dédiée `confidentialite.html` incluant :
- Données collectées (liste exhaustive)
- Base légale (consentement à l'inscription)
- Destinataires (Microsoft, Tally, équipe organisatrice)
- Durée de conservation (proposée : J+30 après événement)
- Droits des personnes (accès, rectification, suppression)
- Contact : `sorunningsncf@sncf.fr`
- Droit de saisir la CNIL

#### 2.2 Bannière de consentement cookies

Chargement conditionnel des iframes Microsoft et Tally après acceptation :

```javascript
document.getElementById('acceptCookies').addEventListener('click', () => {
  localStorage.setItem('cookies_accepted', '1');
  loadThirdPartyIframes(); // charge les iframes Microsoft et Tally
});
```

#### 2.3 Ajouter SRI sur les scripts CDN

```bash
# Calculer le hash
curl -s https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
```

#### 2.4 En-têtes de sécurité via Cloudflare

Configurer Cloudflare (plan gratuit) devant GitHub Pages et ajouter via les règles de transformation :

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdnjs.cloudflare.com tally.so; frame-src forms.office.com tally.so; style-src 'self' fonts.googleapis.com 'unsafe-inline'; font-src fonts.gstatic.com
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

### Phase 3 — Moyen terme (3 mois)

#### 3.1 Établir les DPA avec Microsoft et Tally

- Vérifier si un accord Microsoft est déjà en place au niveau SNCF (probable via le contrat Microsoft 365 entreprise)
- Contacter Tally.so pour obtenir leur DPA RGPD et vérifier la résidence des données en UE

#### 3.2 Constituer le registre des traitements (Article 30)

Document interne listant : finalité, base légale, catégories de données, destinataires, durée de conservation, mesures de sécurité.

#### 3.3 Définir une politique de purge

```
Données d'inscription     → suppression J+30 après la remise des récompenses
Résultats anonymisés      → conservation 1 an maximum
Photos de preuves (Tally) → demander suppression à Tally J+30
```

---

## Annexe — Checklist de remédiation

### Sécurité technique

- [ ] Supprimer le CSV public et purger l'historique Git
- [ ] Remplacer le mot de passe `cc2026admin` par un token aléatoire hors dépôt
- [ ] Ajouter SRI sur SheetJS et html2canvas
- [ ] Configurer les en-têtes HTTP de sécurité (via Cloudflare)
- [ ] Remplacer `innerHTML` par `textContent` dans verify.js et script.js
- [ ] Ajouter sanitisation anti-injection Excel à l'export CSV

### RGPD et conformité

- [ ] Créer une politique de confidentialité dédiée
- [ ] Mettre à jour les CGU avec données et durées complètes
- [ ] Ajouter une bannière de consentement cookies
- [ ] Vérifier/établir DPA avec Microsoft (contrat SNCF existant ?)
- [ ] Établir DPA avec Tally.so
- [ ] Constituer le registre des traitements (Article 30)
- [ ] Définir et appliquer une politique de purge post-événement

---

## Ressources

- [CNIL — Générateur de mentions d'information](https://www.cnil.fr/fr/modeles/outil/generateur-de-mentions-dinformation)
- [CNIL — Guide sécurité des données](https://www.cnil.fr/fr/la-securite-des-donnees)
- [SRI Hash Generator](https://www.srihash.org/)
- [git filter-repo](https://github.com/newren/git-filter-repo)

---

*Rapport généré le 2026-04-11 — Analyse statique du code source (23 fichiers, 7 113 lignes)*  
*Ce rapport ne se substitue pas à un audit professionnel ni à un conseil juridique.*
