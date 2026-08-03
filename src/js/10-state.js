/* Store bootstrap, migrations, accessors */
let store=load()||{work:seedWork(),personal:seedPersonal(),people:PEOPLE_SEED};
if(!store.people)store.people=PEOPLE_SEED;
function sid(){return 's'+Math.random().toString(36).slice(2,10);}
['work','personal'].forEach(sp=>{if(store[sp])store[sp].projects.forEach(p=>{
  if(!p.ideas)p.ideas=[];
  if(!p.goals||!p.goals.length)p.goals=[{id:'g'+Math.random().toString(36).slice(2,9),title:p.goal||'',steps:[]}];
  p.goals.forEach(g=>{(g.steps||[]).forEach(st=>{if(!st.id)st.id=sid();});});
});});
if(!store.order)store.order={};
if(!store.colOrder)store.colOrder={};
let space=localStorage.getItem('cc_space')||'work';
let light=localStorage.getItem('cc_light')==='1';
if(light)document.body.classList.add('light');
let drag=null,popId=null,view='board',flipped={};

function S(){return store[space];}
function PPL(){return store.people;}
function load(){try{const d=localStorage.getItem('cc9');return d?JSON.parse(d):null;}catch(e){return null;}}
