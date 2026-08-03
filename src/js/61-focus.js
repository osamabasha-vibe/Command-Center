/* ═══ FOCUS ═══ */
function rF(){
  const live=S().projects.filter(p=>p.st==='active');
  const rows=live.map(p=>{const n=projNext(p);if(!n)return'';const co=coOf(p.co);
    return`<div class="f-row"><input type="checkbox" class="f-cb" onchange="tog('${p.id}',${n.gi},${n.si},this.checked)">
      <div class="f-mid"><div class="f-act">${esc(n.step.t)}</div>
      <div class="f-meta"><span class="co-dot" style="background:${pcol(p)}"></span>${esc(p.name)}${co?' · '+esc(co.name):''}${p.goals.length>1?' · '+esc(n.goal.title):''}</div></div>
      <span class="f-who">${esc(n.step.w)}</span>
      <button class="f-open" onclick="openPop('${p.id}')">⤢</button></div>`;}).filter(Boolean).join('');
  document.getElementById('v-focus').innerHTML=`<div class="focus"><div class="f-h">My Focus</div>
    <div class="f-sub">The next action on every live project, in priority order</div>
    ${rows||`<div class="f-empty">Nothing pending.</div>`}</div>`;
}
