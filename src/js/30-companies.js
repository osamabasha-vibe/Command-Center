/* ═══ COMPANIES ═══ */
function rCos(){
  document.getElementById('colist').innerHTML=S().cos.map(c=>{
    const ct=S().projects.filter(p=>p.co===c.id&&p.st!=='killed').length;
    return`<div class="corow" id="co-${c.id}" draggable="true" ondragstart="dsCo(event,'${c.id}')" ondragend="dEnd()"
      ondragover="coOver(event,'${c.id}')" ondragleave="coLeave(event,'${c.id}')" ondrop="coDrop(event,'${c.id}')">
      <span class="co-dot" style="background:${c.color}"></span>
      <span class="co-nm" contenteditable spellcheck="false" onblur="editCoName(event,'${c.id}')" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(c.name)}</span>
      <span class="co-ct">${ct}</span>
      <span class="co-x" onclick="delCo('${c.id}')" title="Delete company">×</span>
    </div>`;}).join('');
}
function addCo(){const id='c'+Date.now();S().cos.push({id,name:'New company',color:PAL[S().cos.length%PAL.length]});save();rAll();
  setTimeout(()=>{const el=document.querySelector(`#co-${id} .co-nm`);if(el){el.focus();document.getSelection().selectAllChildren(el);}},50);}
function editCoName(e,id){const c=coOf(id);if(c){const v=e.target.textContent.trim();if(v)c.name=v;else e.target.textContent=c.name;save();rB();}}
function delCo(id){const c=coOf(id);if(!c)return;if(!confirm(`Delete company "${c.name}"? Projects become floating.`))return;S().projects.forEach(p=>{if(p.co===id)p.co=null;});S().cos=S().cos.filter(x=>x.id!==id);save();rAll();}
function dsCo(e,id){e.stopPropagation();document.body.classList.add('dragging');drag={type:'co',id};e.dataTransfer.effectAllowed='copy';setTimeout(()=>{const el=document.getElementById('co-'+id);if(el)el.classList.add('drg');},0);}
function coOver(e,id){if(drag&&(drag.type==='proj'||drag.type==='person')){e.preventDefault();e.stopPropagation();document.getElementById('co-'+id).classList.add('over');}}
function coLeave(e,id){const el=document.getElementById('co-'+id);if(el)el.classList.remove('over');}
function coDrop(e,id){e.preventDefault();e.stopPropagation();const el=document.getElementById('co-'+id);if(el)el.classList.remove('over');
  if(drag&&drag.type==='proj'){const p=P(drag.id);if(p){p.co=id;save();rAll();}}
  else if(drag&&drag.type==='person'){const c=coOf(id);const pr=PPL().find(x=>x.id===drag.id);if(c&&pr){pr.grp=c.name;save();rAll();}}
  drag=null;}
