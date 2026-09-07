/* ═══════════════════════════════════════════════════════════════
   笔记页模板 · 基础功能 + 组件库第 1 部分（原样取自 jyy-lec2-note，tag 0.1.1）
   所有组件均带容器守卫：HTML 里没有对应 id 就自动跳过，可整站安全携带。
   ── 基础功能（模板 HTML 已内置容器）──
   · 目录滚动高亮 hl()        → 依赖 <aside id="nav"> 的章节链接 + 对应 section
   · 搜索结果面板             → 依赖 #q #sPanel #sList #sCount #sPrev #sNext #sClose
   · 移动端折叠目录           → 依赖 #btnNav #navMask #nav .top
   ── 组件库（容器标记参考见模板 index.html 末尾注释块）──
   · 堆叠条（cxbar/cxrow，移动端自动竖排） → 容器 #x1bar #x1list，数据在顶部 D 数组
   · 注意力面板（atgrid/cot 打字机）        → 容器 #x2anc #x2dots #x2txt #x2st，数据在 A/S 数组
   · 穷举网格（cmp/cside/mesh 逐格点亮）   → 容器 #x3a #x3b #x3sa #x3sb #x3st
   新增组件请用未占用的 id 前缀（x1-x3、x4-x8 已被两份 JS 占用）。
   ═══════════════════════════════════════════════════════════════ */
