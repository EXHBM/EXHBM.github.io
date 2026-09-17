/* ═══ 迁移自动画（图 3/4/5/7/8 交互逻辑 + 图 9/10/12 滚动触发）═══ */
(function(){
function $(id){return document.getElementById(id);}

/* ── 图 3：位置效应与「喵」探针 ── */
var MK=[{p:.03,t:'每句加喵'},{p:.13,t:'用中文'},{p:.31,t:'用 C++'},{p:.53,t:'禁第三方库'},{p:.79,t:'注释中文'},{p:.95,t:'修 login bug'}];
var x4m=$('x4mks'),x4sl=$('x4sl'),x4fill=$('x4fill'),x4miao=$('x4miao'),x4st=$('x4st');
if(x4m&&x4sl){
var x4e=MK.map(function(m,i){
  var d=document.createElement('div');d.className='mk';d.style.left=(m.p*100)+'%';
  d.innerHTML='<div class="dotm"></div><div class="lb">'+m.t+'</div>';x4m.appendChild(d);return d;});
function draw4(){
  var len=x4sl.value/100;x4fill.style.width=(len*100)+'%';
  MK.forEach(function(m,i){
    var e=x4e[i];
    if(m.p>len){e.className='mk cut';return;}
    var dist=len-m.p,sc=Math.max(0,Math.min(1,1-dist/0.55));
    e.className='mk '+(sc>=.66?'ok':(sc>=.3?'mid':'dead'));
    e.style.opacity=String(.35+sc*.65);});
  var miao=MK[0];
  if(miao.p>len||(len-miao.p)>=0.25){
    x4miao.className='miao alarm';
    x4miao.textContent='探针报警：输出里的「喵」不见了 → 上下文已被截断或压缩，指令遵循开始失效';
  }else{x4miao.className='miao';x4miao.textContent='探针正常：每句结尾都有「喵」';}
  x4st.textContent='上下文长度 '+Math.round(len*100)+'%';}
x4sl.addEventListener('input',draw4);draw4();}

/* ── 图 4：意图漂移靶心 ── */
var x7arr=$('x7arr'),x7sc=$('x7sc'),x7st=$('x7st');
if(x7arr&&x7sc){
var AR7=[],tk7=[];
function later7(f,m){tk7.push(setTimeout(f,m));}
function clear7(){tk7.forEach(function(t){clearTimeout(t);});tk7=[];}
for(var i=0;i<6;i++){var d=document.createElement('div');d.className='arrow';x7arr.appendChild(d);AR7.push(d);}
function shoot7(spread){
  clear7();var hit=0;
  AR7.forEach(function(a,i){
    a.className='arrow';a.style.transform='translate(0,0)';a.style.opacity='0';
    later7(function(){
      var ang=Math.random()*Math.PI*2,r=spread*(0.55+Math.random()*0.45);
      if(r<34)hit++;
      a.style.transform='translate('+(Math.cos(ang)*r).toFixed(1)+'px,'+(Math.sin(ang)*r).toFixed(1)+'px)';
      a.style.opacity='1';a.className='arrow'+(r>=70?' miss':'');},70+i*180);});
  later7(function(){var p=Math.round(hit/6*100);
    x7sc.textContent='命中靶心 '+hit+' / 6 · 命中率 '+p+'%';
    x7st.textContent=spread>60?'模糊 intent：落点全散':'明确 spec：落点收拢';},70+6*180+900);}
$('x7a').onclick=function(){x7sc.textContent='命中率 —';shoot7(128);};
$('x7b').onclick=function(){x7sc.textContent='命中率 —';shoot7(30);};}

/* ── 图 5：verify 循环 ── */
var LN8=[].slice.call(document.querySelectorAll('#x8loop .ln')),
    x8n=$('x8n'),x8f=$('x8f'),x8st=$('x8st');
if(LN8.length&&x8n){
var r8=0,f8=0,t8=null,i8=0,PASS8=5;
function paint8(s,bad,good){LN8.forEach(function(l,k){
  l.className='ln'+(k===s?' on':'')+(bad&&k===2?' bad':'')+(good&&k===2?' good':'');});}
function stop8(){clearInterval(t8);t8=null;var b=$('x8play');b.textContent='播放';b.classList.add('pri');}
function step8(){
  var s=i8%4;
  if(s===0){r8++;x8n.textContent=r8;}
  if(s===2){if(r8>=PASS8){paint8(2,false,true);x8st.textContent='通过 · 有 verify，这个环就不会停';stop8();return;}
    f8++;x8f.textContent=f8;paint8(2,true,false);x8st.textContent='不通过 → 进入修改';}
  else{paint8(s,false,false);
    x8st.textContent=['写下一版代码','跑测试脚本','判定','按失败原因修改'][s];}
  i8++;}
$('x8play').onclick=function(){
  if(t8){stop8();return;}
  if(r8>=PASS8){r8=0;f8=0;i8=0;x8n.textContent='0';x8f.textContent='0';}
  this.textContent='暂停';this.classList.remove('pri');step8();t8=setInterval(step8,700);};
$('x8reset').onclick=function(){stop8();r8=0;f8=0;i8=0;
  x8n.textContent='0';x8f.textContent='0';LN8.forEach(function(l){l.className='ln';});x8st.textContent='待开始';};}

/* ── 图 7：纸和笔（三幕 FSM）── */
var x5f=$('x5fsm'),x5t=$('x5tape'),x5act=$('x5act'),x5st=$('x5st');
if(x5f&&x5t){
var ST5=[],TP5=[];
for(var i=0;i<4;i++){var s=document.createElement('div');s.className='fst';s.textContent='S'+i;x5f.appendChild(s);ST5.push(s);}
for(var i=0;i<22;i++){var c=document.createElement('div');c.className='tp';x5t.appendChild(c);TP5.push(c);}
var SY=['?','+','(',')','→','x','=','2','√','A','B','C','D','E','F','G','H','I','J','K','L','M'];
var i5=0,tk5=[];
function clear5(){tk5.forEach(function(t){clearTimeout(t);clearInterval(t);});tk5=[];}
function reset5(){clear5();ST5.forEach(function(s){s.className='fst';});
  TP5.forEach(function(c){c.className='tp';c.textContent='';});x5t.className='tape';i5=0;
  x5act.textContent='点播放开始';x5st.textContent='幕 0 / 3';
  $('x5play').textContent='播放';$('x5play').classList.add('pri');}
function run5(){
  clear5();ST5.forEach(function(s){s.className='fst';});
  TP5.forEach(function(c){c.className='tp';c.textContent='';});x5t.className='tape';
  x5act.innerHTML='<b>幕 1</b> 只有有限状态，没有记忆 —— 循环一圈，什么也留不下';
  var k=0;
  var iv=setInterval(function(){
    i5=k%4;ST5.forEach(function(s,j){s.className='fst'+(j===i5?' on':'');});k++;
    if(k>12){clearInterval(iv);
      x5act.innerHTML='<b>幕 2</b> 加上一条纸带 —— 每一步的中间结果都可以写下来';
      x5t.className='tape on';var w=0;
      var iv2=setInterval(function(){
        if(w>=TP5.length){clearInterval(iv2);
          x5act.innerHTML='<b>幕 3</b> 回读纸带、接着往下推 —— 有了 pen and paper，你就是图灵机';
          TP5.forEach(function(c){c.className='tp read';});
          ST5.forEach(function(s){s.className='fst done';});x5st.textContent='幕 3 / 3';return;}
        TP5[w].className='tp on';TP5[w].textContent=SY[w];w++;x5st.textContent='幕 2 / 3';},105);
      tk5.push(iv2);return;}
    x5st.textContent='幕 1 / 3';},330);
  tk5.push(iv);}
$('x5play').onclick=function(){this.classList.remove('pri');run5();};
$('x5reset').onclick=reset5;}

/* ── 图 8：自我纠错（藏头诗五次尝试）── */
var T6=[
 {v:'✗',c:'no',t:'韵脚 ang：苍茫暮色染秋霜，二零二六入画堂…',r:'判定：第 6 句藏头字错位，重来'},
 {v:'✗',c:'no',t:'韵脚 ang（微调语序）：二舟摇过六桥东…',r:'判定：押韵不统一，仍不合格'},
 {v:'✗',c:'no',t:'换韵脚 i：九曲回廊月影移…',r:'判定：末句落字无法同时满足藏头与押韵'},
 {v:'✓',c:'yes',t:'换韵脚 u：二水中分白鹭洲…九秋归雁落平芜',r:'判定：八句藏头全部命中，韵脚一致'},
 {v:'✓',c:'yes',t:'复核：2026 9月1日 八字依次落在句首',r:'通过。它能写出一个，就意味着可以被引导着写出一万个'}];
var x6l=$('x6list'),x6st=$('x6st');
if(x6l&&x6st){
var i6=0,t6=null;
T6.forEach(function(x){var d=document.createElement('div');d.className='try '+x.c;
  d.innerHTML='<div class="vd">'+x.v+'</div><div><div class="tt">'+x.t+'</div><div class="tr">'+x.r+'</div></div>';
  x6l.appendChild(d);});
function stop6(){clearInterval(t6);t6=null;var b=$('x6play');b.textContent='播放';b.classList.add('pri');}
function one6(){if(i6>=T6.length)return false;x6l.children[i6].classList.add('show');i6++;x6st.textContent=i6+' / 5 次尝试';return true;}
$('x6play').onclick=function(){
  if(t6){stop6();return;}
  if(i6>=T6.length)i6=0;
  this.textContent='暂停';this.classList.remove('pri');one6();t6=setInterval(function(){if(!one6())stop6();},1250);};
$('x6reset').onclick=function(){stop6();i6=0;
  [].forEach.call(x6l.children,function(c){c.classList.remove('show');});x6st.textContent='0 / 5 次尝试';};}

/* ── 图 9/10/12：SVG 动画滚动进入视口才播放（离开重置，可重复观看）── */
var anims=[].slice.call(document.querySelectorAll('.anim-fig'));
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(en.isIntersecting)en.target.classList.add('go');
      else en.target.classList.remove('go');});},{threshold:0.25});
  anims.forEach(function(el){io.observe(el);});
}else{anims.forEach(function(el){el.classList.add('go');});}
})();
