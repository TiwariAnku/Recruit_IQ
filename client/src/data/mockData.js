// Mock data source shared by every screen
export const HRS=['HR 01','HR 02','HR 03','HR 04'],ST=['New','Screening','Shortlisted','Interview','Feedback Pending','Selected','Rejected'];
export const H=36e5,now=Date.now();
export const COL={New:'#4A7BB0',Screening:'#C27A1E',Shortlisted:'#A8764F',Interview:'#7C62B3','Feedback Pending':'#C27A1E',Selected:'#3F8F66',Rejected:'#C4513F',Scheduled:'#4A7BB0',Completed:'#3F8F66',Cancelled:'#C4513F',Pending:'#C27A1E',Submitted:'#3F8F66',Low:'#3F8F66',Medium:'#C27A1E',High:'#C4513F',Video:'#7C62B3',Onsite:'#A8764F'};
export const mk=(id,n,pos,exp,sk,hr,st,h,ai)=>({id,n,pos,exp,sk,hr,st,ai,by:hr,up:now-h*H,dt:now-(h+30)*H});
const PHRASE = { 'C#': 'C#', '.NET': '.NET Core and ASP.NET', SQL: 'SQL queries on MySQL', Azure: 'Azure DevOps and cloud services', Selenium: 'Selenium WebDriver', Testing: 'automation testing and test cases', Jira: 'Jira defect tracking', API: 'REST API testing with Postman', Java: 'Java and Spring Boot', React: 'React', Git: 'Git and GitHub', Python: 'Python scripts', Excel: 'advanced Excel (pivot tables, lookups)', 'Power BI': 'Power BI dashboards' };
const COMPANIES = ['Infosys', 'TCS', 'Wipro', 'Accenture', 'Capgemini'];
// Builds a plain-text resume from a demo candidate so the analyser has real content to read
export const resumeText = (r) => {
  const name = r.n.replace(/\.\w+$/, '').split('_').slice(0, 2).join(' '), y = new Date().getFullYear(), co = COMPANIES[r.id % 5];
  const sk = r.sk.map((k) => PHRASE[k] || k), phone = '+91 98' + String(1000 + r.id * 37).padStart(4, '0') + String(5000 + r.id * 13);
  return [name, `${name.toLowerCase().replace(' ', '.')}@gmail.com | ${phone} | Mumbai`, '',
    'Summary', `${r.pos} with ${r.exp} years of experience delivering dependable solutions for business teams. Hands-on with ${sk.join(', ')}.`, '',
    'Experience', `${r.pos}, ${co}   Jan ${y - r.exp} - Present`, `Worked with ${sk.join(', ')} to deliver features on time and reduced turnaround by 25%.`, 'Collaborated with product owners and mentored two junior team members.', '',
    'Education', `B.Tech in Computer Science, University of Mumbai, ${y - r.exp - 4} - ${y - r.exp}`, '',
    'Skills', r.sk.join(', ')].join('\n');
};
export const R0=[mk(1,'Rahul_Mehta_DotNet.pdf','.NET Developer',5,['C#','.NET','SQL'],'HR 01','Shortlisted',3,'Low'),mk(2,'Sneha_Iyer_QA.pdf','QA Engineer',3,['Selenium','Testing','Jira'],'HR 02','Screening',20,'Low'),mk(3,'Arjun_Nair_SDE.pdf','Software Developer',4,['Java','React','Git','SQL'],'HR 03','Feedback Pending',6,'Medium'),mk(4,'Priya_Shah_Analyst.pdf','Data Analyst',2,['SQL','Excel'],'HR 04','New',1,'Low'),mk(5,'Vikram_Rao_DotNet.pdf','.NET Developer',7,['C#','.NET','Azure','SQL'],'HR 01','Interview',9,'Low'),mk(6,'Meera_Joshi_QA.pdf','QA Engineer',4,['Testing','API','Selenium'],'HR 01','Screening',30,'High'),mk(7,'Karan_Patel_SDE.pdf','Software Developer',6,['Java','Git'],'HR 03','Shortlisted',12,'Medium'),mk(8,'Anita_Das_Analyst.pdf','Data Analyst',3,['Python','SQL','Power BI','Excel'],'HR 02','Selected',50,'Low'),mk(9,'Rohit_Verma_QA.pdf','QA Engineer',1,['Testing'],'HR 02','Rejected',70,'Medium')].map((r) => ({ ...r, text: resumeText(r) }));
export const I0=[{id:1,rid:1,rd:'Technical R1',iv:'Amit K.',d:1,t:'11:00',mode:'Video',st:'Scheduled',fb:'Pending'},{id:2,rid:5,rd:'Technical R2',iv:'Neha S.',d:0,t:'15:30',mode:'Onsite',st:'Scheduled',fb:'Pending'},{id:3,rid:3,rd:'HR Round',iv:'Dev P.',d:-1,t:'14:00',mode:'Video',st:'Completed',fb:'Pending'}];
export const L0=[['HR 03','Completed interview','Arjun Nair',6],['HR 01','Status changed to Interview','Vikram Rao',9],['HR 01','Resume shortlisted','Rahul Mehta',3],['HR 04','Resume uploaded','Priya Shah',1]].map(([who,what,ref,h])=>({who,what,ref,t:now-h*H}));