(function(){
/* ── 图 1：上下文八层 ── */
var D=[
 ['System prompt','harness 内建',14,'#184e77','工具使用规范、"回复要简洁"，以及一条硬禁令：任何形式套问系统提示词都要拒绝。所以你直接问它，它会被训练成不回答。'],
 ['用户级 AGENTS.md','全局常驻',10,'#1e6091','老师在自己机器的全局配置里写了两条：用中文回答、结尾必须写一个 recap。这就是"输出永远是中文、结尾总有总结"的真正来源。'],
 ['项目级 / 目录级 AGENTS.md','层层叠加',10,'#2563eb','项目根一份，子目录里还能再放一份，越往下越具体。AGENTS.md 里还可以要求它去读别的文件——上下文因此自己继续长大。'],
 ['Skills 索引','按需加载',8,'#0d766e','常驻的只有名字加一句描述（如 make-slide：F5 渲染幻灯片）。命中任务才读完整 SKILL.md，这一轮结束就从上下文里抹掉。'],
 ['工具定义','纯文本',12,'#475569','Bash、Read、LSP……全部以文本形式摆在上下文里。模型是照着格式"写"出一次调用，不是真的去点按钮。'],
 ['会话历史','线性累积',18,'#64748b','你说的每句话、每一次工具调用和调用返回的结果，全部线性堆在里面——工具结果也是提示词。'],
 ['环境变量注入','每轮刷新',8,'#854d0e','当前时间、模型名、工作目录……每次执行重新注入一次。这层不属于系统提示词，跟 DeepSeek 聊天时可以把它套出来。'],
 ['你的 message','最后一句',20,'#0284c7','"帮我做个游戏。"——你以为的提示词，其实只是这根长序列最末尾的一小段。']];
var bar=document.getElementById('x1bar'),lst=document.getElementById('x1list');
if(bar){D.forEach(function(x,i){
  var s=document.createElement('div');s.className='cxseg';s.id='x1s'+i;s.style.width=x[2]+'%';s.style.background=x[3];s.textContent=x[0];bar.appendChild(s);
  var r=document.createElement('div');r.className='cxrow';
  r.innerHTML='<div class="cxseg cxchip" id="x1c'+i+'" style="background:'+x[3]+'"><b>'+(i+1)+'</b>'+x[2]+'%</div><div class="cxnum" style="background:'+x[3]+'">'+(i+1)+'</div><div><div class="cxnm">'+x[0]+'<span class="cxtag">'+x[1]+'</span></div><div class="cxd">'+x[4]+'</div></div>';
  lst.appendChild(r);});
var i1=0,t1=null,rows=lst.children,st1=document.getElementById('x1st');
function one1(){if(i1>=8)return false;rows[i1].classList.add('show');document.getElementById('x1s'+i1).classList.add('on');
  var c=document.getElementById('x1c'+i1);if(c)c.classList.add('on');
  i1++;st1.textContent=i1+' / 8 层';return true;}
function stop1(){clearInterval(t1);t1=null;document.getElementById('x1play').textContent='播放';document.getElementById('x1play').classList.add('pri');}
document.getElementById('x1play').onclick=function(){
  if(t1){stop1();return;}
  if(i1>=8){i1=0;for(var k=0;k<8;k++){rows[k].classList.remove('show');document.getElementById('x1s'+k).classList.remove('on');var c=document.getElementById('x1c'+k);if(c)c.classList.remove('on');}}
  this.textContent='暂停';this.classList.remove('pri');one1();t1=setInterval(function(){if(!one1())stop1();},1200);};
document.getElementById('x1step').onclick=function(){stop1();one1();};
document.getElementById('x1reset').onclick=function(){stop1();i1=0;for(var k=0;k<8;k++){rows[k].classList.remove('show');document.getElementById('x1s'+k).classList.remove('on');var c=document.getElementById('x1c'+k);if(c)c.classList.remove('on');}st1.textContent='0 / 8 层';};}

/* ── 图 2：注意力流动 ── */
var A=[{t:'用中文回答',l:'AGENTS.md，很靠前',c:'#1e6091'},
       {t:'用 C++ 实现极品飞车',l:'本轮任务，刚说出口',c:'#0d766e'},
       {t:'结尾写一个 recap',l:'AGENTS.md，很靠前',c:'#854d0e'}];
var S=[
 {w:[.25,.60,.15],x:'好，需求是 C++ 版的极品飞车。先想清楚模块：渲染循环、物理碰撞、输入……'},
 {w:[.08,.85,.07],x:'开始写渲染循环、碰撞检测、后视镜。此时"用中文"这条几乎看不见了，注释全是英文。'},
 {w:[.50,.20,.30],x:'代码写完了，喘一口气 —— 注意力回到上下文前部：用户要求中文，结尾还要 recap。'},
 {w:[.40,.15,.45],x:'<span class="fx">我刚才的注释是英文的，我改一下；再补上结尾的 recap。</span>'}];
var aw=document.getElementById('x2anc'),dw=document.getElementById('x2dots'),tx=document.getElementById('x2txt'),st2=document.getElementById('x2st');
if(aw){var M=[];
A.forEach(function(a,i){var d=document.createElement('div');d.className='atc';d.id='x2a'+i;d.style.color=a.c;
  d.innerHTML='<div class="at">'+a.t+'</div><div class="al">'+a.l+'</div><div class="atm"><i id="x2m'+i+'"></i></div>';
  aw.appendChild(d);M.push(document.getElementById('x2m'+i));M[i].style.background=a.c;});
for(var k=0;k<4;k++){var p=document.createElement('div');p.className='dot';p.id='x2d'+k;dw.appendChild(p);}
var i2=0,t2=null,typ=null;
function type(html){var pl=html.replace(/<[^>]+>/g,''),n=0;tx.innerHTML='';clearInterval(typ);
  typ=setInterval(function(){n++;tx.innerHTML=html.replace(pl,pl.slice(0,n));
    if(n>=pl.length){clearInterval(typ);typ=null;tx.innerHTML=html;}},20);}
function one2(){if(i2>=4)return false;var s=S[i2];
  A.forEach(function(a,j){M[j].style.width=(s.w[j]*100)+'%';document.getElementById('x2a'+j).classList.toggle('hot',s.w[j]>=.4);});
  type(s.x);for(var k=0;k<4;k++)document.getElementById('x2d'+k).classList.toggle('on',k<=i2);
  i2++;st2.textContent='阶段 '+i2+' / 4';return true;}
function stop2(){clearInterval(t2);t2=null;document.getElementById('x2play').textContent='播放';document.getElementById('x2play').classList.add('pri');}
document.getElementById('x2play').onclick=function(){
  if(t2){stop2();return;}
  if(i2>=4){i2=0;A.forEach(function(a,j){M[j].style.width='0';document.getElementById('x2a'+j).classList.remove('hot');});
    for(var k=0;k<4;k++)document.getElementById('x2d'+k).classList.remove('on');}
  this.textContent='暂停';this.classList.remove('pri');one2();t2=setInterval(function(){if(!one2())stop2();},3200);};
document.getElementById('x2step').onclick=function(){stop2();one2();};
document.getElementById('x2reset').onclick=function(){stop2();clearInterval(typ);i2=0;
  A.forEach(function(a,j){M[j].style.width='0';document.getElementById('x2a'+j).classList.remove('hot');});
  for(var k=0;k<4;k++)document.getElementById('x2d'+k).classList.remove('on');
  tx.innerHTML='<span style="color:#8b949e">（尚未开始生成）</span>';st2.textContent='阶段 0 / 4';};}

/* ── 图 3：算力换智力 ── */
var gA=document.getElementById('x3a'),gB=document.getElementById('x3b');
if(gA){var N=48,HIT=[5,13,21,29,40],acc=0,n1=0,n2=0,t3=null,i3=0,cnt=0;
for(var i=0;i<N;i++){
  var a=document.createElement('div');a.className='cell';a.id='x3a'+i;gA.appendChild(a);
  var b=document.createElement('div');b.className='cell';b.id='x3b'+i;gB.appendChild(b);}
function seed(){for(var i=0;i<N;i++){document.getElementById('x3a'+i).className='cell';
  document.getElementById('x3b'+i).className='cell';}i3=0;cnt=0;n1=1;n2=0;
  document.getElementById('x3a0').className='cell yes';
  document.getElementById('x3sa').textContent='已探查 1 / 48 · 候选 1';
  document.getElementById('x3sb').textContent='已验证 0 / 48 · 候选 0';
  document.getElementById('x3st').textContent='待开始 · 代价：烧掉大量 token';}
seed();
document.getElementById('x3play').onclick=function(){
  if(t3){clearInterval(t3);t3=null;this.textContent='播放穷举';this.classList.add('pri');return;}
  if(i3>=N)seed();
  this.textContent='暂停';this.classList.remove('pri');
  t3=setInterval(function(){
    if(i3>=N){clearInterval(t3);t3=null;document.getElementById('x3play').textContent='播放穷举';
      document.getElementById('x3play').classList.add('pri');
      document.getElementById('x3st').textContent='完成 · 覆盖率 100%，代价：大量 token';return;}
    var e=document.getElementById('x3b'+i3);
    e.className='cell scan';
    setTimeout(function(el,idx){return function(){
      el.className='cell '+(HIT.indexOf(idx)>-1?'yes':'no');
      if(HIT.indexOf(idx)>-1)cnt++;
      document.getElementById('x3sb').textContent='已验证 '+(idx+1)+' / 48 · 候选 '+cnt;
      document.getElementById('x3st').textContent='穷举中 '+(idx+1)+' / 48 · 用算力换取覆盖率';
    };}(e,i3),90);
    i3++;},70);};
document.getElementById('x3reset').onclick=function(){if(t3){clearInterval(t3);t3=null;}
  document.getElementById('x3play').textContent='播放穷举';document.getElementById('x3play').classList.add('pri');seed();};}

/* ── 目录高亮 ── */
var links=[].slice.call(document.querySelectorAll('#nav a')),
    secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
function hl(){var y=window.scrollY+120,cur=0;
  secs.forEach(function(s,i){if(s&&s.offsetTop<=y)cur=i;});
  links.forEach(function(a,i){a.classList.toggle('on',i===cur);});}
window.addEventListener('scroll',hl,{passive:true});hl();

/* ── 搜索 ── */
var q=document.getElementById('q'),mn=document.getElementById('main'),
    sPanel=document.getElementById('sPanel'),sList=document.getElementById('sList'),
    sCount=document.getElementById('sCount'),matches=[],cur=-1;
function walk(n,f){var c=n.childNodes;
  for(var i=0;i<c.length;i++){var x=c[i];
    if(x.nodeType===3)f(x);
    else if(x.nodeType===1&&!/^(SCRIPT|STYLE|svg|mark)$/i.test(x.tagName))walk(x,f);}}
function clearMarks(){
  var ms=mn.querySelectorAll('mark');
  for(var i=0;i<ms.length;i++){var m=ms[i],p=m.parentNode;
    if(!p)continue;p.replaceChild(document.createTextNode(m.textContent),m);p.normalize();}
}
function hit(nd,v){
  var p=nd.nodeValue,pl=p.toLowerCase(),fr=document.createDocumentFragment(),k=0,j;
  if(pl.indexOf(v)<0)return;
  while((j=pl.indexOf(v,k))>-1){
    if(j>k)fr.appendChild(document.createTextNode(p.slice(k,j)));
    var m=document.createElement('mark');m.textContent=p.slice(j,j+v.length);fr.appendChild(m);
    k=j+v.length;}
  if(k<p.length)fr.appendChild(document.createTextNode(p.slice(k)));
  nd.parentNode.replaceChild(fr,nd);
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function secOf(mk){var s=mk.closest('section');if(!s)return'';
  var c=s.querySelector('.chap'),h=s.querySelector('.sh');
  return (c?c.textContent+' · ':'')+(h?h.textContent:'');}
function ctxOf(mk){ /* 匹配处前后各取约 40 字的纯文本上下文 */
  var p=mk.parentNode,pre='',n;
  for(n=p.firstChild;n&&n!==mk;n=n.nextSibling)pre+=n.textContent;
  var post='';
  for(n=mk.nextSibling;n;n=n.nextSibling)post+=n.textContent;
  var t=mk.textContent,idx=pre.length,L=t.length,W=40,all=pre+t+post;
  var a=Math.max(0,idx-W),b=Math.min(all.length,idx+L+W);
  return (a>0?'…':'')+esc(all.slice(a,idx))+'<b>'+esc(t)+'</b>'+esc(all.slice(idx+L,b))+(b<all.length?'…':'');
}
function buildPanel(v){
  sList.innerHTML='';
  matches=[].slice.call(mn.querySelectorAll('mark'));
  if(!matches.length){
    cur=-1;sCount.textContent='0 / 0';
    sList.innerHTML='<div class="si empty">未找到「'+esc(v)+'」</div>';return;}
  var f=document.createDocumentFragment();
  matches.forEach(function(mk,i){
    var d=document.createElement('div');d.className='si';
    var sc=secOf(mk);
    d.innerHTML=(sc?'<span class="sc">'+esc(sc)+'</span>':'')+'<div class="sx">'+ctxOf(mk)+'</div>';
    d.addEventListener('click',function(){setCur(i,true);});
    f.appendChild(d);});
  sList.appendChild(f);
}
function setCur(i,scroll){
  if(!matches.length)return;
  if(scroll)sPanel.classList.add('collapsed'); // 跳转到结果时收起列表，不遮正文
  if(cur>-1&&matches[cur])matches[cur].classList.remove('cur');
  cur=((i%matches.length)+matches.length)%matches.length;
  matches[cur].classList.add('cur');
  sCount.textContent=(cur+1)+' / '+matches.length;
  var items=sList.children,k;
  for(k=0;k<items.length;k++)items[k].classList.toggle('on',k===cur);
  if(items[cur])items[cur].scrollIntoView({block:'nearest'});
  if(scroll)matches[cur].scrollIntoView({block:'center'});
}
function exitSearch(){
  q.value='';clearMarks();
  secs.forEach(function(s){if(s)s.classList.remove('hide');});
  sPanel.classList.remove('open');sList.innerHTML='';
  matches=[];cur=-1;q.blur();
}
function run(){
  clearMarks();
  var v=q.value.trim().toLowerCase();
  if(!v){secs.forEach(function(s){if(s)s.classList.remove('hide');});
    sPanel.classList.remove('open');sList.innerHTML='';matches=[];cur=-1;return;}
  secs.forEach(function(s){
    if(!s)return;
    var t=(s.innerText||s.textContent||'').toLowerCase();
    if(t.indexOf(v)>-1){s.classList.remove('hide');walk(s,function(nd){hit(nd,v);});}
    else s.classList.add('hide');});
  if(navMask&&navMask.classList.contains('open'))closeNav();
  buildPanel(v);
  sPanel.classList.add('open');
  sPanel.classList.remove('collapsed');
  if(matches.length)setCur(0,false);
}
var tm=null;q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(run,150);});
q.addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();if(!matches.length)return;
    setCur(e.shiftKey?(cur<0?matches.length-1:cur-1):cur+1,true);}
  else if(e.key==='Escape')exitSearch();});
