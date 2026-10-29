// Pure decision model shared by the interface, exports and validation.
export function normalize(data, input = {}) {
 return {cas:data.cases.some(c=>c.id===input.cas)?input.cas:'service',public:Object.hasOwn(data.audiences,input.public)?input.public:'usagers',canal:Object.hasOwn(data.channels,input.canal)?input.canal:'email',contrainte:Object.hasOwn(data.constraints,input.contrainte)?input.contrainte:'urgence'};
}
export function decide(data, input) {
 const state=normalize(data,input), c=data.cases.find(c=>c.id===state.cas), a=data.audiences[state.public], constraint=data.constraints[state.contrainte];
 const pending=state.contrainte==='incomplet';
 // An open social channel cannot substitute for briefing staff.
 const redirected=state.public==='agents'&&state.canal==='social';
 const channel=data.channels[redirected?'email':state.canal];
 const message=pending?c.pendingMessage:c.message;
 const audienceText=state.public==='agents'?'Réponse commune à utiliser à l’accueil : '+message:state.public==='partenaires'?'Texte de référence à reprendre sans ajout : '+message:message;
 const restriction=pending&&c.id==='service'?'Support préparatoire : répondre uniquement aux demandes reçues ; ne pas lancer l’annonce.':pending&&c.id==='rectification'?'Réponse d’attente : aucune affirmation tarifaire tant que le barème n’est pas confirmé.':c.id==='rectification'?'Diffusion limitée aux espaces et destinataires effectivement concernés.':'Maquette à faire valider avant toute diffusion dans le scénario.';
 const headline=pending?c.pendingHeadline:c.headline;
 let body=audienceText+'\n\n'+a.closing;
 if(redirected||state.canal==='email') body='Bonjour,\n\n'+body+'\n\nMaison des services Les Rives';
 if(!redirected&&state.canal==='affiche') body=audienceText+'\n\nUn renseignement ? Adressez-vous à l’accueil.\nVersion de travail 1.0 · À retirer ou remplacer à toute mise à jour.'+(state.public==='agents'?'\nSupport à réserver à l’espace de travail de l’accueil.':state.public==='partenaires'?'\nSupport de référence pour les points d’accueil partenaires.':'');
 if (!redirected && state.canal==='social') body=audienceText+'\n\n'+(state.public==='usagers'?'La référence et une réponse humaine sont disponibles à l’accueil.':a.closing);
 const selectedOption=pending&&c.id!=='controverse'?2:1;
 const options=c.options.map((option,index)=>({...option,selected:index===selectedOption}));
 const access=state.contrainte==='accessibilite';
 const timeline=(pending?c.pendingSequence:c.sequence).map((text,i)=>({when:constraint.timing[i],text:i===1?text+' '+a.internal:text,owner:c.owners[i],deliverable:pending?['Les faits établis séparés des hypothèses','Une demande de validation et une réponse d’accueil alignée','Un message partiel ; les promesses non confirmées restent réservées','Une mise à jour après confirmation'][i]:c.deliverables[i]}));
 if(access) timeline[2].text+=' Prévoir la même information sur place et à l’oral ; le support numérique reste un complément.';
 const reason=(pending?c.pendingReason:c.reason)+' '+a.action;
 const verification=c.facts.map((fact,i)=>({...fact,state:pending&&((c.id==='service'&&i===1)||(c.id==='rectification'&&i===0)||(c.id==='controverse'&&i===2))?'En attente · bloque la promesse correspondante':fact.state}));
 for(const fact of verification){if(fact.state.startsWith('En attente'))fact.detail='Hypothèse à confirmer, à ne pas reprendre dans un support : '+fact.detail;}
 const questions=c.questions.map(q=>({...q}));
 if(pending&&c.id==='service') questions.push({q:'Quand et comment prendre rendez-vous ?',a:'Les modalités ne sont pas encore confirmées. Ne pas proposer de date ni ouvrir de réservation avant validation du planning.'});
 if(pending&&c.id==='rectification') questions[0]={q:'La gratuité est-elle confirmée à ce stade ?',a:'La version actuelle du barème reste à confirmer. Ne pas affirmer de tarif avant cette vérification.'};
 return {state,c,a,constraint,channel,pending,redirected,message,headline,body,restriction,reason,verification,questions,timeline,
 options,requestedChannel:data.channels[state.canal].label,
 title:pending?c.pendingDecision:c.decision,
 gate:pending?c.pendingGate:c.gate,
 channelDecision:redirected?'Je remplace le réseau social par un e-mail de briefing : les consignes destinées aux agents n’ont pas à devenir une publication publique.':channel.benefit,
 access:access?'À ajouter : une version affichée à l’accueil et une réponse orale. Aucun lien, compte ou QR code ne doit être indispensable pour comprendre la prochaine étape.':'À maintenir : un accueil capable de donner la même réponse aux personnes qui ne consultent pas ce canal.',
 format:redirected?'Brief interne par e-mail':channel.format,
 metrics:[...c.metrics,{name:'Adéquation au public',method:a.measure,rule:'Corriger le message ou le circuit de réponse si le public ne peut pas accomplir la prochaine étape.'}],
 refusal:c.refuse+' '+constraint.tradeoff};
}
export function toMarkdown(data,r){
 const lines=['# Dossier de décisions — '+r.c.title,'',data.notice,'','Auteur : '+data.author+' · Version '+data.version,'','## Parcours choisi',`Public : ${r.a.label}`,`Canal demandé : ${data.channels[r.state.canal].label}`,`Canal retenu : ${r.channel.label}`,`Contrainte : ${r.constraint.label}`,'','## Problème',r.c.context,r.c.problem,'','## Mon arbitrage',r.title,r.reason,'','## Les options évaluées',...r.options.map(o=>`- ${o.label}${o.selected?' — option retenue':''}. Intérêt : ${o.benefit} Risque : ${o.risk} Condition : ${o.condition}`),'','## Ce que je vérifie',...r.verification.map(f=>`- ${f.item} — ${f.state}. Pièce fictive : ${f.source}. Responsable : ${f.owner}. ${f.detail}`),'','## Condition de diffusion',r.gate,'','## Message central',r.message,'','## Canal et accès',r.channelDecision,r.channel.limit,r.channel.guard,r.access,'','## Ordre de publication',...r.timeline.map(t=>`- ${t.when} : ${t.text} Responsable : ${t.owner}. Livrable attendu : ${t.deliverable}.`),'','## Exemple de contenu',r.restriction,r.headline,r.body,'','## Réponses d’accueil',...r.questions.map(q=>`- ${q.q} ${q.a}`),'','## Ce que je refuse',r.refusal,'','## Évaluer sans inventer de résultats',...r.metrics.map(m=>`- ${m.name} : ${m.method} Décision : ${m.rule}`),'','Les critères décrivent un protocole proposé. Aucun résultat de terrain n’a été mesuré.',''];
 return lines.join('\n\n');
}

