/* Theme, space switching, view routing, render helpers */
function toggleTheme(){light=!light;document.body.classList.toggle('light',light);localStorage.setItem('cc_light',light?'1':'0');rAll();}
function setSpace(sp){space=sp;localStorage.setItem('cc_space',sp);document.getElementById('sp-work').classList.toggle('on',sp==='work');document.getElementById('sp-personal').classList.toggle('on',sp==='personal');closePop();flipped={};rAll();}
function go(v){view=v;['board','focus','people'].forEach(x=>{document.getElementById('nb-'+x).classList.toggle('on',x===v);document.getElementById('v-'+x).classList.toggle('on',x===v);});
  if(v==='board')rB();else if(v==='focus')rF();else rPeople();}
function rAll(){rCos();rPJ();rSB();if(view==='board')rB();else if(view==='focus')rF();else rPeople();if(popId)rPop();}
function scrollActs(){requestAnimationFrame(()=>{document.querySelectorAll('.bx-act').forEach(el=>{const nx=el.querySelector('.chip.nx');if(nx)el.scrollLeft=Math.max(0,nx.offsetLeft-40);});});}
let _syncQueued=false;
function syncFlipHeights(){
  if(_syncQueued)return;_syncQueued=true;
  requestAnimationFrame(()=>{_syncQueued=false;
    if(document.body.classList.contains('dragging'))return;
    document.querySelectorAll('.flip').forEach(f=>{const front=f.querySelector('.front');const inn=f.querySelector('.flip-in');if(front&&inn)inn.style.minHeight=front.offsetHeight+'px';});
  });
}