document.getElementById('sPrev').addEventListener('click',function(){setCur(cur-1,true);});
document.getElementById('sNext').addEventListener('click',function(){setCur(cur+1,true);});
document.getElementById('sClose').addEventListener('click',exitSearch);
document.querySelector('.sph').addEventListener('click',function(e){
  if(e.target.closest('button'))return; // 按钮点击不触发收起/展开
  sPanel.classList.toggle('collapsed');});

/* ── 移动端折叠目录 ── */
var navEl=document.getElementById('nav'),
    btnNav=document.getElementById('btnNav'),
    navMask=document.getElementById('navMask'),
    topbar=document.querySelector('.top');
function setTopbarH(){document.documentElement.style.setProperty('--topbar-h',topbar.offsetHeight+'px');}
function closeNav(){navEl.classList.remove('open');navMask.classList.remove('open');}
btnNav.addEventListener('click',function(){
  if(navEl.classList.contains('open')){closeNav();return;}
  setTopbarH();
  navEl.classList.add('open');navMask.classList.add('open');});
navMask.addEventListener('click',closeNav);
navEl.addEventListener('click',function(e){if(e.target.closest('a'))closeNav();});
window.addEventListener('resize',function(){
  if(!window.matchMedia('(max-width:900px)').matches)closeNav();
  else if(navEl.classList.contains('open'))setTopbarH();});
})();

