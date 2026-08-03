/* ═══ POPUP ═══ */
function openPop(id){popId=id;rPop();document.getElementById('ov').classList.add('open');}
function closePop(){popId=null;document.getElementById('ov').classList.remove('open');}
function rPop(){
  const p=P(popId);if(!p)return;const col=pcol(p);
  const coOpts=buildOpts(p);
  const team=p.team.map(id=>{const x=PPL().find(y=>y.id===id);if(!x)return'';
    return`<div class="tm" draggable="true" ondragstart="dsPerson(event,'${id}','${p.id}')" ondragend="dEnd()"><div class="av" style="${avS(col)}">${ini(x.name)}</div><div class="tm-n">${esc(x.name.split(' ')[0])}</div></div>`;}).join('')
    ||`<span class="tm-e">${space==='work'?'Drag people from the sidebar':'Solo project'}</span>`;

  const goalsHtml=p.goals.map((g,gi)=>{
    const ni=nextInGoal(g);
    const chain=g.steps.map((s,i)=>{const nx=i===ni;
      return(i>0?`<div class="arw${nx?' nx':''}">›</div>`:'')+
      `<div class="stp${s.d?' dn':''}${nx?' nx':''}" id="stp-${i}" draggable="true"
        ondragstart="dsAct(event,'${p.id}',${gi},${i})" ondragend="dEnd()"
        ondragover="stOver(event,${i})" ondragleave="stLeave(event,${i})" ondrop="stDrop(event,${gi},${i})">
        <div class="st-l${nx?' nx':''}">${s.d?'✓ done':(nx?'▶ next':'step '+(i+1))}</div>
        <div class="st-t${s.d?' dn':''}${nx?' nx':''}" contenteditable spellcheck="false" onblur="editStep(event,'${p.id}',${gi},${i})" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(s.t)}</div>
        <div class="st-w${nx?' nx':''}" contenteditable spellcheck="false" onblur="editWho(event,'${p.id}',${gi},${i})" onkeydown="keyBlur(event)" ondragstart="event.preventDefault();event.stopPropagation()">${esc(s.w)}</div>
        <div class="st-row"><input type="checkbox" class="scb" ${s.d?'checked':''} onchange="tog('${p.id}',${gi},${i},this.checked)">
        <span class="sdel" onclick="delStep('${p.id}',${gi},${i})" title="Delete action">×</span></div>
      </div>`;}).join('');
    return`<div class="pgblk"><div class="pgblk-top"><span class="pop-gl">Goal</span>
      <div class="pop-gt" contenteditable spellcheck="false" data-ph="Set the goal…" onblur="editGoal(event,'${p.id}',${gi})" onkeydown="keyBlur(event)">${esc(g.title)}</div>
      <button class="pgdel" onclick="delGoal('${p.id}',${gi})" title="Delete goal">×</button></div>
      <div class="chain">${chain}<div class="newstep">
        <input id="pa-${p.id}-${gi}" placeholder="Next action…" onkeydown="popAdd(event,'${p.id}',${gi})">
        <span class="newstep-hint">Enter to add</span></div></div></div>`;}).join('')
    +`<button class="addgoal-pop" onclick="addGoal('${p.id}')">+ add another goal</button>`;

  const ideasPop=p.ideas.length?p.ideas.map((t,i)=>
    `<div class="idea"><div class="idea-t" contenteditable spellcheck="false" onblur="editIdea(event,'${p.id}',${i})" onkeydown="keyBlur(event)">${esc(t)}</div>
      <div class="idea-a">
        <button class="ib" onclick="ideaToGoal('${p.id}',${i});rPop()">→ goal</button>
        <button class="ib" onclick="ideaToTask('${p.id}',${i});rPop()">→ task</button>
        <button class="ib x" onclick="delIdea('${p.id}',${i});rPop()">×</button></div></div>`).join(''):'';

  document.getElementById('pop').innerHTML=`
    <div class="bx-bar" style="background:${col}"></div>
    <div class="pop-h"><div class="pop-top"><div style="flex:1;min-width:0">
      <div class="pop-n" contenteditable spellcheck="false" onblur="editName(event,'${p.id}')" onkeydown="keyBlur(event)">${esc(p.name)}</div>
      <select class="co-pick" onchange="setPick('${p.id}',this.value)" style="color:${col}">${coOpts}</select>
      </div>
      <button class="pop-x" onclick="delProj('${p.id}')" title="Delete project" style="font-size:15px">🗑</button>
      <button class="pop-x" onclick="closePop()">×</button></div>
      <div class="pop-team" id="ptz" ondragover="pzOver(event,'ptz')" ondragleave="pzLeave(event,'ptz')" ondrop="pzDrop(event,'${p.id}','ptz')">${team}</div>
    </div>
    <div class="pop-b">${goalsHtml}
      <div class="pgblk"><div class="pgblk-top"><span class="pop-gl">💡 Ideas</span>
        <div style="flex:1"></div></div>
        <div style="display:flex;flex-direction:column;gap:5px">${ideasPop||'<div class="bk-empty">Nothing parked yet.</div>'}
        <div class="bk-add" style="border:none;padding:6px 0 0"><input id="bi-${p.id}" placeholder="Park an idea… Enter to save" onkeydown="addIdea(event,'${p.id}');if(event.key==='Enter')setTimeout(rPop,50)"></div></div>
      </div>
      <div class="pop-hint">Drag a step onto another to reorder · on the board drag cards left/right to set priority, or onto a card's bottom strip to fold it in as a goal.</div>
    </div>`;
}
