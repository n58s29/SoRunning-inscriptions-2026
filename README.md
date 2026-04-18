# SoRunning Inscriptions 2026 — Challenge Connecté

Outil de gestion des inscriptions et de génération de dossards pour le **Challenge Connecté 2026**, ainsi qu'un espace public permettant aux participants de vérifier leur inscription, déposer leur preuve de participation et consulter les résultats.

---

## Structure du projet

```
/
├── index.html          # Page d'accueil — portail principal (parcours 3 étapes)
├── inscription.html    # Page publique — formulaire d'inscription Microsoft Forms
├── verify.html         # Page publique — vérification d'inscription
├── depot.html          # Page publique — dépôt de preuve (activable)
├── gpx-cutter.html     # Page publique — découpeur GPX & certificat de performance
├── resultats.html      # Page publique — résultats (activable)
├── admin.html          # Outil d'administration (accès restreint)
├── tshirt.html         # Espace ambassadeurs — générateur d'e-mail commande t-shirt (accès restreint)
├── FAQ.html            # Page publique — foire aux questions (en construction)
├── reglement.html      # Page publique — règlement officiel (12 articles)
├── cgu.html            # Page publique — CGU + Politique de confidentialité (RGPD)
├── config.json         # Flags d'activation des pages depot et résultats
├── verify.js           # Logique de la page de vérification
├── script.js           # Logique de l'outil admin
├── style.css           # Design system partagé (dark/light mode)
├── logo.png            # Logo de l'événement
├── img/                # Visuels du t-shirt SoRunning (tshirt-1.jpg, tshirt-2.jpg…)
├── audits/
│   ├── AUDIT-RGPD.md        # Audit conformité RGPD
│   ├── AUDIT-CYBER.md       # Audit cybersécurité technique
│   └── AUDIT-RGAA.md        # Audit accessibilité RGAA 4.1
└── data/
    └── participants_anonymises.csv   # CSV mis à jour quotidiennement (données masquées)
```

---

## Page d'accueil (`index.html`)

Portail d'entrée du site. Parcours guidé en 3 étapes numérotées :

| Étape | Bouton | Destination | Accès |
|---|---|---|---|
| 1 | S'inscrire au Challenge | `inscription.html` | Libre |
| 2 | Vérifier mon inscription | `verify.html` | Libre |
| 3 | Déposer ma preuve | `depot.html` | Contrôlé par `config.json` (`depotOpen`) |
| — | Résultats | `resultats.html` | Contrôlé par `config.json` (`resultatsOpen`) |
| — | T-shirts | `tshirt.html` | Accès restreint (espace ambassadeurs) |
| — | FAQ | `FAQ.html` | Libre |

Affiche une **rangée jauge + FAQ** en haut de page : la jauge (2/3 de largeur) montre le nombre d'inscrits (issu du CSV anonymisé) / objectif 1 000 avec compteur animé, barre de progression et badge contextuel ; le pavé FAQ (1/3) renvoie vers `FAQ.html`. Sur mobile les deux s'empilent verticalement.

La **carte "S'inscrire au Challenge"** (Étape 1) est mise en avant visuellement : fond rose dégradé, bordure 2 px accent, glow permanent.

Affiche un **popup de confirmation** si la page est chargée avec `?depot=ok` (redirection post-soumission Tally). URL à configurer dans Tally : `https://n58s29.github.io/SoRunning-inscriptions-2026/?depot=ok`.

En bas de page : encart **Communauté SoRunning** (Strava, WhatsApp, Viva Engage) et **footer légal** (Règlement, CGU, contact).

---

## Page d'inscription (`inscription.html`)

Formulaire Microsoft Forms intégré en pleine page sous le header. Accessible à tous. Aucune dépendance à `config.json`.

---

## Page de vérification (`verify.html`)

Permet de confirmer son inscription en saisissant le **numéro d'inscription reçu par email** (≠ numéro de dossard). Le résultat s'affiche directement sous le formulaire. Données mises à jour toutes les 24h.

---

## Page résultats (`resultats.html`)

Activée via `config.json` (`resultatsOpen: true`). Chargement de deux fichiers CSV :

| Fichier | Format | Source |
|---|---|---|
| Résultats | CSV virgule | Export Tally |
| Participants | CSV point-virgule | Export admin |

Fonctionnalités :
- Classements par épreuve (Course 5/10/21,1 km) triés au temps
- Catégories d'âge et genre (ESP/SEN/M0…M4+, H/F)
- Détection d'alertes : dossard inconnu, hors plage, initiales incorrectes
- Tirage au sort animé pour les marcheurs (avec confettis)

---

## Découpeur GPX (`gpx-cutter.html`)

Outil pour les participants ayant couru plus loin que la distance Challenge Connecté visée (cas typique : sortie longue du 8–11 mai). Accessible via un raccourci dans le bandeau de `depot.html`.

Fonctionnement :
1. Dépôt d'un fichier `.gpx` (drag & drop ou sélecteur)
2. Affichage des statistiques de la trace (distance totale, durée, date)
3. Choix de la distance cible — 5 km / 10 km / 21,1 km (boutons désactivés si trace trop courte)
4. Extraction du meilleur segment par algorithme de fenêtre glissante à deux pointeurs (O(n)) — identifie le tronçon le plus rapide couvrant exactement la distance cible
5. Génération d'un **certificat de performance** : distance, temps, allure, date, carte canvas (trace gradient vert → rose sur fond sombre)
6. Export PNG haute résolution (rendu 2×, html2canvas)

Gère les fichiers GPX sans horodatage : repli sur découpe depuis le départ, avertissement affiché.

---

## Pages légales