/* ═══ 归并：SPA 路由 + 树形目录交互 + 滚动跟踪 + 接管搜索（移植侧补充，已归并进 script-main.js） ═══ */
(function(){
function $(id){return document.getElementById(id);}
var nav=$('nav'),mn=$('main');
var VIEWS=['home','p1','p2','p3','p4'];

/* ── SPA 路由：home=古文笔记主页；#p1~#p4=四篇；其余 hash=跨篇锚点（自动切篇再滚动） ── */
function activate(name,scrollTop){
  VIEWS.forEach(function(v){var el=$(v);if(el)el.hidden=(v!==name);});
  [].forEach.call(nav.querySelectorAll('.tree-part'),function(tp){
    tp.hidden=(tp.getAttribute('data-part')!==name);});
  /* 篇标签用独立的 cur 类：模板 hl() 与移植 spy() 都会重排 #nav 链接上的 on 类，
     若共用 on 则在篇章内一滚动，当前篇标签就会被清掉（主页因 spy 提前返回而幸存） */
  [].forEach.call(nav.querySelectorAll('.ptab'),function(t){
    t.classList.toggle('cur',t.getAttribute('data-v')===name);});
  if(scrollTop)window.scrollTo(0,0);
  spy();
}
function route(){
  var h=decodeURIComponent(location.hash.slice(1));
  if(h==='home'||/^p[1-4]$/.test(h)){activate(h,true);return;}
  var el=h?document.getElementById(h):null;
  if(el){var v=el.closest('.view');
    if(v)activate(v.id,false);
    setTimeout(function(){el.scrollIntoView({block:'center'});expand(el);spy();},0);
    return;}
  activate('home',true);
}
window.addEventListener('hashchange',route);

/* ── 树：caret 开合 + 跳转展开祖先（经树内锚点反查） ── */
function expand(el){
  var id=el&&el.id;if(!id||!nav)return;
  var a=nav.querySelector('a[href="#'+id+'"]');if(!a)return;
  var li=a.closest('li');
  while(li){li.classList.add('open');li=li.parentNode&&li.parentNode.closest?li.parentNode.closest('li'):null;}}
if(nav){nav.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;
  var a=t.closest('a');
  if(a){var h=a.getAttribute('href')||'';
    if(h.charAt(0)==='#')setTimeout(function(){var el=document.getElementById(h.slice(1));if(el)expand(el);spy();},0);
    return;}
  var li=t.closest('li');
  if(li&&li.classList.contains('has')&&(t.closest('.caret')||t.closest('.tnode'))){
    li.classList.toggle('open');setTimeout(spy,0);}
});}

