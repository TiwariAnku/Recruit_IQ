import { useState, useEffect, useContext, createContext } from 'react';
import { R0, I0, L0, mk } from '../data/mockData';
import { nm } from '../utils/helpers';
import { analyzeText } from '../utils/analyzerCore';
import { bestFit } from '../utils/evaluate';
import { loadPositions, savePositions } from '../utils/positionStore';
import { uploadFiles, listFiles, abs } from '../utils/api';
import { analyzeFile, cachedAnalysis, cacheAnalysis, usable } from '../utils/extractText';
import { loadFeedback, saveFeedback, syncFeedback, pushFeedback, overallOf, NEXT_STEPS } from '../utils/feedbackStore';

const MAX = 10 * 1024 * 1024, OK = /\.(pdf|docx?|png|jpe?g)$/i;
// Copies the real analysis onto the resume (skills, experience, AI level) and, while the position is still
// auto-assigned, moves it to the best-fitting OPEN position based on what the resume really contains.
const applyAnalysis = (r, a, P) => {
  const open = P.filter((p) => p.status === 'Open'), best = a.valid ? bestFit(a, open.length ? open : P) : null;
  return { ...r, analysis: a, sk: a.skills.slice(0, 8), exp: +Number(a.experienceYears || 0).toFixed(1), ai: a.ai.level !== 'Unknown' ? a.ai.level : 'Low', pos: r.autoPos && best ? best.pos.title : r.pos };
};
const mkUpload = (f, i, P) => {
  const open = P.filter((p) => p.status === 'Open');
  const base = { ...mk(Date.now() + i, f.name, open[0]?.title || P[0]?.title || 'Unassigned', 0, [], 'HR 01', 'New', 0, 'Low'), file: f, autoPos: true };
  return f.analysis ? applyAnalysis(base, f.analysis, P) : base;
};

