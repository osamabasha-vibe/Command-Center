/* ═══ PEOPLE TASK LIST ═══ */
let pvCo='',pvProj='',pvDone='open',pvQ='',pvSolo='',pvSort='order';
const PRI={h:{n:'High',r:0},m:{n:'Mid',r:1},l:{n:'Low',r:2}};
function priOf(st){return st.p||'m';}
function personMatches(step,person){
  if(step.a)return step.a===person.id;
  const w=(step.w||'').trim().toLowerCase();
  if(!w||w==='—')return false;
  const full=person.name.toLowerCase(),first=full.split(' ')[0];
  return w===full||w===first||w.startsWith(first+' ')||full.startsWith(w);
}
function tasksFor(person){
  const out=[];
  const q=pvQ.toLowerCase();
  S().projects.forEach(p=>{
    if(p.st==='killed')return;
    if(pvCo&&p.co!==pvCo)return;
    if(pvProj&&p.id!==pvProj)return;
    p.goals.forEach((g,gi)=>g.steps.forEach((st,si)=>{
      if(!personMatches(st,person))return;
      if(pvDone==='open'&&st.d)return;
      if(q&&!((st.t||'').toLowerCase().includes(q)||p.name.toLowerCase().includes(q)))return;
      out.push({p,g,gi,si,st});
    }));
  });
  const ord=(store.order[person.id]||[]);
  out.sort((a,b)=>{
    const pa=PRI[priOf(a.st)].r,pb=PRI[priOf(b.st)].r;
    if(pa!==pb)return pa-pb;
    const ai=ord.indexOf(a.st.id),bi=ord.indexOf(b.st.id);
    if(ai>=0&&bi>=0)return ai-bi;
    if(ai>=0)return -1;
    if(bi>=0)return 1;
    return 0;
  });
  return out;
}
function roster(){
  if(space!=='work')return[{id:'me',name:'Osama',role:'Owner',grp:'Personal',c:'#7F77DD'}];
  let r=PPL().slice();
  const q=pvQ.toLowerCase();
  if(q)r=r.filter(x=>x.name.toLowerCase().includes(q)||(x.role||'').toLowerCase().includes(q)||tasksFor(x).length);
  const co=store.colOrder&&store.colOrder[space]?store.colOrder[space]:[];
  if(pvSort==='order'&&co.length){
    r.sort((a,b)=>{const ai=co.indexOf(a.id),bi=co.indexOf(b.id);
      if(ai>=0&&bi>=0)return ai-bi;if(ai>=0)return -1;if(bi>=0)return 1;return 0;});
  } else if(pvSort==='most'){r.sort((a,b)=>openCount(b)-openCount(a));}
  else if(pvSort==='least'){r.sort((a,b)=>openCount(a)-openCount(b));}
  else if(pvSort==='urgent'){r.sort((a,b)=>highCount(b)-highCount(a));}
  else if(pvSort==='name'){r.sort((a,b)=>a.name.localeCompare(b.name));}
  else if(pvSort==='team'){r.sort((a,b)=>(a.grp||'').localeCompare(b.grp||'')||a.name.localeCompare(b.name));}
  return r;
}
function openCount(pp){return tasksFor(pp).filter(x=>!x.st.d).length;}
function highCount(pp){return tasksFor(pp).filter(x=>!x.st.d&&priOf(x.st)==='h').length;}