/* ── 自动展开开关（localStorage）+ 滚动跟踪 ──
   以视口垂直中线内容为当前位置；高亮节点在面板内居中（平滑跟随）；
   收起时高亮最近可见祖先；自动展开开启时展开当前分支。 */
var autoEx=true;
try{autoEx=localStorage.getItem('treeAutoEx')!=='0';}catch(e){}
var btnAuto=$('btnAuto');
if(btnAuto){btnAuto.classList.toggle('auto-on',autoEx);
  btnAuto.addEventListener('click',function(){
    autoEx=!autoEx;btnAuto.classList.toggle('auto-on',autoEx);
    try{localStorage.setItem('treeAutoEx',autoEx?'1':'0');}catch(e){}
    spy();});}
var tlinks=[].slice.call(nav.querySelectorAll('.tree-part a[href^="#"]')).map(function(a){
  return {a:a,t:document.getElementById(a.getAttribute('href').slice(1))};
}).filter(function(o){return o.t;});
function firstVisibleUp(a){
  var cur=a;
  while(cur){
    if(cur.offsetParent!==null)return cur;
    var li=cur.closest('li');
    var pli=li&&li.parentNode&&li.parentNode.closest?li.parentNode.closest('li'):null;
    cur=pli?pli.querySelector('.tnode a'):null;}
  return null;}
