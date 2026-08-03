/* ═══ DRAG CORE ═══ */
function dsPerson(e,pid,fromProj){e.stopPropagation();document.body.classList.add('dragging');drag={type:'person',id:pid,from:fromProj};e.dataTransfer.effectAllowed='copyMove';const el=document.getElementById('ch-'+pid);if(el&&!fromProj)setTimeout(()=>el.classList.add('drg'),0);}
function dsProj(e,id){e.stopPropagation();document.body.classList.add('dragging');drag={type:'proj',id};e.dataTransfer.effectAllowed='move';['bx-','pjc-'].forEach(pre=>{const el=document.getElementById(pre+id);if(el)setTimeout(()=>el.classList.add('drg'),0);});}
function dsAct(e,projId,gi,idx){e.stopPropagation();document.body.classList.add('dragging');drag={type:'act',proj:projId,gi,idx};e.dataTransfer.effectAllowed='move';}
function dEnd(){document.body.classList.remove('dragging');document.querySelectorAll('.drg,.insL,.insR,.nestover,.over').forEach(el=>el.classList.remove('drg','insL','insR','nestover','over'));drag=null;_rect=null;_rectId=null;_side=null;}

function applyDrop(id,mode){
  if(!drag)return;
  const tgt=P(id);if(!tgt){drag=null;return;}
  if(drag.type==='person'){
    if(drag.from&&drag.from!==id){const s=P(drag.from);if(s)s.team=s.team.filter(x=>x!==drag.id);}
    if(!tgt.team.includes(drag.id))tgt.team.push(drag.id);
  } else if(drag.type==='co'){tgt.co=drag.id;}
  else if(drag.type==='act'){
    const src=P(drag.proj);
    if(src){const sg=src.goals[drag.gi];const [st]=sg.steps.splice(drag.idx,1);tgt.goals[0].steps.push(st);
      if(src.id!==tgt.id&&sg.steps.length===0&&src.goals.length>1)src.goals.splice(drag.gi,1);}
  } else if(drag.type==='proj'&&mode==='nest'&&drag.id!==id){
    const src=P(drag.id);
    if(src){src.goals.forEach(g=>tgt.goals.push(g));src.team.forEach(pid=>{if(!tgt.team.includes(pid))tgt.team.push(pid);});
      S().projects=S().projects.filter(x=>x.id!==drag.id);}
  }
  save();rAll();drag=null;
}
/* PRIORITY REORDER */
function reorderProj(fromId,toId,after){
  if(fromId===toId)return;
  const arr=S().projects;
  const fi=arr.findIndex(x=>x.id===fromId);if(fi<0)return;
  const [mv]=arr.splice(fi,1);
  const tgt=arr.find(x=>x.id===toId);
  if(tgt)mv.st=tgt.st;
  let ti=arr.findIndex(x=>x.id===toId);
  if(ti<0)ti=arr.length-1;
  arr.splice(after?ti+1:ti,0,mv);
  save();rAll();
}
let _rect=null,_rectId=null,_side=null;
function bxEnter(e,id){
  if(!drag)return;
  const el=document.getElementById('bx-'+id);if(!el)return;
  _rect=el.getBoundingClientRect();_rectId=id;_side=null;
}
function bxOver(e,id){
  if(!drag)return;
  const el=document.getElementById('bx-'+id);if(!el)return;
  if(drag.type==='proj'&&drag.id!==id){
    e.preventDefault();e.stopPropagation();
    if(_rectId!==id||!_rect){_rect=el.getBoundingClientRect();_rectId=id;}
    const after=e.clientX>_rect.left+_rect.width/2;
    if(after===_side)return;
    _side=after;
    el.classList.toggle('insR',after);el.classList.toggle('insL',!after);
  } else if(drag.type==='person'||drag.type==='co'||drag.type==='act'){
    e.preventDefault();e.stopPropagation();
    if(!el.classList.contains('nestover'))el.classList.add('nestover');
  }
}
function bxLeave(e,id){const el=document.getElementById('bx-'+id);if(el)el.classList.remove('insL','insR','nestover');if(_rectId===id){_rect=null;_rectId=null;_side=null;}}
function bxDrop(e,id){
  e.preventDefault();e.stopPropagation();
  const el=document.getElementById('bx-'+id);
  if(!drag){return;}
  if(drag.type==='proj'){
    const r=(_rectId===id&&_rect)?_rect:el.getBoundingClientRect();const after=e.clientX>r.left+r.width/2;
    const fromId=drag.id;drag=null;
    if(el)el.classList.remove('insL','insR');
    reorderProj(fromId,id,after);return;
  }
  if(el)el.classList.remove('nestover');
  applyDrop(id,'assign');
}
function nzOver(e,id){if(drag&&drag.type==='proj'&&drag.id!==id){e.preventDefault();e.stopPropagation();document.getElementById('nz-'+id).classList.add('over');}}
function nzLeave(e,id){const el=document.getElementById('nz-'+id);if(el)el.classList.remove('over');}
function nzDrop(e,id){e.preventDefault();e.stopPropagation();const el=document.getElementById('nz-'+id);if(el)el.classList.remove('over');applyDrop(id,'nest');}
function secOver(e,lid){if(drag&&drag.type==='proj'){e.preventDefault();document.getElementById('sec-'+lid).classList.add('over');}}
function secLeave(e,lid){const el=document.getElementById('sec-'+lid);if(el)el.classList.remove('over');}
function secDrop(e,lid){e.preventDefault();const el=document.getElementById('sec-'+lid);if(el)el.classList.remove('over');
  if(drag&&drag.type==='proj'){const arr=S().projects;const i=arr.findIndex(x=>x.id===drag.id);const [mv]=arr.splice(i,1);mv.st=lid;arr.push(mv);save();rAll();}drag=null;}
