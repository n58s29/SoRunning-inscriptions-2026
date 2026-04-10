# SoRunning Inscriptions 2026 — Challenge Connecté

Outil de gestion des inscriptions et de génération de dossards pour le **Challenge Connecté 2026**, ainsi qu'un espace public permettant aux participants de vérifier leur inscription, déposer leur preuve de participation et consulter les résultats.

---

## Structure du projet

```
/
├── index.html          # Page d'accueil — portail principal
├── verify.html         # Page publique — vérification d'inscription
├── depot.html          # Page publique — dépôt de preuve (activable)
├── resultats.html      # Page publique — résultats (activable)
├── admin.html          # Outil d'administration (accès restreint)
├── config.json         # Flags d'activation des pages depot et résultats
├── verify.js           # Logique de la page de vérification
├── script.js           # Logique de l'outil admin
├── style.css           # Design system partagé (dark/light mode)
├── logo.png            # Logo de l'événement
└── data/
    └── participants_anonymises.csv   # CSV mis à jour quotidiennement
```

---

## Page d'accueil (`index.html`)

Portail d'entrée du site. Présente quatre boutons d'accès :

| Bouton | Destination | Accès |
|---|---|---|
| Vérifier mon inscription | `verify.html` | Libre |
| Administration | `admin.html` | Protégé par mot de passe |
| Déposer votre preuve | `depot.html` | Contrôlé par `config.json` |
| Résultats | `resultats.html` | Contrôlé par `config.json` |

Les boutons "Déposer votre preuve" et "Résultats" affichent un badge **🔒 Bientôt disponible** et sont désactivés tant que les flags correspondants sont à `false` dans `config.json`.

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
   - Email masqué (ex. `m***.d****@sncf.fr`)
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
| **Statistiques** | KPIs, répartition par catégorie, sexe, âge, région, société |
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

## Technologies

- HTML / CSS / JavaScript vanilla — aucune dépendance serveur
- [SheetJS (xlsx)](https://sheetjs.com/) — lecture des fichiers Excel
- [html2canvas](https://html2canvas.hertzen.com/) — export PNG des dossards
- Google Fonts — Barlow & Barlow Condensed
- Hébergement : GitHub Pages

---

## Déploiement (GitHub Pages)

Le site est servi directement depuis la branche `main`. Aucune étape de build requise.

URL publique : `https://n58s29.github.io/SoRunning-inscriptions-2026/`

> Le lien "Administration" en bas de la page de vérification pointe vers `admin.html`. Il est volontairement discret. La page est protégée par mot de passe à l'ouverture.
