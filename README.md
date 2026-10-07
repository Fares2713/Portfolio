# Farès Benamar | Portfolio

Site statique en français, sans framework ni compilation. Vercel publie la racine du dépôt.

## Structure

- `index.html` : parcours, coordonnées et six réalisations.
- `styles.css` : styles responsive, clavier, mouvement réduit et impression.
- `script.js` : navigation mobile, filtres et section active. Les contenus restent accessibles sans JavaScript.
- `assets/cv-fares-benamar.pdf` et `assets/portrait-fares-benamar.jpg` : CV et portrait fournis par Farès, également conservés sous leurs noms d’origine.
- `scripts/check.mjs` : ressources, ancres et interactions ; exécuter avec Node 22.
- `scripts/browser-check.mjs` : vérification Chromium à 360, 768, 1440 et 1920 px, filtres, menu, téléchargement du CV et contrôles axe.

## Contenu

Le parcours professionnel et la formation sont alignés sur le CV fourni. Les réalisations reprennent les faits du portfolio précédent. L’Enjeu est présenté à partir du dépôt du média et du lancement indiqué par Farès : identité, formats et parcours de lecture, sans chiffres d’audience inventés. Le lien public est https://lenjeumedia.fr.

Le symbole L’Enjeu provient du média.

## Références de conception

- [Nielsen Norman Group : Creating a UX-Design Portfolio](https://www.nngroup.com/articles/ux-design-portfolios/) : sélection, rôle, récit et résultats.
- [W3C WAI : Page Structure](https://www.w3.org/WAI/tutorials/page-structure/) : régions, titres et navigation.

## Validation

GitHub Actions exécute les contrôles statiques et les tests navigateur, avec captures en artefacts. Les contrôles automatisés d’accessibilité ne constituent pas un audit WCAG complet. La prévisualisation Vercel permet de revoir le rendu avant fusion.