function trOver(e){if(drag&&drag.type==='person'&&drag.from){e.preventDefault();document.getElementById('sbscroll').classList.add('trash');}}
function trLeave(e){document.getElementById('sbscroll').classList.remove('trash');}
function trDrop(e){document.getElementById('sbscroll').classList.remove('trash');
  if(drag&&drag.type==='person'&&drag.from){e.preventDefault();const p=P(drag.from);if(p)p.team=p.team.filter(x=>x!==drag.id);save();rAll();}drag=null;}
function pzOver(e,zid){if(drag&&drag.type==='person'){e.preventDefault();e.stopPropagation();document.getElementById(zid).classList.add('over');}}
function pzLeave(e,zid){const el=document.getElementById(zid);if(el)el.classList.remove('over');}
function pzDrop(e,projId,zid){if(!(drag&&drag.type==='person'))return;e.preventDefault();e.stopPropagation();
  const el=document.getElementById(zid);if(el)el.classList.remove('over');
  if(drag.from&&drag.from!==projId){const s=P(drag.from);if(s)s.team=s.team.filter(x=>x!==drag.id);}
  const p=P(projId);if(p&&!p.team.includes(drag.id))p.team.push(drag.id);save();rAll();drag=null;}
function stOver(e,i){if(drag&&drag.type==='act'){e.preventDefault();e.stopPropagation();const el=document.getElementById('stp-'+i);if(el)el.classList.add('over');}}
function stLeave(e,i){const el=document.getElementById('stp-'+i);if(el)el.classList.remove('over');}
function stDrop(e,gi,i){e.preventDefault();e.stopPropagation();const el=document.getElementById('stp-'+i);if(el)el.classList.remove('over');
  if(drag&&drag.type==='act'){const src=P(drag.proj);const tgt=P(popId);
    if(src&&tgt){const [mv]=src.goals[drag.gi].steps.splice(drag.idx,1);tgt.goals[gi].steps.splice(i,0,mv);save();rPop();rB();}}drag=null;}
