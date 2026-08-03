/* Lanes, colour palette, avatar backgrounds */
const LANES=[{id:'active',name:'Live',color:'#22a878'},{id:'paused',name:'Paused',color:'#d48d1a'},{id:'killed',name:'Killed',color:'#e05252'}];
const PAL=['#7F77DD','#D85A30','#22a878','#4a9eff','#0fa8a0','#d48d1a','#8b72e0','#D4537E'];
const CBG={'#7F77DD':'#1e1c3a','#D85A30':'#2a1a10','#22a878':'#0d2a1e','#4a9eff':'#0d1e30','#0fa8a0':'#0a2225','#d48d1a':'#2a1e08','#e05252':'#2a1010','#8b72e0':'#1c1833','#D4537E':'#2a0f1a','#83838f':'#1e1e26'};
const CBGL={'#7F77DD':'#eceafc','#D85A30':'#fbe9e2','#22a878':'#ddf3e9','#4a9eff':'#e2eefb','#0fa8a0':'#dcf2f1','#d48d1a':'#f9ecd4','#e05252':'#fbe5e5','#8b72e0':'#eae6fa','#D4537E':'#fae4ec','#83838f':'#ececf0'};
function G(title,steps){return{id:'g'+Math.random().toString(36).slice(2,9),title,steps};}
