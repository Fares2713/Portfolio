#!/usr/bin/env python3
"""Render an original, periodic abstract background. No stock footage or network calls.
Requires NumPy, Pillow and FFmpeg with libx264. 12 seconds, 24 fps, silent H.264.
"""
from pathlib import Path
import json, subprocess
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/hero';OUT.mkdir(exist_ok=True)
WIDTH,HEIGHT,FPS,SECONDS=960,540,24,12
Y,X=np.mgrid[0:HEIGHT,0:WIDTH].astype(np.float32)
X/=WIDTH;Y/=HEIGHT
PAPER=np.array([247,246,242],dtype=np.float32)
BLUE=np.array([39,69,194],dtype=np.float32)
LIGHT=np.array([133,158,233],dtype=np.float32)

def render(phase):
 # Every animated parameter is periodic, including its velocity across the loop.
 image=np.broadcast_to(PAPER,(HEIGHT,WIDTH,3)).copy()
 for index,(cx,cy,sx,sy,angle,color,strength) in enumerate([
  (.77,.38,.40,.16,-.60,BLUE,.78),(.98,.66,.43,.20,.62,LIGHT,.67),
  (.38,.94,.47,.13,-.23,BLUE,.38),(.44,.06,.37,.09,-.55,LIGHT,.44)]):
  t=phase+index*1.65
  cx+=.075*np.sin(t);cy+=.085*np.cos(t)
  theta=angle+.22*np.sin(phase+index)
  u=(X-cx)*np.cos(theta)+(Y-cy)*np.sin(theta)
  v=-(X-cx)*np.sin(theta)+(Y-cy)*np.cos(theta)
  # Smooth warped ribbons create folds rather than isolated circles.
  bend=.07*np.sin(u*7+phase+index)
  field=np.exp(-((u/sx)**2+((v+bend)/sy)**2)*1.9)*strength
  image=image*(1-field[...,None])+color*field[...,None]
 # Delicate highlight along the central fold, with a second matching periodic wave.
 line=.61+.14*np.sin(X*4+phase)-.20*X
 ribbon=np.exp(-((Y-line)/.027)**2)*np.exp(-((X-.76)/.39)**2)*.16
 image=image*(1-ribbon[...,None])+np.array([235,240,255])*ribbon[...,None]
 return np.clip(image,0,255).astype(np.uint8)

command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','slow','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart','-metadata','title=Farès Benamar — Flux bleu','-metadata','comment=Original procedural animation for the portfolio',str(OUT/'background-video.mp4')]
process=subprocess.Popen(command,stdin=subprocess.PIPE)
try:
 for frame in range(FPS*SECONDS):
  pixels=render(2*np.pi*frame/(FPS*SECONDS))
  if frame==0:Image.fromarray(pixels).save(OUT/'background-poster.webp',quality=88)
  process.stdin.write(pixels.tobytes())
finally:process.stdin.close()
if process.wait()!=0:raise SystemExit('FFmpeg failed')
(OUT/'source.json').write_text(json.dumps({'title':'Flux bleu','author':'Farès Benamar · Portfolio','creation':'2026-10-25','type':'Animation abstraite procédurale originale créée pour le portfolio','generator':'scripts/build-hero-video.py','duration_seconds':SECONDS,'fps':FPS,'resolution':[WIDTH,HEIGHT],'audio':False,'loop':'Paramètres périodiques ; pas de fondu noir ni de texte intégré','dependencies':['NumPy','Pillow','FFmpeg/libx264']},ensure_ascii=False,indent=2)+'\n')
print(f'Generated silent 12-second loop: {(OUT/"background-video.mp4").stat().st_size:,} bytes')
