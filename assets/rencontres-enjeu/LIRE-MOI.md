# Les Rencontres de L’Enjeu

Projet personnel de conception, préparé par Farès Benamar le 13 octobre 2026. Première édition envisagée en avril 2027 ; date, lieu, équipe, intervenants, budget et financement non confirmés. Aucun événement réalisé ni résultat acquis n’est revendiqué.

## Contenu du dossier

- 01 : dossier de conception (PDF et DOCX modifiable).
- 02 : organisation, responsabilités, rétroplanning, conducteur et risques (PDF et DOCX).
- 03 : textes de communication, calendrier et indicateurs (PDF et DOCX).
- 04 : affiche A3 (PDF), avec aperçu affiche.png généré avec l’outil image.
- 05 : invitation A5 (PDF), avec visuel invitation.png généré avec l’outil image.
- 06 : programme public envisagé (PDF).
- 07 : classeur de pilotage XLSX, vingt onglets de pilotage, avec tableau de bord, Gantt, budget détaillé et résultats vierges.
- 08 : page de présentation HTML autonome, sans formulaire ni collecte active.
- sources-projet.json : données et textes sources.

## Repères cohérents

80 participants visés, salle de 100 personnes au minimum, équipe de 8 personnes maximum. Budget prévisionnel TTC : 2 100 € de base + 210 € de réserve = 2 310 €. Aucun devis ni financement acquis. La référence du 8 avril 2027 dans le classeur sert uniquement au calendrier de travail ; les supports publics indiquent avril 2027 sans jour confirmé.

Les documents de communication comportant des champs entre crochets sont des modèles à compléter avant diffusion. Aucun destinataire n’a été contacté, aucune inscription ouverte et aucun prestataire engagé.

## Réutilisation

Dans le dépôt Portfolio, le script scripts/build-rencontres.py régénère les documents avec reportlab, python-docx et openpyxl. Les PDF sont prêts à consulter et les DOCX/XLSX permettent des ajustements. Les valeurs modifiées dans le XLSX doivent aussi être reportées dans les documents de conception avant toute diffusion.

Le classeur V2 comporte 20 onglets visibles et une feuille masquée pour les listes de validation. Modifier les cellules bleues ; les cellules vertes contiennent des formules. La date de revue est saisie pour rendre les alertes reproductibles. Le budget conserve les hypothèses du dossier (2 310 € TTC, réserve comprise). Le registre des dépenses et les indicateurs de réalisation restent vierges. Génération : `python3 scripts/build_rencontres_workbook.py`.
