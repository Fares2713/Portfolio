# Farès Benamar | Portfolio

Portfolio statique en français, sans framework ni compilation. Vercel publie la racine du dépôt lors d’un déploiement autorisé.

Le portfolio présente un profil généraliste de chargé de communication et de projets. Le parcours distingue emplois, alternance et projets indépendants. Douze réalisations présentent le contexte, le rôle, les actions, les livrables et le périmètre des résultats. La communication interne Inria, le projet de Séoul et FNK Location font partie de la sélection. Les filtres sont organisés par compétence : communication, événementiel, audiovisuel et digital. Les cartes restent courtes ; les études de cas et les aperçus visuels s’ouvrent dans une fenêtre native avec retour du focus à la fermeture. Sans JavaScript, les études de cas utilisent des accordéons et les aperçus restent accessibles par des liens directs.

## Prévisualisation

Depuis la racine du dépôt :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Pour produire un fichier HTML autonome à ouvrir dans un navigateur, avec les images, styles et interactions intégrés :

```sh
node scripts/preview.mjs
```

Le fichier est écrit dans `../portfolio-apercu.html`, hors du dépôt. Les liens vers les sites publics restent des liens externes. La génération de cet aperçu ne publie rien. Le dossier de décisions est une page distincte : pour tester son interactivité, servir le dépôt par HTTP avec la commande ci-dessus.

## Validation

Node 22 est utilisé en CI :

```sh
node --check script.js
node scripts/check.mjs
node scripts/browser-check.mjs
```

Le test navigateur nécessite Playwright 1.56.1, @axe-core/playwright 4.10.2 et Chromium. Dans l’environnement cloud, ces dépendances sont conservées hors du dépôt dans `/workspace/portfolio-tools`. Le script peut utiliser le Chromium fourni par la machine :

```sh
cp scripts/browser-check.mjs /workspace/portfolio-tools/browser-check.mjs
PORTFOLIO_CHROMIUM_PATH=/usr/bin/chromium /workspace/portfolio-tools/node_modules/.bin/node /workspace/portfolio-tools/browser-check.mjs
```

La suite vérifie quatre largeurs (360, 768, 1440, 1920 px), les images, les proportions, les filtres, les liens vers les études de cas, les fenêtres de détail, l’agrandissement des visuels, le retour du focus et les interactions au clavier, le contenu sans JavaScript et la préférence de réduction des mouvements. Les contrôles axe incluent les contrastes ; ils ne remplacent pas un audit WCAG complet. Les captures sont écrites dans `screenshots/`.

## Contenus et attributions

- Inria : alternance d’octobre 2023 à novembre 2025. Les chiffres concernent le périmètre précisé dans chaque fiche. Le projet audiovisuel est présenté comme du copilotage avec un prestataire.
- FNK Location : CDD d’avril à septembre 2026 ; seules les missions confirmées par Farès sont présentées. Aucun résultat chiffré ou support fictif n’est ajouté.
- L’Enjeu : projet média indépendant associatif, distinct d’un emploi salarié. Aucun chiffre d’audience non confirmé.
- VigySafety : projet entrepreneurial de novembre 2025 à avril 2026 ; 6 % de conversion sur environ 1 000 contacts prospectés, sans extrapolation de revenus ou de clients actifs.
- Propulsion Studio, DMANCIEL et le Centre Médical Maréchal Juin restent des expériences secondaires.

Les visuels Inria sont ceux déjà disponibles dans le portfolio. Les légendes distinguent photographies de lieux, travail collectif et contribution personnelle. Aucun document interne supplémentaire n’a été ajouté.

Les captures de L’Enjeu et VigySafety proviennent de leurs sites publics, consultés le 12 octobre 2026. L’aperçu de VigySafety décrit l’état actuel du site ; il n’attribue pas à Farès toutes les évolutions postérieures à sa mission. Les images servies par la page sont optimisées en WebP ; les originaux restent conservés.

## Éléments à compléter avant publication

