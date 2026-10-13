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
