/* ═══════════════════════════════════════════════════════════════
   笔记页模板 · 基础功能 + 组件库第 1 部分（原样取自 jyy-lec2-note，tag 0.1.1）
   所有组件均带容器守卫：HTML 里没有对应 id 就自动跳过，可整站安全携带。
   ── 基础功能（模板 HTML 已内置容器）──
   · 目录滚动高亮 hl()        → 依赖 <aside id="nav"> 的章节链接 + 对应 section
   · 搜索结果面板             → 依赖 #q #sPanel #sList #sCount #sPrev #sNext #sClose
   · 移动端折叠目录           → 依赖 #btnNav #navMask #nav .top
   ── 组件库 x1-x3：产物页无对应容器，构建时已剥离，需要时从模板库恢复 ──
   新增组件请用未占用的 id 前缀（x1-x3、x4-x8 已被两份 JS 占用）。
   ═══════════════════════════════════════════════════════════════ */
(function(){
/* ── 构建时裁剪：x1 堆叠条 / x2 注意力 / x3 穷举网格 组件段 ── */
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