- Le PDF conservé dans `assets/cv-fares-benamar.pdf` et sous son nom d’origine ne contient pas FNK Location ni toutes les dates confirmées dans la nouvelle demande. Il n’est plus proposé comme CV à jour. Un PDF actualisé permettra de rétablir le téléchargement.
- Le visuel de façade de FNK Location provient de https://fnklocation.com/assets/fnk-agence-hero.jpg, récupéré le 13 octobre 2026 après confirmation de l’adresse du site par Farès. Il présente l’entreprise et n’est pas revendiqué comme une production personnelle. Les supports réalisés pendant la mission ne sont pas disponibles pour une galerie ; aucun résultat chiffré n’est inventé.
- Aucun extrait vidéo autonome ni kakémono de Séoul autorisé n’est disponible. Les aperçus et les légendes indiquent précisément ce qui est montré.

Cette révision doit être prévisualisée et présentée à Farès avant toute publication, conformément à sa demande du 12 octobre 2026.

Les fiches « Conférences scientifiques Inria » et « Journée du siège Inria » détaillent deux volets de la mission événementielle existante. Elles ne constituent pas deux expériences supplémentaires et ne s’ajoutent pas au total des plus de 12 événements de l’alternance. Les photographies sont des vues de contexte, pas des photos prétendument prises lors de ces rendez-vous.

## Les Rencontres de L’Enjeu

Projet personnel de conception d’une édition pilote envisagée en avril 2027. L’événement n’est pas réalisé ; la date exacte, le lieu, les intervenants et le financement restent à confirmer. Le portfolio donne accès aux six PDF, trois DOCX, au classeur de pilotage XLSX, à la page HTML et à une archive complète. Le scénario prévoit 80 participants et 2 310 € TTC, dont une réserve de 10 %, sans présenter ces objectifs comme des résultats.

Les fichiers sont dans `assets/rencontres-enjeu/`. Pour les régénérer : `python3 scripts/build-rencontres.py` (reportlab, python-docx, openpyxl). Les sources sont conservées dans le script et dans le JSON du dossier. Les tableaux de résultats du classeur sont vierges.

## Les petites mains créatives

Projet collectif de fin de formation, préparé en 2025 pour une école élémentaire en REP+ à Argenteuil. Le descriptif transmis par Farès porte sur la découverte artistique et les besoins de financement (matériel, repas et imprévus). Le rôle d’appui à la préparation logistique est une formulation proposée à partir de sa demande ; les détails personnels restent à valider. La fiche ne revendique aucun événement réalisé, partenaire acquis, montant collecté ou résultat pédagogique.

La photographie de l’équipe des Petites mains créatives a été fournie par Farès dans `1745505572412.pdf`. Le JPEG intégré au PDF a été extrait directement, sans modification, puis ajouté à la carte et à la galerie.

L’affiche A3 et l’invitation A5 ont été recréées avec l’outil image dans une identité éditoriale commune (ivoire, noir et doré). Leurs PNG sources sont conservés dans le dossier. `python3 scripts/build_rencontres_visuals.py` réexporte uniquement les deux PDF aux formats exacts et actualise l’archive complète.

Le classeur de pilotage V2 propose 20 onglets visibles : tableau de bord et graphiques, paramètres, budget détaillé en 20 postes, financement, registre des dépenses, rétroplanning de 31 tâches, Gantt, conducteur, RACI, communication, partenaires, intervenants, logistique, comparaison de lieux, risques, décisions, check-list, indicateurs, bilan et mode d’emploi. Il se génère avec `python3 scripts/build_rencontres_workbook.py` depuis les hypothèses du JSON commun. Les formules ont été recalculées dans LibreOffice, avec un scénario de modification de date, jauge, financement et paiements ; les résultats réels ne sont pas inventés.

Vérification du classeur : `python3 scripts/check_rencontres_workbook.py` (LibreOffice requis). Cette vérification recalcule trois scénarios, dont les valeurs nulles et les changements de paramètres, et contrôle les alertes ainsi que la stabilité des dates déjà réalisées.

## Carrousel éditorial L’Enjeu

Six slides « L’IA a une adresse », créées le 14 octobre 2026 avec l’outil image, adaptées de https://lenjeumedia.fr/article/201-l-ia-a-une-adresse. Les chiffres mondiaux des centres de données (415 TWh estimés en 2024, 945 TWh projetés en 2030) ont été vérifiés auprès de l’AIE : https://www.iea.org/reports/energy-and-ai/executive-summary. L’adaptation ne revendique aucune diffusion ni résultat d’audience. Le portfolio propose une galerie avec défilement natif et boutons, transcription accessible, liens vers les images originales, PDF et ZIP. Les images sont des illustrations éditoriales générées, pas des photographies documentaires. `python3 scripts/build_lenjeu_carousel.py` régénère les WebP, le PDF de six pages et l’archive depuis les PNG originaux ; les sources sont dans `assets/lenjeu-carrousel/sources.json`.