function rPeople(){
  const all=roster();
  const list=pvSolo?all.filter(x=>x.id===pvSolo):all;
  const coOpts=`<option value="">All companies</option>`+S().cos.map(c=>`<option value="${c.id}"${pvCo===c.id?' selected':''}>${esc(c.name)}</option>`).join('');
  const pjOpts=`<option value="">All projects</option>`+S().projects.filter(p=>p.st!=='killed'&&(!pvCo||p.co===pvCo)).map(p=>`<option value="${p.id}"${pvProj===p.id?' selected':''}>${esc(p.name)}</option>`).join('');
  const sorts=[['order','Manual order'],['most','Most tasks'],['least','Least tasks'],['urgent','Most high priority'],['name','Name A-Z'],['team','Team']];

  const cols=list.map(person=>{
    const t=tasksFor(person);
    const n=t.filter(x=>!x.st.d).length,hi=t.filter(x=>!x.st.d&&priOf(x.st)==='h').length;
    const hc=n>=6?'var(--rd)':n>=4?'var(--am)':n>0?'var(--dn)':'var(--t3)';
    const hbg=n>=6?'rgba(224,82,82,.13)':n>=4?'rgba(212,141,26,.13)':n>0?'rgba(34,168,120,.13)':'transparent';

    let rows='',lastP=null;
    if(t.length){
      t.forEach((x,i)=>{
        const pr=priOf(x.st);
        if(pr!==lastP&&!x.st.d){rows+=`<div class="pgrp"><span class="pri-dot ${pr}"></span>${PRI[pr].n}</div>`;lastP=pr;}
        const co=coOf(x.p.co);
        rows+=`<div class="ptask${x.st.d?' done':''}" id="pt-${person.id}-${x.st.id}" draggable="true"
          ondragstart="dsTask(event,'${person.id}','${x.st.id}')" ondragend="dEnd()"
          ondragover="ptOver(event,'${person.id}','${x.st.id}')" ondragleave="ptLeave(event,'${person.id}','${x.st.id}')" ondrop="ptDrop(event,'${person.id}','${x.st.id}')">
          <button class="pri-dot ${pr}" onclick="cyclePri('${x.st.id}')" title="Priority: ${PRI[pr].n} — click to change"></button>
          <input type="checkbox" class="pt-cb" ${x.st.d?'checked':''} onchange="tog('${x.p.id}',${x.gi},${x.si},this.checked)">
          <div class="pt-mid">
            <div class="pt-t${x.st.d?' done':''}" contenteditable spellcheck="false" onblur="editStep(event,'${x.p.id}',${x.gi},${x.si})" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(x.st.t)}</div>
            <div class="pt-meta"><span class="co-dot" style="background:${pcol(x.p)}"></span>${esc(x.p.name)}${co?' · '+esc(co.name):''}</div>
          </div>
          <button class="pt-open" onclick="openPop('${x.p.id}')" title="Open project">⤢</button>
          <button class="pt-del" onclick="delTask('${x.p.id}',${x.gi},${x.si})" title="Delete task">×</button>
        </div>`;
      });
    } else rows=`<div class="pcol-e">${pvQ?'No tasks match that search.':'No open tasks assigned.'}</div>`;

    return`<div class="pcol" id="pcol-${person.id}" draggable="true"
      ondragstart="dsCol(event,'${person.id}')" ondragend="dEnd()"
      ondragenter="colEnter(event,'${person.id}')" ondragover="colOver(event,'${person.id}')" ondragleave="colLeave(event,'${person.id}')" ondrop="colDrop(event,'${person.id}')">
      <div class="pcol-h">
        <div class="av pcol-av" style="${avS(person.c)}">${ini(person.name)}</div>
        <div style="min-width:0">
          <div class="pcol-n" onclick="soloPerson('${person.id}')" title="Show only this person">${esc(person.name)}</div>
          <div class="pcol-r">${esc(person.role||'')}${hi?` · ${hi} high`:''}</div>
        </div>
        <span class="pcol-ct" style="color:${hc};background:${hbg}">${n} open</span>
      </div>
      <div class="pcol-b" id="pcb-${person.id}" ondragover="pcOver(event,'${person.id}')" ondragleave="pcLeave(event,'${person.id}')" ondrop="pcDrop(event,'${person.id}')">${rows}</div>
      <div class="pcol-add"><input id="pa2-${person.id}" placeholder="+ task for ${esc(person.name.split(' ')[0])}" onkeydown="addPersonTask(event,'${person.id}')"></div>
    </div>`;}).join('');

  const soloP=pvSolo?all.find(x=>x.id===pvSolo):null;
  document.getElementById('v-people').innerHTML=`<div class="pv">
    <div class="pv-h"><div class="pv-t">People</div>
      ${soloP?`<div class="pv-focus"><div class="av" style="${avS(soloP.c)};width:19px;height:19px;font-size:7px">${ini(soloP.name)}</div>focused on ${esc(soloP.name)}<button onclick="soloPerson('')" title="Show everyone">×</button></div>`:''}
      <div class="pv-filters">
        <div class="pv-search"><input id="pvq" placeholder="Search tasks or people…" value="${esc(pvQ)}" oninput="pvQ=this.value;rPeople();restoreQ()"></div>
        <select onchange="pvSort=this.value;rPeople()">${sorts.map(([v,l])=>`<option value="${v}"${pvSort===v?' selected':''}>${l}</option>`).join('')}</select>
        <select onchange="pvCo=this.value;pvProj='';rPeople()">${coOpts}</select>
        <select onchange="pvProj=this.value;rPeople()">${pjOpts}</select>
        <select onchange="pvDone=this.value;rPeople()">
          <option value="open"${pvDone==='open'?' selected':''}>Open only</option>
          <option value="all"${pvDone==='all'?' selected':''}>Include done</option>
        </select>
      </div></div>
    <div class="pv-sub">Click a name to focus on one person. Drag tasks to reorder or reassign, drag column headers to rearrange people, click the coloured dot to set priority.</div>
    <div class="pv-cols${pvSolo?' solo':''}">${cols||'<div class="pcol-e">Nobody matches these filters.</div>'}</div>
  </div>`;
}
function restoreQ(){const i=document.getElementById('pvq');if(i){i.focus();const v=i.value;i.value='';i.value=v;}}
function soloPerson(id){pvSolo=(pvSolo===id)?'':id;rPeople();}
function cyclePri(stepId){
  const f=findStep(stepId);if(!f)return;
  const cur=priOf(f.st);
  f.st.p=cur==='h'?'m':(cur==='m'?'l':'h');
  save();rPeople();
}
function delTask(projId,gi,si){
  const p=P(projId);if(!p)return;
  const st=p.goals[gi].steps[si];
  if(!confirm('Delete this task?'))return;
  if(st&&st.id)Object.keys(store.order).forEach(k=>{store.order[k]=(store.order[k]||[]).filter(x=>x!==st.id);});
  p.goals[gi].steps.splice(si,1);save();rAll();
}
function findStep(stepId){
  for(const p of S().projects)for(let gi=0;gi<p.goals.length;gi++){
    const si=p.goals[gi].steps.findIndex(x=>x.id===stepId);
    if(si>=0)return{p,gi,si,st:p.goals[gi].steps[si]};
  }
  return null;
}
/* task drag */
function dsTask(e,personId,stepId){e.stopPropagation();document.body.classList.add('dragging');drag={type:'task',person:personId,step:stepId};e.dataTransfer.effectAllowed='move';
  const el=document.getElementById('pt-'+personId+'-'+stepId);if(el)setTimeout(()=>el.classList.add('drg'),0);}