const Ctx=createContext();export const useS=()=>useContext(Ctx);
export function StoreProvider({children}){
  const [R,setR]=useState(()=>R0.map(r=>({...r,analysis:analyzeText(r.text,1)}))),[I,setI]=useState(I0),[L,setL]=useState(L0),[T,setT]=useState([{id:1,t:'Approve offer for Anita Das',done:false}]),[sel,setSel]=useState(null),[q,setQ]=useState(''),[notice,setNotice]=useState(null);
  const [P,setP]=useState(loadPositions),[posFilter,setPosFilter]=useState(''),[fbView,setFbView]=useState(null),[busy,setBusy]=useState(null);
  useEffect(()=>{savePositions(P)},[P]);
  // Reads a stored file in the browser (PDF text / scanned PDF + image OCR / DOCX) and attaches the real analysis
  const reanalyze=async(id,f,force)=>{
    let a=!force&&cachedAnalysis(f.url);
    if(!a){
      try{setBusy('Analysing "'+f.name+'"…');const blob=await (await fetch(abs(f.url))).blob();a=await analyzeFile(blob,f.name,m=>setBusy('Analysing "'+f.name+'": '+m));if(!/^blob:/.test(f.url)&&usable(a))cacheAnalysis(f.url,a)}
      catch{a=null}
      setBusy(null)
    }
    if(a)setR(rs=>rs.map(r=>r.id===id?applyAnalysis(r,a,P):r))
  };
  const flash=(msg,type='ok')=>{setNotice({msg,type});setTimeout(()=>setNotice(null),4500)};
  useEffect(()=>{listFiles().then(fs=>{const g=fs.map(f=>usable(f.analysis)?f:{...f,analysis:cachedAnalysis(f.url)||undefined});setR(r=>[...g.map((f,i)=>({...mkUpload(f,i,P),id:'f'+f.url,up:Date.parse(f.uploadedAt)||Date.now()})),...r]);g.forEach(f=>{if(!f.analysis)reanalyze('f'+f.url,f)})}).catch(()=>{})},[]);
  const [FB,setFB]=useState(loadFeedback),[fbTarget,setFbTarget]=useState(null);
  useEffect(()=>{saveFeedback(FB)},[FB]);
  useEffect(()=>{syncFeedback(FB).then(m=>m&&setFB(m))},[]);
  const log=(what,ref,who='You (Manager)')=>setL(l=>[{who,what,ref,t:Date.now()},...l]);
  const rn=id=>nm(R.find(r=>r.id==id)||{n:'-'});
  const S={R,I,L,T,sel,setSel,q,setQ,notice,flash,FB,fbTarget,setFbTarget,P,posFilter,setPosFilter,fbView,setFbView,busy,rn,log,
    status(id,s){setR(r=>r.map(x=>x.id==id?{...x,st:s,up:Date.now()}:x));log('Status changed to '+s,rn(id))},
    assign(id,hr){setR(r=>r.map(x=>x.id==id?{...x,hr,up:Date.now()}:x));log('Reassigned to '+hr,rn(id))},
    setPos(id,p){setR(r=>r.map(x=>x.id==id?{...x,pos:p,autoPos:false,up:Date.now()}:x));log('Position set to '+p,rn(id))},
    async upload(files){
      const all=[...files],list=all.filter(f=>OK.test(f.name)&&f.size<=MAX);
      if(list.length<all.length)flash('Skipped files that are not PDF/DOC/DOCX/PNG/JPG or are over 10 MB','err');
      if(!list.length)return;
      let saved,local=false;
      try{saved=await uploadFiles(list)}catch(e){if(e.server){flash(e.message,'err');return}local=true;saved=list.map(f=>({name:f.name,url:URL.createObjectURL(f),mime:f.type,size:f.size,local:true}))}
      for(let i=0;i<saved.length;i++){
        if(usable(saved[i].analysis))continue;
        const nm0=saved[i].name;setBusy('Analysing "'+nm0+'"…');
        saved[i].analysis=await analyzeFile(list[i],nm0,m=>setBusy('Analysing "'+nm0+'": '+m));
        if(!saved[i].local&&usable(saved[i].analysis))cacheAnalysis(saved[i].url,saved[i].analysis)
      }
      setBusy(null);
      setR(r=>[...saved.map((f,i)=>mkUpload(f,i,P)),...r]);saved.forEach(f=>log('Resume uploaded',nm({n:f.name})));
      flash(local?'Saved for this session only – start the server to store files in server/uploads/resumes':saved.length+' resume'+(saved.length>1?'s':'')+' uploaded to server/uploads/resumes')},
    sched(rid,rd,d,t,mode,iv='Panel'){setI(i=>[...i,{id:Date.now(),rid,rd,iv,d,t,mode,st:'Scheduled',fb:'Pending'}]);S.status(rid,'Interview');log('Interview scheduled ('+rd+')',rn(rid))},
    resched(id){setI(i=>i.map(x=>x.id==id?{...x,d:x.d+1}:x));log('Interview rescheduled',rn(I.find(x=>x.id==id).rid))},
    cancel(id){const x=I.find(y=>y.id==id);setI(i=>i.map(y=>y.id==id?{...y,st:'Cancelled'}:y));S.status(x.rid,'Shortlisted')},
    complete(id){const x=I.find(y=>y.id==id);setI(i=>i.map(y=>y.id==id?{...y,st:'Completed'}:y));S.status(x.rid,'Feedback Pending');log('Interview completed',rn(x.rid))},
    fb(id){const x=I.find(y=>y.id==id);setI(i=>i.map(y=>y.id==id?{...y,fb:'Submitted'}:y));S.status(x.rid,'Selected');log('Feedback submitted',rn(x.rid))},
    openFeedback(id){setFbTarget(id);location.hash='#/feedback'},
    submitFeedback(iid,d){
      const iv=I.find(x=>x.id==iid),r=R.find(x=>x.id==iv.rid);
      const rec={id:'fb'+Date.now(),interviewId:iid,resumeId:iv.rid,candidate:rn(iv.rid),position:r.pos,round:iv.rd,interviewer:iv.iv,mode:iv.mode,hr:r.hr,submittedBy:d.submittedBy,submittedAt:new Date().toISOString(),ratings:d.ratings,overall:overallOf(d.ratings),recommendation:d.recommendation,nextStep:d.nextStep,strengths:d.strengths.trim(),concerns:d.concerns.trim(),notes:d.notes.trim(),synced:false};
      setFB(f=>[rec,...f]);
      pushFeedback(rec).then(ok=>ok&&setFB(f=>f.map(x=>x.id==rec.id?{...x,synced:true}:x)));
      setI(i=>i.map(x=>x.id==iid?{...x,fb:'Submitted'}:x));
      setR(rs=>rs.map(x=>x.id==iv.rid?{...x,st:NEXT_STEPS[d.nextStep],up:Date.now()}:x));
      if(d.nextStep==='Select candidate')setT(t=>[...t,{id:Date.now(),t:'Approve offer for '+rec.candidate,done:false}]);
      log('Feedback submitted: '+d.recommendation+' ('+rec.overall+'/5) → '+d.nextStep,rec.candidate,d.submittedBy);
      flash('Feedback saved to history')},
    clearSamples(){setFB(f=>f.filter(x=>!x.seed))},
    analyzeResume(id){const r=R.find(x=>x.id===id);if(r?.file)reanalyze(id,r.file,true)},
    viewFeedback(fid){setFbView(fid);location.hash='#/feedback'},
    addPosition(p){const rec={...p,id:'p'+Date.now(),createdAt:new Date().toISOString()};setP(x=>[rec,...x]);log('Position created',rec.title);flash('Position "'+rec.title+'" added');return rec},
    updatePosition(id,p){const old=P.find(x=>x.id==id);setP(x=>x.map(y=>y.id==id?{...y,...p}:y));if(p.title&&p.title!==old.title)setR(rs=>rs.map(r=>r.pos===old.title?{...r,pos:p.title}:r));log('Position updated',p.title||old.title);flash('Position saved')},
    setPositionStatus(id,status){const old=P.find(x=>x.id==id);setP(x=>x.map(y=>y.id==id?{...y,status}:y));log('Position marked '+status.toLowerCase(),old.title)},
    removePosition(id){const old=P.find(x=>x.id==id);if(R.some(r=>r.pos===old.title))return false;setP(x=>x.filter(y=>y.id!=id));log('Position deleted',old.title);return true},
    taskDone(id){setT(t=>t.map(x=>x.id==id?{...x,done:true}:x));log('Manager approval completed','Offer')}};
  S.acts=[...I.filter(i=>i.st=='Completed'&&i.fb=='Pending').map(i=>{const r=R.find(x=>x.id==i.rid);return{k:'f'+i.id,g:'Urgent',t:'Submit interview feedback',r,due:'Overdue',do:()=>S.openFeedback(i.id)}}),
    ...R.filter(r=>r.st=='New').map(r=>({k:'n'+r.id,g:'Today',t:'Screen new resume',r,due:'Today',do:()=>S.status(r.id,'Screening')})),
    ...R.filter(r=>r.st=='Shortlisted'&&!I.some(i=>i.rid==r.id&&i.st=='Scheduled')).map(r=>({k:'s'+r.id,g:'Today',t:'Schedule interview',r,due:'Today',do:()=>S.sched(r.id,'Technical R1',1,'10:00','Video')})),
    ...R.filter(r=>r.st=='Screening').map(r=>({k:'c'+r.id,g:'Upcoming',t:'Complete screening',r,due:'This week',do:()=>S.status(r.id,'Shortlisted')})),
    ...T.filter(x=>!x.done).map(x=>({k:'t'+x.id,g:'Upcoming',t:x.t,r:null,hr:'Manager',due:'This week',do:()=>S.taskDone(x.id)}))];
  return <Ctx.Provider value={S}>{children}</Ctx.Provider>}