Le second carrousel « Musique & IA » comprend cinq slides au format portrait 4:5 : titres courts, typographie sans empattement, fonds alternés bleu électrique, blanc, graphite et citron vert, avec illustrations audio sculpturales. Il adapte l’article https://lenjeumedia.fr/article/463-musique-et-ia-reconnaitre-un-morceau-ne-dit-pas-ce-qu-on-veut-ecouter. Le chiffre de 97 % a été vérifié dans le communiqué Deezer / Ipsos Digital du 12 novembre 2025 ; le périmètre du test est précisé dans la slide et la transcription. Galerie, PDF et PNG originaux restent accessibles avec le premier carrousel. Génération des exports : `python3 scripts/build_lenjeu_carousel.py lenjeu-musique-carrousel`.

Le troisième carrousel porte sur le football féminin : cinq slides en crème, bleu nuit et terracotta, avec illustrations simples et accroches courtes. Il adapte l’article L’Enjeu https://lenjeumedia.fr/article/467-football-feminin-la-hausse-des-salaires-ne-garantit-pas-encore-une-carriere. Les salaires mensuels moyen et médian ont été vérifiés dans le communiqué FIFPRO 2026, consulté le 14 octobre 2026. Le périmètre d’enquête est conservé dans les sources et la transcription. La couverture historique de la fiche L’Enjeu reste inchangée ; les trois séries sont dans la galerie. Exports : `python3 scripts/build_lenjeu_carousel.py lenjeu-football-carrousel`.

Deux séries supplémentaires créées le 14 octobre 2026 : « Péages : où va l’argent ? » (ART, comptes 2024) et « L’espace nous apprend quoi ? » (présentation NASA de CRS-35). Chaque carrousel compte cinq slides avec sources, transcription, PDF et ZIP. Les éléments primaires ont été consultés ; aucun lancement ou résultat médical n’est présenté comme acquis, ni remboursement automatique des péages. Les cinq séries L’Enjeu restent accessibles avec la couverture historique. Exports : `python3 scripts/build_lenjeu_carousel.py lenjeu-autoroutes-carrousel` et `python3 scripts/build_lenjeu_carousel.py lenjeu-iss-carrousel`.

## Direction visuelle et animations

L’ouverture éditoriale « Communication, création & projets. » met en avant la création de contenus, le pilotage événementiel et la coordination d’équipes, en lien avec les expériences Inria et les projets média et digitaux. Le bleu, le papier clair et les accents vert profond structurent la visite : introduction, réalisations, parcours, compétences et contact. Les réalisations conservent leurs contenus, leurs attributions et leurs ressources.

Les animations utilisent principalement `transform` et `opacity` : entrée des éléments, apparitions au défilement via IntersectionObserver, léger déplacement du portrait sur ordinateur, survols des aperçus et ouverture des fenêtres de détail. Une barre indique la progression de lecture. Aucun défilement forcé ni bibliothèque d’animation externe n’est nécessaire.

Le réglage « Réduire les animations » en bas de page est conservé localement quand le stockage est disponible. La préférence système `prefers-reduced-motion` reste prioritaire, y compris lorsqu’elle change pendant la visite. Sans JavaScript, le contenu et les liens restent disponibles. L’impression conserve sa mise en page dédiée.

