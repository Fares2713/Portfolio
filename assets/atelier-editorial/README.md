# Atelier éditorial — documents de démonstration

Conception de l’outil et du système de travail : Farès Benamar.

Le sujet public porte sur la réduction des animations d’une interface. Les références du CSS Working Group (brouillon Media Queries Level 5) et de MDN sont indiquées dans les sources. Dates de campagne, affectations et décisions de relecture sont des exemples, pas une mission ni une validation institutionnelle.

- `demonstration.webm` : capture réelle du navigateur, moins d’une minute, sans audio. Les étapes sont indiquées à l’écran.
- `demonstration.vtt` : sous-titres français ; une transcription détaillée est disponible dans la page de l’atelier.
- `apercu.webp` : aperçu de l’espace de travail. Le PNG conserve la capture source.
- `exemple-production.csv` : tableau exporté à la fin de la vidéo, séparateur point-virgule, UTF-8 avec BOM.
- `dossier-demonstration.json` : le même état, avec les versions et les décisions déclaratives antérieures.
- `dossier-demonstration.md` : document éditorial issu du même état, avec brief, sources, contenus et journal.

Le premier support a été validé dans la démonstration puis modifié : la version finale est un brouillon ; les modifications de texte et de date créent leurs versions, et la décision précédente reste dans l’historique. Les autres supports ne sont pas validés. L’exemple initial chargeable dans l’outil reste distinct : `atelier-editorial/exemple.json` contient les trois brouillons de départ et les deux sources à revoir.

Importer un JSON dans l’outil remet les sources et les supports en revue, en préservant les décisions antérieures dans les versions. La validation est déclarative et locale ; aucun fichier ne constitue une signature authentifiée. Aucun gain de temps n’a été mesuré ou annoncé.

La capture se recrée avec `scripts/record-atelier.mjs`, Playwright, Chromium et FFmpeg. Aucun téléchargement ni appel à une IA n’est effectué pendant l’utilisation de l’atelier.

La vidéo de la version 2 montre aussi la vue d’ensemble, la production par public, la comparaison des champs modifiés et la prévisualisation d’un échelonnement de dates. L’état exporté suit l’application des dates à partir du 16 novembre 2026. Les week-ends sont décalés ; aucune disponibilité d’équipe ni aucun jour férié n’est calculé.
