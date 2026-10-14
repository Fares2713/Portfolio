# Farès Benamar | Portfolio

Portfolio statique en français, sans framework ni compilation. Vercel publie la racine du dépôt lors d’un déploiement autorisé.

Le portfolio présente un profil généraliste de chargé de communication et de projets. Le parcours distingue emplois, alternance et projets indépendants. Onze réalisations présentent le contexte, le rôle, les actions, les livrables et le périmètre des résultats. La communication interne Inria, le projet de Séoul et FNK Location font partie de la sélection. Les filtres sont organisés par compétence : communication, événementiel, audiovisuel et digital. Les cartes restent courtes ; les études de cas et les aperçus visuels s’ouvrent dans une fenêtre native avec retour du focus à la fermeture. Sans JavaScript, les études de cas utilisent des accordéons et les aperçus restent accessibles par des liens directs.

## Prévisualisation

Depuis la racine du dépôt :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Pour produire un fichier HTML autonome à ouvrir dans un navigateur, avec les images, styles et interactions intégrés :

```sh
node scripts/preview.mjs
```

Le fichier est écrit dans `../portfolio-apercu.html`, hors du dépôt. Les liens vers les sites publics restent des liens externes. La génération de cet aperçu ne publie rien.

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
