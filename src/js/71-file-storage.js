/* ═══ LOCAL FILE STORAGE (File System Access API) ═══ */
let fileHandle=null,fileTimer=null,fileBusy=false;
const IDB_DB='cc_fs',IDB_STORE='handles';
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open(IDB_DB,1);
  r.onupgradeneeded=()=>{r.result.createObjectStore(IDB_STORE);};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function idbSet(k,v){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction(IDB_STORE,'readwrite');t.objectStore(IDB_STORE).put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);});}
async function idbGet(k){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction(IDB_STORE,'readonly');const q=t.objectStore(IDB_STORE).get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}

function fsSupported(){return typeof window.showSaveFilePicker==='function';}
function setFileBadge(){
  const b=document.getElementById('fileBtn');if(!b)return;
  if(fileHandle){b.style.borderColor='var(--dn)';b.style.color='var(--dn)';b.title='Saving to '+fileHandle.name+' — click to change file';}
  else{b.style.borderColor='';b.style.color='';b.title=fsSupported()?'Connect a file on your computer':'File storage needs Chrome or Edge on desktop';}
}
async function writeFile(){
  if(!fileHandle||fileBusy)return;
  fileBusy=true;
  try{const w=await fileHandle.createWritable();await w.write(JSON.stringify(store,null,2));await w.close();}
  catch(e){console.warn('file write failed',e);}
  fileBusy=false;
}
function scheduleWrite(){if(!fileHandle)return;clearTimeout(fileTimer);fileTimer=setTimeout(writeFile,600);}