| Page | Fichier | Statut |
|---|---|---|
| Règlement | `reglement.html` | Complet — à relire |
| CGU & Politique de confidentialité | `cgu.html` | Complet — CGU (10 articles) + Politique de confidentialité RGPD (7 §, ancre `#confidentialite`) |

Les deux pages suivent la charte graphique du site (dark/light mode, Barlow Condensed, footer commun).

---

## Activation des pages (`config.json`)

```json
{
  "depotOpen": false,
  "resultatsOpen": false
}
```

Pour ouvrir une page, modifier le flag correspondant à `true` directement sur GitHub (interface web) et pousser. La modification est effective dès le déploiement GitHub Pages (quelques secondes).

- `depotOpen: true` → active la page de dépôt de preuve
- `resultatsOpen: true` → active la page des résultats

Tant qu'un flag est à `false`, la page affiche un écran **"Pas encore disponible"** si on accède directement à son URL.

---

## Page publique — Vérification d'inscription (`verify.html`)

Accessible à tous les participants. Permet de confirmer son inscription en saisissant son **identifiant d'inscription** reçu par email.

### Fonctionnement

1. La page charge automatiquement `./data/participants_anonymises.csv` au démarrage.
2. Le participant saisit son ID et clique sur **Vérifier** (ou appuie sur Entrée).
3. Si l'ID est trouvé, la page affiche :
   - Nom anonymisé (ex. `D*****`)
   - Prénom anonymisé (ex. `M*****`)
   - Email masqué (ex. `m***.d****@s***.f*`)
   - Épreuve(s) inscrite(s) (sans numéro de dossard — attribués ultérieurement)
   - Date de dernière mise à jour des données

### Format du CSV attendu

Le fichier `data/participants_anonymises.csv` est généré depuis l'outil admin (voir ci-dessous). Il doit :
- Être encodé **UTF-8 avec BOM**
- Utiliser **`;`** comme séparateur
- Avoir les colonnes `ID;NOM;PRÉNOM;EMAIL;[catégorie…]`

### Mise à jour quotidienne

```
1. Ouvrir admin.html
2. Charger le fichier Excel des inscriptions
3. Aller dans l'onglet "Liste des participants"
4. Cliquer sur "Exporter CSV anonymisé"
5. Déposer le fichier téléchargé dans data/participants_anonymises.csv
6. Commiter et pousser sur GitHub
```

---

## Outil admin (`admin.html`)

Réservé aux organisateurs. L'accès est protégé par un mot de passe demandé au chargement de la page. Nécessite de charger le fichier Excel des inscriptions (export Forms).

### Onglets

| Onglet | Fonctionnalités |
|---|---|
| **Dossards** | Visualisation et export PNG des dossards, application d'une trame personnalisée, envoi par email |
| **Liste des participants** | Recherche, export CSV complet, export CSV anonymisé RGPD |
| **Statistiques** | KPIs (dont total km cumulés — dossards × distances, affiché en macaron doré), répartition par catégorie, sexe, âge, région, société |
| **Doublons** | Détection automatique d'inscriptions dupliquées |
| **Paramètres** | Nom de l'événement, catégories, plages de numéros de dossards |

### Numérotation des dossards

| Catégorie | Plage |
|---|---|
| Course 5 km | 0001 – 0999 |
| Course 10 km | 1001 – 1999 |
| Course 21,1 km | 2001 – 2999 |
| Marche 5 km | 3001 – 3999 |
| Marche 10 km | 4001 – 4999 |
| Marche 21,1 km | 5001 – 5999 |

Les numéros sont persistés dans le `localStorage` du navigateur.

---

## Page ambassadeurs — Commande de t-shirts (`tshirt.html`)

Accessible depuis l'encart organisateurs de la page d'accueil. Protégée par mot de passe (hash SHA-256 via Web Crypto API — le mot de passe n'est jamais stocké en clair dans le code).

### Fonctionnalités

- **Galerie** : affiche automatiquement les images déposées dans `img/` (`tshirt-1.jpg`, `tshirt-2.jpg`…). Fallback graphique si le dossier est vide.
- **Bloc informatif** : tarif (~30 €/unité), arguments de cohésion d'équipe, exemples d'entités ayant commandé (CRG Pays-de-la-Loire, SNCF Mixité).
- **Formulaire de demande** : coordonnées de l'ambassadeur, destinataire (directrice/directeur ou sponsor), nombre de t-shirts, calcul automatique du montant, message personnalisé optionnel.
- **Génération `.eml`** : produit un fichier email RFC 2822 (encodage UTF-8 base64) téléchargeable et directement ouvrable dans Outlook. Aperçu en ligne disponible avant téléchargement.

### Ajouter des images du t-shirt

Déposer les fichiers dans `img/` en les nommant `tshirt-1.jpg`, `tshirt-2.jpg`, etc. La galerie les charge automatiquement sans modifier le code.

---

## Technologies

- HTML / CSS / JavaScript vanilla — aucune dépendance serveur
- [SheetJS (xlsx)](https://sheetjs.com/) — lecture des fichiers Excel
- [html2canvas](https://html2canvas.hertzen.com/) — export PNG des dossards
- Web Crypto API — hash SHA-256 pour la protection par mot de passe
- Polices Barlow & Barlow Condensed auto-hébergées (`fonts/`)
- Hébergement : GitHub Pages

---

## Déploiement (GitHub Pages)

Le site est servi directement depuis la branche `main`. Aucune étape de build requise.

URL publique : `https://n58s29.github.io/SoRunning-inscriptions-2026/`

> Le lien "Administration" en bas de la page de vérification pointe vers `admin.html`. Il est volontairement discret. La page est protégée par mot de passe à l'ouverture.