export function compareDecisions(first,second){
 return [['Décision',first.title,second.title],['Message',first.message,second.message],['Canal demandé',first.requestedChannel,second.requestedChannel],['Canal retenu',first.channel.label,second.channel.label],['Condition de diffusion',first.gate,second.gate],['Public',first.a.label,second.a.label],['Ordre de publication',first.timeline.map(t=>t.text).join(' '),second.timeline.map(t=>t.text).join(' ')]].map(([label,before,after])=>({label,before,after,changed:before!==after}));
}
export function toWorkshop(data,r,sourceURL){
 const url=new URL(sourceURL);if(!['http:','https:'].includes(url.protocol))throw new Error('Ouvrez le dossier depuis le site servi par HTTP pour préparer le transfert.');
 const rootURL=new URL('./',url);rootURL.search='';rootURL.hash='';
 for(const[k,v]of Object.entries(r.state))rootURL.searchParams.set(k,v);rootURL.searchParams.set('onglet','preuves');
 const sources=r.verification.map((fact,index)=>({id:'piece-'+r.c.id+'-'+index,title:'Pièce fictive · '+fact.source,url:rootURL.href+'#fait-'+index,claim:fact.detail,note:'Exercice de conception : '+fact.state+'. Référent proposé : '+fact.owner+'. Cette pièce n’est pas une preuve réelle et doit être remplacée ou vérifiée pour une mission effective.',checked:false,version:1,history:[]}));
 const make=(id,title,publicName,format,angle,content)=>({id,title,public:publicName,format,angle,content,date:'',owner:'',sourceIds:sources.map(s=>s.id),version:1,status:'brouillon',approval:null,history:[]});
 return {schema:1,title:'Exercice fictif — '+r.c.title,origin:{kind:'fictional-decision-case',label:r.c.title,notice:data.notice},brief:{subject:r.c.title,goal:r.c.problem+' '+data.notice,message:r.message,audiences:[r.a.label,'Équipe d’accueil','Responsable de validation'],start:''},sources,items:[
 make('support-principal',r.headline,r.a.label,r.redirected||r.state.canal==='email'?'E-mail':r.state.canal==='social'?'Publication courte':'Affiche','Répondre au besoin du public : '+r.a.need,r.body),
 make('support-accueil','La réponse commune de l’accueil','Équipe d’accueil','Fiche pratique','Préparer les questions et les limites de la réponse.',r.questions.map(q=>q.q+'\n'+q.a).join('\n\n')),
 make('support-validation','Les conditions avant diffusion','Responsable de validation','Fiche pratique','Séparer les faits, les hypothèses et la décision attendue.',r.gate+'\n\n'+r.timeline.map(t=>t.when+' — '+t.text+'\nRéférent : '+t.owner+'\nLivrable : '+t.deliverable).join('\n\n'))],archivedItems:[],events:[{at:new Date().toISOString(),action:'Cas fictif préparé',details:'Trois supports de travail ; sources, responsables et dates à revoir. Aucune validation ni publication réelle.'}]};
}