function ptOver(e,personId,stepId){if(drag&&drag.type==='task'){e.preventDefault();e.stopPropagation();const el=document.getElementById('pt-'+personId+'-'+stepId);if(el&&!el.classList.contains('ins'))el.classList.add('ins');}}
function ptLeave(e,personId,stepId){const el=document.getElementById('pt-'+personId+'-'+stepId);if(el)el.classList.remove('ins');}
function ptDrop(e,personId,stepId){
  e.preventDefault();e.stopPropagation();
  const el=document.getElementById('pt-'+personId+'-'+stepId);if(el)el.classList.remove('ins');
  if(!(drag&&drag.type==='task'))return;
  applyTaskMove(drag.step,drag.person,personId,stepId);drag=null;
}
function pcOver(e,personId){if(drag&&drag.type==='task'){e.preventDefault();const el=document.getElementById('pcb-'+personId);if(el&&!el.classList.contains('over'))el.classList.add('over');}}
function pcLeave(e,personId){const el=document.getElementById('pcb-'+personId);if(el)el.classList.remove('over');}
function pcDrop(e,personId){
  e.preventDefault();
  const el=document.getElementById('pcb-'+personId);if(el)el.classList.remove('over');
  if(!(drag&&drag.type==='task'))return;
  applyTaskMove(drag.step,drag.person,personId,null);drag=null;
}
function applyTaskMove(stepId,fromPerson,toPerson,beforeStepId){
  const f=findStep(stepId);if(!f)return;
  const person=roster().find(x=>x.id===toPerson);
  if(person&&toPerson!==fromPerson){
    f.st.a=person.id;
    f.st.w=person.name.split(' ')[0];
    store.order[fromPerson]=(store.order[fromPerson]||[]).filter(x=>x!==stepId);
  }
  if(beforeStepId){
    const bf=findStep(beforeStepId);
    if(bf)f.st.p=priOf(bf.st);
  }
  const target=roster().find(x=>x.id===toPerson);
  if(target){
    const visible=tasksFor(target).map(x=>x.st.id).filter(x=>x!==stepId);
    let at=beforeStepId?visible.indexOf(beforeStepId):visible.length;
    if(at<0)at=visible.length;
    visible.splice(at,0,stepId);
    store.order[toPerson]=visible;
  }
  save();rAll();
}
/* column drag */
let _colRect=null,_colId=null,_colSide=null;
function dsCol(e,personId){
  if(drag&&drag.type==='task')return;
  e.stopPropagation();document.body.classList.add('dragging');
  drag={type:'col',id:personId};e.dataTransfer.effectAllowed='move';
  const el=document.getElementById('pcol-'+personId);if(el)setTimeout(()=>el.classList.add('drg'),0);
}
function colEnter(e,personId){if(!drag||drag.type!=='col')return;const el=document.getElementById('pcol-'+personId);if(el){_colRect=el.getBoundingClientRect();_colId=personId;_colSide=null;}}
function colOver(e,personId){
  if(!drag||drag.type!=='col'||drag.id===personId)return;
  e.preventDefault();e.stopPropagation();
  const el=document.getElementById('pcol-'+personId);if(!el)return;
  if(_colId!==personId||!_colRect){_colRect=el.getBoundingClientRect();_colId=personId;}
  const after=e.clientX>_colRect.left+_colRect.width/2;
  if(after===_colSide)return;
  _colSide=after;
  el.classList.toggle('insR',after);el.classList.toggle('insL',!after);
}
function colLeave(e,personId){const el=document.getElementById('pcol-'+personId);if(el)el.classList.remove('insL','insR');}
function colDrop(e,personId){
  if(!drag||drag.type!=='col'){return;}
  e.preventDefault();e.stopPropagation();
  const el=document.getElementById('pcol-'+personId);
  const r=(_colId===personId&&_colRect)?_colRect:(el?el.getBoundingClientRect():{left:0,width:0});
  const after=e.clientX>r.left+r.width/2;
  if(el)el.classList.remove('insL','insR');
  const fromId=drag.id;drag=null;_colRect=null;_colId=null;_colSide=null;
  if(fromId===personId)return;
  if(!store.colOrder)store.colOrder={};
  let ord=(store.colOrder[space]&&store.colOrder[space].length)?store.colOrder[space].slice():roster().map(x=>x.id);
  ord=ord.filter(x=>x!==fromId);
  let at=ord.indexOf(personId);
  if(at<0)at=ord.length; else if(after)at++;
  ord.splice(at,0,fromId);
  store.colOrder[space]=ord;
  pvSort='order';
  save();rPeople();
}
function addPersonTask(e,personId){
  if(e.key!=='Enter')return;
  const v=e.target.value.trim();if(!v)return;
  let target=null;
  if(pvProj)target=P(pvProj);
  if(!target)target=S().projects.find(p=>p.st==='active'&&p.team.includes(personId));
  if(!target)target=S().projects.find(p=>p.st==='active'&&(!pvCo||p.co===pvCo));
  if(!target){alert('Create a project first, or pick one in the project filter.');return;}
  const person=roster().find(x=>x.id===personId);
  const gi=target.goals.length-1;
  const st={id:sid(),t:v,w:person?person.name.split(' ')[0]:'—',a:personId,p:'m',d:0};
  target.goals[gi].steps.push(st);
  store.order[personId]=[...(store.order[personId]||[]),st.id];
  if(person&&!target.team.includes(personId))target.team.push(personId);
  save();e.target.value='';rAll();
  setTimeout(()=>{const inp=document.getElementById('pa2-'+personId);if(inp)inp.focus();},40);
}
