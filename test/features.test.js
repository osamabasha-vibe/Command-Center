const fs=require('fs');
let s=fs.readFileSync(require('path').join(__dirname,'..','dist','index.html'),'utf8');
let js=s.slice(s.indexOf('<script>')+8, s.lastIndexOf('</script>'));
const els={};
function mk(id){return {id,innerHTML:'',value:'',style:{},classList:{_s:new Set(),add(c){this._s.add(c)},remove(...c){c.forEach(x=>this._s.delete(x))},toggle(){},contains(c){return this._s.has(c)}},
 querySelector(){return null},querySelectorAll(){return []},parentElement:null,getBoundingClientRect(){return{left:0,width:100}},focus(){}};}
global.document={body:{classList:{add(){},remove(){},contains(){return false}}},
 getElementById(id){return els[id]||(els[id]=mk(id));},querySelector(){return null},querySelectorAll(){return[]},
 addEventListener(){},createElement(){return{click(){},style:{}}},getSelection(){return{selectAllChildren(){}}}};
global.window={addEventListener(){},location:{protocol:'file:',href:'f'}};global.location=window.location;
const LS={};global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=v},key:i=>Object.keys(LS)[i],get length(){return Object.keys(LS).length}};
global.indexedDB={open(){return{}}};global.requestAnimationFrame=f=>f();
global.setTimeout=()=>{};global.clearTimeout=()=>{};
global.confirm=()=>true;global.alert=m=>{global._alert=m};global.prompt=()=>'x';
global.fetch=()=>Promise.reject();global.FileReader=function(){};global.Blob=function(){};global.URL={createObjectURL(){return''}};
eval(js + '\n;Object.assign(global,{store,tasksFor,roster,applyTaskMove,findStep,P,rPeople,rB,rF,go,S,cyclePri,__setDrag:(d)=>{drag=d},__setQ:(v)=>{pvQ=v},__setSort:(v)=>{pvSort=v},delTask,soloPerson,addPersonTask,colDrop,dsCol,openCount,priOf});');

let f=0; const ok=(c,m)=>{if(!c){console.log('FAIL: '+m);f++}else console.log('pass: '+m)};

const faysal=store.people.find(x=>x.name.startsWith('Faysal'));
const ahmad=store.people.find(x=>x.name.startsWith('Ahmad'));

// priority cycling
let t=tasksFor(faysal); ok(t.length>0,`Faysal has ${t.length} tasks`);
const sidA=t[0].st.id;
ok(priOf(t[0].st)==='m','default priority is mid');
cyclePri(sidA); ok(findStep(sidA).st.p==='l','mid -> low');
cyclePri(sidA); ok(findStep(sidA).st.p==='h','low -> high');
ok(tasksFor(faysal)[0].st.id===sidA,'high priority sorts to top');

// add task
const before=openCount(ahmad);
addPersonTask({key:'Enter',target:{value:'Test new task',focus(){}}},ahmad.id);
ok(openCount(ahmad)===before+1,`add task: ${before} -> ${openCount(ahmad)}`);
const added=tasksFor(ahmad).find(x=>x.st.t==='Test new task');
ok(!!added,'added task is findable');
ok(added.st.a===ahmad.id,'added task assigned to Ahmad');

// delete task
delTask(added.p.id,added.gi,added.si);
ok(openCount(ahmad)===before,`delete task back to ${before}`);
ok(!Object.values(store.order).flat().includes(added.st.id),'deleted id purged from priority order');

// solo focus
soloPerson(faysal.id); ok(true,'soloPerson runs');
soloPerson('');

// search filter
__setQ('zzzznomatch');
try{rPeople();ok(true,'render with no-match search')}catch(e){ok(false,'search render: '+e.message)}
__setQ('');

// column reorder
const first=roster()[0].id, third=roster()[2].id;
__setDrag({type:'col',id:first});
colDrop({preventDefault(){},stopPropagation(){},clientX:9999},third);
const ord=store.colOrder[ 'work' ]||[];
ok(ord.length>0,'column order saved ('+ord.length+' entries)');
ok(ord.indexOf(first)>ord.indexOf(third),'dragged column moved after target');

// sorting modes
['most','least','urgent','name','team','order'].forEach(m=>{
  __setSort(m);
  try{const r=roster();ok(r.length>0,`sort "${m}" -> ${r.length} people`);}catch(e){ok(false,`sort ${m}: ${e.message}`);}
});
__setSort('most');
const r=roster();
ok(openCount(r[0])>=openCount(r[r.length-1]),'most-tasks sort puts busiest first');

try{rPeople();ok(true,'rPeople renders')}catch(e){ok(false,'rPeople: '+e.message)}
try{rB();rF();ok(true,'board + focus still render')}catch(e){ok(false,e.message)}
console.log(f?`\n${f} FAILURES`:'\nALL PASS');process.exit(f?1:0);
