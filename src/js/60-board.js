/* ═══ BOARD ═══ */
function rB(){
  document.getElementById('v-board').innerHTML=`<div class="board">${LANES.map(l=>{
    const items=S().projects.filter(p=>(p.st||'active')===l.id);
    return`<div class="sec" id="sec-${l.id}" ondragover="secOver(event,'${l.id}')" ondragleave="secLeave(event,'${l.id}')" ondrop="secDrop(event,'${l.id}')">
      <div class="sec-h"><span class="sec-dot" style="background:${l.color}"></span>
        <span class="sec-n" style="color:${l.color}">${l.name}</span>
        <span class="sec-c">${items.length}</span>
        <button class="sec-add" onclick="addProj('${l.id}')">+</button></div>
      <div class="grid">${items.map((p,i)=>card(p,i+1)).join('')}</div>
    </div>`;}).join('')}</div>`;
  Object.keys(flipped).forEach(id=>{if(flipped[id]){const el=document.getElementById('fl-'+id);if(el)el.classList.add('on');}});
  scrollActs();syncFlipHeights();
}

function card(p,pri){
  const col=pcol(p);
  const coOpts=buildOpts(p);
  const team=p.team.map(id=>{const x=PPL().find(y=>y.id===id);
    return x?`<div class="pav" draggable="true" ondragstart="dsPerson(event,'${id}','${p.id}')" ondragend="dEnd()" style="${avS(col)}" title="${esc(x.name)} — drag to move, drop on sidebar to remove">${ini(x.name)}</div>`:'';}).join('')
    ||(space==='work'?`<span class="pp-h">drop people</span>`:'');

  const goalsHtml=p.goals.map((g,gi)=>{
    const ni=nextInGoal(g);
    let acts=g.steps.map((s,i)=>{
      const isNext=i===ni;const cls=s.d?'dn':(isNext?'nx':'');
      const dg=!s.d?`draggable="true" ondragstart="dsAct(event,'${p.id}',${gi},${i})" ondragend="dEnd()"`:'';
      return(i>0?`<span class="arr${isNext?' nx':''}">›</span>`:'')+
      `<span class="chip ${cls}" ${dg} title="${esc(s.t)} — ${esc(s.w)}">
        <input type="checkbox" class="chip-cb" ${s.d?'checked':''} onclick="event.stopPropagation()" onchange="tog('${p.id}',${gi},${i},this.checked)">
        <span class="chip-tx">${esc(s.t.length>36?s.t.slice(0,36)+'…':s.t)}</span>
        <span class="chip-x" onclick="event.stopPropagation();delStep('${p.id}',${gi},${i})" title="Delete action">×</span>
      </span>`;}).join('');
    acts+=`<input class="act-in" id="qa-${p.id}-${gi}" placeholder="${g.steps.length?'+ action':'+ first action'}" onkeydown="quickAdd(event,'${p.id}',${gi})" onclick="event.stopPropagation()" ondragstart="event.preventDefault()">`;
    return`<div class="gblk">
      <div class="g-row"><span class="g-l">Goal</span>
        <div class="g-t" contenteditable spellcheck="false" data-ph="Set the goal…" onblur="editGoal(event,'${p.id}',${gi})" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(g.title)}</div>
        <button class="g-del" onclick="event.stopPropagation();delGoal('${p.id}',${gi})" title="Delete goal">×</button></div>
      <div class="bx-act">${acts}</div>
    </div>`;}).join('');

  const pplRow=(space==='work'||p.team.length)?`<div class="bx-ppl"><div class="pdrop" id="tz-${p.id}" ondragover="pzOver(event,'tz-${p.id}')" ondragleave="pzLeave(event,'tz-${p.id}')" ondrop="pzDrop(event,'${p.id}','tz-${p.id}')">${team}</div></div>`:'';

  const ideasHtml=p.ideas.length?p.ideas.map((t,i)=>
    `<div class="idea">
      <div class="idea-t" contenteditable spellcheck="false" onblur="editIdea(event,'${p.id}',${i})" onkeydown="keyBlur(event)">${esc(t)}</div>
      <div class="idea-a">
        <button class="ib" onclick="ideaToGoal('${p.id}',${i})" title="Promote to goal">→ goal</button>
        <button class="ib" onclick="ideaToTask('${p.id}',${i})" title="Add as next action">→ task</button>
        <button class="ib x" onclick="delIdea('${p.id}',${i})">×</button>
      </div>
    </div>`).join(''):`<div class="bk-empty">Nothing parked yet. Throw raw ideas here, promote them later.</div>`;

  return`<div class="flip" id="fl-${p.id}"><div class="flip-in">
    <div class="face front">
      <div class="box ${p.st}" id="bx-${p.id}" draggable="true"
        ondragstart="dsProj(event,'${p.id}')" ondragend="dEnd()"
        ondragenter="bxEnter(event,'${p.id}')" ondragover="bxOver(event,'${p.id}')" ondragleave="bxLeave(event,'${p.id}')" ondrop="bxDrop(event,'${p.id}')">
        <div class="bx-bar" style="background:${col};opacity:.75"></div>
        <div class="bx-top">
          <div class="bx-acc" style="background:${col}"></div>
          <span class="pri" title="Priority order — drag cards left/right to reorder">${pri}</span>
          <div class="bx-mid">
            <div class="bx-name" contenteditable spellcheck="false" data-ph="Project name" onblur="editName(event,'${p.id}')" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(p.name)}</div>
            <select class="co-pick" onchange="setPick('${p.id}',this.value)" onclick="event.stopPropagation()" style="color:${col}">${coOpts}</select>
          </div>
          <button class="ico" onclick="event.stopPropagation();flip('${p.id}')" title="Ideas / backlog">💡${p.ideas.length?' '+p.ideas.length:''}</button>
          <button class="ico" onclick="event.stopPropagation();openPop('${p.id}')" title="Expand">⤢</button>
          <button class="ico del" onclick="event.stopPropagation();delProj('${p.id}')" title="Delete project">🗑</button>
        </div>
        ${pplRow}
        <div class="bx-goals">${goalsHtml}</div>
        <div class="bx-foot">
          <button class="tinybtn" onclick="event.stopPropagation();addGoal('${p.id}')">+ goal</button>
          <button class="tinybtn" onclick="event.stopPropagation();flip('${p.id}')">+ idea</button>
        </div>
        <div class="nestzone" id="nz-${p.id}" ondragover="nzOver(event,'${p.id}')" ondragleave="nzLeave(event,'${p.id}')" ondrop="nzDrop(event,'${p.id}')">drop a project here to fold it in as a goal</div>
      </div>
    </div>
    <div class="face back">
      <div class="back-box">
        <div class="bk-h">
          <span class="bk-t">💡 ${esc(p.name)} — ideas</span>
          <button class="ico" onclick="flip('${p.id}')" title="Back to project">↩</button>
        </div>
        <div class="bk-b">${ideasHtml}</div>
        <div class="bk-add"><input id="bi-${p.id}" placeholder="Park an idea… Enter to save" onkeydown="addIdea(event,'${p.id}')"></div>
      </div>
    </div>
  </div></div>`;
}
