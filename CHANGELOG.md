# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.10.0] — 2026-04-11

### Ajouté
- **Audit RGPD** (`audits/AUDIT-RGPD.md`) et **Audit Cybersécurité** (`audits/AUDIT-CYBER.md`) : `AUDIT-RGPD-CYBER.md` scindé en deux fichiers distincts. `AUDIT-RGPD.md` couvre la conformité réglementaire (inventaire PII, articles RGPD, DPA, cookies, documents légaux, plan de purge). `AUDIT-CYBER.md` couvre la sécurité technique (authentification, CSV, XSS, SRI, injection Excel, en-têtes HTTP, scénarios d'attaque).

### Supprimé
- `audits/AUDIT-RGPD-CYBER.md` : remplacé par les deux fichiers ci-dessus.

---

## [1.9.0] — 2026-04-11

### Ajouté
- **Audit RGAA 4.1** (`audits/AUDIT-RGAA.md`) : analyse statique complète de l'accessibilité couvrant les 13 thèmes du référentiel (images, cadres, couleurs, liens, scripts, structuration, formulaires, navigation, consultation). Conformité estimée à ~35 %. Plan de remédiation priorisé en 4 niveaux (P1 à P4).

### Modifié
- **Réorganisation des fichiers d'audit** : `AUDIT-RGPD-CYBER.md` déplacé dans le dossier `audits/`. Les liens internes du fichier ont été mis à jour (`../` préfixé). Structure `audits/` créée pour regrouper tous les audits du projet.

---

## [1.8.0] — 2026-04-11

### Ajouté
- **Politique de confidentialité fusionnée dans `cgu.html`** : plutôt que de créer une page dédiée `confidentialite.html`, la politique de confidentialité (7 paragraphes RGPD) est intégrée directement dans `cgu.html` sous une ancre `#confidentialite`. Couvre : responsable du traitement, données collectées (tableau exhaustif), base légale (consentement art. 6.1.a RGPD), destinataires (Microsoft, Tally, équipe orga), durée de conservation (J+30 après récompenses), droits (accès / rectification / effacement / opposition / retrait consentement), droit de saisir la CNIL.

### Modifié
- **Titre de `cgu.html`** : "CGU" → "CGU & Politique de confidentialité" (page et balise `<title>`).
- **Article 4 des CGU** : simplifié, renvoie désormais par lien ancre vers la section Politique de confidentialité ci-dessous.
- **Footers de toutes les pages publiques** (`index.html`, `verify.html`, `inscription.html`, `reglement.html`, `cgu.html`) : libellé du lien mis à jour "CGU" → "CGU & Confidentialité".

---

## [1.7.0] — 2026-04-11

### Ajouté
- **Audit RGPD & cybersécurité** (`AUDIT-RGPD-CYBER.md`) : analyse complète du code source couvrant les niveaux de risque réels (basés sur le modèle de données éphémère côté client), la conformité RGPD article par article, les scénarios d'attaque réalistes et un plan de remédiation priorisé. Niveau de risque global : **MOYEN**.

### Modifié
- **Anonymisation de l'email dans l'export CSV anonymisé** : le domaine et l'extension sont désormais masqués (`@s***.f*` au lieu de `@sncf.fr`), supprimant la fuite de l'identité de l'employeur via le domaine email.

---

## [1.6.0] — 2026-04-11

### Ajouté
- **Page Règlement** (`reglement.html`) : transcription complète des 12 articles du règlement officiel, mise en forme dans la charte du site (articles numérotés, encarts surlignés pour les points critiques, contacts organisateurs cliquables, dark/light mode).
- **Page CGU** (`cgu.html`) : conditions générales d'utilisation en 10 articles (objet, accès, données personnelles RGPD, droit à l'image, propriété intellectuelle, responsabilité, cookies, modification). À relire et compléter par les organisateurs.

### Modifié
- Liens du footer mis à jour sur toutes les pages publiques : Règlement et CGU pointent désormais vers les pages HTML dédiées (plus de placeholder PDF).

---

## [1.5.0] — 2026-04-11

### Ajouté
- **Page d'inscription** (`inscription.html`) : formulaire Microsoft Forms intégré en pleine page sous le header, accessible depuis une nouvelle carte primaire (pleine largeur, bordure accent) sur l'accueil.
- **Overlay de confirmation dépôt** : popup modal sur `index.html` déclenché via redirection Tally (`?depot=ok`). Confirme la prise en compte, indique que l'inscription est en cours de validation, rappelle qu'un dépôt séparé est requis par course, et annonce la publication des résultats. L'URL est nettoyée après affichage.
- **Footer légal** sur toutes les pages publiques (`index.html`, `verify.html`, `inscription.html`) : liens vers le Règlement (`reglement.pdf`, à déposer), les CGU (`cgu.html`, à créer) et le contact `sorunningsncf@sncf.fr`.
- **Numérotation des étapes** (Étape 1 / 2 / 3) sur les cartes participants de l'accueil pour matérialiser le parcours inscription → vérification → dépôt.

### Modifié
- **Page d'accueil** : hiérarchie des cartes revue — S'inscrire en carte primaire pleine largeur, Vérifier + Déposer en grille 2 colonnes dessous. Descriptions mises à jour (délai 24h sur la vérif, date d'activation 8 mai sur le dépôt).
- **Page de vérification** (`verify.html`) : hero compacté (icône petite inline), résultat remonté juste sous le formulaire (plus de scroll), label clarifié ("numéro d'inscription reçu par mail ≠ dossard"), contact Viva Engage conservé.
- **Encart communauté** : liens réels branchés (Strava, WhatsApp via formulaire Office, Viva Engage SNCF).

### Corrigé
- Remplacement du mécanisme `postMessage` Tally (non fonctionnel) par la redirection URL native de Tally.

---

## [1.4.2] — 2026-04-11

### Ajouté
- **Overlay de confirmation** sur `depot.html` : après soumission du formulaire Tally, un écran pleine page remplace l'iframe et confirme la prise en compte du dépôt, informe que l'inscription est en cours de validation, et annonce la publication prochaine des résultats. Déclenché via l'event `Tally.FormSubmitted` (postMessage natif de Tally). Bouton "Retour à l'accueil" bien visible.

---

## [1.4.1] — 2026-04-11

### Ajouté
- **Encart communauté SoRunning** sur la page d'accueil (`index.html`) : trois liens en pills avec icônes SVG brand vers le club Strava, le groupe WhatsApp et l'espace Viva Engage. Design sobre (couleurs brand activées uniquement au hover), placé sous l'espace organisateurs pour conserver la hiérarchie visuelle.

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
