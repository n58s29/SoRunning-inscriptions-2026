# Audit Cybersécurité — SoRunning Inscriptions 2026

> **Date** : 2026-04-11
> **Version analysée** : 1.8.0
> **Périmètre** : Sécurité technique du code source (HTML/CSS/JS, 23 fichiers)
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique automatisée)

---

## Résumé exécutif

L'application est un site statique (HTML/CSS/JS) hébergé sur GitHub Pages. Elle suit un modèle de données **éphémère côté client** : les PII complètes ne sont jamais exposées sur le web — elles transitent uniquement en mémoire JS pendant la session admin et disparaissent au refresh.

**Le niveau de risque cybersécurité global est MOYEN.** La surface d'attaque est structurellement réduite par l'absence de serveur applicatif. Les vulnérabilités identifiées sont réelles mais d'impact limité compte tenu du modèle de données.

### Tableau de risque

| Domaine | Risque | Note |
|---------|--------|------|
| Authentification admin | 🟡 MOYEN | Mot de passe client-side, mais sans Excel = 0 PII accessible |
| CSV public | 🟡 MOYEN | Données fortement masquées, réidentification improbable |
| Dépendances CDN sans SRI | 🟡 MOYEN | Risque supply chain théorique — critique si session admin active |
| Validation des entrées | 🟡 MOYEN | XSS correctement mitigé, injection Excel théorique |
| En-têtes HTTP de sécurité | 🟡 MOYEN | GitHub Pages ne permet pas de les configurer nativement |
| localStorage | 🟢 FAIBLE | Aucune PII persistée |
| Gestion des erreurs | 🟢 FAIBLE | Pas de fuite d'information sensible |

---

## Table des matières

