/* Persistence: localStorage, local server API, cloud API */
const SERVER=location.protocol==='http:'||location.protocol==='https:';
let srvTimer=null,srvState='local';
function setSrvBadge(txt,color){const b=document.getElementById('srvBadge');if(b){b.textContent=txt;b.style.color=color||'var(--t3)';}}
function pushServer(){
  clearTimeout(srvTimer);
  srvTimer=setTimeout(()=>{
    setSrvBadge('saving…','var(--am)');
    fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(store)})
      .then(r=>{if(!r.ok)throw 0;setSrvBadge('saved','var(--dn)');setTimeout(()=>setSrvBadge('','var(--t3)'),1400);})
      .catch(()=>setSrvBadge('offline','var(--rd)'));
  },500);
}
function save(){
  try{localStorage.setItem('cc9',JSON.stringify(store));}catch(e){}
  if(SERVER){pushServer();return;}
  try{scheduleWrite();}catch(e){}
}
async function pullServer(){
  if(!SERVER)return;
  try{
    const r=await fetch('/api/data',{cache:'no-store'});
    if(!r.ok)throw 0;
    const d=await r.json();
    if(d&&(d.work||d.personal)){
      const w=normSpace(d.work),pe=normSpace(d.personal);
      if(w)store.work=w;
      if(pe)store.personal=pe;
      if(d.people&&d.people.length)store.people=d.people;
      ['work','personal'].forEach(sp=>{store[sp].projects.forEach(p=>{if(!p.ideas)p.ideas=[];if(!p.goals||!p.goals.length)p.goals=[G('',[])];});});
      rAll();
      setSrvBadge('loaded','var(--dn)');setTimeout(()=>setSrvBadge('','var(--t3)'),1400);
    } else {
      pushServer();
    }
  }catch(e){setSrvBadge('offline','var(--rd)');}
}
function ini(n){return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
function rgbv(h){return`${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;}
function avS(c){const bg=light?(CBGL[c]||'#ececf0'):(CBG[c]||'#1e1e26');return`background:${bg};color:${c};border:1px solid rgba(${rgbv(c)},.4)`;}
function coOf(id){return S().cos.find(c=>c.id===id)||null;}
function pcol(p){if(p.st==='killed')return'#e05252';if(p.st==='paused')return'#d48d1a';const c=coOf(p.co);return c?c.color:'#83838f';}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function P(id){return S().projects.find(x=>x.id===id);}
function nextInGoal(g){return g.steps.findIndex(s=>!s.d);}
function projNext(p){for(let gi=0;gi<p.goals.length;gi++){const si=nextInGoal(p.goals[gi]);if(si>=0)return{gi,si,step:p.goals[gi].steps[si],goal:p.goals[gi]};}return null;}
