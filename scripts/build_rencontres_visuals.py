#!/usr/bin/env python3
"""Package the approved image-tool artwork as A3/A5 PDFs without altering it."""
from pathlib import Path
import zipfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3, A5
from reportlab.lib.utils import ImageReader

OUT = Path(__file__).resolve().parents[1] / 'assets/rencontres-enjeu'


def build_visuals():
    for image, pdf, size, label in [
        ('affiche.png', '04-affiche-a3.pdf', A3, 'Affiche A3'),
        ('invitation.png', '05-invitation-a5.pdf', A5, 'Invitation A5'),
    ]:
        artwork = ImageReader(str(OUT / image))
        iw, ih = artwork.getSize()
        w, h = size
        scale = min(w / iw, h / ih)
        c = canvas.Canvas(str(OUT / pdf), pagesize=size)
        c.setTitle('Les Rencontres de L’Enjeu | ' + label)
        c.setAuthor('Farès Benamar')
        c.setSubject('Édition pilote envisagée en avril 2027 ; date, lieu et intervenants à confirmer')
        c.drawImage(artwork, (w-iw*scale)/2, (h-ih*scale)/2,
                    width=iw*scale, height=ih*scale)
        c.showPage()
        c.save()


def update_archive():
    with zipfile.ZipFile(OUT / 'dossier-complet.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for path in sorted(OUT.iterdir()):
            if path.is_file() and path.name != 'dossier-complet.zip':
                z.write(path, path.name)


if __name__ == '__main__':
    build_visuals()
    update_archive()
    print('Updated A3 poster, A5 invitation and complete archive.')
