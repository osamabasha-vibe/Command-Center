/* ═══ PEOPLE ═══ */
function heat(pid){return S().projects.filter(p=>p.st==='active'&&p.team.includes(pid)).length;}
function rSB(){
  const hdr=document.getElementById('ppl-hdr');
  if(space==='personal'){hdr.style.display='none';document.getElementById('sbl').innerHTML='';return;}
  hdr.style.display='';
  const q=(document.getElementById('q').value||'').toLowerCase();
  const g={};
  PPL().forEach(p=>{if(q&&!p.name.toLowerCase().includes(q)&&!p.role.toLowerCase().includes(q))return;(g[p.grp]=g[p.grp]||[]).push(p);});
  document.getElementById('sbl').innerHTML=Object.entries(g).map(([grp,ppl])=>
    `<div style="margin-bottom:9px"><div class="sb-t" style="padding:0 12px 4px">${esc(grp)}</div>
    ${ppl.map(p=>{const h=heat(p.id);const hc=h>=4?'#e05252':h===3?'#d48d1a':h>0?'#22a878':'transparent';
      return`<div class="pch" id="ch-${p.id}" draggable="true" ondragstart="dsPerson(event,'${p.id}',null)" ondragend="dEnd()"
        ondragover="pchOver(event,'${p.id}')" ondragleave="pchLeave(event,'${p.id}')" ondrop="pchDrop(event,'${p.id}')">
      <div class="av" style="${avS(p.c)}">${ini(p.name)}${h>0?`<span class="heat" style="background:${hc}">${h}</span>`:''}</div>
      <div class="ci"><div class="cn" contenteditable spellcheck="false" onblur="editPersonName(event,'${p.id}')" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(p.name)}</div><div class="cr">${esc(p.role)}</div></div>
      <span class="co-x" onclick="delPerson('${p.id}')" title="Delete person">×</span></div>`;}).join('')}</div>`).join('');
}
function addPerson(){const id='u'+Date.now();const grp=(S().cos[0]||{}).name||'Unassigned';
  PPL().push({id,name:'New person',role:'Team member',grp,c:PAL[PPL().length%PAL.length]});save();rSB();
  setTimeout(()=>{const el=document.querySelector(`#ch-${id} .cn`);if(el){el.focus();document.getSelection().selectAllChildren(el);}},50);}
function editPersonName(e,id){const p=PPL().find(x=>x.id===id);if(p){const v=e.target.textContent.trim();if(v)p.name=v;else e.target.textContent=p.name;save();rB();}}
function delPerson(id){const p=PPL().find(x=>x.id===id);if(!p)return;if(!confirm(`Remove ${p.name} from the roster?`))return;
  PPL().splice(PPL().findIndex(x=>x.id===id),1);
  ['work','personal'].forEach(sp=>{store[sp].projects.forEach(pr=>{pr.team=pr.team.filter(x=>x!==id);});});save();rAll();}
function pchOver(e,id){if(drag&&drag.type==='co'){e.preventDefault();e.stopPropagation();document.getElementById('ch-'+id).classList.add('over');}}
function pchLeave(e,id){const el=document.getElementById('ch-'+id);if(el)el.classList.remove('over');}
function pchDrop(e,id){e.preventDefault();e.stopPropagation();const el=document.getElementById('ch-'+id);if(el)el.classList.remove('over');
  if(drag&&drag.type==='co'){const c=coOf(drag.id);const pr=PPL().find(x=>x.id===id);if(c&&pr){pr.grp=c.name;save();rSB();}}drag=null;}
