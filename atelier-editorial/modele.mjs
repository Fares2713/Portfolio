export const SCHEMA=1;
export const FORMATS=['E-mail','Publication courte','Fiche pratique','Affiche'];
export function emptyWorkspace(){return {schema:SCHEMA,title:'Mon dossier éditorial',brief:{subject:'',goal:'',message:'',audiences:[],start:''},sources:[],items:[],events:[]};}
export function log(workspace,action,details){workspace.events.push({at:new Date().toISOString(),action,details});}
export function blockers(workspace,item){
 const list=[];
 if(!workspace.brief.subject.trim()||!workspace.brief.goal.trim())list.push('Compléter le sujet et l’objectif du brief.');
 for(const [field,label]of [['public','le public'],['angle','l’angle'],['content','le contenu'],['owner','le responsable'],['date','la date prévue']])if(!String(item[field]||'').trim())list.push('Renseigner '+label+'.');
 if(item.date&&!(/^\d{4}-\d{2}-\d{2}$/.test(item.date)&&Number.isFinite(Date.parse(item.date))&&new Date(item.date).toISOString().slice(0,10)===item.date))list.push('Utiliser une date valide au format année-mois-jour.');
 if(!item.sourceIds.length)list.push('Relier au moins une source à ce support.');
 for(const id of item.sourceIds){const source=workspace.sources.find(s=>s.id===id);if(!source||!source.checked||!source.note.trim())list.push('Vérifier la source '+(source?.title||id)+' et consigner la vérification.');}
 return list;
}
export function reviseItem(workspace,id,fields){
 const item=workspace.items.find(i=>i.id===id);if(!item)throw new Error('Support introuvable.');
 const changed=Object.entries(fields).some(([key,value])=>JSON.stringify(item[key])!==JSON.stringify(value));if(!changed)return item;
 item.history.push(structuredClone({...item,history:undefined}));Object.assign(item,fields);item.version++;item.status='brouillon';item.approval=null;
 log(workspace,'Nouvelle version',item.title+' · v'+item.version+' · validation à refaire');return item;
}
function invalidate(item){if(item.status!=='brouillon'||item.approval){item.history.push(structuredClone({...item,history:undefined}));item.version++;}item.status='brouillon';item.approval=null;}
export function reviseSource(workspace,id,fields){
 const source=workspace.sources.find(s=>s.id===id);if(!source)throw new Error('Source introuvable.');
 const changed=Object.entries(fields).some(([key,value])=>source[key]!==value);if(!changed)return;
 const contentChanged=['title','url','claim'].some(key=>key in fields&&source[key]!==fields[key]);
 source.history.push(structuredClone({...source,history:undefined}));Object.assign(source,fields);source.version++;
 if(contentChanged){source.checked=false;source.note='';}
 for(const item of workspace.items.filter(i=>i.sourceIds.includes(id))){if(item.status!=='brouillon'||item.approval){invalidate(item);log(workspace,'Validation retirée',item.title+' : source modifiée.');}}
 log(workspace,'Source mise à jour',source.title+' · v'+source.version);
}
export function reviseBrief(workspace,brief){
 if(JSON.stringify(workspace.brief)===JSON.stringify(brief))return;
 workspace.brief=brief;workspace.title=brief.subject||'Mon dossier éditorial';
 for(const item of workspace.items)invalidate(item);
 log(workspace,'Brief modifié','Les validations des supports doivent être renouvelées.');
}
export function requestReview(workspace,id){const item=workspace.items.find(i=>i.id===id);if(!item)throw new Error('Support introuvable.');if(item.status!=='brouillon')throw new Error('Cette version n’est pas un brouillon.');item.status='en-relecture';item.approval=null;log(workspace,'Relecture demandée',item.title+' · v'+item.version);}
export function approve(workspace,id,reviewer,note){
 const item=workspace.items.find(i=>i.id===id);if(!item)throw new Error('Support introuvable.');const missing=blockers(workspace,item);
 if(item.status!=='en-relecture')missing.push('Demander d’abord une relecture de cette version.');
 if(!reviewer.trim()||!note.trim())missing.push('Nommer le relecteur et expliquer la décision.');
 if(missing.length)throw new Error(missing.join('\n'));
 item.status='valide';item.approval={reviewer:reviewer.trim(),note:note.trim(),at:new Date().toISOString(),version:item.version,sourceVersions:item.sourceIds.map(id=>({id,version:workspace.sources.find(s=>s.id===id).version}))};
 log(workspace,'Validation déclarée',item.title+' · v'+item.version+' · '+reviewer.trim());
}
export function structure(workspace){
 if(!workspace.brief.subject.trim()||!workspace.brief.goal.trim()||!workspace.brief.message.trim()||!workspace.brief.audiences.length)throw new Error('Complétez le sujet, l’objectif, le message de départ et au moins un public.');
 if(workspace.items.length)throw new Error('Un plan existe déjà. Ajoutez un support sans écraser les versions existantes.');
 workspace.items=workspace.brief.audiences.map((publicName,index)=>({id:'support-'+crypto.randomUUID(),title:workspace.brief.subject+' — '+publicName,public:publicName,format:FORMATS[index%FORMATS.length],angle:'Quel besoin concret pour '+publicName+' ?',content:workspace.brief.message,date:workspace.brief.start,owner:'',sourceIds:workspace.sources.map(s=>s.id),version:1,status:'brouillon',approval:null,history:[]}));
 log(workspace,'Plan préparé',workspace.items.length+' supports de travail ; angles, dates et responsables à préciser.');
}
export function calendar(workspace){return [...workspace.items].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.title.localeCompare(b.title,'fr'));}
function safeCell(value){let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function toCSV(workspace){const rows=[['Support','Public','Format','Angle','Contenu','Date prévue','Responsable','Statut','Version','Sources','Relecteur déclaré','Validation déclarée le'],...calendar(workspace).map(i=>[i.title,i.public,i.format,i.angle,i.content,i.date,i.owner,i.status,i.version,i.sourceIds.map(id=>workspace.sources.find(s=>s.id===id)?.title||id).join(' | '),i.approval?.reviewer||'',i.approval?.at||''])];return '\ufeff'+rows.map(row=>row.map(safeCell).join(';')).join('\r\n');}
export function toDocument(workspace){return ['# '+workspace.title,'','Atelier éditorial de Farès Benamar — espace de travail local. Les validations sont déclaratives et ne constituent pas une signature authentifiée.','','## Brief',workspace.brief.subject,'Objectif : '+workspace.brief.goal,'Message de départ : '+workspace.brief.message,'Publics : '+workspace.brief.audiences.join(', '),'','## Sources',...workspace.sources.map(s=>`### ${s.title}\n${s.url}\nCe qu’elle étaye : ${s.claim}\nÉtat : ${s.checked?'revue déclarée':'à vérifier'} · v${s.version}\nNote : ${s.note||'non renseignée'}`),'','## Production',...calendar(workspace).map(i=>`### ${i.title}\nPublic : ${i.public}\nFormat : ${i.format}\nAngle : ${i.angle}\nPrévu : ${i.date||'à planifier'} · Responsable : ${i.owner||'à nommer'}\nStatut : ${i.status} · v${i.version}\n\n${i.content}\n\nSources : ${i.sourceIds.map(id=>workspace.sources.find(s=>s.id===id)?.title||id).join(', ')}\nValidation : ${i.approval?i.approval.reviewer+' — '+i.approval.note+' — '+i.approval.at:'non validé'}\nVersions précédentes : ${i.history.map(v=>'v'+v.version+' '+v.title).join(', ')||'aucune'}`),'','## Journal',...workspace.events.map(e=>`${e.at} — ${e.action} : ${e.details}`),''].join('\n\n');}
export function readWorkspace(text){
 if(text.length>3000000)throw new Error('Le fichier dépasse la limite de 3 Mo.');
 const data=JSON.parse(text);
 if(data?.schema!==SCHEMA||!data.brief||!Array.isArray(data.sources)||!Array.isArray(data.items)||!Array.isArray(data.events))throw new Error('Format de dossier non reconnu.');
 if(data.sources.length>40||data.items.length>100||data.events.length>5000)throw new Error('Le dossier dépasse les limites de cette démonstration.');
 const str=v=>typeof v==='string'&&v.length<=20000;
 if(!['subject','goal','message','start'].every(k=>str(data.brief[k]))||!Array.isArray(data.brief.audiences)||data.brief.audiences.length>10||!data.brief.audiences.every(str)||!str(data.title))throw new Error('Brief non valide.');
 const ids=new Set();for(const s of data.sources){if(!str(s.id)||ids.has(s.id)||!str(s.title)||!str(s.url)||!str(s.claim)||!str(s.note)||!/^https?:\/\//.test(s.url)||typeof s.checked!=='boolean'||!Number.isInteger(s.version)||!Array.isArray(s.history))throw new Error('Source non valide.');if(!s.history.every(h=>h&&['title','url','claim','note'].every(k=>str(h[k]))&&Number.isInteger(h.version)))throw new Error('Historique de source non valide.');ids.add(s.id);}
 const itemIds=new Set();for(const i of data.items){if(!['id','title','public','format','angle','content','date','owner','status'].every(k=>str(i[k]))||itemIds.has(i.id)||!['brouillon','en-relecture','valide'].includes(i.status)||!Array.isArray(i.history)||!Array.isArray(i.sourceIds)||!i.sourceIds.every(id=>ids.has(id))||!Number.isInteger(i.version)||i.version<1)throw new Error('Support non valide.');if(!i.history.every(h=>h&&['title','public','format','angle','content','date','owner','status'].every(k=>str(h[k]))&&Number.isInteger(h.version)))throw new Error('Historique de support non valide.');itemIds.add(i.id);}
 if(!data.events.every(e=>e&&['at','action','details'].every(k=>str(e[k]))&&Number.isFinite(Date.parse(e.at))))throw new Error('Journal non valide.');return data;
}
export function importWorkspace(text){const data=readWorkspace(text);for(const item of data.items)invalidate(item);for(const source of data.sources){if(source.checked){source.history.push(structuredClone({...source,history:undefined}));source.version++;}source.checked=false;}log(data,'Dossier importé','Les sources et supports sont à revoir dans ce nouvel espace.');return data;}