Références : [performances des animations, web.dev](https://web.dev/articles/animations-and-performance) et [réduction des mouvements, W3C](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html).

## Mémoire de Master 2

Mémoire de recherche 2024–2025 de Farès Benamar sur le rôle de l’intelligence émotionnelle dans les dynamiques collectives des fonctions supports. Le PDF original fourni est conservé dans `assets/memoire-m2-fares-benamar.pdf` (111 pages) ; la couverture WebP est issue de sa première page. La fiche présente la méthodologie qualitative (11 entretiens semi-directifs, dont huit professionnels du siège d’Inria et trois participants extérieurs), ses limites et l’accès au document complet. La note de 18/20, la durée de l’oral de 30 minutes et les trois personnes présentes ont été indiquées par Farès. La fonction de Gilles Rouet reprend la page de garde : directeur de l’ISM-IAE de l’UVSQ et directeur du mémoire.

## Dossier de décisions interactif

`dossier-decisions/` propose un exercice de conception personnel, distinct des missions réalisées : annoncer un service, expliquer une controverse, rectifier une information. L’institution et les pièces sont fictives ; aucun mandat ni résultat mesuré n’est revendiqué. Le visiteur choisit un public, un canal et une contrainte. Les 81 parcours reposent sur des règles éditoriales locales ; aucune API ni génération distante n’est utilisée. Un canal public choisi pour des agents est réorienté vers un briefing interne, avec justification. Une validation manquante change le message et peut différer l’annonce.

`contenus.json` contient les faits, cas et critères ; `moteur.mjs` est partagé par l’interface, les exports et les vérifications. Les paramètres d’URL conservent les quatre choix. Export du parcours en Markdown et impression en PDF depuis le navigateur ; pas de collecte ni d’analyse d’audience. Sans JavaScript, les résumés et les documents restent consultables. Les PDF fixes décrivent le parcours usagers / e-mail / deux heures pour agir et des variantes explicites.

Les documents générés sont dans `assets/dossier-decisions/` : dossier intégral, trois fiches, méthode éditoriale, DOCX modifiable, CSV d’évaluation aux observations vierges, textes Markdown et ZIP. Pour les régénérer depuis la même base :

```sh
python3 scripts/build-decisions.py
```

Prérequis de génération uniquement : Node.js, reportlab, python-docx et polices DejaVu (`/usr/share/fonts/truetype/dejavu`). Aucun de ces outils Python n’est requis pour consulter le site statique. Les textes alternatifs, l’en-tête des PDF et les documents rappellent le statut fictif.

Vérification dédiée : `node scripts/check-decisions.mjs`. Pour le navigateur, copier `scripts/browser-decisions.mjs` dans `/workspace/portfolio-tools/`, puis l’exécuter depuis la racine du dépôt avec Node et `PORTFOLIO_CHROMIUM_PATH=/usr/bin/chromium`. Pour conserver les captures hors du dépôt, définir `PORTFOLIO_DECISIONS_OUTPUT=/workspace/portfolio-tools/decisions-validation`. En CI, elles sont générées par défaut dans `screenshots/decisions/`.

## Navigation et lecture du portfolio

La page conserve les douze réalisations et propose une vue synthèse par défaut, une vue avec visuels et un index d’accès direct. La préférence de présentation est conservée localement ; les filtres continuent à porter sur toutes les réalisations. Les liens d’ancrage placent le focus sur le titre cible, y compris après fermeture du menu mobile (jusqu’à 960 px). Le suivi de rubrique utilise la position des sections, même lorsqu’elles sont très longues. Les études de cas proposent précédent/suivant dans le filtre actif ; la fermeture revient au projet lu. Le défilement de fond est bloqué pendant l’ouverture d’une fenêtre. Sans JavaScript, tous les contenus et l’index natif restent disponibles ; l’en-tête mobile ne masque pas les cibles.

La rubrique « Ma démarche » regroupe le dossier de décisions et l’atelier éditorial. Les accès aux choix et aux documents du dossier restent visibles sur mobile.

## Atelier éditorial utilisable

`atelier-editorial/` est une application statique locale : brief, sources et notes de revue, supports par public, calendrier, historique des versions et décisions de validation déclaratives. Le plan déterministe reprend le message fourni ; il ne génère pas de nouveaux faits. Toute validation demande une relecture préalable, une source revue, un contenu, un angle, un public, une date, un responsable et une décision renseignée. Modifier le contenu, le brief ou une source invalide les validations concernées ; les décisions antérieures restent dans l’historique.

Le stockage est local au navigateur, avec avertissement si la sauvegarde échoue ou si un autre onglet modifie le dossier. Les formulaires s’enregistrent explicitement. Les exports JSON conservent versions et journal ; CSV fournit le tableau de production ; Markdown constitue le document éditorial. Le CSV neutralise les cellules qui pourraient être interprétées comme des formules. Une réimportation exige une nouvelle revue. Limites de cette démonstration : 100 supports, 40 sources et fichiers JSON de 3 Mo ; pas d’authentification, de collaboration simultanée, de publication ou de vérification distante automatique. Aucun gain de temps annoncé ou mesuré.

L’exemple sur la réduction des animations utilise deux références publiques consultées le 24 octobre 2026 : [CSS Working Group, Media Queries Level 5, brouillon](https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion) et [MDN, Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia). Les sources originales ont été consultées via leurs dépôts publics W3C et MDN. Les dates de campagne, affectations et décisions de l’exemple sont fictives. Les sources restent à revoir par l’utilisateur.

`assets/atelier-editorial/` conserve la vidéo réelle de l’outil (WebM, sans audio), ses sous-titres VTT, sa capture d’aperçu et les exports CSV/JSON/Markdown de l’état montré en fin de vidéo. La transcription est disponible dans la page. La vidéo montre la revue d’une source, une affectation, une validation puis sa perte après modification, et l’export du calendrier.

Contrôles : `node scripts/check-atelier.mjs` et `scripts/browser-navigation.mjs` (Playwright et axe). Le contrôle navigateur couvre aussi les ancres, le focus, le menu mobile, les modes de lecture, les filtres et les fenêtres du portfolio.

Pour recréer la vidéo depuis la racine du dépôt, exécuter `scripts/record-atelier.mjs` avec Playwright et son FFmpeg installés, ou le FFmpeg système fourni au cache de travail. Définir `PORTFOLIO_CHROMIUM_PATH` si l’on utilise le Chromium système. Le script nécessite aussi la commande `ffmpeg` pour l’aperçu WebP. Dans l’environnement cloud, les dépendances restent hors dépôt dans `/workspace/portfolio-tools` ; copier le script dans ce dossier et l’exécuter depuis la racine du dépôt. Ne pas désactiver la vérification TLS lors de l’installation des outils.

## Refonte des démonstrations — version 2

Le dossier de décisions s’actualise au changement des choix et propose quatre vues : synthèse, supports, plan d’action et preuves. Les onglets se parcourent au clavier (flèches, Début, Fin). Les alternatives présentent leur intérêt, leur risque et leur condition ; une seule est retenue dans chaque parcours. Le plan distingue les référents et les livrables. Le visiteur peut épingler un parcours pour comparer les décisions et les messages, copier le support et transférer le cas dans l’atelier. La comparaison ne constitue ni un score ni une mesure de performance. Les PDF de référence et le DOCX sont régénérés depuis la même base versionnée.

Le transfert passe par la session du navigateur. L’atelier présente un aperçu et attend une action explicite. Un dossier existant reste protégé par confirmation ; refuser conserve les données. Les trois supports transférés restent des brouillons : sources fictives non revues, dates et responsables non renseignés, aucune validation. Leur origine fictive est conservée dans le JSON et rappelée dans l’interface et le document. Si le stockage de session est indisponible, le dossier de décisions propose un JSON à importer.

L’atelier dispose d’une vue d’ensemble calculée depuis le dossier et d’une navigation entre six étapes. Les repères indiquent les données manquantes et les prochaines actions, sans évaluer automatiquement la véracité des contenus. La production peut être affichée par public, par état ou en liste, filtrée et recherchée. Décliner crée un nouveau brouillon sans validation héritée ; archiver conserve le support et ses versions ; restaurer impose une nouvelle revue. Les champs modifiés entre deux versions sont comparés dans une fenêtre dédiée.

Le calendrier propose un échelonnement avant application. L’espacement est réglable ; les week-ends peuvent être décalés. Les jours fériés et la charge réelle ne sont pas calculés. Appliquer une date modifiée crée une version et retire la validation du support. Les repères de longueur, de texte identique entre publics ou de dates communes pour un responsable sont des aides explicites, pas des verdicts de qualité.

Les exports restent fondés sur les données enregistrées. Le JSON conserve aussi les archives ; CSV et Markdown portent sur la production active. Une synthèse du dossier peut être imprimée ou enregistrée en PDF depuis le navigateur. Les anciens dossiers JSON du schéma 1 sont conservés : l’absence d’archives est interprétée comme une liste vide. La vidéo et ses exports sont actualisés pour la nouvelle interface.

Vérification complémentaire : `scripts/browser-experience.mjs` couvre le transfert protégé, les déclinaisons, la comparaison, l’archivage/restauration, la recherche, la prévisualisation du calendrier, l’application des dates, les exports et les six vues à 320, 768 et 1440 px avec axe. En cloud, copier ce script dans le dossier d’outils externe, puis l’exécuter depuis le dépôt avec `PORTFOLIO_CHROMIUM_PATH=/usr/bin/chromium`. `PORTFOLIO_EXPERIENCE_OUTPUT` permet de placer les captures hors du dépôt.

## Hero animé · Flux bleu

`assets/hero/background-video.mp4` est une animation abstraite originale de 12 secondes (960 × 540, 24 images/s, H.264, sans piste audio, environ 151 Kio). Le poster WebP assure le rendu sans JavaScript ou sans lecture vidéo. Les formes bleues sont générées localement ; aucun stock externe, visage ou texte n’est intégré à la vidéo. Les paramètres de mouvement sont périodiques pour une boucle continue.

Le contrôleur `hero-motion.js` attache la source vidéo uniquement lorsque les conditions autorisent la lecture. Il respecte la préférence système et le réglage local de réduction des animations. Si le navigateur expose une économie de données ou une connexion 2G, aucune vidéo n’est chargée. La lecture se met en pause hors écran, dans un onglet masqué ou derrière une étude de cas. Le bouton de pause du Hero a été retiré ; le réglage global « Réduire les animations » reste disponible en bas de page. L’ancienne préférence de pause propre au Hero est ignorée. En cas de refus d’autoplay ou d’échec du chargement, le poster reste affiché. Le fond est décoratif et ignoré par les technologies d’assistance ; le réglage global est utilisable au clavier.

`hero-motion.css` conserve un masque clair sous le texte, une arrivée progressive des éléments et des survols discrets sur les boutons. Le portrait conserve sa parallaxe légère sur ordinateur, désactivée lorsque les animations sont réduites. La vidéo n’est pas imprimée.

Régénération : `python3 scripts/build-hero-video.py` (NumPy, Pillow, FFmpeg avec libx264). Tests : `node scripts/browser-hero.mjs` (Playwright/axe), avec lectures réelles, absence de bouton dans le Hero, réglage global, visibilité, changements de préférence, absence de téléchargement en mode statique et échec de chargement. Le fichier `assets/hero/source.json` documente la création.

## Direction éditoriale · Typographie et interactions

Le portfolio utilise Manrope (variable) et Instrument Serif (romain et italique), servies localement en WOFF avec `font-display: swap`. Les glyphes et noms d’origine sont conservés ; les licences SIL OFL et les références de téléchargement Google Fonts sont dans `assets/fonts/`. Les trois fichiers représentent environ 136 Kio ; le sans et l’italique du Hero sont préchargés. `typography.css` est partagé avec le dossier de décisions et l’atelier éditorial ; aucun service de polices externe n’est contacté pendant la visite.

`editorial.css` compose les titres par lignes, ajoute des repères de section décoratifs, distingue photos, captures de sites et couvertures documentaires, et conserve les vues synthèse/visuels et les 12 réalisations. Les cadres de navigateur sont des éléments graphiques autour des captures existantes ; les contenus et attributions restent ceux du portfolio. La chronologie conserve les groupes emplois/alternance et projets indépendants. Les dates suivent la lecture sur ordinateur ; un repère visuel désigne l’expérience consultée sans modifier l’ordre des contenus.

Les études de cas présentent un aperçu avec sa légende avant le texte. Deux événements locaux (`portfolio:caseopen` et `portfolio:caseclose`) permettent à `editorial.js` d’animer une image entre la carte et le dialogue natif, avec la Web Animations API. L’image décorative est retirée après la transition ; elle n’intercepte aucun clic. La fermeture native et le retour du focus restent immédiats. Les transitions sont omises pour les images hors écran, les entrées directes aux carrousels et la réduction des animations ; elles ne nécessitent aucune bibliothèque. Un changement de préférence annule les effets en cours. La fermeture rapide est couverte par le test navigateur.

La section contact reprend discrètement le poster du Hero et ajoute une copie locale de l’adresse e-mail. Le lien `mailto:` fonctionne sans JavaScript. Si le presse-papiers est refusé, l’interface propose le lien existant ; aucune donnée n’est envoyée.

Validation : `node scripts/browser-editorial.mjs` vérifie les trois largeurs (320, 768, 1440 px), les polices, l’absence de débordement, le clavier, les transitions et leur nettoyage, le marqueur du parcours, le presse-papiers et son refus, le fonctionnement sans JavaScript et axe. Les suites existantes vérifient les galeries, le Hero et les deux démonstrations. Les captures des tests sont conservées hors dépôt dans l’environnement cloud, ou dans `screenshots/` en CI.

## Contenus et hiérarchie · Octobre 2026

L’accueil annonce le métier de chargé de communication et les domaines communication institutionnelle, contenus et coordination. Trois repères Inria sont désormais intégrés dans le Hero. Quatre projets principaux précèdent les contributions complémentaires et les travaux de formation.

Les conférences scientifiques et la journée du siège sont intégrées dans l’étude de cas des événements institutionnels. Les dix cartes conservent les autres projets ; les anciennes ancres `#projet-conferences` et `#projet-journee-siege` conduisent aux deux exemples dans cette étude. Les formulations précisent les contributions et les périmètres de façon affirmative ; les attributions, les dates et l’état de préparation des projets restent explicites.


## Outils temporairement indisponibles

Le dossier de décisions et l’atelier éditorial sont suspendus à la demande de Farès. Leurs boutons d’accueil sont désactivés et leurs deux pages d’entrée affichent une page de maintenance statique, sans charger les applications. Les modèles, ressources et données de navigateur restent conservés. Les pages complètes sont archivées comme sources inactives dans `scripts/paused-apps/*.html.source`.

- Suspendre : `python3 scripts/set-tools-availability.py pause`.
- Réactiver : `python3 scripts/set-tools-availability.py activate`.

Le fichier `tools-availability.json` reflète cet état. Les tests de modèles restent exécutés ; les suites navigateur des applications actives passent par `scripts/check-app-browsers.mjs` et sont explicitement suspendues pendant la maintenance. `browser-portfolio-content.mjs` vérifie alors les deux pages d’indisponibilité, les boutons désactivés et les supports éditoriaux. La partie atelier de `browser-navigation.mjs` est conditionnée au même état ; les vérifications de navigation du portfolio restent exécutées.

## Ouverture panoramique

La mise en page utilise une largeur maximale de 1 600 px, un titre de plus grande taille et un portrait rectangulaire encadré d’un liseré clair, avec une ombre douce et un contour fin décalé. Trois liens visuels introduisent les archives orales Inria, le média L’Enjeu et le projet de conception des Rencontres. Les légendes distinguent le travail réalisé du projet envisagé. Sur mobile, cette sélection se présente en lignes compactes ; le bandeau des repères adopte un fond sombre.

`assets/rencontres-enjeu/affiche-apercu.webp` est une version allégée de l’affiche existante, réservée à cet aperçu. Le PNG original et les documents téléchargeables restent disponibles.

## Retrait de la section Ma démarche

La section « Des décisions. Un système de travail. » et ses deux cartes ont été retirées du portfolio, avec les liens du menu et du parcours de visite. Les raccourcis de visite proposent désormais les réalisations et le parcours. Les pages autonomes des outils conservent leur état de maintenance.

## Réseaux sociaux chez FNK Location

Le périmètre confirmé par Farès comprend le calendrier éditorial, la création de visuels et vidéos, la programmation et la publication, les messages et commentaires, la publicité et l’analyse des statistiques. Il est détaillé dans l’étude de cas et résumé dans le parcours. Aucune plateforme, aucun budget publicitaire ni résultat chiffré non précisé n’est ajouté.

Les expériences indépendantes L’Enjeu et VigySafety proposent chacune un lien « Voir le site » à côté de l’étude de cas, avec ouverture du site public dans un nouvel onglet.

Le portrait d’ouverture ne comporte plus de légende ni de signature « fb. ». La photo conserve son fichier original et son texte alternatif ; son cadrage vertical 4:5, le contour clair et les angles légèrement arrondis structurent sa présentation.
