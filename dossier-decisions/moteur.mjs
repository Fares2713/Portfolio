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
 const access=state.contrainte==='accessibilite';
 const timeline=(pending?c.pendingSequence:c.sequence).map((text,i)=>({when:constraint.timing[i],text:i===1?text+' '+a.internal:text}));
 if(access) timeline[2].text+=' Prévoir la même information sur place et à l’oral ; le support numérique reste un complément.';
 const reason=(pending?c.pendingReason:c.reason)+' '+a.action;
 const verification=c.facts.map((fact,i)=>({...fact,state:pending&&((c.id==='service'&&i===1)||(c.id==='rectification'&&i===0)||(c.id==='controverse'&&i===2))?'En attente · bloque la promesse correspondante':fact.state}));
 for(const fact of verification){if(fact.state.startsWith('En attente'))fact.detail='Hypothèse à confirmer, à ne pas reprendre dans un support : '+fact.detail;}
 const questions=c.questions.map(q=>({...q}));
 if(pending&&c.id==='service') questions.push({q:'Quand et comment prendre rendez-vous ?',a:'Les modalités ne sont pas encore confirmées. Ne pas proposer de date ni ouvrir de réservation avant validation du planning.'});
 if(pending&&c.id==='rectification') questions[0]={q:'La gratuité est-elle confirmée à ce stade ?',a:'La version actuelle du barème reste à confirmer. Ne pas affirmer de tarif avant cette vérification.'};
 return {state,c,a,constraint,channel,pending,redirected,message,headline,body,restriction,reason,verification,questions,timeline,
 title:pending?c.pendingDecision:c.decision,
 gate:pending?c.pendingGate:c.gate,
 channelDecision:redirected?'Je remplace le réseau social par un e-mail de briefing : les consignes destinées aux agents n’ont pas à devenir une publication publique.':channel.benefit,
 access:access?'À ajouter : une version affichée à l’accueil et une réponse orale. Aucun lien, compte ou QR code ne doit être indispensable pour comprendre la prochaine étape.':'À maintenir : un accueil capable de donner la même réponse aux personnes qui ne consultent pas ce canal.',
 format:redirected?'Brief interne par e-mail':channel.format,
 metrics:[...c.metrics,{name:'Adéquation au public',method:a.measure,rule:'Corriger le message ou le circuit de réponse si le public ne peut pas accomplir la prochaine étape.'}],
 refusal:c.refuse+' '+constraint.tradeoff};
}
export function toMarkdown(data,r){
 const lines=['# Dossier de décisions — '+r.c.title,'',data.notice,'','Auteur : '+data.author+' · Version '+data.version,'','## Parcours choisi',`Public : ${r.a.label}`,`Canal demandé : ${data.channels[r.state.canal].label}`,`Canal retenu : ${r.channel.label}`,`Contrainte : ${r.constraint.label}`,'','## Problème',r.c.context,r.c.problem,'','## Mon arbitrage',r.title,r.reason,'','## Ce que je vérifie',...r.verification.map(f=>`- ${f.item} — ${f.state}. Pièce fictive : ${f.source}. Responsable : ${f.owner}. ${f.detail}`),'','## Condition de diffusion',r.gate,'','## Message central',r.message,'','## Canal et accès',r.channelDecision,r.channel.limit,r.channel.guard,r.access,'','## Ordre de publication',...r.timeline.map(t=>`- ${t.when} : ${t.text}`),'','## Exemple de contenu',r.restriction,r.headline,r.body,'','## Réponses d’accueil',...r.questions.map(q=>`- ${q.q} ${q.a}`),'','## Ce que je refuse',r.refusal,'','## Évaluer sans inventer de résultats',...r.metrics.map(m=>`- ${m.name} : ${m.method} Décision : ${m.rule}`),'','Les critères décrivent un protocole proposé. Aucun résultat de terrain n’a été mesuré.',''];
 return lines.join('\n\n');
}
