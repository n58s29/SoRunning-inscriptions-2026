# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.22.0] — 2026-04-20

### Corrigé
- **Bouton "Restaurer depuis CSV"** : utilise désormais un `<input type="file">` dans le DOM (même pattern que "Charger la trame") — plus de blocage navigateur sur le clic programmatique.
- **Bouton "Dossards manquants"** : détection du support `showDirectoryPicker` avec message explicite si navigateur non compatible (Firefox, Safari) ; erreur d'annulation ignorée silencieusement.

---

## [1.21.0] — 2026-04-20

### Ajouté
- **Page de récupération des dossards** (`dossard.html` + `dossard.js`) : les participants saisissent leur numéro d'inscription et visualisent les dossards de leurs épreuves avec un aperçu PNG et un bouton de téléchargement direct.
- **Dossier `dossards/`** réparti en 6 sous-dossiers par catégorie (`course-5km/`, `course-10km/`, `course-21km/`, `marche-5km/`, `marche-10km/`, `marche-21km/`) — 1 454 PNG déposés.
- **Bouton "📥 Restaurer depuis CSV"** (`admin.html`) : relit le CSV anonymisé exporté et restaure tous les assignments ID→numéro dans le localStorage sans régénérer les PNG. Remet aussi les compteurs au bon niveau. Résout la perte d'assignments en cas de changement de session/navigateur.
- **Bouton "🔍 Dossards manquants"** (`admin.html`) : compare les dossards attendus (en mémoire) avec les fichiers présents dans un dossier local sélectionné ; affiche le premier ID d'inscription manquant et la liste complète avec chemin attendu.
- **Correction manuelle du numéro** : double-clic sur le numéro d'un dossard dans la grille admin ouvre un prompt pour corriger l'assignment, avec vérification de conflit.
- **Affichage de l'ID d'inscription** sous chaque prénom dans la grille admin (`inscr. #XXX`), masqué à l'impression et dans les PNG exportés.

### Modifié
- **Export PNG admin** : fichiers nommés `XXXX.png` (ex. `1126.png`) au lieu de `dossard_XXXX.png`.
- **Export CSV anonymisé** : colonnes d'épreuve contiennent le chemin complet (`course-10km/1126.png`) pour correspondre directement à la structure du dossier `dossards/`.

---

## [1.20.0] — 2026-04-19

### Ajouté
- **Modal de sélection export PNG** (`admin.html`) : au clic sur "Exporter les dossards", une popup apparaît avec deux options — tout exporter, ou filtrer par plage d'IDs d'inscription (de XX à YY). Le sous-titre affiche le nombre de dossards disponibles et la plage d'IDs couverte.

---

## [1.19.2] — 2026-04-19

