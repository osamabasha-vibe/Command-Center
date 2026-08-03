/* ═══ EDIT ═══ */
function keyBlur(e){if(e.key==='Enter'){e.preventDefault();e.target.blur();}}
function editName(e,id){const p=P(id);if(p){const v=e.target.textContent.trim();if(v)p.name=v;else e.target.textContent=p.name;save();rPJ();}}
function editGoal(e,id,gi){const p=P(id);if(p&&p.goals[gi]){p.goals[gi].title=e.target.textContent.trim();save();}}
function editStep(e,id,gi,i){const p=P(id);if(p&&p.goals[gi]){const v=e.target.textContent.trim();if(v)p.goals[gi].steps[i].t=v;else e.target.textContent=p.goals[gi].steps[i].t;save();rB();}}
function editWho(e,id,gi,i){const p=P(id);if(p&&p.goals[gi]){p.goals[gi].steps[i].w=e.target.textContent.trim()||'—';save();}}
function tog(id,gi,i,d){const p=P(id);if(p){p.goals[gi].steps[i].d=d?1:0;save();rAll();}}
function delStep(id,gi,i){const p=P(id);if(p){p.goals[gi].steps.splice(i,1);save();rAll();}}
function delGoal(id,gi){const p=P(id);if(!p)return;if(p.goals.length<=1){if(!confirm('This is the last goal. Clear it?'))return;p.goals[0]={...p.goals[0],title:'',steps:[]};}
  else{if(!confirm('Delete this goal and its actions?'))return;p.goals.splice(gi,1);}save();rAll();}
function delProj(id){const p=P(id);if(!p)return;if(!confirm(`Delete project "${p.name}"?`))return;S().projects=S().projects.filter(x=>x.id!==id);if(popId===id)closePop();save();rAll();}
function buildOpts(p){
  const st=p.st||'active';
  let h='<optgroup label="Company">';
  h+=`<option value="co:"${!p.co?' selected':''}>◇ floating</option>`;
  h+=S().cos.map(c=>`<option value="co:${c.id}"${p.co===c.id?' selected':''}>${esc(c.name)}</option>`).join('');
  h+='</optgroup><optgroup label="Status">';
  h+=LANES.map(l=>`<option value="st:${l.id}"${st===l.id?' selected':''}>${l.id==='active'?'● Live':(l.id==='paused'?'❚❚ Paused':'✕ Killed')}</option>`).join('');
  h+='</optgroup>';
  return h;
}
function setPick(id,val){
  const p=P(id);if(!p)return;
  if(val.startsWith('co:')){p.co=val.slice(3)||null;}
  else if(val.startsWith('st:')){p.st=val.slice(3);}
  save();rAll();
}
function setCo(id,co){const p=P(id);if(p){p.co=co||null;save();rAll();}}
function addGoal(id){const p=P(id);if(p){p.goals.push(G('New goal',[]));save();rAll();
  setTimeout(()=>{const gs=document.querySelectorAll(`#bx-${id} .g-t`);const last=gs[gs.length-1];if(last){last.focus();document.getSelection().selectAllChildren(last);}},60);}}
function quickAdd(e,id,gi){if(e.key!=='Enter')return;const v=e.target.value.trim();if(!v)return;const p=P(id);if(!p)return;
  p.goals[gi].steps.push({id:sid(),t:v,w:space==='personal'?'Osama':'—',d:0});save();e.target.value='';rB();
  setTimeout(()=>{const inp=document.getElementById(`qa-${id}-${gi}`);if(inp)inp.focus();},30);}
function popAdd(e,id,gi){if(e.key!=='Enter')return;const v=e.target.value.trim();if(!v)return;const p=P(id);if(!p)return;
  p.goals[gi].steps.push({id:sid(),t:v,w:space==='personal'?'Osama':'—',d:0});save();rPop();rB();
  setTimeout(()=>{const inp=document.getElementById(`pa-${id}-${gi}`);if(inp)inp.focus();},30);}
function addProj(lane){const id='p'+Date.now();S().projects.push({id,name:'New project',co:null,st:lane,team:[],ideas:[],goals:[G('',[])]});save();rAll();
  setTimeout(()=>{const el=document.querySelector(`#bx-${id} .bx-name`);if(el){el.focus();document.getSelection().selectAllChildren(el);el.scrollIntoView({block:'center'});}},60);}
