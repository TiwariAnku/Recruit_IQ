import { REQ, H } from '../data/mockData';

export const nm=r=>r.n.replace(/\.\w+$/,'').replace(/[_-]+/g,' ');
export const hash=(s)=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
export const guessPos=(n)=>{n=n.toLowerCase();return /qa|test/.test(n)?'QA Engineer':/net|c#|dotnet/.test(n)?'.NET Developer':/data|analy|bi\b/.test(n)?'Data Analyst':'Software Developer'};
export const match=r=>Math.round(100*REQ[r.pos].filter(s=>r.sk.includes(s)).length/REQ[r.pos].length);
export const ago=t=>{const h=Math.floor((Date.now()-t)/H);return h<1?'Just now':h<24?h+'h ago':Math.floor(h/24)+'d ago'};
export const dl=d=>d==0?'Today':d==1?'Tomorrow':d<0?'Yesterday':'In '+d+'d';
export const go=p=>{location.hash='#/'+p};
export const stat=(S,h)=>({res:S.R.filter(r=>r.hr==h&&!['Selected','Rejected'].includes(r.st)).length,pos:new Set(S.R.filter(r=>r.hr==h).map(r=>r.pos)).size,iv:S.I.filter(i=>i.st=='Scheduled'&&S.R.find(r=>r.id==i.rid)?.hr==h).length,fb:S.acts.filter(a=>a.g=='Urgent'&&a.r?.hr==h).length});
