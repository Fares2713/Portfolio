# Farès Benamar — Portfolio

Site statique en français, sans framework, dépendance npm ni compilation. Servir la racine du dépôt avec un serveur HTTP ; Vercel peut publier ce répertoire directement.

## Structure
- `index.html` : contenu, coordonnées et six études de cas.
- `styles.css` : design responsive, styles clavier, mouvement réduit et impression.
- `script.js` : navigation mobile, filtres et section active. Le contenu et les fiches restent accessibles sans JavaScript.
- `assets/` : images existantes et monogramme du portfolio.
- `scripts/check.mjs` : vérification des ressources, ancres, métadonnées des images et interactions. Exécuter `node scripts/check.mjs` avec Node 22.

## Ligne éditoriale
Présentation directe du métier, sélection de projets, rôle personnel explicite et séparation contexte / contribution / résultat. Les faits, dates, coordonnées et chiffres proviennent du portfolio précédent. Les compétences sont dérivées des contributions décrites ; aucun employeur, diplôme, témoignage ou résultat supplémentaire n'est ajouté.

Le lien vers un PDF de CV absent a été remplacé par une demande par email. Pour rétablir un téléchargement, ajouter un CV à jour puis modifier le lien « Recevoir mon CV ». Le visuel typographique Glow est une composition d'illustration du portfolio, pas une reproduction du logotype livré ; les visuels de la mission restent confidentiels.

## Références de conception
- [Nielsen Norman Group — 5 Steps to Creating a UX-Design Portfolio](https://www.nngroup.com/articles/ux-design-portfolios/) : recommandations sur la sélection, le rôle, le récit et les résultats, adaptées ici à un profil communication.
- [W3C WAI — Page Structure](https://www.w3.org/WAI/tutorials/page-structure/) : régions, hiérarchie des titres et navigation.
- [W3C WAI — Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/) : premiers contrôles d'accessibilité.

## Validation
Vérifications de structure et des ressources, syntaxe JavaScript, tests des filtres et du menu avec simulation du DOM. Contrastes calculés pour les principales paires texte/fond (minimum observé : 6:1). Ces contrôles ne constituent pas un audit WCAG complet.

Avant mise en production, ouvrir la prévisualisation Vercel et contrôler le rendu à 360, 768 et 1440 px, le zoom à 200 %, le parcours clavier et le comportement sans JavaScript. Aucun navigateur de rendu n'était disponible lors de cette refonte ; la validation visuelle reste à effectuer. Vérifier aussi l'actualité des chiffres, de la disponibilité et du profil LinkedIn.
