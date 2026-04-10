# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.4.0] — 2026-04-10

### Ajouté
- **Page résultats** (`resultats.html`) : classements complets avec chargement de deux CSV (Tally + participants), onglets par épreuve, détection d'alertes (dossard inconnu, hors plage, initiales incorrectes), tirage au sort animé pour les marcheurs avec confettis. Design system du repo (dark/light mode).
- **Formulaire Tally** embarqué en pleine page dans `depot.html` (flag `depotOpen: true`).
- **Classe `.btn-back`** dans `style.css` : bouton retour accueil unifié (haut droite du header, même style sur toutes les pages).

### Modifié
- Page d'accueil : suppression du hero (icône, titre, sous-titre) et réduction de la taille des cartes.
- Badge "bientôt disponible" réduit à un simple 🔒 pour ne pas masquer les icônes des cartes.
- Bouton "← Accueil" déplacé dans le header (haut droite) sur `verify.html`, `depot.html` et `resultats.html`, en remplacement des liens disparates dans les footers.

---

## [1.3.0] — 2026-04-10

### Ajouté
- **Page d'accueil** (`index.html`) : portail principal avec quatre boutons vers les différentes sections du site.
- **Page "Déposer votre preuve"** (`depot.html`) : page contrôlée par `config.json`, affiche "Pas encore disponible" ou le contenu selon le flag `depotOpen`.
- **Page "Résultats"** (`resultats.html`) : page contrôlée par `config.json`, affiche "Pas encore disponible" ou le contenu selon le flag `resultatsOpen`.
- **`config.json`** : fichier de configuration permettant d'activer/désactiver `depot.html` et `resultats.html` depuis GitHub sans modifier le code.
- Lien **"← Accueil"** dans le footer de `verify.html`.

### Modifié
- L'ancienne `index.html` (vérification d'inscription) est renommée `verify.html`.
- `home.html` redirige automatiquement vers `index.html` pour compatibilité des anciens liens.

---

## [1.2.0] — 2026-04-06

### Ajouté
- **Protection par mot de passe** de `admin.html` : un écran de connexion bloque l'accès à la page d'administration au chargement. La session est mémorisée le temps de l'onglet navigateur ouvert.

### Modifié
- **Page de vérification** (`index.html` / `verify.js`) : l'affichage du résultat montre désormais l'épreuve inscrite (ex. « Course 10 km ») sans le numéro de dossard, les numéros n'étant pas encore attribués définitivement.

---

## [1.1.0] — 2026-04-06

### Ajouté
- **Page de vérification d'inscription** (`index.html`) : les participants peuvent vérifier leur inscription en saisissant leur identifiant reçu par email.
- **`verify.js`** : chargement et parsing du CSV anonymisé, recherche par ID, affichage du résultat (nom/prénom/email masqués + dossard(s) attribué(s)).
- **Export CSV anonymisé** (RGPD) dans l'onglet Liste : génère un fichier avec ID, initiales, email masqué et numéros de dossard uniquement.
- **`data/`** : dossier dédié au CSV anonymisé mis à jour quotidiennement (`participants_anonymises.csv`).
- Lien "← Accueil" dans le header de `admin.html`.
- Lien "Administration" discret en pied de page de `index.html`.

### Modifié
- L'ancien `index.html` (outil admin) est renommé `admin.html`.
- `style.css` étendu avec le design system de la page de vérification (états : loading, trouvé, non trouvé, erreur) et le lien retour admin.

---

## [1.0.0] — 2026-04-06

### Ajouté
- **Outil d'administration** (`admin.html`) pour la gestion complète des inscriptions.
- Chargement de fichiers Excel (`.xlsx`, `.xls`) ou CSV via drag & drop ou sélection.
- **Onglet Dossards** : génération automatique des dossards avec numérotation par catégorie, application d'une trame PNG personnalisée, export PNG, envoi par email.
- **Onglet Liste** : tableau des participants avec recherche en temps réel, export CSV complet, impression.
- **Onglet Statistiques** : KPIs, répartition par catégorie, sexe, âge, région et société, export PNG du tableau de bord.
- **Onglet Doublons** : détection automatique des inscriptions potentiellement dupliquées.
- **Onglet Paramètres** : configuration du nom de l'événement, des catégories et des plages de numéros de dossards, persistance en `localStorage`.
- Mode clair / sombre avec détection automatique des préférences système.
- 6 catégories par défaut : Course et Marche en 5 km, 10 km et 21,1 km.