1. [Structure du projet](#1-structure-du-projet)
2. [Modèle de données — élément clé de l'analyse](#2-modèle-de-données--élément-clé-de-lanalyse)
3. [Authentification et contrôle d'accès](#3-authentification-et-contrôle-daccès)
4. [CSV public et anonymisation](#4-csv-public-et-anonymisation)
5. [Validation des entrées et sanitisation](#5-validation-des-entrées-et-sanitisation)
6. [Dépendances et Subresource Integrity](#6-dépendances-et-subresource-integrity)
7. [En-têtes HTTP de sécurité](#7-en-têtes-http-de-sécurité)
8. [Scénarios d'attaque](#8-scénarios-dattaque)
9. [Évaluation fichier par fichier](#9-évaluation-fichier-par-fichier)
10. [Plan de remédiation priorisé](#10-plan-de-remédiation-priorisé)

---

## 1. Structure du projet

```
SoRunning-inscriptions-2026/
├── index.html          (503 lignes) — Page d'accueil, portail inscription
├── inscription.html    ( 98 lignes) — Iframe Microsoft Forms
├── verify.html         (114 lignes) — Vérification d'inscription par ID
├── depot.html          (106 lignes) — Dépôt de preuves via Tally.so
├── resultats.html      (719 lignes) — Résultats (protégée par mot de passe)
├── admin.html          (311 lignes) — Outil admin (dossards, stats, liste)
├── reglement.html      (335 lignes) — Règlement officiel
├── cgu.html            (~370 lignes) — CGU + Politique de confidentialité
├── script.js           (2411 lignes) — Logique admin
├── verify.js           ( 264 lignes) — Logique vérification
├── style.css           (2021 lignes) — Design système
├── config.json         (   4 lignes) — Feature flags
├── data/
│   └── participants_anonymises_Challenge_Connecté_2026.csv  (52 Ko)
└── logo.png            ( 66 Ko)
```

---

## 2. Modèle de données — élément clé de l'analyse

L'application ne dispose d'aucun serveur applicatif. Toutes les données personnelles transitent selon le flux suivant :

```
Participant → Microsoft Forms → Serveurs Microsoft
                                      │
                              Export manuel (.xlsx)
                                      │
                              Admin uploade dans admin.html
                                      │
                              ┌───────▼────────┐
                              │  Mémoire JS     │  ← PII complètes
                              │  (session only) │    disparaissent
                              └───────┬────────┘    au refresh
                                      │
                          ┌───────────▼───────────┐
                          │      localStorage      │  ← ID → dossard
                          │  (pas de PII directe)  │    uniquement
                          └───────────┬───────────┘
                                      │
                              Export CSV anonymisé
                                      │
                              GitHub Pages (public)
```

**Un attaquant qui accède à l'interface admin sans le fichier Excel ne voit aucune donnée personnelle.** L'Excel, seul porteur des PII complètes, reste sous la responsabilité exclusive de l'administrateur (fichier local, non exposé sur le web).

---

## 3. Authentification et contrôle d'accès

### 🟡 MOYEN — Mot de passe côté client uniquement

**Fichiers** : [admin.html](../admin.html) ligne 54, [resultats.html](../resultats.html) ligne 291

```javascript
const MDP = 'cc2026admin';
// Contournable via : sessionStorage.setItem('admin_ok', '1')
```

Le mot de passe est visible dans le code source public (GitHub). Il est contournable en une ligne de console DevTools.

### Analyse du risque réel

| Ce qu'un attaquant peut faire sans Excel | Impact |
|-----------------------------------------|--------|
| Voir l'interface admin vide | Nul |
| Lire le localStorage (ID → dossard, sans noms) | Négligeable |
| Générer de faux dossards avec un faux fichier | Très faible |

Le risque principal concerne `resultats.html` : si des résultats nominatifs y sont uploadés, le niveau monte à **ÉLEVÉ**.

### Remédiation

- Remplacer `cc2026admin` par un token aléatoire long, communiqué hors du dépôt :
  ```bash
  openssl rand -base64 24  # → ex: "k7Hq2mXpL9vRnT4wBcYeJd8sA=="
  ```
- Ne pas committer ce token — le transmettre directement à l'administrateur
- Le renouveler après chaque événement

---

## 4. CSV public et anonymisation

### 🟡 MOYEN — Accès public sans authentification, données fortement masquées

**Fichier** : [data/participants_anonymises_Challenge_Connecté_2026.csv](../data/participants_anonymises_Challenge_Connecté_2026.csv)
**Chargé par** : [verify.js](../verify.js) ligne 8, sans token ni authentification

### Contenu exposé (depuis v1.7.0)

```
"ID";"NOM";"PRÉNOM";"EMAIL";"Course 5 km";"Course 10 km";...
"188";"A*****";"L*****";"l***.a****@s***.f*";"";"1126";"2048";...
```

Le domaine et l'extension sont masqués (`@s***.f*`). Le fichier ne contient ni âge, ni région, ni société.

### Risque résiduel — Historique Git

Les commits antérieurs à la v1.7.0 peuvent contenir le domaine email en clair (`@sncf.fr`), accessibles via l'API GitHub.

**Remédiation optionnelle** :
```bash
git filter-repo --path data/participants_anonymises_Challenge_Connecté_2026.csv --invert-paths
git push origin --force
```

---

## 5. Validation des entrées et sanitisation

### 🟡 MOYEN — XSS mitigé, injection Excel théorique

### XSS

`escapeHtml()` est correctement implémenté dans [verify.js](../verify.js) :

```javascript
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

L'utilisation de `innerHTML` avec ce filtre est actuellement sûre. Le pattern reste fragile si le code évolue sans maintenir la sanitisation — **préférer `textContent`** pour les contenus purement textuels.

### Injection de formule Excel (CSV injection)

Les formules Excel (`=CMD|'/c calc'!A1`) ne sont pas exécutées par SheetJS en JavaScript. Le risque existe si les données exportées sont ouvertes dans Excel sans protection.

**Remédiation** : préfixer les valeurs commençant par `=`, `+`, `-`, `@` lors de l'export CSV :

```javascript
function csvSafe(val) {
  return /^[=+\-@]/.test(String(val)) ? "'" + val : val;
}
```

### Validation du fichier Excel importé

Aucune validation de schéma n'est appliquée au fichier Excel importé dans [admin.html](../admin.html). Un fichier malformé ou hors format sera traité sans erreur explicite.

**Remédiation** : vérifier la présence des colonnes attendues avant traitement :

```javascript
const REQUIRED_COLS = ['Nom', 'Prénom', 'Email', 'ID'];
const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
if (missing.length) throw new Error(`Colonnes manquantes : ${missing.join(', ')}`);
```

---

## 6. Dépendances et Subresource Integrity

### 🟡 MOYEN — Scripts CDN sans vérification d'intégrité

| Bibliothèque | Version | CVE connues | SRI |
|-------------|---------|------------|-----|
| SheetJS (xlsx) | 0.18.5 | Aucune critique | ❌ |
| html2canvas | 1.4.1 | Aucune critique | ❌ |
| ~~Google Fonts~~ | ~~Latest~~ | ~~Aucune~~ | ✅ Auto-hébergé (v1.12.0) |
| Tally Embed | Latest | Inconnue | ❌ |

Les scripts chargés depuis CDN externe ne sont pas vérifiés par hash. En cas de compromission de `cdnjs.cloudflare.com`, du code malveillant pourrait s'exécuter lors d'une session admin avec un Excel uploadé (exfiltration des PII en mémoire).

### Remédiation — Générer et ajouter les hashes SRI

```bash
# SheetJS
curl -s https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

# html2canvas
curl -s https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<!-- admin.html — actuel (sans SRI) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<!-- À remplacer par -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
```

---

## 7. En-têtes HTTP de sécurité

### 🟡 MOYEN — GitHub Pages ne permet pas de configurer des en-têtes personnalisés

Via Cloudflare (plan gratuit) devant GitHub Pages, les en-têtes suivants peuvent être ajoutés :

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' cdnjs.cloudflare.com tally.so;
  frame-src forms.office.com tally.so;
  style-src 'self' 'unsafe-inline';

X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 8. Scénarios d'attaque

### Scénario 1 — Téléchargement CSV (Probabilité : ÉLEVÉE / Impact : FAIBLE)

```
1. Accès direct à l'URL publique du CSV
2. Téléchargement de l'intégralité en 1 requête HTTP
3. Contenu : initiales, email masqué (s***.f*), numéros de dossard
4. Réidentification nécessite un annuaire interne + recoupements significatifs
```

**Impact limité** : les données obtenues ne permettent pas d'identification directe.

---

### Scénario 2 — Bypass authentification admin (Probabilité : ÉLEVÉE / Impact : FAIBLE)

```
1. DevTools → sessionStorage.setItem('admin_ok', '1')
2. Accès à l'interface admin
3. Sans fichier Excel → interface vide, aucune PII visible
4. localStorage lisible : ID → dossard uniquement (non nominatif)
```

**Impact faible** tant que l'attaquant ne possède pas le fichier Excel.

---

### Scénario 3 — Supply chain CDN (Probabilité : TRÈS FAIBLE / Impact : ÉLEVÉ)

```
1. Compromission de cdnjs.cloudflare.com
2. Code malveillant injecté dans xlsx.full.min.js
3. Lors d'une session admin avec Excel uploadé : exfiltration des PII en mémoire
```

**Mitigé par l'ajout de SRI** (voir section 6).

---

### Scénario 4 — Résultats nominatifs accessibles (Probabilité : FAIBLE / Impact : ÉLEVÉ)

```
1. resultats.html protégée par le même mot de passe visible dans le source
2. Si des résultats incluant des noms complets sont uploadés
3. Contournement par DevTools → accès à des données nominatives
```

**Ce scénario ne s'applique que si les résultats uploadés contiennent des PII non masquées.** À surveiller lors de la phase résultats.

---

## 9. Évaluation fichier par fichier

| Fichier | Risque | Observations |
|---------|--------|-------------|
| [index.html](../index.html) | 🟢 FAIBLE | Pas de traitement de données |
| [inscription.html](../inscription.html) | 🟡 MOYEN | Iframe Microsoft sans bannière de consentement |
| [verify.html](../verify.html) | 🟡 MOYEN | CSV public sans auth, données bien masquées |
| [admin.html](../admin.html) | 🟡 MOYEN | Mot de passe client-side, sans Excel = sans PII |
| [depot.html](../depot.html) | 🟡 MOYEN | Iframe Tally sans SRI ni bannière de consentement |
| [resultats.html](../resultats.html) | 🟡 MOYEN | Même auth faible ; risque conditionnel au contenu uploadé |
| [reglement.html](../reglement.html) | 🟢 FAIBLE | Document statique |
| [cgu.html](../cgu.html) | 🟢 FAIBLE | Document statique |
| [script.js](../script.js) | 🟡 MOYEN | innerHTML, pas de validation schéma Excel, PII non persistées |
| [verify.js](../verify.js) | 🟡 MOYEN | escapeHtml OK, CSV chargé sans auth |
| [style.css](../style.css) | 🟢 FAIBLE | Aucun problème |
| [config.json](../config.json) | 🟢 FAIBLE | Feature flags publics, pas de secrets |

---

## 10. Plan de remédiation priorisé

### Phase 1 — Court terme (1 à 2 semaines)

#### 1.1 Changer le mot de passe admin

Remplacer `cc2026admin` par un token aléatoire long, communiqué hors du dépôt Git :

```bash
openssl rand -base64 24
```

Ne pas committer — transmettre directement à l'administrateur. Renouveler après chaque événement.

### Phase 2 — Moyen terme (1 mois)

#### 2.1 Ajouter SRI sur les scripts CDN

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
```

#### 2.2 Configurer les en-têtes HTTP de sécurité

Via Cloudflare (plan gratuit) devant GitHub Pages — voir section 7.

#### 2.3 Ajouter la sanitisation anti-injection Excel

```javascript
function csvSafe(val) {
  return /^[=+\-@]/.test(String(val)) ? "'" + val : val;
}
```

#### 2.4 Ajouter la validation de schéma Excel

Vérifier la présence des colonnes attendues avant traitement — voir section 5.

### Phase 3 — Après l'événement

#### 3.1 Purge de l'historique Git si nécessaire

Si des versions antérieures du CSV (avant v1.7.0) ont été commitées avec des données moins masquées :

```bash
git filter-repo --path data/participants_anonymises_Challenge_Connecté_2026.csv --invert-paths
git push origin --force
```

---

## Annexe — Checklist sécurité technique

- [ ] Remplacer `cc2026admin` par un token aléatoire hors dépôt Git
- [ ] Ajouter SRI sur SheetJS (`xlsx.full.min.js`)
- [ ] Ajouter SRI sur html2canvas
- [ ] Configurer les en-têtes HTTP de sécurité (via Cloudflare)
- [ ] Ajouter sanitisation anti-injection Excel sur l'export CSV
- [ ] Ajouter validation de schéma sur l'import Excel
- [ ] Remplacer `innerHTML` par `textContent` pour les contenus textuels purs dans [script.js](../script.js)

---

## Ressources

- [CNIL — Guide sécurité des données](https://www.cnil.fr/fr/la-securite-des-donnees)
- [SRI Hash Generator](https://www.srihash.org/)
- [OWASP — CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [git filter-repo](https://github.com/newren/git-filter-repo)

---

*Rapport généré le 2026-04-11, mis à jour le 2026-04-11 (v1.8.0) — Analyse statique du code source*
*Ce rapport ne se substitue pas à un audit professionnel de sécurité (pentest).*
