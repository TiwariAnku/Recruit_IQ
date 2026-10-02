import { useState, useEffect, useContext, createContext } from 'react';
import { REQ, POS, R0, I0, L0, mk } from '../data/mockData';
import { nm, hash, guessPos } from '../utils/helpers';
import { uploadFiles, listFiles } from '../utils/api';

const MAX = 10 * 1024 * 1024, OK = /\.(pdf|docx?|png|jpe?g)$/i;
const mkUpload = (f, i) => { const id = Date.now() + i, p = guessPos(f.name), h = hash(f.name); return { ...mk(id, f.name, p, 1 + (h % 8), REQ[p].slice(0, 2 + (h % 3)), 'HR 01', 'New', 0, ['Low', 'Low', 'Medium'][h % 3]), file: f }; };

const Ctx=createContext();export const useS=()=>useContext(Ctx);
export function StoreProvider({children}){
  const [R,setR]=useState(R0),[I,setI]=useState(I0),[L,setL]=useState(L0),[T,setT]=useState([{id:1,t:'Approve offer for Anita Das',done:false}]),[sel,setSel]=useState(null),[q,setQ]=useState(''),[notice,setNotice]=useState(null);
  const flash=(msg,type='ok')=>{setNotice({msg,type});setTimeout(()=>setNotice(null),4500)};
  useEffect(()=>{listFiles().then(fs=>setR(r=>[...fs.map((f,i)=>({...mkUpload(f,i),id:'f'+f.url,up:Date.parse(f.uploadedAt)||Date.now()})),...r])).catch(()=>{})},[]);
  const log=(what,ref,who='You (Manager)')=>setL(l=>[{who,what,ref,t:Date.now()},...l]);
  const rn=id=>nm(R.find(r=>r.id==id)||{n:'-'});
  const S={R,I,L,T,sel,setSel,q,setQ,notice,flash,rn,log,
    status(id,s){setR(r=>r.map(x=>x.id==id?{...x,st:s,up:Date.now()}:x));log('Status changed to '+s,rn(id))},
    assign(id,hr){setR(r=>r.map(x=>x.id==id?{...x,hr,up:Date.now()}:x));log('Reassigned to '+hr,rn(id))},
    setPos(id,p){setR(r=>r.map(x=>x.id==id?{...x,pos:p,up:Date.now()}:x));log('Position set to '+p,rn(id))},
    async upload(files){
      const all=[...files],list=all.filter(f=>OK.test(f.name)&&f.size<=MAX);
      if(list.length<all.length)flash('Skipped files that are not PDF/DOC/DOCX/PNG/JPG or are over 10 MB','err');
      if(!list.length)return;
      let saved,local=false;
      try{saved=await uploadFiles(list)}catch(e){if(e.server){flash(e.message,'err');return}local=true;saved=list.map(f=>({name:f.name,url:URL.createObjectURL(f),mime:f.type,size:f.size,local:true}))}
      setR(r=>[...saved.map(mkUpload),...r]);saved.forEach(f=>log('Resume uploaded',nm({n:f.name})));
      flash(local?'Saved for this session only – start the server to store files in server/uploads/resumes':saved.length+' resume'+(saved.length>1?'s':'')+' uploaded to server/uploads/resumes')},
    sched(rid,rd,d,t,mode,iv='Panel'){setI(i=>[...i,{id:Date.now(),rid,rd,iv,d,t,mode,st:'Scheduled',fb:'Pending'}]);S.status(rid,'Interview');log('Interview scheduled ('+rd+')',rn(rid))},
    resched(id){setI(i=>i.map(x=>x.id==id?{...x,d:x.d+1}:x));log('Interview rescheduled',rn(I.find(x=>x.id==id).rid))},
    cancel(id){const x=I.find(y=>y.id==id);setI(i=>i.map(y=>y.id==id?{...y,st:'Cancelled'}:y));S.status(x.rid,'Shortlisted')},
    complete(id){const x=I.find(y=>y.id==id);setI(i=>i.map(y=>y.id==id?{...y,st:'Completed'}:y));S.status(x.rid,'Feedback Pending');log('Interview completed',rn(x.rid))},
    fb(id){const x=I.find(y=>y.id==id);setI(i=>i.map(y=>y.id==id?{...y,fb:'Submitted'}:y));S.status(x.rid,'Selected');log('Feedback submitted',rn(x.rid))},
    taskDone(id){setT(t=>t.map(x=>x.id==id?{...x,done:true}:x));log('Manager approval completed','Offer')}};
  S.acts=[...I.filter(i=>i.st=='Completed'&&i.fb=='Pending').map(i=>{const r=R.find(x=>x.id==i.rid);return{k:'f'+i.id,g:'Urgent',t:'Submit interview feedback',r,due:'Overdue',do:()=>S.fb(i.id)}}),
    ...R.filter(r=>r.st=='New').map(r=>({k:'n'+r.id,g:'Today',t:'Screen new resume',r,due:'Today',do:()=>S.status(r.id,'Screening')})),
    ...R.filter(r=>r.st=='Shortlisted'&&!I.some(i=>i.rid==r.id&&i.st=='Scheduled')).map(r=>({k:'s'+r.id,g:'Today',t:'Schedule interview',r,due:'Today',do:()=>S.sched(r.id,'Technical R1',1,'10:00','Video')})),
    ...R.filter(r=>r.st=='Screening').map(r=>({k:'c'+r.id,g:'Upcoming',t:'Complete screening',r,due:'This week',do:()=>S.status(r.id,'Shortlisted')})),
    ...T.filter(x=>!x.done).map(x=>({k:'t'+x.id,g:'Upcoming',t:x.t,r:null,hr:'Manager',due:'This week',do:()=>S.taskDone(x.id)}))];
  return <Ctx.Provider value={S}>{children}</Ctx.Provider>}
