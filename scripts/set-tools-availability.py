#!/usr/bin/env python3
"""Pause or restore the two public entry pages; application sources and local data remain intact."""
from pathlib import Path
import argparse,json,re
R=Path(__file__).resolve().parents[1];B=R/'scripts/paused-apps';B.mkdir(exist_ok=True)
a=argparse.ArgumentParser();a.add_argument('state',choices=['pause','activate']);state=a.parse_args().state
paused=state=='pause'
apps=[('dossier-decisions','Le dossier de décisions','button button-primary','Explorer les cas'),('atelier-editorial','L’atelier éditorial','button button-outline','Ouvrir l’atelier')]
home=R/'index.html';html=home.read_text()
for folder,title,cls,label in apps:
 page=R/folder/'index.html';source=B/(folder+'.html.source')
 if paused:
  if not source.exists():source.write_bytes(page.read_bytes())
  page.write_text('''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>'''+title+''' · Temporairement indisponible</title><link rel="stylesheet" href="../typography.css"><link rel="stylesheet" href="../tools-paused.css"></head><body><main><p class="eyebrow">Farès Benamar · Portfolio</p><h1>'''+title+'''</h1><p class="state">Temporairement indisponible</p><p>L’accès à cet outil est suspendu pour le moment.</p><a href="../index.html#projets">Découvrir les réalisations →</a><a href="../index.html#contact">Me contacter →</a></main></body></html>''')
  pattern=r'<a class="'+re.escape(cls)+r'" href="'+folder+r'/(?:index.html)?">.*?</a>'
  html=re.sub(pattern,'<button class="'+cls+'" type="button" data-paused-tool="'+folder+'" disabled>Temporairement indisponible</button>',html)
 else:
  if not source.exists():raise SystemExit('Missing preserved source: '+folder)
  page.write_bytes(source.read_bytes())
  html=re.sub(r'<button class="'+re.escape(cls)+r'"[^>]*data-paused-tool="'+folder+r'"[^>]*>.*?</button>','<a class="'+cls+'" href="'+folder+'/">'+label+'</a>',html)
home.write_text(html)
(R/'tools-availability.json').write_text(json.dumps({'paused':paused,'apps':[v[0] for v in apps]},indent=2)+'\n')
print('Public tools '+('paused' if paused else 'restored'))
