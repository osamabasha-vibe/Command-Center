/* ═══ IDEAS / BACKLOG ═══ */
function flip(id){flipped[id]=!flipped[id];const el=document.getElementById('fl-'+id);if(el)el.classList.toggle('on',!!flipped[id]);
  if(flipped[id])setTimeout(()=>{const inp=document.getElementById('bi-'+id);if(inp)inp.focus();},400);}
function addIdea(e,id){if(e.key!=='Enter')return;const v=e.target.value.trim();if(!v)return;const p=P(id);if(!p)return;
  p.ideas.push(v);save();e.target.value='';rB();flipped[id]=true;
  setTimeout(()=>{const el=document.getElementById('fl-'+id);if(el)el.classList.add('on');const inp=document.getElementById('bi-'+id);if(inp)inp.focus();},60);}
function editIdea(e,id,i){const p=P(id);if(p){const v=e.target.textContent.trim();if(v)p.ideas[i]=v;else e.target.textContent=p.ideas[i];save();}}
function delIdea(id,i){const p=P(id);if(p){p.ideas.splice(i,1);save();rB();keepFlip(id);}}
function ideaToGoal(id,i){const p=P(id);if(!p)return;const txt=p.ideas[i];p.ideas.splice(i,1);
  if(p.goals.length===1&&!p.goals[0].title&&p.goals[0].steps.length===0)p.goals[0].title=txt;else p.goals.push(G(txt,[]));
  save();rB();keepFlip(id);}
function ideaToTask(id,i){const p=P(id);if(!p)return;const txt=p.ideas[i];p.ideas.splice(i,1);
  const gi=p.goals.length-1;p.goals[gi].steps.push({id:sid(),t:txt,w:space==='personal'?'Osama':'—',d:0});
  save();rB();keepFlip(id);}
function keepFlip(id){setTimeout(()=>{const el=document.getElementById('fl-'+id);if(el&&flipped[id])el.classList.add('on');},20);}