function spy(){
  var y=window.scrollY+window.innerHeight/2,best=null;
  tlinks.forEach(function(o){
    if(o.t.offsetParent===null)return;
    if(o.t.offsetTop<=y)best=o;});
  var pick=null;
  if(best){
    if(autoEx)expand(best.t);
    pick=firstVisibleUp(best.a)||best.a;
  }else{
    for(var i=0;i<tlinks.length;i++){pick=firstVisibleUp(tlinks[i].a);if(pick)break;}
  }
  if(!pick)return;
  [].forEach.call(nav.querySelectorAll('a.on'),function(x){x.classList.remove('on');});
  pick.classList.add('on');
  var top=pick.offsetTop,h=pick.offsetHeight,st=nav.scrollTop,ch=nav.clientHeight;
  if(autoEx)nav.scrollTop=Math.max(0,top+h/2-ch/2);
  else if(top<st+4)nav.scrollTop=Math.max(0,top-4);
  else if(top+h>st+ch-4)nav.scrollTop=top+h-ch+4;
}
window.addEventListener('scroll',spy,{passive:true});

/* ── 接管搜索：跨篇全文搜索；跳转自动切换到条目所在篇 ── */
if(!mn)return;
var q=$('q'),sPanel=$('sPanel');
if(q){var cq=q.cloneNode(true);q.parentNode.replaceChild(cq,q);q=cq;}
if(sPanel){var p2=sPanel.cloneNode(true);sPanel.parentNode.replaceChild(p2,sPanel);sPanel=p2;}
var sList=$('sList'),sCount=$('sCount');
var matches=[],cur=-1;
var allSecs=[].slice.call(mn.querySelectorAll('section:not(.view)'));
function walk(n,f){var c=n.childNodes;
  for(var i=0;i<c.length;i++){var x=c[i];
    if(x.nodeType===3)f(x);
    else if(x.nodeType===1&&!/^(SCRIPT|STYLE|svg|mark)$/i.test(x.tagName))walk(x,f);}}
function clearMarks(){var ms=mn.querySelectorAll('mark');
  for(var i=0;i<ms.length;i++){var m=ms[i],p=m.parentNode;
    if(!p)continue;p.replaceChild(document.createTextNode(m.textContent),m);p.normalize();}}
function hit(nd,v){var p=nd.nodeValue,pl=p.toLowerCase(),fr=document.createDocumentFragment(),k=0,j;
  if(pl.indexOf(v)<0)return;
  while((j=pl.indexOf(v,k))>-1){
    if(j>k)fr.appendChild(document.createTextNode(p.slice(k,j)));
    var m=document.createElement('mark');m.textContent=p.slice(j,j+v.length);fr.appendChild(m);
    k=j+v.length;}
  if(k<p.length)fr.appendChild(document.createTextNode(p.slice(k)));
  nd.parentNode.replaceChild(fr,nd);}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function secOf(mk){var s=mk.closest('section:not(.view)')||mk.closest('section');if(!s)return'';
  var h=s.querySelector(':scope>h2,:scope>h3,:scope>h4');if(!h)return'';
  var v=mk.closest('.view');var lbl=v?v.getAttribute('data-label'):'';
  return (lbl?lbl+' · ':'')+h.textContent;}
