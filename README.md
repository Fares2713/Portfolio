# Farès Benamar — Site personnel professionnel

Site statique multipage en français, sans framework ni étape de compilation pour la production. Vercel publie la racine du dépôt ; toutes les pages utilisent des liens HTML natifs et restent disponibles sans JavaScript.

## Parcours
- `index.html` : présentation du métier, trois missions sélectionnées et invitation à découvrir le profil.
- `projets.html` : six réalisations, filtres et mises en page de tailles différentes.
- `profil.html` : parcours, formation, expertises et méthode de travail.
- `contact.html` : coordonnées, opportunités et demande de CV par email.
- `projets/*.html` : six pages de mission, avec contexte, rôle, contribution, résultat et navigation vers la mission suivante.
- `styles.css`, `script.js` : identité éditoriale ivoire / bordeaux / sauge, menu mobile et filtres progressifs.
- `sitemap.xml`, `robots.txt` : découverte des dix pages par les moteurs de recherche.

Les fonts DM Sans et Instrument Serif viennent de Google Fonts avec des polices de remplacement système. Le contenu et la navigation n'en dépendent pas.

## Fidélité du contenu
Les faits, dates, chiffres, qualifications et coordonnées sont issus du portfolio existant. Aucun témoignage, employeur ni résultat supplémentaire n'est inventé. Les images institutionnelles illustrent le contexte ; le visuel Glow est explicitement une composition illustrative, pas une reproduction de livrables confidentiels. Le PDF de CV n'étant pas présent, le lien propose une demande par email.

## Références
Références visuelles consultées pour la typographie éditoriale, l'espace et la progression entre pages :
- [Anastasiia Gulenko — Awwwards](https://www.awwwards.com/sites/anastasiia-gulenko-portfolio)
- [Aven — Sophie Dallamore](https://avencreative.co.uk/work/sophie-dallamore)
- [Siteinspire — Sites personnels](https://www.siteinspire.com/websites/category/personal)

Les principes de sélection, de rôle et de résultat s'appuient sur [NN/g](https://www.nngroup.com/articles/ux-design-portfolios/). Structure accessible : [W3C WAI](https://www.w3.org/WAI/tutorials/page-structure/).

## Vérification
`node scripts/check.mjs` vérifie les dix pages, fichiers locaux, liens entre pages, ancres, titres, métadonnées d'images, menu et filtres.

Le workflow Browser and accessibility checks installe Playwright et axe uniquement dans le runner GitHub ; aucun outil de test n'est chargé par le site. Il contrôle les dix pages dans Chromium à 360, 768 et 1440 px, les images, débordements horizontaux, filtres, navigation entre documents, clavier, absence de JavaScript et règles axe de niveau sérieux/critique. Il produit des captures de cinq pages à ces trois largeurs dans l'artefact `portfolio-screenshots`. Le contrôle zoom CSS à 200 % est une approximation complémentaire, pas une simulation exhaustive de toutes les fonctions de zoom des navigateurs.

Les principales paires texte/fond ont un contraste calculé supérieur à 4,5:1. Les tests automatiques ne remplacent pas une revue visuelle humaine ni un audit complet d'accessibilité. Vérifier l'actualité des chiffres et de la disponibilité avant diffusion.
