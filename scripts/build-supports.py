#!/usr/bin/env python3
"""Create original, dated portfolio supports without institutional attribution."""
from pathlib import Path
from html import escape
import json,zipfile
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
R=Path(__file__).resolve().parents[1];O=R/'assets/supports-editoriaux';O.mkdir(exist_ok=True)
DATE='26 octobre 2026';BLUE='#2446da';INK='#192b27';MUTED='#53635e';PAPER='#f7f6f2'
for n,f in [('Support','NotoSans-Regular.ttf'),('SupportBold','NotoSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(n,'/usr/share/fonts/truetype/noto/'+f))
pdfmetrics.registerFont(TTFont('SupportSerif','/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf'))
D=[
{'id':'newsletter','label':'Newsletter','title':'La recherche, en clair.','subtitle':'Recherche & publics · La lettre des contenus utiles · Édition 01', 'intro':'Faire comprendre un sujet scientifique, c’est choisir une entrée accessible et conserver les nuances qui permettent de l’interpréter.', 'blocks':[
('À la une / Un résultat, un périmètre','Avant de raconter une découverte, préciser ce qui a été observé, dans quelles conditions et avec quelle méthode. Un résultat obtenu sur un échantillon ou dans un cadre expérimental ne décrit pas automatiquement toutes les situations. La réserve utile fait partie de l’information.'),
('Dans les supports / Une image ne remplace pas sa légende','Une photographie situe un contexte ; un graphique représente des données ; une illustration propose une interprétation visuelle. Les nommer, les créditer et expliquer ce qu’ils montrent aide le lecteur à comprendre leur rôle.'),
('En pratique / Laisser le lecteur choisir le mouvement','Sur une interface, la préférence prefers-reduced-motion permet de détecter une demande de réduction des mouvements non essentiels. Prévoir une alternative stable donne au lecteur la possibilité de consulter le contenu autrement.'),
('Le repère éditorial','Un titre informe. Une introduction donne le contexte. Un lien permet d’approfondir. Chaque élément doit aider le lecteur à savoir ce qu’il apprend et où poursuivre sa lecture.')], 'action':'À retenir : adapter la porte d’entrée, conserver la portée de la source.', 'sources':[('W3C · Media Queries Level 5, prefers-reduced-motion','https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion')]},
{'id':'programme','label':'Programme','title':'Parler de recherche à des publics différents.','subtitle':'Proposition de rencontre professionnelle · Format de trois heures', 'intro':'Un parcours pour relier le contenu scientifique, les besoins du public et la préparation des supports. Les intervenants, la date et le lieu sont à définir.', 'blocks':[
('09 h 30 / Ouvrir le sujet · 15 min','Accueil et cadrage. Identifier les publics auxquels on s’adresse et ce qu’ils doivent pouvoir comprendre ou faire à l’issue de la rencontre.'),
('09 h 45 / Du résultat au récit · 35 min','Échange entre une personne issue de la recherche et une personne chargée de communication : question de départ, méthode, résultat et limites. Fonctions d’intervention proposées.'),
('10 h 20 / Mettre le message à l’épreuve · 40 min','Travail en petits groupes : réécrire un titre et une introduction pour trois publics. Justifier les informations conservées et les mots à expliquer.'),
('11 h 00 / Pause et échanges · 15 min','Temps de circulation et de discussion. Supports consultables en version textuelle.'),
('11 h 15 / Décliner sans déformer · 45 min','Comparer une actualité web, une newsletter et une publication courte. Vérifier que les réserves et les références restent compréhensibles dans chaque format.'),
('12 h 00 / Décider de la suite · 30 min','Restitution, liste des points à vérifier et répartition des prochaines actions. Clôture à 12 h 30.')], 'action':'Préparation : confirmer les intervenants et les conditions d’accueil avant d’annoncer le rendez-vous.', 'sources':[]},
{'id':'publication','label':'Publication','title':'Un bon titre ne promet pas plus que la source.','subtitle':'Proposition de publication professionnelle · Format court', 'intro':'Avant de publier un résultat de recherche, je pose trois questions.', 'blocks':[
('01 / Qu’a-t-on observé ?','Nommer le résultat précis, plutôt qu’une promesse générale.'),
('02 / Dans quelles conditions ?','Garder les informations qui changent l’interprétation : méthode, terrain, population ou contexte expérimental.'),
('03 / Que peut-on en conclure ?','Distinguer le constat, l’hypothèse et les applications encore à explorer.')], 'action':'Rendre un sujet accessible, c’est aussi rendre ses limites compréhensibles.\nQuel mot de votre sujet mérite d’être expliqué avant d’être mis dans le titre ?', 'sources':[]},
{'id':'affiche','label':'Support graphique','title':'La recherche mérite d’être comprise.','subtitle':'Conception graphique & éditoriale', 'intro':'Des contenus clairs.\nDes sources accessibles.\nDes publics considérés.', 'blocks':[
('Clarifier','Expliquer les termes et choisir une information principale.'),('Relier','Associer le message à sa source et à son contexte.'),('Transmettre','Préparer des formats lisibles, adaptés aux usages du public.')], 'action':'Farès Benamar · Communication, contenus & coordination\nportfolio-fares-benamar.vercel.app', 'sources':[]},
{'id':'preparation','label':'Document de préparation','title':'Du cadrage à la publication.','subtitle':'Note de préparation · Rencontre sur la communication de la recherche', 'intro':'Organiser une rencontre de trois heures et ses supports autour d’un objectif : faire comprendre une information scientifique à plusieurs publics. Cadre de conception proposé, à adapter avec une structure organisatrice.', 'blocks':[
('1 / Objectif et public prioritaire','Permettre aux équipes de recherche et de communication de préparer un message central, un titre et une introduction dont la portée reste fidèle aux éléments disponibles. Public prioritaire : personnels de recherche et d’appui à la recherche.'),
('2 / Message central','Un contenu accessible relie une question, un résultat, ses conditions et une référence. La simplification porte sur la formulation ; les informations qui changent le sens restent visibles.'),
('3 / Livrables attendus','Une page de présentation, un programme, une newsletter d’invitation, une publication courte et un document de restitution. Prévoir une version textuelle des supports et des liens explicites.'),
('4 / Informations à confirmer','Date, lieu, capacité, conditions d’accueil, intervenants, modalités d’inscription et responsable de publication. Les documents de travail conservent les mentions à confirmer jusqu’à l’accord de la structure organisatrice.'),
('5 / Organisation proposée','Pilotage : cadrage et arbitrages. Référent scientifique : exactitude et portée. Communication : rédaction, mise en forme et diffusion. Accueil : informations pratiques et besoins d’accès. Ces fonctions restent à attribuer.'),
('6 / Calendrier relatif','J−21 : cadrer les objectifs et confirmer les conditions. J−14 : préparer les supports et consolider les retours. J−7 : diffuser les informations validées. J−1 : vérifier programme, liens et consignes. J+2 : partager ressources et restitution.'),
('7 / Circuit de validation','Une version de référence par support. Regrouper les retours en trois catégories : exactitude, compréhension et forme. Identifier les points bloquants, la personne qui les résout et l’accord autorisant la diffusion.'),
('8 / Critères de réception','Le titre annonce un contenu réellement traité ; les faits sont reliés aux références ; les informations pratiques sont cohérentes entre supports ; les crédits et alternatives textuelles sont présents ; les liens fonctionnent.'),
('9 / Évaluation à préparer','Recueillir une reformulation du message central et les questions restant ouvertes. Suivre les inscriptions et la présence si une rencontre est organisée, avec un périmètre de collecte défini. Les résultats seront consignés après observation.'),
('10 / Version et suite','Version 1.0 · Création du 26 octobre 2026. Prochaine décision : valider le périmètre avec une structure organisatrice avant toute adaptation à un événement réel.')], 'action':'La préparation rend les décisions visibles : quoi dire, à qui, sur quel support et après quelle vérification.', 'sources':[]}
]
(O/'contenus.json').write_text(json.dumps({'author':'Farès Benamar','date':DATE,'context':'Créations originales pour le portfolio. Conception éditoriale indépendante, sans attribution à une mission institutionnelle passée.','supports':D},ensure_ascii=False,indent=2)+'\n')
class PDF:
 def __init__(self,path,label):self.c=canvas.Canvas(str(path),pagesize=(595.28,841.89));self.c.setTitle(label+' · Farès Benamar');self.c.setAuthor('Farès Benamar');self.page=0
 def start(self,label):
  self.page+=1;c=self.c;c.setFillColor(HexColor(PAPER));c.rect(0,0,595.28,841.89,fill=1,stroke=0);c.setFillColor(HexColor(BLUE));c.rect(40,794,29,3,fill=1,stroke=0);self.text(label.upper(),40,61,515,8,'SupportBold',BLUE)
  c.setStrokeColor(HexColor('#cbd3cb'));c.line(40,41,555,41);c.setFont('Support',7.3);c.setFillColor(HexColor(MUTED));c.drawString(40,26,'Farès Benamar · Création pour le portfolio · '+DATE);c.drawRightString(555,26,str(self.page))
 def text(self,s,x,y,width=515,size=10,font='Support',color=INK):
  p=Paragraph(escape(s).replace('\n','<br/>'),ParagraphStyle('p',fontName=font,fontSize=size,leading=size*1.5,textColor=HexColor(color)));_,h=p.wrap(width,1000)
  if y+h>780:raise ValueError(f'Overflow: {s[:70]} / {y+h}')
  p.drawOn(self.c,x,841.89-y-h);return y+h
 def finish(self):self.c.showPage()
 def save(self):self.c.save()
for d in D:
 p=PDF(O/(d['id']+'.pdf'),d['label']);p.start(d['label']);y=p.text(d['subtitle'],40,88,size=8.5,color=MUTED)+13;y=p.text(d['title'],40,y,size=30,font='SupportSerif')+15
 y=p.text(d['intro'],40,y,size=11)+20
 for i,(title,body) in enumerate(d['blocks']):
  if d['id']=='preparation' and i in [4,8]:p.finish();p.start(d['label']+' / Suite');y=100
  y=p.text(title,40,y,size=10,font='SupportBold',color=BLUE)+5;y=p.text(body,40,y,size=9.7)+14
 y=p.text(d['action'],40,y,size=10,font='SupportBold')+12
 for label,url in d['sources']:
  old=y;y=p.text(label,40,y,size=7.7,color=MUTED)+3;p.c.linkURL(url,(40,841.89-y,555,841.89-old),relative=0,thickness=0)
 p.finish();p.save()
 head='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(d['label'])+' · Farès Benamar</title><link rel="stylesheet" href="../../typography.css"><link rel="stylesheet" href="supports.css"></head><body>'
 blocks=''.join('<section><h2>'+escape(t)+'</h2><p>'+escape(b)+'</p></section>' for t,b in d['blocks'])
 sources=''.join('<a href="'+escape(url)+'">'+escape(label)+'</a>' for label,url in d['sources'])
 doc=head+'<header class="top"><a href="index.html">Les supports</a><a href="../../index.html#projets">Portfolio</a></header><main class="sheet '+d['id']+'"><p class="eyebrow">'+escape(d['subtitle'])+'</p><h1>'+escape(d['title'])+'</h1><p class="intro">'+escape(d['intro']).replace('\n','<br>')+'</p><div class="blocks">'+blocks+'</div><p class="action">'+escape(d['action']).replace('\n','<br>')+'</p><div class="references">'+sources+'</div><footer>Farès Benamar · Création pour le portfolio · '+DATE+'<a href="'+d['id']+'.pdf">Télécharger le PDF</a></footer></main></body></html>'
 (O/(d['id']+'.html')).write_text(doc)
links=''.join('<article><p class="eyebrow">'+f'{i:02d}'+' / '+escape(d['label'])+'</p><h2>'+escape(d['title'])+'</h2><p>'+escape(d['subtitle'])+'</p><div class="links"><a href="'+d['id']+'.html">Lire le support →</a><a href="'+d['id']+'.pdf">PDF ↓</a></div></article>' for i,d in enumerate(D,1))
(O/'index.html').write_text('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supports éditoriaux · Farès Benamar</title><link rel="stylesheet" href="../../typography.css"><link rel="stylesheet" href="supports.css"></head><body><header class="top"><a href="../../index.html#projets">Retour aux réalisations</a><span>Farès Benamar</span></header><main class="collection"><p class="eyebrow">Conception éditoriale · 26 octobre 2026</p><h1>Des textes.<br>Des formats.<br>Une intention.</h1><p class="intro">Cinq créations originales pour le portfolio : rédaction, hiérarchie de l’information, mise en page et préparation de la production. Une série indépendante consacrée à la communication de la recherche.</p><div class="catalogue">'+links+'</div><a class="download-all" href="supports-complets.zip">Télécharger les cinq supports et leurs sources · ZIP</a><footer>Conception, rédaction et mise en forme : Farès Benamar · 26 octobre 2026</footer></main></body></html>')
# Two visual formats receive their own composition instead of a report layout.
def visual_text(c,s,x,y,width,size,font='Support',color='#fffefb',height=841.89):
 p=Paragraph(escape(s).replace('\n','<br/>'),ParagraphStyle('visual',fontName=font,fontSize=size,leading=size*1.23,textColor=HexColor(color)))
 _,h=p.wrap(width,1200)
 if y+h>height-35:raise ValueError('Visual overflow: '+s[:50])
 p.drawOn(c,x,height-y-h);return y+h
c=canvas.Canvas(str(O/'affiche.pdf'),pagesize=(595.28,841.89));c.setTitle('La recherche mérite d’être comprise · Farès Benamar');c.setAuthor('Farès Benamar');c.setFillColor(HexColor(INK));c.rect(0,0,595.28,841.89,fill=1,stroke=0)
c.setStrokeColor(HexColor('#5c7465'));c.setLineWidth(.6);c.circle(550,760,130,fill=0,stroke=1);c.circle(550,760,100,fill=0,stroke=1)
visual_text(c,'FARÈS BENAMAR / CONCEPTION ÉDITORIALE',40,43,470,9,'SupportBold','#dce8b2')
visual_text(c,'La recherche\nmérite d’être\ncomprise.',40,140,505,48,'SupportSerif')
visual_text(c,'Des contenus clairs.\nDes sources accessibles.\nDes publics considérés.',43,375,485,22,'Support','#dce8b2')
for i,(title,body) in enumerate(D[3]['blocks']):
 x=43+i*174;c.setStrokeColor(HexColor('#dce8b2'));c.line(x,251,x+135,251);visual_text(c,title.upper(),x,610,146,9,'SupportBold','#dce8b2');visual_text(c,body,x,634,145,9.5)
visual_text(c,'Communication · Contenus · Coordination',43,746,500,10,'Support')
visual_text(c,'portfolio-fares-benamar.vercel.app',43,768,500,9,'Support','#dce8b2');c.linkURL('https://portfolio-fares-benamar.vercel.app/',(43,51,550,75),relative=0,thickness=0)
visual_text(c,'Création pour le portfolio · 26 octobre 2026',43,790,500,7,'Support','#c1cdbf');c.showPage();c.save()
c=canvas.Canvas(str(O/'publication.pdf'),pagesize=(720,900));c.setTitle('Un bon titre ne promet pas plus que la source · Farès Benamar');c.setAuthor('Farès Benamar');c.setFillColor(HexColor('#1739b9'));c.rect(0,0,720,900,fill=1,stroke=0)
visual_text(c,'FARÈS BENAMAR / PUBLICATION PROFESSIONNELLE',48,40,625,10,'SupportBold','#e8edff',900)
visual_text(c,D[2]['title'],48,100,620,38,'SupportBold','#fffefb',900)
visual_text(c,D[2]['intro'],48,265,620,15,'Support','#e8edff',900)
y=330
for i,(title,body) in enumerate(D[2]['blocks']):
 c.setStrokeColor(HexColor('#9fafec'));c.line(48,900-y,672,900-y);y+=19;y=visual_text(c,title,48,y,620,18,'SupportBold','#fffefb',900)+11;y=visual_text(c,body,48,y,620,13,'Support','#e8edff',900)+25
visual_text(c,'Rendre un sujet accessible, c’est aussi rendre ses limites compréhensibles.',48,755,620,15,'SupportBold','#e3efc1',900)
visual_text(c,'Proposition de publication · Création pour le portfolio · 26 octobre 2026',48,850,620,8,'Support','#e8edff',900);c.showPage();c.save()
with zipfile.ZipFile(O/'supports-complets.zip','w',zipfile.ZIP_DEFLATED) as z:
 for d in D:
  for ext in ['pdf','html']:z.write(O/(d['id']+'.'+ext),'portfolio/assets/supports-editoriaux/'+d['id']+'.'+ext)
 for file in ['contenus.json','index.html','supports.css']:
  if not (O/file).exists():continue
  if file=='index.html':
   archive_index=(O/file).read_text().replace('<a class="download-all" href="supports-complets.zip">Télécharger les cinq supports et leurs sources · ZIP</a>','<p>Les cinq PDF et leurs sources sont inclus dans ce dossier.</p>')
   z.writestr('portfolio/assets/supports-editoriaux/'+file,archive_index)
  else:z.write(O/file,'portfolio/assets/supports-editoriaux/'+file)
 z.write(R/'typography.css','portfolio/typography.css')
 for file in (R/'assets/fonts').iterdir():
  if file.is_file():z.write(file,'portfolio/assets/fonts/'+file.name)
 z.writestr('portfolio/index.html','<!doctype html><html lang="fr"><meta charset="utf-8"><title>Portfolio</title><a href="https://portfolio-fares-benamar.vercel.app/">Consulter le portfolio de Farès Benamar</a><br><a href="assets/supports-editoriaux/index.html">Lire les supports</a></html>')
print('Generated five original supports: five PDFs (1/1/1/1/3 pages), HTML reading views and source JSON.')
