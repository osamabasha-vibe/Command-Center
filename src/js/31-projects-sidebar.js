/* ═══ PROJECTS SIDEBAR ═══ */
function rPJ(){
  document.getElementById('pjlist').innerHTML=S().projects.map(p=>
    `<div class="pjrow" id="pjc-${p.id}" draggable="true" ondragstart="dsProj(event,'${p.id}')" ondragend="dEnd()"
      ondragover="pjOver(event,'${p.id}')" ondragleave="pjLeave(event,'${p.id}')" ondrop="pjDrop(event,'${p.id}')" onclick="openPop('${p.id}')">
      <span class="pj-dot" style="background:${pcol(p)}"></span>
      <span class="pj-nm">${esc(p.name)}</span>
      <span class="co-x" onclick="event.stopPropagation();delProj('${p.id}')" title="Delete project">×</span>
    </div>`).join('');
}
function pjOver(e,id){if(!drag)return;if(drag.type==='co'||(drag.type==='proj'&&drag.id!==id)){e.preventDefault();e.stopPropagation();document.getElementById('pjc-'+id).classList.add('over');}}
function pjLeave(e,id){const el=document.getElementById('pjc-'+id);if(el)el.classList.remove('over');}
function pjDrop(e,id){e.preventDefault();e.stopPropagation();const el=document.getElementById('pjc-'+id);if(el)el.classList.remove('over');
  if(drag&&drag.type==='proj'){reorderProj(drag.id,id);drag=null;return;}
  applyDrop(id,'assign');}
