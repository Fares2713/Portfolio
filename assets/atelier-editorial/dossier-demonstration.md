# Réduire les animations : informer et accompagner



Atelier éditorial de Farès Benamar — espace de travail local. Les validations sont déclaratives et ne constituent pas une signature authentifiée.





## Brief

Respecter la préférence de réduction des animations

Objectif : Préparer une information compréhensible pour les visiteurs et un passage de relais entre communication et équipe web.

Message de départ : Certaines personnes préfèrent limiter les animations. Une interface peut tenir compte de la préférence de réduction des mouvements du système. Ce réglage ne constitue pas à lui seul un audit complet d’accessibilité.

Publics : Visiteurs du site, Équipe communication, Équipe web



## Sources

### W3C · Media Queries Level 5, prefers-reduced-motion
https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion
Ce qu’elle étaye : La caractéristique permet de détecter une demande de réduction des mouvements non essentiels. La valeur reduce exprime une préférence pour retirer ou remplacer certaines animations.
État : revue déclarée · v2
Note : Relecture de démonstration : la préférence concerne les mouvements non essentiels ; elle ne suffit pas à établir une conformité complète.

### MDN · Window.matchMedia()
https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
Ce qu’elle étaye : matchMedia() fournit un objet MediaQueryList pour tester une requête média ; la propriété matches renseigne l’état et l’événement change permet de suivre ses évolutions.
État : à vérifier · v1
Note : Documentation consultée le 24 octobre 2026. Vérifier les navigateurs et le code réellement utilisés avant toute promesse de prise en charge.



## Production

### Informer les visiteurs
Public : Visiteurs du site
Format : Publication courte
Angle : Expliquer le bénéfice sans promettre une accessibilité totale.
Prévu : 2026-11-16 · Responsable : Responsable éditorial — démonstration
Statut : brouillon · v4

Vous préférez limiter les animations ? La préférence de réduction des mouvements de votre appareil peut être prise en compte par un site. Notre message doit préciser les fonctions effectivement adaptées, après vérification par l’équipe web. Ce réglage ne remplace pas une démarche complète d’accessibilité.

La communication doit aussi indiquer comment signaler une animation gênante.

Sources : W3C · Media Queries Level 5, prefers-reduced-motion
Validation : non validé
Versions précédentes : v1 Informer les visiteurs, v2 Informer les visiteurs, v3 Informer les visiteurs

### Aligner la communication
Public : Équipe communication
Format : E-mail
Angle : Employer une formulation vérifiable et organiser le retour des usagers.
Prévu : 2026-11-17 · Responsable : à nommer
Statut : brouillon · v2

Objet : réduction des animations — cadrer notre message

Avant d’annoncer cette adaptation, faisons confirmer par l’équipe web les animations réellement concernées. Expliquons le bénéfice et la façon de signaler une difficulté, sans annoncer que le site est entièrement accessible. La version du message et ses limites doivent rester communes à l’accueil et aux supports publics.

Sources : W3C · Media Queries Level 5, prefers-reduced-motion
Validation : non validé
Versions précédentes : v1 Aligner la communication

### Préparer la vérification technique
Public : Équipe web
Format : Fiche pratique
Angle : Transformer la recommandation en points de contrôle concrets.
Prévu : 2026-11-18 · Responsable : à nommer
Statut : brouillon · v2

Vérifier la préférence prefers-reduced-motion dans les styles et les interactions. Contrôler la valeur initiale avec matchMedia(), puis tester la réaction à un changement de préférence. Comparer les animations attendues et observées, consigner les écarts et transmettre à la communication le périmètre réellement testé. Ne pas assimiler ces essais à un audit complet d’accessibilité.

Sources : W3C · Media Queries Level 5, prefers-reduced-motion, MDN · Window.matchMedia()
Validation : non validé
Versions précédentes : v1 Préparer la vérification technique



## Archives



## Journal

2026-10-24T12:00:00.000Z — Exemple préparé : Sujet public documenté. Campagne, dates et affectations de démonstration ; aucune diffusion réelle.

2026-10-24T20:16:20.600Z — Source mise à jour : W3C · Media Queries Level 5, prefers-reduced-motion · v2

2026-10-24T20:16:23.371Z — Nouvelle version : Informer les visiteurs · v2 · validation à refaire

2026-10-24T20:16:24.983Z — Relecture demandée : Informer les visiteurs · v2

2026-10-24T20:16:27.135Z — Validation déclarée : Informer les visiteurs · v2 · Relecture de démonstration

2026-10-24T20:16:29.290Z — Nouvelle version : Informer les visiteurs · v3 · validation à refaire

2026-10-24T20:16:34.671Z — Nouvelle version : Informer les visiteurs · v4 · validation à refaire

2026-10-24T20:16:34.671Z — Nouvelle version : Aligner la communication · v2 · validation à refaire

2026-10-24T20:16:34.671Z — Nouvelle version : Préparer la vérification technique · v2 · validation à refaire

2026-10-24T20:16:34.671Z — Calendrier appliqué : 3 dates proposées appliquées ; validations concernées à refaire.

