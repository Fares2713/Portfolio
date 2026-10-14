#!/usr/bin/env python3
"""Export FNK concept artwork, preserving each support's aspect ratio."""
from pathlib import Path
from io import BytesIO
import json,zipfile
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
OUT=Path(__file__).resolve().parents[1]/'assets/fnk-campagne'
meta=json.loads((OUT/'sources.json').read_text())
c=canvas.Canvas(str(OUT/'campagne.pdf'))
c.setTitle(meta['titre']);c.setAuthor('Farès Benamar');c.setSubject(meta['statut'])
for item in meta['supports']:
 p=OUT/item['image'];im=Image.open(p);w,h=im.size
 im.save(p.with_suffix('.webp'),format='WEBP',quality=88,method=6)
 pw=540 if h>=w else 900;ph=pw*h/w;c.setPageSize((pw,ph))
 b=BytesIO();im.convert('RGB').save(b,format='JPEG',quality=95,subsampling=0);b.seek(0)
 c.drawImage(ImageReader(b),0,0,pw,ph);c.showPage()
c.save()
with zipfile.ZipFile(OUT/'campagne-complete.zip','w',zipfile.ZIP_DEFLATED) as z:
 for n in ['campagne.pdf','logo-officiel.png','LIRE-MOI.md','sources.json']+[v['image'] for v in meta['supports']]:z.write(OUT/n,n)
print('Built 3 formats, PDF, original-image ZIP and WebP gallery previews.')
