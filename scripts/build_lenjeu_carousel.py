#!/usr/bin/env python3
"""Package the image-tool carousel: optimized previews, six-page PDF and originals."""
from pathlib import Path
import json,zipfile
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
OUT=Path(__file__).resolve().parents[1]/'assets/lenjeu-carrousel'
meta=json.loads((OUT/'sources.json').read_text())
c=canvas.Canvas(str(OUT/'carrousel.pdf'),pagesize=(540,675))
c.setTitle('L’Enjeu | L’IA a une adresse | Carrousel éditorial')
c.setAuthor('Farès Benamar');c.setSubject('Adaptation du grand format L’Enjeu, chiffres mondiaux AIE 2025. Illustrations éditoriales générées avec l’outil image.')
for page in meta['slides']:
 path=OUT/page['image'];im=Image.open(path)
 im.save(path.with_suffix('.webp'),format='WEBP',quality=88,method=6)
 w,h=im.size;scale=min(540/w,675/h)
 pdf_image=BytesIO()
 im.convert('RGB').save(pdf_image,format='JPEG',quality=95,subsampling=0)
 pdf_image.seek(0)
 c.drawImage(ImageReader(pdf_image),(540-w*scale)/2,(675-h*scale)/2,w*scale,h*scale)
 c.showPage()
c.save()
with zipfile.ZipFile(OUT/'carrousel-complet.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['LIRE-MOI.md','sources.json','carrousel.pdf']+[f'{i:02}.png' for i in range(1,7)]:z.write(OUT/name,name)
print('Built 6-slide PDF, original-image archive and optimized WebP previews.')