### Corrigé
- **Dossards exportés** : affichage du prénom seul (RGPD — le nom de famille n'apparaît plus sur le fichier PNG généré).
- **Dossards exportés** : numéro remonté dans le cadre rose (`padding-bottom` export passé de 80 px à 200 px).

---

## [1.19.1] — 2026-04-18

### Modifié
- **`index.html`** : étiquettes des étapes (Étape 1 / 2 / 3) passées en rose foncé pour meilleur contraste sur fond rose.

---

## [1.19.0] — 2026-04-18

### Modifié
- **Boutons retour standardisés** sur toutes les pages : `<a href="index.html" class="btn-back">← Accueil</a>` placé dans le `header-right` aux côtés du toggle thème, identique au standard de `inscription.html`.
  - `admin.html` : `admin-back-link` → `btn-back`, attribut `title` supprimé
  - `cgu.html`, `reglement.html`, `verify.html` : lien fixe hors header supprimé, btn-back ajouté dans le header
  - `tshirt.html` : lien avec styles inline remplacé par `btn-back`
  - `gpx-cutter.html` : lien vers `depot.html` remplacé par lien vers `index.html`
  - `FAQ.html` : lien `.back-link` dans le contenu supprimé (CSS inclus), btn-back ajouté dans le header
  - `resultats.html` : doublon `← Retour à l'accueil` dans le contenu supprimé
- **`index.html`** : fond rose dégradé appliqué aux cartes Étape 2 et 3 (même gradient 28→14 % que l'Étape 1). Bulle `.step-num` passée en blanc (`#fff`, fond et bordure semi-transparents blancs) pour éviter le rose sur rose.
- **`index.html`** : titre du pavé FAQ agrandi (18 px → 26 px).
- **`index.html`** : jauge allégée — suppression du label "Inscriptions Challenge Connecté 2026", du badge contextuel, du pourcentage et du message "encore X pour l'objectif". Padding réduit. JS nettoyé en conséquence.

---

## [1.18.0] — 2026-04-18

### Ajouté
- **FAQ dynamique** (`FAQ.html`) : page alimentée par un fichier `data/faq.xlsx` (3 colonnes : `Catégorie`, `Question`, `Réponse`). Chargement via SheetJS, questions groupées par catégorie, rendu en accordéon animé (max-height CSS). Affiche un état de chargement (spinner) puis un état d'erreur si le fichier est absent — avec un bouton "Télécharger le modèle XLSX" qui génère et télécharge un fichier Excel pré-rempli d'exemples (colonnes larges, 8 Q&A de départ).

---

## [1.17.0] — 2026-04-18

### Ajouté
- **Page FAQ** (`FAQ.html`) : page vierge avec header, lien retour accueil et footer — structure prête à recevoir les questions fréquentes.
- **Pavé FAQ** sur `index.html` : carte ❓ "FAQ / Vos questions, nos réponses" occupant le tiers droit de la rangée supérieure, aux côtés de la jauge des inscrits.

### Modifié
- **`index.html` — rangée jauge + FAQ** : la jauge des inscrits est désormais intégrée dans un grid `2fr 1fr` (`.gauge-faq-row`) : jauge à gauche (2/3 de la largeur), pavé FAQ à droite (1/3). Les deux blocs s'empilent verticalement sur mobile (≤ 480 px).
- **`index.html` — carte Inscription** : mise en valeur renforcée — fond rose dégradé (28 → 14 % accent), bordure passée à 2 px, glow rose permanent (`box-shadow`), intensifié au hover.

---

## [1.16.0] — 2026-04-17

### Ajouté
- **Page "Découpeur GPX"** (`gpx-cutter.html`) : outil permettant aux participants ayant couru plus loin que la distance visée d'extraire un segment de preuve conforme. Dépose un fichier `.gpx` via drag & drop ou sélecteur, choisit la distance Challenge Connecté (5 km / 10 km / 21,1 km), et l'outil extrait automatiquement le meilleur temps sur cette distance par algorithme de fenêtre glissante (deux pointeurs, O(n)). Génère un certificat de performance avec distance, temps, allure, date, et carte de la trace rendue sur `<canvas>` (gradient vert → rose, glow, dots départ/arrivée). Le certificat est exportable en PNG haute résolution via html2canvas (rendu 2×). Gère les fichiers GPX sans horodatage (repli sur découpe depuis le départ). Les boutons de distance sont désactivés si la trace est trop courte.
- **Raccourci "✂️ Découper GPX"** dans le bandeau supérieur de `depot.html` : bouton rosé distinct du bouton Accueil, visible dans la vue verrouillée.

---

## [1.14.1] — 2026-04-15

### Modifié
- **`tshirt.html`** : suppression de toutes les références à "Challenge Connecté" dans le contenu de la page (titre, sous-titre du login, bloc info, e-mail généré) — les t-shirts étant destinés à tous les événements SoRunning, le contenu est désormais générique. Objet de l'e-mail simplifié en "Soutien à la commande de t-shirts SoRunning".
- **`tshirt.html` — galerie** : correction de la logique du placeholder "Photos à venir" — l'affichage ne se déclenche plus via un `setTimeout` (risque d'apparition prématurée si les images sont lentes), mais uniquement après que toutes les tentatives de chargement ont abouti à une erreur.
- **`tshirt.html` — header/footer** : alignement visuel avec les autres pages — remplacement du toggle de thème SVG par le bouton emoji standard (`🌙/☀️` + `toggleTheme()`), même clé `localStorage` (`challenge2026_theme`), footer `site-footer` identique aux autres pages (liens Règlement, CGU, e-mail), sous-titre login corrigé en "Commande de t-shirts SoRunning".

---

## [1.14.0] — 2026-04-15

### Ajouté
- **Page "Aide à la commande de t-shirts"** (`tshirt.html`) : espace ambassadeurs protégé par mot de passe (hash SHA-256 via Web Crypto API — mot de passe jamais stocké en clair dans le HTML). Contient une galerie d'images (dossier `img/`), un bloc d'information sur l'intérêt des t-shirts (~30 €/unité, identité commune, exemples : CRG Pays-de-la-Loire et SNCF Mixité), et un formulaire de génération d'e-mail de demande de financement à l'attention d'une directrice/d'un directeur ou d'un sponsor. Le formulaire produit un fichier `.eml` téléchargeable, directement ouvrable dans Outlook.
- **Dossier `img/`** : répertoire dédié aux visuels du t-shirt, chargés dynamiquement par la page (fallback placeholder si aucune image n'est encore présente).
- **Carte "T-shirts"** dans l'encart organisateurs de `index.html` : lien vers `tshirt.html`, icône 👕, intégré à la grille admin (désormais `repeat(auto-fit, minmax(120px, 1fr))` pour s'adapter à 3 cartes).

---

## [1.13.0] — 2026-04-13

### Ajouté
- **Jauge de progression des inscriptions** (`index.html`) : widget gamifiant affiché en tête de page d'accueil, au-dessus de la carte Étape 1. Affiche en temps réel le nombre d'inscrits (lu dynamiquement depuis le CSV anonymisé) sur un objectif de 1 000. Comprend un compteur animé, une barre de progression avec effet shimmer, des repères à 250 / 500 / 750 / 🏁, un badge contextuel (🌱 → 💪 → ⚡ → 🚀 → 🔥) et la progression en pourcentage.

---

## [1.12.0] — 2026-04-11

### Ajouté
- **Polices auto-hébergées** (`fonts/`) : les polices Barlow et Barlow Condensed (14 fichiers `.woff2`, latin + latin-ext, graisses 300/400/600 et 400/600/700/900) sont désormais servies depuis GitHub Pages. Suppression de tout appel externe vers `fonts.googleapis.com` et `fonts.gstatic.com`.

### Modifié
- **`style.css` ligne 1** : `@import` Google Fonts remplacé par 14 blocs `@font-face` locaux pointant vers `fonts/*.woff2`.
- **`audits/AUDIT-RGESN.md`** : section 6.1 marquée ✅ RÉSOLU, résumé exécutif et plan de remédiation mis à jour.
- **`audits/AUDIT-RGPD.md`** : Google Fonts retiré des tableaux sous-traitants et cookies/traceurs ; recommandations mises à jour.
- **`audits/AUDIT-CYBER.md`** : ligne Google Fonts barrée dans le tableau des dépendances ; CSP simplifiée (suppression de `fonts.googleapis.com` et `font-src fonts.gstatic.com`).

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
