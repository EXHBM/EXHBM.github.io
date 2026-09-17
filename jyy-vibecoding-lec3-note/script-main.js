/* lec3 成稿：移动端目录 / 回顶部 / 目录滚动跟踪 */
(function () {
  'use strict';
  function byId(i) { return document.getElementById(i); }

  /* ── 移动端目录：顶栏下方弹出 ── */
  var nav = byId('side'), btnNav = byId('btnNav'), navMask = byId('navMask');
  function setTopH() {
    var t = document.querySelector('.topbar');
    var h = t ? t.offsetHeight : 0;
    if (!t && window.matchMedia('(max-width:900px)').matches) {
      // 成稿没有顶栏：用移动端「目录」按钮的高度当基准，面板从按钮下方展开
      var b = byId('btnNav');
      h = b ? (b.offsetHeight + 24) : 0;
    }
    document.documentElement.style.setProperty('--topbar-h', h + 'px');
  }
  function closeNav() {
    if (nav) { nav.classList.remove('open'); }
    if (navMask) { navMask.classList.remove('open'); }
  }
  if (btnNav) {
    btnNav.addEventListener('click', function () {
      if (nav.classList.contains('open')) { closeNav(); return; }
      setTopH();
      nav.classList.add('open');
      navMask.classList.add('open');
    });
  }
  if (navMask) { navMask.addEventListener('click', closeNav); }
  if (nav) {
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { closeNav(); } });
  }
  window.addEventListener('resize', function () {
    if (!window.matchMedia('(max-width:900px)').matches) { closeNav(); }
    else if (nav && nav.classList.contains('open')) { setTopH(); }
  });
  setTopH();

  /* ── 目录滚动跟踪（按 offsetTop，同 lec2） ── */
  var links = [].slice.call(document.querySelectorAll('#toc a'));
  var secs = links.map(function (a) { return byId(a.getAttribute('href').slice(1)); });
  function spy() {
    var y = window.scrollY + 120, cur = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) { cur = i; } });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ── 回到顶部 ── */
  var totop = byId('totop');
  function tt() { if (totop) { totop.classList.toggle('show', window.scrollY > 600); } }
  window.addEventListener('scroll', tt, { passive: true });
  tt();
  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 全文搜索（结果面板固定定位，JS 贴到搜索框下方，避免被侧栏 overflow 裁切）── */
  var q = byId('q'), main = contentRoot(), sPanel = byId('sPanel'), sList = byId('sList'),
      sCount = byId('sCount'), matches = [], mcur = -1;
  function contentRoot() { return byId('content'); }
  function placePanel() {
    if (!q || !sPanel) { return; }
    var r = q.getBoundingClientRect();
    var w = Math.min(380, window.innerWidth - 24);
    var left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
    sPanel.style.width = w + 'px';
    sPanel.style.left = Math.round(left) + 'px';
    sPanel.style.top = Math.round(r.bottom + 8) + 'px';
  }
  function walk(n, f) {
    var c = n.childNodes, i, x;
    for (i = 0; i < c.length; i++) {
      x = c[i];
      if (x.nodeType === 3) { f(x); }
      else if (x.nodeType === 1) {
        if (/^(SCRIPT|STYLE|svg|TEXTAREA|INPUT)$/i.test(x.tagName)) { continue; }
        if (x.tagName === 'MARK' && !x.classList.contains('rep')) { continue; }
        walk(x, f);
      }
    }
  }
  function clearMarks() {
    var ms = main.querySelectorAll('mark:not(.rep)'), i, m, p;
    for (i = 0; i < ms.length; i++) {
      m = ms[i]; p = m.parentNode;
      if (!p) { continue; }
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
    }
  }
  function hitNode(nd, v) {
    var p = nd.nodeValue, pl = p.toLowerCase(), fr = document.createDocumentFragment(), k = 0, j;
    if (pl.indexOf(v) < 0) { return; }
    while ((j = pl.indexOf(v, k)) > -1) {
      if (j > k) { fr.appendChild(document.createTextNode(p.slice(k, j))); }
      var m = document.createElement('mark');
      m.textContent = p.slice(j, j + v.length);
      fr.appendChild(m);
      k = j + v.length;
    }
    if (k < p.length) { fr.appendChild(document.createTextNode(p.slice(k))); }
    nd.parentNode.replaceChild(fr, nd);
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function secOf(mk) {
    var heads = contentRoot().querySelectorAll('h2[id], h3[id]'), head = null, i, el = mk.parentNode;
    for (i = 0; i < heads.length; i++) {
      if (heads[i].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) { head = heads[i]; }
    }
    return head ? (head.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }
  function ctxOf(mk) {
    var p = mk.parentNode, pre = '', n, post = '';
    for (n = p.firstChild; n && n !== mk; n = n.nextSibling) { pre += n.textContent; }
    for (n = mk.nextSibling; n; n = n.nextSibling) { post += n.textContent; }
    var t = mk.textContent, idx = pre.length, L = t.length, W = 34, all = pre + t + post;
    var a = Math.max(0, idx - W), b = Math.min(all.length, idx + L + W);
    return (a > 0 ? '…' : '') + esc(all.slice(a, idx)) + '<b>' + esc(t) + '</b>' +
      esc(all.slice(idx + L, b)) + (b < all.length ? '…' : '');
  }
  function buildPanel(v) {
    sList.innerHTML = '';
    matches = [].slice.call(main.querySelectorAll('mark:not(.rep)'));
    if (!matches.length) {
      mcur = -1; sCount.textContent = '0 / 0';
      sList.innerHTML = '<div class="si empty">未找到「' + esc(v) + '」</div>';
      return;
    }
    var f = document.createDocumentFragment();
    matches.forEach(function (mk, i) {
      var d = document.createElement('div');
      d.className = 'si';
      d.setAttribute('tabindex', '0');
      d.setAttribute('role', 'button');
      var sc = secOf(mk);
      d.innerHTML = (sc ? '<span class="sc">' + esc(sc) + '</span>' : '') + '<div class="sx">' + ctxOf(mk) + '</div>';
      function activate() { setCur(i, true); }
      d.addEventListener('click', activate);
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
      f.appendChild(d);
    });
    sList.appendChild(f);
  }
  function setCur(i, scroll) {
    if (!matches.length) { return; }
    if (scroll) { sPanel.classList.add('collapsed'); }
    if (mcur > -1 && matches[mcur]) { matches[mcur].classList.remove('cur'); }
    mcur = ((i % matches.length) + matches.length) % matches.length;
    matches[mcur].classList.add('cur');
    sCount.textContent = (mcur + 1) + ' / ' + matches.length;
    var items = sList.children, k;
    for (k = 0; k < items.length; k++) { items[k].classList.toggle('on', k === mcur); }
    if (items[mcur]) { items[mcur].scrollIntoView({ block: 'nearest' }); }
    if (scroll) { matches[mcur].scrollIntoView({ block: 'center' }); }
  }
  function exitSearch() {
    if (q) { q.value = ''; }
    clearMarks();
    sPanel.classList.remove('open');
    sList.innerHTML = '';
    matches = []; mcur = -1;
    if (q) { q.blur(); }
  }
  function runSearch() {
    clearMarks();
    var v = q.value.trim().toLowerCase();
    if (!v) { sPanel.classList.remove('open'); sList.innerHTML = ''; matches = []; mcur = -1; return; }
    walk(main, function (nd) { hitNode(nd, v); });
    closeNav();
    buildPanel(v);
    placePanel();
    sPanel.classList.add('open');
    sPanel.classList.remove('collapsed');
    if (matches.length) { setCur(0, false); }
  }
  if (q) {
    var tm = null;
    q.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(runSearch, 150); });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!matches.length) { return; }
        setCur(e.shiftKey ? (mcur < 0 ? matches.length - 1 : mcur - 1) : mcur + 1, true);
      } else if (e.key === 'Escape') { exitSearch(); }
    });
    byId('sPrev').addEventListener('click', function () { setCur(mcur - 1, true); });
    byId('sNext').addEventListener('click', function () { setCur(mcur + 1, true); });
    byId('sClose').addEventListener('click', exitSearch);
    document.querySelector('.sph').addEventListener('click', function (e) {
      if (e.target.closest('button')) { return; }
      sPanel.classList.toggle('collapsed');
    });
    window.addEventListener('scroll', function () { if (sPanel.classList.contains("open")) { placePanel(); } }, { passive: true });
    window.addEventListener('resize', function () { if (sPanel.classList.contains('open')) { placePanel(); } });
  }
})();
