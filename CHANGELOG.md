# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

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
