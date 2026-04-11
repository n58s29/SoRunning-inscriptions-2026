# Audit RGPD — SoRunning Inscriptions 2026

> **Date** : 2026-04-11
> **Version analysée** : 1.8.0
> **Périmètre** : Conformité au Règlement Général sur la Protection des Données (RGPD)
> **Réalisé par** : Claude Sonnet 4.6 (analyse statique automatisée)

---

## Résumé exécutif

L'application **SoRunning Inscriptions 2026** suit un modèle de données **éphémère côté client** : les données personnelles ne sont jamais stockées sur un serveur ni persistées dans le navigateur — elles transitent uniquement en mémoire JS pendant la session admin.

**Le niveau de risque RGPD global est MOYEN.** Les manques sont principalement documentaires (DPA, registre des traitements, bannière de consentement) plutôt que techniques. La politique de confidentialité requise par l'art. 13/14 RGPD a été intégrée dans `cgu.html` en v1.8.0.

### Tableau de risque RGPD

| Domaine | Risque | Note |
|---------|--------|------|
| Information des personnes (Art. 13/14) | ✅ FAIBLE | Politique de confidentialité présente depuis v1.8.0 |
| Base légale du traitement (Art. 6) | 🟡 MOYEN | Consentement recueilli, mais non documenté formellement côté organisateur |
| Services tiers — DPA (Art. 28) | 🟠 ÉLEVÉ | Pas de DPA visible avec Microsoft ni Tally |
| Cookies et traceurs (ePrivacy) | 🟡 MOYEN | Iframes tierces sans bannière de consentement |
| Durée de conservation (Art. 5) | 🟡 MOYEN | Durée définie dans cgu.html, pas encore appliquée techniquement |
| Registre des traitements (Art. 30) | 🟡 MOYEN | Non constitué |
| Droits des personnes (Art. 15–20) | 🟡 MOYEN | Email de contact fourni, pas de procédure formelle |
| localStorage | 🟢 FAIBLE | Aucune PII persistée |

---

## Table des matières

