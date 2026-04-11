# Audit RGPD & Cybersécurité — SoRunning Inscriptions 2026

> **Date** : 2026-04-11  
> **Version analysée** : 1.8.0  
> **Périmètre** : Revue complète du code source (7 113 lignes, 23 fichiers)  
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique automatisée)

---

## Résumé exécutif

L'application **SoRunning Inscriptions 2026** est un site statique (HTML/CSS/JS) hébergé sur GitHub Pages pour la gestion des inscriptions au Challenge Connecté 2026. Elle suit un modèle de données **éphémère côté client** : les données personnelles ne sont jamais stockées sur un serveur ni persistées dans le navigateur — elles transitent uniquement en mémoire JS pendant la session admin.

Ce modèle réduit considérablement la surface d'attaque. **Le niveau de risque global est MOYEN**, les manques étant principalement documentaires (RGPD) plutôt que techniques.

### Tableau de risque

| Domaine | Risque | Note |
|---------|--------|------|
| Authentification admin | 🟡 MOYEN | Sans fichier Excel, aucune PII accessible |
| CSV public (verify.html) | 🟡 MOYEN | Données fortement masquées (v1.7.0), réidentification improbable |
| Services tiers (Microsoft, Tally) | 🟡 MOYEN | Transfert de données hors UE, DPA à vérifier |
| Dépendances CDN sans SRI | 🟡 MOYEN | Risque supply chain théorique |
| Conformité RGPD | 🟡 MOYEN | Manques documentaires, pas de failles techniques majeures |
| Validation des entrées | 🟡 MOYEN | XSS correctement mitigé, injection Excel théorique |
| localStorage | 🟢 FAIBLE | Aucune PII persistée |
| Gestion des erreurs | 🟢 FAIBLE | Pas de fuite d'information sensible |

---

## Table des matières