function ctxOf(mk){var p=mk.parentNode,pre='',n;
  for(n=p.firstChild;n&&n!==mk;n=n.nextSibling)pre+=n.textContent;
  var post='';
  for(n=mk.nextSibling;n;n=n.nextSibling)post+=n.textContent;
  var t=mk.textContent,idx=pre.length,L=t.length,W=40,all=pre+t+post;
  var a=Math.max(0,idx-W),b=Math.min(all.length,idx+L+W);
  return (a>0?'…':'')+esc(all.slice(a,idx))+'<b>'+esc(t)+'</b>'+esc(all.slice(idx+L,b))+(b<all.length?'…':'');}
function buildPanel(v){
  sList.innerHTML='';
  matches=[].slice.call(mn.querySelectorAll('mark'));
  if(!matches.length){cur=-1;sCount.textContent='0 / 0';
    sList.innerHTML='<div class="si empty">未找到「'+esc(v)+'」</div>';return;}
  var f=document.createDocumentFragment();
  matches.forEach(function(mk,i){
    var d=document.createElement('div');d.className='si';
    var sc=secOf(mk);
    d.innerHTML=(sc?'<span class="sc">'+esc(sc)+'</span>':'')+'<div class="sx">'+ctxOf(mk)+'</div>';
    d.addEventListener('click',function(){setCur(i,true);});
    f.appendChild(d);});
  sList.appendChild(f);
}
function setCur(i,scroll){
  if(!matches.length)return;
  if(scroll){sPanel.classList.add('collapsed');}
  if(cur>-1&&matches[cur])matches[cur].classList.remove('cur');
  cur=((i%matches.length)+matches.length)%matches.length;
  matches[cur].classList.add('cur');
  sCount.textContent=(cur+1)+' / '+matches.length;
  var items=sList.children,k;
  for(k=0;k<items.length;k++)items[k].classList.toggle('on',k===cur);
  if(items[cur])items[cur].scrollIntoView({block:'nearest'});
  if(scroll){
    var v=matches[cur].closest('.view');
    if(v&&v.hidden)activate(v.id,false);
    matches[cur].scrollIntoView({block:'center'});
    expand(matches[cur].closest('[id]')||matches[cur].closest('section'));
  }
}
function exitSearch(){
  q.value='';clearMarks();
  allSecs.forEach(function(s){s.classList.remove('hide');});
  sPanel.classList.remove('open');sPanel.classList.remove('collapsed');sList.innerHTML='';
  matches=[];cur=-1;q.blur();
}
function run(){
  clearMarks();
  var v=q.value.trim().toLowerCase();
  if(!v){allSecs.forEach(function(s){s.classList.remove('hide');});
    sPanel.classList.remove('open');sPanel.classList.remove('collapsed');sList.innerHTML='';
    matches=[];cur=-1;return;}
  allSecs.forEach(function(s){
    var t=(s.textContent||'').toLowerCase();
    s.classList.toggle('hide',t.indexOf(v)<0);
  });
  allSecs.forEach(function(s){if(!s.classList.contains('hide'))walk(s,function(nd){hit(nd,v);});});
  buildPanel(v);
  var nm=$('navMask'),na=$('nav');
  if(nm&&nm.classList.contains('open')){nm.classList.remove('open');if(na)na.classList.remove('open');}
  sPanel.classList.add('open');sPanel.classList.remove('collapsed');
  if(matches.length)setCur(0,false);
}
var tm=null;
q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(run,150);});
q.addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();if(!matches.length)return;
    setCur(e.shiftKey?(cur<0?matches.length-1:cur-1):cur+1,true);}
  else if(e.key==='Escape')exitSearch();});
$('sPrev').addEventListener('click',function(){setCur(cur-1,true);});
$('sNext').addEventListener('click',function(){setCur(cur+1,true);});
$('sClose').addEventListener('click',exitSearch);
sPanel.querySelector('.sph').addEventListener('click',function(e){
  if(e.target.closest('button'))return;
  sPanel.classList.toggle('collapsed');});
route();
})();