async function connectFile(){
  if(!fsSupported()){
    alert('Saving to a file needs Chrome or Edge on desktop.\n\nUse ⟲ → Download backup instead, and load the file when you reopen.');
    return;
  }
  try{
    const h=await window.showSaveFilePicker({
      suggestedName:'command-center.json',
      types:[{description:'Command Center data',accept:{'application/json':['.json']}}]
    });
    let existing=null;
    try{const f=await h.getFile();const txt=await f.text();if(txt.trim())existing=parseAny(txt);}catch(e){}
    if(existing){
      if(confirm('That file already has a board in it.\n\nOK = load the file into this page.\nCancel = overwrite the file with what is on screen now.')){
        if(existing.work)store.work=existing.work;
        if(existing.personal)store.personal=existing.personal;
        if(existing.people)store.people=existing.people;
        ['work','personal'].forEach(sp=>{store[sp].projects.forEach(p=>{if(!p.ideas)p.ideas=[];if(!p.goals||!p.goals.length)p.goals=[G('',[])];});});
      }
    }
    fileHandle=h;
    await idbSet('handle',h);
    await writeFile();
    save();rAll();setFileBadge();
    alert('Connected. Every change now saves straight to '+h.name+' on your computer.');
  }catch(e){/* user cancelled */}
}
async function tryReconnectFile(){
  if(!fsSupported())return setFileBadge();
  try{
    const h=await idbGet('handle');
    if(!h)return setFileBadge();
    const perm=await h.queryPermission({mode:'readwrite'});
    if(perm!=='granted'){
      const again=await h.requestPermission({mode:'readwrite'});
      if(again!=='granted')return setFileBadge();
    }
    const f=await h.getFile();const txt=await f.text();
    const d=txt.trim()?parseAny(txt):null;
    if(d){
      if(d.work)store.work=d.work;
      if(d.personal)store.personal=d.personal;
      if(d.people)store.people=d.people;
      ['work','personal'].forEach(sp=>{store[sp].projects.forEach(p=>{if(!p.ideas)p.ideas=[];if(!p.goals||!p.goals.length)p.goals=[G('',[])];});});
      save();rAll();
    }
    fileHandle=h;setFileBadge();
  }catch(e){setFileBadge();}
}
function renderDiag(){
  const el=document.getElementById('diag');if(!el)return;
  let out=[];
  try{
    out.push('page address: '+location.href.slice(0,90));
    out.push('mode: '+(SERVER?'local server (data.json on disk)':'browser storage'));
    out.push('file storage: '+(fileHandle?('connected → '+fileHandle.name):(fsSupported()?'available, not connected':'not supported in this browser')));
    out.push('storage entries: '+localStorage.length);
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
      const ok=parseAny(v)?' [readable board]':'';
      out.push('• '+k+'  —  '+v.length+' chars'+ok);
    }
    if(!localStorage.length)out.push('(storage is empty on this page address)');
  }catch(e){out.push('storage blocked: '+e.message);}
  el.innerHTML=out.map(x=>esc(x)).join('<br>');
}
function loadPasted(){
  const box=document.getElementById('pastebox');if(!box)return;
  const txt=(box.value||'').trim();
  if(!txt){alert('Nothing pasted.');return;}
  const d=parseAny(txt);
  if(!d){alert('Could not read that as board data.');return;}
  if(!confirm('Replace the current board with the pasted data?'))return;
  if(d.work)store.work=d.work;
  if(d.personal)store.personal=d.personal;
  if(d.people)store.people=d.people;
  ['work','personal'].forEach(sp=>{store[sp].projects.forEach(p=>{if(!p.ideas)p.ideas=[];if(!p.goals||!p.goals.length)p.goals=[G('',[])];});});
  save();closeRestore();rAll();
  alert('Loaded. Download a backup now so this is never lost again.');
}
function restoreFrom(key,mode){
  const raw=localStorage.getItem(key);const d=raw?parseAny(raw):null;
  if(!d){alert('Could not read that saved board.');return;}
  if(mode==='replace'){
    if(!confirm('Replace the current board with this saved version?'))return;
    if(d.work)store.work=d.work;
    if(d.personal)store.personal=d.personal;
    if(d.people)store.people=d.people;
  } else {
    ['work','personal'].forEach(sp=>{
      const src=d[sp];if(!src)return;
      const tgt=store[sp];
      src.cos.forEach(c=>{if(!tgt.cos.find(x=>x.id===c.id||x.name===c.name))tgt.cos.push(c);});
      src.projects.forEach(pr=>{
        const ex=tgt.projects.find(x=>x.id===pr.id||x.name.toLowerCase()===pr.name.toLowerCase());
        if(!ex){tgt.projects.push(pr);return;}
        pr.goals.forEach(g=>{
          const eg=ex.goals.find(x=>(x.title||'').toLowerCase()===(g.title||'').toLowerCase());
          if(!eg){ex.goals.push(g);return;}
          g.steps.forEach(st=>{if(!eg.steps.find(y=>y.t===st.t))eg.steps.push(st);});
        });
        (pr.ideas||[]).forEach(i=>{if(!ex.ideas.includes(i))ex.ideas.push(i);});
        pr.team.forEach(t=>{if(!ex.team.includes(t))ex.team.push(t);});
      });
    });
    if(d.people)d.people.forEach(pp=>{if(!store.people.find(x=>x.id===pp.id))store.people.push(pp);});
  }
  ['work','personal'].forEach(sp=>{store[sp].projects.forEach(p=>{if(!p.ideas)p.ideas=[];if(!p.goals)p.goals=[G('',[])];});});
  save();closeRestore();rAll();
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='command-center-'+new Date().toISOString().slice(0,10)+'.json';a.click();
}
function importJSON(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const d=JSON.parse(r.result);
    if(!d.work&&!d.personal){alert('That file does not look like a Command Center backup.');return;}
    if(!confirm('Replace everything with this backup file?'))return;
    if(d.work)store.work=normSpace(d.work)||store.work;
    if(d.personal)store.personal=normSpace(d.personal)||store.personal;
    if(d.people)store.people=d.people;
    ['work','personal'].forEach(sp=>{store[sp].projects.forEach(p=>{if(!p.ideas)p.ideas=[];});});
    save();closeRestore();rAll();
  }catch(err){alert('Could not read that file.');}};
  r.readAsText(f);
}
/* auto-offer restore once if this board is untouched and older data exists */
(function(){
  try{
    if(localStorage.getItem(CURKEY))return;
    if(scanOld().length)setTimeout(openRestore,500);
  }catch(e){}
})();

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePop();closeRestore();}});
window.addEventListener('resize',syncFlipHeights);
rAll();
if(SERVER){document.getElementById('fileBtn').style.display='none';pullServer();}else{tryReconnectFile();}
