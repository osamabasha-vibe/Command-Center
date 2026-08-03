/* ═══ RESTORE / BACKUP ═══ */
const CURKEY='cc9';
function normSpace(sp){
  if(!sp||!Array.isArray(sp.projects))return null;
  const cos=Array.isArray(sp.cos)?sp.cos.map(c=>({id:c.id||('c'+Math.random().toString(36).slice(2,7)),name:c.name||'Company',color:c.color||'#83838f'})):[];
  const byName={};cos.forEach(c=>byName[(c.name||'').toLowerCase()]=c.id);
  const projects=sp.projects.filter(p=>p&&(p.name||p.goal||p.goals||p.steps)).map(p=>{
    let goals=[];
    if(Array.isArray(p.goals)&&p.goals.length){
      goals=p.goals.map(g=>({id:g.id||('g'+Math.random().toString(36).slice(2,9)),title:g.title||g.goal||'',
        steps:(g.steps||[]).map(st=>({t:st.t||st.title||st.text||'',w:st.w||st.who||'—',d:(st.d||st.done)?1:0}))}));
    } else {
      goals=[{id:'g'+Math.random().toString(36).slice(2,9),title:p.goal||'',
        steps:(p.steps||[]).map(st=>({t:st.t||st.title||st.text||'',w:st.w||st.who||'—',d:(st.d||st.done)?1:0}))}];
    }
    let co=p.co||null;
    if(co&&!cos.find(c=>c.id===co))co=byName[String(co).toLowerCase()]||null;
    return{id:p.id||('p'+Math.random().toString(36).slice(2,9)),name:p.name||'Untitled',co,
      st:['active','paused','killed'].includes(p.st)?p.st:'active',
      team:Array.isArray(p.team)?p.team:[],ideas:Array.isArray(p.ideas)?p.ideas:[],goals};
  });
  return{cos,projects};
}
function parseAny(raw){
  let d;try{d=JSON.parse(raw);}catch(e){return null;}
  if(!d)return null;
  if(Array.isArray(d)){const w=normSpace({cos:[],projects:d});return w&&w.projects.length?{work:w,personal:null}:null;}
  if(d.work||d.personal){
    const w=normSpace(d.work),pe=normSpace(d.personal);
    if((w&&w.projects.length)||(pe&&pe.projects.length))return{work:w,personal:pe,people:d.people||null};
    return null;
  }
  if(Array.isArray(d.projects)){const w=normSpace(d);return w&&w.projects.length?{work:w,personal:null}:null;}
  return null;
}
function scanOld(){
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(!k||k===CURKEY||k==='cc_light'||k==='cc_space')continue;
    const raw=localStorage.getItem(k);
    if(!raw||raw.length<40)continue;
    const d=parseAny(raw);
    if(d){d.label=k;d.size=raw.length;out.push(d);}
  }
  out.sort((a,b)=>b.size-a.size);
  return out;
}
function openRestore(){rRestore();document.getElementById('rov').classList.add('open');}
function closeRestore(){document.getElementById('rov').classList.remove('open');}
function rRestore(){
  const found=scanOld();
  const rows=found.length?found.map(d=>{
    const wc=d.work?d.work.projects.length:0, pc=d.personal?d.personal.projects.length:0;
    const names=(d.work?d.work.projects:[]).slice(0,4).map(x=>x.name).join(', ');
    return`<div class="f-row" style="margin-bottom:6px;align-items:flex-start">
      <div class="f-mid"><div class="f-act">${wc} work${pc?` · ${pc} personal`:''} <code style="opacity:.45;font-size:10px">${d.label}</code></div>
      <div class="f-meta" style="display:block;line-height:1.4">${esc(names)}${wc>4?' …':''}</div></div>
      <button class="tinybtn" onclick="restoreFrom('${d.label}','merge')">Merge in</button>
      <button class="tinybtn" onclick="restoreFrom('${d.label}','replace')">Replace</button>
    </div>`;}).join(''):`<div class="bk-empty">No earlier boards found in this browser. If you organized the board in a different browser or on another device, open it there and use ⤓ Download backup, then load the file here.</div>`;
  document.getElementById('rpop').innerHTML=`
    <div class="pop-h"><div class="pop-top"><div style="flex:1">
      <div class="pop-n" style="font-size:17px" contenteditable="false">Restore &amp; backup</div>
      <div class="f-sub" style="margin:0">Earlier versions saved their own copy. Merge keeps what you have now and adds anything missing.</div>
      </div><button class="pop-x" onclick="closeRestore()">×</button></div></div>
    <div class="pop-b">
      ${rows}
      <div class="pgblk"><div class="pgblk-top"><span class="pop-gl">Backup</span></div>
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          <button class="tinybtn" onclick="exportJSON()">⤓ Download backup</button>
          <label class="tinybtn" style="cursor:pointer">⤒ Load backup file<input type="file" accept="application/json" style="display:none" onchange="importJSON(event)"></label>
        </div>
        <div class="pop-hint" style="margin-top:8px">Download a backup before any big change. Loading a file replaces everything.</div>
      </div>
      <div class="pgblk"><div class="pgblk-top"><span class="pop-gl">Paste data</span></div>
        <textarea id="pastebox" placeholder="Paste exported JSON here, then press Load" style="width:100%;min-height:80px;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;color:var(--t);font-size:11px;padding:8px;font-family:monospace;outline:none"></textarea>
        <div style="display:flex;gap:7px;margin-top:7px"><button class="tinybtn" onclick="loadPasted()">Load pasted data</button></div>
      </div>
      <div class="pgblk"><div class="pgblk-top"><span class="pop-gl">Diagnostics</span></div>
        <div id="diag" style="font-size:10.5px;font-family:monospace;color:var(--t2);line-height:1.6"></div>
        <div class="pop-hint" style="margin-top:8px">This lists every storage entry this page can see. If your saved board is not here, it lives on a different page address and must be exported from there.</div>
      </div>
    </div>`;

  renderDiag();
}