1. [Structure du projet](#1-structure-du-projet)
2. [Modèle de données — élément clé de l'analyse](#2-modèle-de-données--élément-clé-de-lanalyse)
3. [Inventaire des données personnelles](#3-inventaire-des-données-personnelles)
4. [Authentification et contrôle d'accès](#4-authentification-et-contrôle-daccès)
5. [CSV public et anonymisation](#5-csv-public-et-anonymisation)
6. [localStorage et stockage navigateur](#6-localstorage-et-stockage-navigateur)
7. [Services tiers et intégrations externes](#7-services-tiers-et-intégrations-externes)
8. [Cookies et traceurs](#8-cookies-et-traceurs)
9. [Validation des entrées et sanitisation](#9-validation-des-entrées-et-sanitisation)
10. [Dépendances et bibliothèques externes](#10-dépendances-et-bibliothèques-externes)
11. [Conformité RGPD article par article](#11-conformité-rgpd-article-par-article)
12. [Documents légaux](#12-documents-légaux)
13. [Scénarios d'attaque](#13-scénarios-dattaque)
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
├── resultats.html      (719 lignes) — Résultats (protégée par mot de passe)
├── admin.html          (311 lignes) — Outil admin (dossards, stats, liste)
├── reglement.html      (335 lignes) — Règlement officiel (12 articles)
├── cgu.html            (~370 lignes) — CGU (10 articles) + Politique de confidentialité (7 §)
├── home.html           ( 10 lignes) — Redirection legacy
├── script.js           (2411 lignes) — Logique admin
├── verify.js           ( 264 lignes) — Logique vérification
├── style.css           (2021 lignes) — Design système (dark/light mode)
├── config.json         (   4 lignes) — Feature flags
├── data/
│   └── participants_anonymises_Challenge_Connecté_2026.csv  (52 Ko)
└── logo.png            ( 66 Ko)
```

---

## 2. Modèle de données — élément clé de l'analyse

### Architecture éphémère côté client

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
                              → initiales + email masqué
                                + numéros de dossard
```

### Conséquence directe sur l'évaluation des risques

**Un attaquant qui accède à l'interface admin sans le fichier Excel ne voit aucune donnée personnelle.** L'interface est vide. L'Excel, seul porteur des PII complètes, reste sous la responsabilité exclusive de l'administrateur (fichier local, non exposé sur le web).

---

## 3. Inventaire des données personnelles

### Ce qui est collecté et où ça va

| Donnée | Collectée par | Stockage | Exposé publiquement |
|--------|--------------|----------|---------------------|
| Nom, prénom | Microsoft Forms | Excel admin (local) | Initiale seulement (CSV) |
| Email professionnel | Microsoft Forms | Excel admin (local) | Masqué `l***.a****@s***.f*` (CSV) |
| Âge, sexe, région, société | Microsoft Forms | Excel admin (local) | ❌ Non |
| Catégorie de course | Microsoft Forms | Excel admin + CSV | Oui (participation par épreuve) |
| N° dossard | Généré en admin | localStorage + CSV | Oui |
| Photos de preuve | Tally.so | Serveurs Tally | ❌ Non |

**Volume estimé** : 795 à 900 participants

### Ce qui est et n'est PAS dans le localStorage

```javascript
// Ce qui EST persisté (pas de PII directe)
localStorage['challenge2026_assignments'] = { "123": { number: "A0042", cat: "5km" }, ... }
localStorage['challenge2026_counters']    = { "5km": 43, "10km": 31 }
localStorage['challenge2026_theme']       = "dark"

// Ce qui N'EST PAS persisté (disparaît au refresh)
// → Noms, prénoms, emails, âge, sexe, région, société
```

---

## 4. Authentification et contrôle d'accès

### 🟡 MOYEN — Mot de passe côté client uniquement

**Fichiers** : [admin.html](../admin.html) ligne 54, [resultats.html](../resultats.html) ligne 291

```javascript
const MDP = 'cc2026admin';
// Contournable via : sessionStorage.setItem('admin_ok', '1')
```

### Analyse du risque réel

Le mot de passe est visible dans le code source et dans le dépôt GitHub. Il est contournable en une ligne de console DevTools. Toutefois, **le contournement de ce mot de passe ne donne accès à aucune PII** sans le fichier Excel que seul l'administrateur possède.

| Ce qu'un attaquant peut faire sans Excel | Impact |
|-----------------------------------------|--------|
| Voir l'interface admin vide | Nul |
| Lire le localStorage (ID → dossard, sans noms) | Négligeable |
| Générer de faux dossards avec un faux fichier | Très faible |

Le risque principal concerne `resultats.html` : si des résultats nominatifs y sont uploadés, le niveau monte à ÉLEVÉ.

### Remédiation proportionnée

- Remplacer `cc2026admin` par un token aléatoire long, communiqué hors du dépôt :
  ```bash
  openssl rand -base64 24  # → ex: "k7Hq2mXpL9vRnT4wBcYeJd8sA=="
  ```
- Ne pas committer ce token — le transmettre directement à l'administrateur
- Le renouveler après chaque événement

---

## 5. CSV public et anonymisation

### 🟡 MOYEN — Accès public sans authentification, données fortement masquées

**Fichier** : [data/participants_anonymises_Challenge_Connecté_2026.csv](../data/participants_anonymises_Challenge_Connecté_2026.csv)  
**Chargé par** : [verify.js](../verify.js) ligne 8, sans token ni authentification

### Contenu exposé (v1.7.0)

```
"ID";"NOM";"PRÉNOM";"EMAIL";"Course 5 km";"Course 10 km";...
"188";"A*****";"L*****";"l***.a****@s***.f*";"";"1126";"2048";...
```

Depuis la v1.7.0, le domaine et l'extension sont masqués (`@s***.f*`). Le fichier ne contient ni âge, ni région, ni société — ces champs restent dans l'Excel admin.

### Évaluation du risque de réidentification

| Donnée présente dans le CSV | Permet l'identification ? |
|----------------------------|--------------------------|
| Initiale du nom (`A*****`) | Non — trop commune |
| Initiale du prénom (`L*****`) | Non — trop commune |
| Email masqué (`l***.a****@s***.f*`) | Non — insuffisant sans données tierces |
| Catégorie de course | Non seul, mais contribue faiblement |
| N° dossard | Non — identifiant opaque |

**Conclusion** : la réidentification d'un participant à partir du seul CSV nécessite un accès préalable à un annuaire interne SNCF et des recoupements significatifs. Le risque est **faible en pratique**.

### Risque résiduel — Historique Git

Les versions antérieures à la v1.7.0 (domaine email en clair) sont accessibles via l'historique Git et l'API GitHub. Ce point mérite attention si des versions moins masquées ont été commitées.

**Remédiation optionnelle** : purger l'historique Git du CSV si des versions antérieures contenaient des données plus exposées :
```bash
git filter-repo --path data/participants_anonymises_Challenge_Connecté_2026.csv --invert-paths
git push origin --force
```

---

## 6. localStorage et stockage navigateur

### 🟢 FAIBLE — Aucune PII persistée

Le localStorage ne contient que des données opérationnelles non nominatives (mappings ID → dossard, compteurs, préférences d'affichage). Toutes les données personnelles issues du fichier Excel disparaissent dès le refresh ou la fermeture de l'onglet.

Aucune action corrective requise sur ce point.

---

## 7. Services tiers et intégrations externes

### 🟡 MOYEN — Transferts vers des services américains sans DPA documenté

| Service | Usage | Données transmises | Localisation | DPA |
|---------|-------|-------------------|-------------|-----|
| **Microsoft Forms** | Inscription | Nom, prénom, email, démographie | USA (Azure) | ❌ Non documenté |
| **Tally.so** | Dépôt de preuves | Photos, email | USA | ❌ Non documenté |
| **cdnjs.cloudflare.com** | SheetJS, html2canvas | Aucune (CDN statique) | USA/EU | N/A |
| **Google Fonts** | Typographie | IP navigateur | USA | N/A |

### Absence de Subresource Integrity (SRI)

Les scripts chargés depuis un CDN externe ne sont pas vérifiés par hash. En cas de compromission du CDN, du code malveillant pourrait s'exécuter lors d'une session admin avec un Excel uploadé.

```html
<!-- admin.html — actuel (sans SRI) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<!-- À remplacer par -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
```

Générer le hash : `curl -s [URL] | openssl dgst -sha384 -binary | openssl base64 -A`

### En-têtes HTTP de sécurité manquants

GitHub Pages ne permet pas de configurer des en-têtes personnalisés. Via Cloudflare (plan gratuit) :

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdnjs.cloudflare.com tally.so; frame-src forms.office.com tally.so; style-src 'self' fonts.googleapis.com 'unsafe-inline'; font-src fonts.gstatic.com
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 8. Cookies et traceurs

### 🟡 MOYEN — Traceurs tiers sans bannière de consentement

| Source | Cookies potentiels | Consentement |
|--------|-------------------|-------------|
| Microsoft Forms (iframe) | Analytique, session | ❌ Non demandé |
| Tally.so (iframe) | Analytique | ❌ Non demandé |
| Google Fonts | IP uniquement | ❌ Non demandé |

L'application elle-même ne dépose aucun cookie. Mais les iframes tierces intégrées peuvent le faire sans que l'utilisateur en soit informé, ce qui est non conforme à la directive ePrivacy et aux recommandations CNIL.

**Remédiation** : chargement conditionnel des iframes après acceptation d'une bannière de consentement, ou affichage d'une notice avant l'accès aux pages concernées.

---

## 9. Validation des entrées et sanitisation

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

L'utilisation de `innerHTML` avec ce filtre est actuellement sûre. Le pattern reste fragile si le code évolue sans maintenir la sanitisation — préférer `textContent` pour les contenus purement textuels.

### Injection Excel

Les formules Excel (`=CMD|'/c calc'!A1`) ne sont pas exécutées par SheetJS en JavaScript. Le risque existe uniquement si les données exportées sont ouvertes directement dans Excel sans protection. Pour y remédier, préfixer les valeurs commençant par `=`, `+`, `-`, `@` lors de l'export CSV :

```javascript
function csvSafe(val) {
  return /^[=+\-@]/.test(String(val)) ? "'" + val : val;
}
```

### Validation du fichier Excel uploadé

Aucune validation de schéma n'est appliquée au fichier Excel importé. Un fichier malformé ou hors format sera traité sans erreur explicite. Ajouter à minima une vérification de la présence des colonnes attendues avant traitement.

---

## 10. Dépendances et bibliothèques externes

| Bibliothèque | Version | CVE connues | SRI |
|-------------|---------|------------|-----|
| SheetJS (xlsx) | 0.18.5 | Aucune critique | ❌ |
| html2canvas | 1.4.1 | Aucune critique | ❌ |
| Google Fonts | Latest | Aucune | N/A |
| Tally Embed | Latest | Inconnue | ❌ |

Action requise : ajouter les hashes SRI (voir section 7).

---

## 11. Conformité RGPD article par article

| Article | Intitulé | Statut | Observation |
|---------|---------|--------|-------------|
| **Art. 5** | Principes | ⚠️ PARTIEL | Limitation conservation : CSV sans date d'expiration définie |
| **Art. 6** | Licéité du traitement | ⚠️ PARTIEL | Base légale (consentement) non documentée formellement |
| **Art. 13/14** | Information des personnes | ✅ OUI | Politique de confidentialité intégrée dans `cgu.html#confidentialite` (v1.8.0) |
| **Art. 15** | Droit d'accès | ⚠️ PARTIEL | Email de contact fourni, pas de procédure formelle |
| **Art. 17** | Droit à l'effacement | ❌ NON | Pas de mécanisme de suppression côté utilisateur |
| **Art. 20** | Portabilité | ❌ NON | Pas d'export pour les personnes concernées |
| **Art. 25** | Privacy by design | ⚠️ PARTIEL | Masquage email renforcé en v1.7.0 ; pseudonymisation résiduelle |
| **Art. 28** | Sous-traitant (DPA) | ❌ NON | Pas de DPA visible avec Microsoft ni Tally |
| **Art. 30** | Registre des traitements | ❌ NON | Non constitué |
| **Art. 32** | Sécurité | ⚠️ PARTIEL | HTTPS, données éphémères ; token admin à sécuriser |
| **Art. 33** | Notification de violation | ❌ NON | Pas de procédure documentée |

> ℹ️ La majorité des non-conformités sont **documentaires**. L'application ne présente pas de faille technique majeure entraînant une exposition directe de données personnelles.

---

## 12. Documents légaux

### CGU & Politique de confidentialité ([cgu.html](../cgu.html)) — état v1.8.0

- ✅ Mentionne le RGPD et fournit l'email `sorunningsncf@sncf.fr`
- ✅ Liste exhaustive des données collectées (tableau § 2 : nom, prénom, email, entité, résultats, photos)
- ✅ Base légale documentée (consentement, art. 6.1.a RGPD — § 3)
- ✅ Durée de conservation précisée (J+30 après remise des récompenses — § 5)
- ✅ Sous-traitants mentionnés (Microsoft, Tally, équipe orga — § 4)
- ✅ Droits des personnes détaillés (accès, rectification, effacement, opposition, retrait — § 6)
- ✅ Droit de saisir la CNIL (lien direct — § 7)
- ❌ Ne mentionne pas les cookies et traceurs tiers (Microsoft Forms, Tally, Google Fonts)

### Documents manquants

| Document | Base légale | Priorité |
|---------|------------|---------|
| ~~Politique de confidentialité~~ | ~~Art. 13/14 RGPD~~ | ✅ Fait en v1.8.0 |
| DPA avec Microsoft | Art. 28 RGPD | 🟠 ÉLEVÉ |
| DPA avec Tally | Art. 28 RGPD | 🟠 ÉLEVÉ |
| Registre des traitements | Art. 30 RGPD | 🟡 MOYEN |
| Politique de cookies | Directive ePrivacy + CNIL | 🟡 MOYEN |

---

## 13. Scénarios d'attaque

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

**Mitigé par l'ajout de SRI** (voir section 7).

---

### Scénario 4 — Résultats nominatifs accessibles (Probabilité : FAIBLE / Impact : ÉLEVÉ)

```
1. resultats.html protégée par le même mot de passe visible dans le source
2. Si des résultats incluant des noms complets sont uploadés
3. Contournement par DevTools → accès à des données nominatives
```

**Ce scénario ne s'applique que si les résultats uploadés contiennent des PII non masquées.** À surveiller lors de la phase résultats.

---

## 14. Évaluation fichier par fichier

| Fichier | Risque | Observations |
|---------|--------|-------------|
| [index.html](../index.html) | 🟢 FAIBLE | Pas de traitement de données |
| [inscription.html](../inscription.html) | 🟡 MOYEN | Iframe Microsoft sans bannière de consentement |
| [verify.html](../verify.html) | 🟡 MOYEN | CSV public sans auth, données bien masquées |
| [admin.html](../admin.html) | 🟡 MOYEN | Mot de passe client-side, sans Excel = sans PII |
| [depot.html](../depot.html) | 🟡 MOYEN | Iframe Tally sans SRI ni bannière de consentement |
| [resultats.html](../resultats.html) | 🟡 MOYEN | Même auth faible ; risque conditionnel au contenu uploadé |
| [reglement.html](../reglement.html) | 🟢 FAIBLE | Document statique |
| [cgu.html](../cgu.html) | 🟢 FAIBLE | CGU + Politique de confidentialité complète (v1.8.0) |
| [script.js](../script.js) | 🟡 MOYEN | innerHTML, pas de validation schéma Excel, PII non persistées |
| [verify.js](../verify.js) | 🟡 MOYEN | escapeHtml OK, CSV chargé sans auth |
| [style.css](../style.css) | 🟢 FAIBLE | Aucun problème |
| [config.json](../config.json) | 🟢 FAIBLE | Feature flags publics, pas de secrets |

---

## 15. Plan de remédiation priorisé

### Phase 1 — Court terme (1 à 2 semaines)

#### 1.1 Changer le mot de passe admin

Remplacer `cc2026admin` par un token aléatoire long, communiqué hors du dépôt Git, renouvelé après chaque événement :

```bash
openssl rand -base64 24
```

#### ~~1.2 Créer une politique de confidentialité~~ ✅ Fait en v1.8.0

Politique de confidentialité intégrée dans `cgu.html` (section `#confidentialite`) plutôt qu'une page dédiée — choix pragmatique pour un site interne de cette taille. Couvre les 7 points requis : responsable du traitement, données collectées (tableau), base légale, destinataires, durée de conservation, droits RGPD, droit de saisir la CNIL.

#### 1.3 Bannière de consentement pour les iframes tierces

Chargement conditionnel de Microsoft Forms et Tally.so après acceptation explicite.

---

### Phase 2 — Moyen terme (1 mois)

#### 2.1 Ajouter SRI sur les scripts CDN

```bash
curl -s https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
```

#### 2.2 Configurer les en-têtes HTTP de sécurité

Via Cloudflare (plan gratuit) devant GitHub Pages — voir section 7.

#### 2.3 Mettre à jour les CGU

Ajouter : champs collectés exhaustifs, durées de conservation, mention des sous-traitants Microsoft et Tally, politique de cookies.

#### 2.4 Vérifier les DPA Microsoft et Tally

- Microsoft : un accord est probablement déjà en place au niveau SNCF via le contrat Microsoft 365 entreprise — le confirmer avec le service juridique
- Tally.so : contacter le support pour obtenir leur DPA RGPD et vérifier la résidence des données en UE

---

### Phase 3 — Après l'événement

#### 3.1 Politique de purge des données

```
CSV anonymisé GitHub   → supprimer J+30 après remise des récompenses
Excel admin (local)    → archiver chiffré ou supprimer J+30
Photos Tally           → demander suppression à Tally J+30
localStorage           → se vide automatiquement si non utilisé
```

#### 3.2 Purge de l'historique Git si nécessaire

Si des versions antérieures du CSV (avant v1.7.0, domaine email en clair) ont été commitées :

```bash
git filter-repo --path data/participants_anonymises_Challenge_Connecté_2026.csv --invert-paths
git push origin --force
```

---

## Annexe — Checklist de remédiation

### Sécurité technique

- [ ] Remplacer `cc2026admin` par un token aléatoire hors dépôt Git
- [ ] Ajouter SRI sur SheetJS et html2canvas
- [ ] Configurer les en-têtes HTTP de sécurité (via Cloudflare)
- [ ] Ajouter sanitisation anti-injection Excel sur l'export CSV
- [ ] Remplacer `innerHTML` par `textContent` pour les contenus textuels purs

### RGPD et conformité

- [x] Créer une politique de confidentialité dédiée *(fusionnée dans `cgu.html#confidentialite` — v1.8.0)*
- [x] Mettre à jour les CGU (champs, durées, sous-traitants) *(v1.8.0 — cookies tiers restants)*
- [ ] Ajouter une bannière de consentement pour les iframes tierces
- [ ] Confirmer/établir DPA avec Microsoft (contrat SNCF existant ?)
- [ ] Établir DPA avec Tally.so
- [ ] Constituer le registre des traitements (Art. 30)
- [ ] Définir et appliquer une politique de purge post-événement

---

## Ressources

- [CNIL — Générateur de mentions d'information](https://www.cnil.fr/fr/modeles/outil/generateur-de-mentions-dinformation)
- [CNIL — Guide sécurité des données](https://www.cnil.fr/fr/la-securite-des-donnees)
- [SRI Hash Generator](https://www.srihash.org/)
- [git filter-repo](https://github.com/newren/git-filter-repo)

---

*Rapport généré le 2026-04-11, mis à jour le 2026-04-11 (v1.8.0) — Analyse statique du code source*  
*Ce rapport ne se substitue pas à un audit professionnel ni à un conseil juridique.*
