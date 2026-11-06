# Évolution spatiale du portfolio

## Audit et continuité artistique

La version auditée est la page réelle du dépôt, avant modification (2e87d69). Architecture statique HTML, feuilles CSS spécialisées, JavaScript sans framework. Les études de cas utilisent un dialogue natif ; les images partagent déjà une transition à l'ouverture. La navigation conserve le scroll natif et un réglage global de réduction du mouvement.

Codes conservés : fond ivoire `--paper`, bleu `--blue`, encre `--ink`, filets fins, cartes de projet, monogramme, portrait photographique, typographie sans empattement et italiques éditoriales. Manrope et Instrument Serif sont hébergées localement ; le hero conserve ses surcharges Avenir/Segoe et Georgia existantes. Les textes, projets, données professionnelles, documents, filtres et destinations des liens restent inchangés.

## Parti pris

Le contenu devient un ensemble de plans éditoriaux : photographie devant son cadre bleu, supports montés en perspective, grands verbes en italiques. Aucun objet 3D décoratif étranger à cette identité.

- **Hero** : entrée typographique par masque ; le portrait et le cadre se séparent au premier scroll. La réponse au pointeur réutilise les variables du contrôleur existant.
- **Réalisations** : quatre perspectives, « Transmettre », « Rassembler », « Informer », « Développer ». Les supports et descriptions proviennent des cartes existantes : archives Inria, événements Inria, L'Enjeu, VigySafety. Chaque perspective mène à sa carte complète.
- **Scroll** : sur écran d'au moins 1100 × 650, une scène sticky de 320vh transforme les quatre plans en fonction de la position réelle du navigateur. Translation dans la profondeur, rotation des visuels, fondu et repère de progression. Les quatre boutons permettent d'avancer directement ; un lien permet de passer à la sélection complète.
- **Sélection complète** : tous les projets restent dans leur grille et leurs filtres. Une perspective très légère affecte uniquement les images ; les informations et actions restent immobiles.
- **Parcours, compétences et contact** : les révélations et transitions existantes sont conservées. Une inclinaison limitée accompagne certains titres, sans changer l'ordre de lecture.

## Implémentation et limites

`immersive.js` et `immersive.css` sont une amélioration progressive isolée. Pas de dépendance distante, Three.js, GSAP, boucle WebGL, interception de la molette ou moteur de scroll supplémentaire. Le besoin est une mise en scène de plans d'images ; CSS 3D et un rendu requestAnimationFrame déclenché par les événements suffisent.

IntersectionObserver limite le travail aux éléments proches de l'écran. Aucun nouvel asset visuel lourd, quatre images provenant du cache du portfolio. Les transformations animées utilisent principalement transform et opacity. Aucun changement d'URL ou d'ouverture de dialogue automatique au scroll.

Sous 1100px, sur petit écran en hauteur ou lorsque le mouvement est réduit, la scène devient une galerie horizontale native avec boutons. Aucune séquence verticale imposée sur mobile. La préférence système et le réglage persistant du site sont respectés, y compris après changement. Les panneaux inactifs sont inert et retirés de l'arbre d'accessibilité uniquement dans la scène synchronisée ; en galerie tous restent consultables. Sans JavaScript, la sélection complète et les études de cas restent accessibles. À l'impression, la séquence supplémentaire est omise.

Validation : contrôles statiques du dépôt, suite navigateur existante, et `scripts/browser-immersive.mjs` (Playwright et axe, mêmes dépendances que la suite existante). Les mesures automatiques ne remplacent pas une vérification de fluidité sur des appareils physiques variés.
