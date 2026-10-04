import { H } from '../data/mockData';

export const nm=r=>r.n.replace(/\.\w+$/,'').replace(/[_-]+/g,' ');
export const ago=t=>{const h=Math.floor((Date.now()-t)/H);return h<1?'Just now':h<24?h+'h ago':Math.floor(h/24)+'d ago'};
export const dl=d=>d==0?'Today':d==1?'Tomorrow':d<0?'Yesterday':'In '+d+'d';
export const go=p=>{location.hash='#/'+p};
export const stat=(S,h)=>({res:S.R.filter(r=>r.hr==h&&!['Selected','Rejected'].includes(r.st)).length,pos:new Set(S.R.filter(r=>r.hr==h).map(r=>r.pos)).size,iv:S.I.filter(i=>i.st=='Scheduled'&&S.R.find(r=>r.id==i.rid)?.hr==h).length,fb:S.acts.filter(a=>a.g=='Urgent'&&a.r?.hr==h).length});
