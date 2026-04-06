# SoRunning Inscriptions 2026 — Challenge Connecté

Outil de gestion des inscriptions et de génération de dossards pour le **Challenge Connecté 2026**, ainsi qu'une page publique permettant aux participants de vérifier leur inscription.

---

## Structure du projet

```
/
├── index.html          # Page publique — vérification d'inscription
├── admin.html          # Outil d'administration (accès restreint)
├── verify.js           # Logique de la page de vérification
├── script.js           # Logique de l'outil admin
├── style.css           # Design system partagé (dark/light mode)
├── logo.png            # Logo de l'événement
└── data/
    └── participants_anonymises.csv   # CSV mis à jour quotidiennement
```

---

## Page publique — Vérification d'inscription (`index.html`)

Accessible à tous les participants. Permet de confirmer son inscription en saisissant son **identifiant d'inscription** reçu par email.

### Fonctionnement

1. La page charge automatiquement `./data/participants_anonymises.csv` au démarrage.
2. Le participant saisit son ID et clique sur **Vérifier** (ou appuie sur Entrée).
3. Si l'ID est trouvé, la page affiche :
   - Nom anonymisé (ex. `D*****`)
   - Prénom anonymisé (ex. `M*****`)
   - Email masqué (ex. `m***.d****@sncf.fr`)
   - Dossard(s) attribué(s) par catégorie
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

Réservé aux organisateurs. Nécessite de charger le fichier Excel des inscriptions (export Forms).

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

> Le lien "Administration" en bas de la page de vérification (`index.html`) pointe vers `admin.html`. Il est volontairement discret mais accessible à tous — l'outil admin ne contient pas de données personnelles tant qu'aucun fichier Excel n'est chargé.