1. [Structure du projet](#1-structure-du-projet)
2. [Modèle de données — élément clé de l'analyse](#2-modèle-de-données--élément-clé-de-lanalyse)
3. [Inventaire des données personnelles](#3-inventaire-des-données-personnelles)
4. [localStorage et stockage navigateur](#4-localstorage-et-stockage-navigateur)
5. [Services tiers et transferts de données](#5-services-tiers-et-transferts-de-données)
6. [Cookies et traceurs](#6-cookies-et-traceurs)
7. [Conformité RGPD article par article](#7-conformité-rgpd-article-par-article)
8. [Documents légaux](#8-documents-légaux)
9. [Plan de remédiation priorisé](#9-plan-de-remédiation-priorisé)

---

## 1. Structure du projet

```
SoRunning-inscriptions-2026/
├── index.html          — Page d'accueil, portail inscription
├── inscription.html    — Iframe Microsoft Forms
├── verify.html         — Vérification d'inscription par ID
├── depot.html          — Dépôt de preuves via Tally.so
├── resultats.html      — Résultats (protégée par mot de passe)
├── admin.html          — Outil admin (dossards, stats, liste)
├── cgu.html            — CGU (10 articles) + Politique de confidentialité (7 §)
├── data/
│   └── participants_anonymises_Challenge_Connecté_2026.csv
└── ...
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

### Conséquence directe sur l'évaluation RGPD

Le principal dépositaire des PII complètes est le **fichier Excel local** de l'administrateur, qui n'est jamais exposé sur le web. Les risques de fuite par compromission du site sont donc structurellement limités.

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

### Risque de réidentification dans le CSV public

| Donnée présente dans le CSV | Permet l'identification ? |
|----------------------------|--------------------------|
| Initiale du nom (`A*****`) | Non — trop commune |
| Initiale du prénom (`L*****`) | Non — trop commune |
| Email masqué (`l***.a****@s***.f*`) | Non — insuffisant sans données tierces |
| Catégorie de course | Non seul, mais contribue faiblement |
| N° dossard | Non — identifiant opaque |

**Conclusion** : la réidentification nécessite un accès préalable à un annuaire interne SNCF et des recoupements significatifs. Le risque est **faible en pratique**.

### Risque résiduel — Historique Git

Les versions antérieures à la v1.7.0 (domaine email en clair) sont accessibles via l'historique Git et l'API GitHub.

**Remédiation optionnelle** : purger l'historique Git du CSV si des versions antérieures contenaient des données plus exposées :
```bash
git filter-repo --path data/participants_anonymises_Challenge_Connecté_2026.csv --invert-paths
git push origin --force
```

---

## 4. localStorage et stockage navigateur

### 🟢 FAIBLE — Aucune PII persistée

```javascript
// Ce qui EST persisté (pas de PII directe)
localStorage['challenge2026_assignments'] = { "123": { number: "A0042", cat: "5km" }, ... }
localStorage['challenge2026_counters']    = { "5km": 43, "10km": 31 }
localStorage['challenge2026_theme']       = "dark"

// Ce qui N'EST PAS persisté (disparaît au refresh)
// → Noms, prénoms, emails, âge, sexe, région, société
```

Toutes les données personnelles issues du fichier Excel disparaissent dès le refresh ou la fermeture de l'onglet. **Aucune action corrective requise sur ce point.**

---

## 5. Services tiers et transferts de données

### 🟠 ÉLEVÉ — DPA non documentés pour Microsoft et Tally

| Service | Usage | Données transmises | Localisation | DPA |
|---------|-------|-------------------|-------------|-----|
| **Microsoft Forms** | Inscription | Nom, prénom, email, démographie | USA (Azure) | ❌ Non documenté |
| **Tally.so** | Dépôt de preuves | Photos, email | USA | ❌ Non documenté |
| **Google Fonts** | Typographie | IP navigateur | USA | N/A |

L'article 28 du RGPD impose la conclusion d'un contrat de sous-traitance (DPA) avec tout sous-traitant traitant des données personnelles pour le compte du responsable de traitement.

### Remédiation

- **Microsoft** : un DPA est probablement déjà en place au niveau SNCF via le contrat Microsoft 365 entreprise — **confirmer avec le service juridique** que ce contrat couvre l'usage de Microsoft Forms par des organisations internes comme SoRunningSNCF.
- **Tally.so** : contacter le support Tally pour obtenir leur DPA RGPD et vérifier la localisation des données en UE.

---

## 6. Cookies et traceurs

### 🟡 MOYEN — Traceurs tiers sans bannière de consentement

| Source | Cookies potentiels | Consentement |
|--------|-------------------|-------------|
| Microsoft Forms (iframe) | Analytique, session | ❌ Non demandé |
| Tally.so (iframe) | Analytique | ❌ Non demandé |
| Google Fonts | IP navigateur | ❌ Non demandé |

L'application elle-même ne dépose aucun cookie. Mais les iframes tierces intégrées peuvent le faire sans que l'utilisateur en soit informé, ce qui est non conforme à la directive ePrivacy et aux recommandations CNIL.

### Remédiation

Chargement conditionnel des iframes après acceptation explicite d'une notice de consentement. Exemple pour Microsoft Forms :

```html
<!-- Avant chargement de l'iframe, afficher une notice -->
<div id="consent-notice">
  <p>Ce formulaire est hébergé par Microsoft. En continuant, vous acceptez
     que des cookies tiers soient déposés par Microsoft.</p>
  <button onclick="loadForm()">Accepter et continuer</button>
</div>
<div id="form-container" style="display:none">
  <!-- iframe Microsoft Forms ici -->
</div>
```

---

## 7. Conformité RGPD article par article

| Article | Intitulé | Statut | Observation |
|---------|---------|--------|-------------|
| **Art. 5** | Principes | ⚠️ PARTIEL | Durée de conservation définie dans cgu.html, pas encore appliquée techniquement |
| **Art. 6** | Licéité du traitement | ⚠️ PARTIEL | Base légale (consentement) documentée dans cgu.html mais non formalisée côté organisateur |
| **Art. 13/14** | Information des personnes | ✅ OUI | Politique de confidentialité intégrée dans `cgu.html#confidentialite` (v1.8.0) |
| **Art. 15** | Droit d'accès | ⚠️ PARTIEL | Email de contact fourni, pas de procédure formelle documentée |
| **Art. 17** | Droit à l'effacement | ❌ NON | Pas de mécanisme de suppression côté utilisateur |
| **Art. 20** | Portabilité | ❌ NON | Pas d'export des données pour les personnes concernées |
| **Art. 25** | Privacy by design | ⚠️ PARTIEL | Masquage email renforcé en v1.7.0 ; données éphémères en mémoire JS |
| **Art. 28** | Sous-traitant (DPA) | ❌ NON | Pas de DPA visible avec Microsoft ni Tally |
| **Art. 30** | Registre des traitements | ❌ NON | Non constitué |
| **Art. 32** | Sécurité | ⚠️ PARTIEL | HTTPS, données éphémères ; voir AUDIT-CYBER.md |
| **Art. 33** | Notification de violation | ❌ NON | Pas de procédure documentée |

> ℹ️ La majorité des non-conformités sont **documentaires**. L'application ne présente pas de faille technique majeure entraînant une exposition directe de données personnelles.

---

## 8. Documents légaux

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

## 9. Plan de remédiation priorisé

### Phase 1 — Court terme (1 à 2 semaines)

#### ~~1.1 Créer une politique de confidentialité~~ ✅ Fait en v1.8.0

Politique intégrée dans `cgu.html#confidentialite`. Couvre les 7 points requis.

#### 1.2 Bannière de consentement pour les iframes tierces

Chargement conditionnel de Microsoft Forms et Tally.so après acceptation explicite — voir section 6.

### Phase 2 — Moyen terme (1 mois)

#### 2.1 Vérifier / établir les DPA Microsoft et Tally

- Microsoft : vérifier avec le service juridique SNCF que le contrat M365 couvre cet usage
- Tally.so : demander leur DPA et vérifier la résidence des données en UE

#### 2.2 Compléter la politique de confidentialité (cookies tiers)

Ajouter dans `cgu.html#confidentialite` une section sur les cookies tiers déposés par Microsoft Forms, Tally et Google Fonts, avec leur finalité.

#### 2.3 Constituer le registre des traitements (Art. 30)

Documenter a minima :
- Nom et coordonnées du responsable de traitement
- Finalité : gestion des inscriptions au Challenge Connecté 2026
- Catégories de personnes concernées : agents SNCF et filiales
- Catégories de données : identité, email pro, résultats sportifs
- Destinataires : Microsoft, Tally, équipe orga
- Durée de conservation : J+30 après remise des récompenses

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

## Annexe — Checklist RGPD

- [x] Politique de confidentialité (Art. 13/14) *(fusionnée dans `cgu.html#confidentialite` — v1.8.0)*
- [x] CGU mises à jour (champs, durées, sous-traitants) *(v1.8.0 — cookies tiers restants)*
- [ ] Bannière de consentement pour les iframes tierces
- [ ] Confirmer/établir DPA avec Microsoft (contrat SNCF existant ?)
- [ ] Établir DPA avec Tally.so
- [ ] Compléter cgu.html avec la mention des cookies tiers
- [ ] Constituer le registre des traitements (Art. 30)
- [ ] Définir et appliquer la politique de purge post-événement

---

## Ressources

- [CNIL — Générateur de mentions d'information](https://www.cnil.fr/fr/modeles/outil/generateur-de-mentions-dinformation)
- [CNIL — Modèle de registre des traitements](https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement)
- [Tally — Privacy Policy](https://tally.so/privacy)

---

*Rapport généré le 2026-04-11, mis à jour le 2026-04-11 (v1.8.0)*
*Ce rapport ne se substitue pas à un conseil juridique.*
