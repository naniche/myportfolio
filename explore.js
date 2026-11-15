(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var WK = window.WORKS || {};

  /* ---------- language ---------- */
  var X = {
    sk: { back: 'Späť', title: 'Všetky práce', map: 'Mapa', list: 'Zoznam', hint: 'Ťahajte do strán a kliknite na prácu', hintT: 'Ťahajte prstom, podržte pre náhľad',
      all: 'Všetko', post: 'Posty', reel: 'Reelsy', poster: 'Plagáty', campaign: 'Kampaň',
      prev: 'Predošlá', next: 'Ďalšia', client: 'Klient', anon: 'Klientska práca', free: 'Voľná tvorba', pieces: 'prác', docTitle: 'Všetky práce | Jozef Lavko, grafický dizajnér a editor' },
    en: { back: 'Back', title: 'All work', map: 'Map', list: 'List', hint: 'Drag around and click a piece', hintT: 'Drag with a finger, hold to preview',
      all: 'All', post: 'Posts', reel: 'Reels', poster: 'Posters', campaign: 'Campaign',
      prev: 'Previous', next: 'Next', client: 'Client', anon: 'Client work', free: 'Personal work', pieces: 'pieces', docTitle: 'All work | Jozef Lavko, graphic designer and video editor' }
  };
  var lang = 'sk';
  try { lang = localStorage.getItem('jl-lang') === 'en' ? 'en' : 'sk'; } catch (e) {}
  function t(k) { return X[lang][k] || X.sk[k] || ''; }
  function L() { return lang === 'en' ? 1 : 0; }

  /* ---------- data ---------- */
  var CATS = ['all', 'post', 'reel', 'poster', 'campaign'];
  var ALL = Object.keys(WK).filter(function (k) { return k !== 'showreel'; });
  // interleave categories so neighbours differ
  (function () {
    var by = {}; ALL.forEach(function (k) { (by[WK[k].cat] = by[WK[k].cat] || []).push(k); });
    var out = [], order = ['post', 'reel', 'poster', 'campaign'], any = true;
    while (any) { any = false; order.forEach(function (c) { if (by[c] && by[c].length) { out.push(by[c].shift()); any = true; } }); }
    ALL = out;
  })();
  var cat = 'all', items = ALL.slice();
  var view = 'map';

  /* ---------- top bar ---------- */
  var filtersEl = document.getElementById('filters'), countEl = document.getElementById('count');
  function renderFilters() {
    filtersEl.innerHTML = '';
    CATS.forEach(function (c) {
      var n = c === 'all' ? ALL.length : ALL.filter(function (k) { return WK[k].cat === c; }).length;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.cat = c;
      b.setAttribute('aria-pressed', c === cat ? 'true' : 'false');
      b.innerHTML = t(c) + ' <span class="chip__n">' + n + '</span>';
      b.addEventListener('click', function () { setCat(c); });
      filtersEl.appendChild(b);
    });
  }
  function applyLang() {
    root.lang = lang; document.title = t('docTitle');
    document.querySelectorAll('[data-x]').forEach(function (el) { el.textContent = t(el.dataset.x); });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    var hintTxt = document.querySelector('#hint [data-x]'); if (hintTxt) hintTxt.textContent = fine ? t('hint') : t('hintT');
    renderFilters();
    countEl.textContent = '(' + items.length + ')';
    if (view === 'list') renderList();
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.dataset.lang; try { localStorage.setItem('jl-lang', lang); } catch (e) {} applyLang(); });
  });

  /* ---------- map: an endless grid you can throw around ---------- */
  var mapEl = document.getElementById('map'), world = document.getElementById('world');
  var cw, ch, C, R, cells = [], ox = 0, oy = 0, vx = 0, vy = 0, dragging = false;
  function measure() {
    var small = innerWidth < 640;
    cw = small ? 196 : 320; ch = small ? 268 : 430;
    C = Math.max(4, Math.ceil((innerWidth + 2 * cw) / cw));
    R = Math.max(3, Math.ceil((innerHeight + 2 * ch) / ch));
    // every piece must exist somewhere on the endless map
    while (C * R < items.length) { if (C * cw <= R * ch * 1.4) C++; else R++; }
  }
  function fit(w, boxW, boxH) {
    var r = w.w / w.h, bw = boxW, bh = boxW / r;
    if (bh > boxH) { bh = boxH; bw = boxH * r; }
    return [Math.round(bw), Math.round(bh)];
  }
  function card(k, cls) {
    var w = WK[k], small = innerWidth < 640;
    var s = fit(w, small ? 150 : 236, small ? 210 : 330);
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.dataset.id = k;
    b.style.setProperty('--gl', w.col.join(','));
    var inner = '<span class="xcard" style="width:' + s[0] + 'px;height:' + s[1] + 'px">' +
      '<img src="' + w.poster + '" alt="' + w.t[L()].replace(/"/g, '&quot;') + '" loading="lazy" decoding="async">';
    if (w.type === 'video') inner += '<video muted loop playsinline preload="none" data-src="' + (w.pv || w.src) + '" aria-hidden="true"></video><span class="xcard__play"></span>';
    if (w.type === 'set') inner += '<span class="xcard__count">' + w.slides.length + '</span>';
    inner += '</span>';
    b.innerHTML = inner;
    return b;
  }
  function build() {
    measure();
    world.innerHTML = ''; cells = [];
    var n = 0;
    for (var r = 0; r < R; r++) {
      for (var c = 0; c < C; c++) {
        var k = items[n % items.length]; n++;
        var el = card(k, 'xcell');
        el.style.width = cw + 'px'; el.style.height = ch + 'px';
        world.appendChild(el);
        cells.push({ el: el, c: c, r: r });
        hookCard(el);
      }
    }
    // reveal from the centre outwards
    var cx = innerWidth / 2, cy = innerHeight / 2;
    place();
    cells.forEach(function (o) {
      var rect = o.el.getBoundingClientRect();
      var d = Math.hypot(rect.left + cw / 2 - cx, rect.top + ch / 2 - cy);
      o.el.style.transitionDelay = reduce ? '0ms' : Math.min(700, d * 0.6) + 'ms';
    });
    requestAnimationFrame(function () { world.classList.add('is-in'); });
    setTimeout(function () { cells.forEach(function (o) { o.el.style.transitionDelay = ''; }); }, 1500);
  }
  function mod(a, b) { return ((a % b) + b) % b; }
  function place() {
    var W = C * cw, H = R * ch;
    for (var i = 0; i < cells.length; i++) {
      var o = cells[i];
      var x = mod(o.c * cw + ox, W) - cw;
      var y = mod(o.r * ch + oy + (o.c % 2) * ch * 0.5, H) - ch;
      o.el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }
    var sk = Math.max(-4, Math.min(4, vx * 0.12));
    world.style.transform = reduce ? '' : 'skewX(' + (-sk).toFixed(2) + 'deg)';
  }
  (function loop() {
    if (!dragging) {
      if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) { ox += vx; oy += vy; vx *= 0.93; vy *= 0.93; place(); }
      else if (vx || vy) { vx = vy = 0; place(); }
    }
    requestAnimationFrame(loop);
  })();

  var px = 0, py = 0, moved = 0, lastT = 0, hintGone = false;
  var hint = document.getElementById('hint');
  function hideHint() { if (!hintGone) { hintGone = true; hint.classList.add('is-gone'); } }
  mapEl.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    dragging = true; moved = 0; px = e.clientX; py = e.clientY; vx = vy = 0; lastT = performance.now();
  });
  mapEl.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - px, dy = e.clientY - py, now = performance.now(), dt = Math.max(1, now - lastT);
    px = e.clientX; py = e.clientY; lastT = now;
    ox += dx; oy += dy; moved += Math.abs(dx) + Math.abs(dy);
    vx = dx * 16 / dt; vy = dy * 16 / dt;
    if (moved > 6) {
      hideHint(); clearTimeout(holdT);
      // capture only once it is a real drag, so a plain click still reaches the card
      if (!mapEl.classList.contains('is-drag')) { try { mapEl.setPointerCapture(e.pointerId); } catch (er) {} mapEl.classList.add('is-drag'); }
    }
    place();
  });
  function endDrag() { dragging = false; mapEl.classList.remove('is-drag'); if (reduce) { vx = vy = 0; } }
  mapEl.addEventListener('pointerup', endDrag);
  mapEl.addEventListener('pointercancel', endDrag);
  mapEl.addEventListener('wheel', function (e) {
    e.preventDefault();
    vx += -e.deltaX * 0.12; vy += -e.deltaY * 0.12;
    vx = Math.max(-40, Math.min(40, vx)); vy = Math.max(-40, Math.min(40, vy));
    hideHint();
  }, { passive: false });
  mapEl.addEventListener('keydown', function (e) {
    var s = 14;
    if (e.key === 'ArrowLeft') vx += s; else if (e.key === 'ArrowRight') vx -= s;
    else if (e.key === 'ArrowUp') vy += s; else if (e.key === 'ArrowDown') vy -= s; else return;
    e.preventDefault(); hideHint();
  });
  setTimeout(hideHint, 7000);

  /* ---------- cards: hover play, click opens, hold to peek ---------- */
  var holdT = 0, peeking = false;
  var peek = document.createElement('div'); peek.className = 'peek'; peek.setAttribute('aria-hidden', 'true'); document.body.appendChild(peek);
  function loadPlay(b) { var v = b.querySelector('video'); if (!v || reduce) return; if (!v.src) v.src = v.dataset.src; v.play().then(function () { b.classList.add('is-playing'); }).catch(function () {}); }
  function stop(b) { var v = b.querySelector('video'); if (v) v.pause(); b.classList.remove('is-playing'); }
  function hookCard(b) {
    if (fine) {
      b.addEventListener('mouseenter', function () { if (!dragging) { mapEl.classList.add('has-hover'); loadPlay(b); } });
      b.addEventListener('mouseleave', function () { mapEl.classList.remove('has-hover'); stop(b); });
    } else {
      b.addEventListener('touchstart', function () {
        holdT = setTimeout(function () {
          var w = WK[b.dataset.id]; peeking = true; peek.innerHTML = '';
          var el;
          if (w.type === 'video') { el = document.createElement('video'); el.src = w.pv || w.src; el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = true; }
          else { el = new Image(); el.src = w.slides ? w.slides[0] : w.src; }
          peek.appendChild(el); peek.classList.add('is-on');
          if (navigator.vibrate) navigator.vibrate(10);
        }, 420);
      }, { passive: true });
      b.addEventListener('touchend', function () {
        clearTimeout(holdT);
        if (peeking) { peek.classList.remove('is-on'); setTimeout(function () { peek.innerHTML = ''; }, 250); }
      });
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
    b.addEventListener('click', function (e) {
      if (moved > 6 || peeking) { peeking = false; e.preventDefault(); return; }
      stop(b); open(b.dataset.id);
    });
  }

  /* ---------- list view ---------- */
  var listEl = document.getElementById('list');
  function renderList() {
    listEl.innerHTML = '';
    items.forEach(function (k) {
      var w = WK[k], fig = document.createElement('figure'); fig.className = 'xli';
      var b = card(k, 'xli__b'); hookCard(b);
      fig.appendChild(b);
      var cap = document.createElement('figcaption');
      cap.innerHTML = '<b></b><span></span>';
      cap.firstChild.textContent = w.t[L()];
      cap.lastChild.textContent = w.c || (w.anon ? t('anon') : t('free'));
      fig.appendChild(cap);
      listEl.appendChild(fig);
    });
  }
  function setView(v) {
    view = v;
    document.querySelectorAll('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'); });
    mapEl.hidden = v !== 'map'; listEl.hidden = v !== 'list'; hint.hidden = v !== 'map';
    root.classList.toggle('xp-list', v === 'list');
    if (v === 'list') renderList();
    try { history.replaceState(null, '', v === 'list' ? '#zoznam' : location.pathname + location.search); } catch (e) {}
  }
  document.querySelectorAll('[data-view]').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });

  function setCat(c) {
    cat = c;
    items = c === 'all' ? ALL.slice() : ALL.filter(function (k) { return WK[k].cat === c; });
    world.classList.remove('is-in');
    setTimeout(function () { ox = oy = 0; build(); }, reduce ? 0 : 220);
    applyLang();
  }

  /* ---------- detail ---------- */
  var lb = document.getElementById('lb'), stage = document.getElementById('lbStage');
  var lbKind = document.getElementById('lbKind'), lbTitle = document.getElementById('lbTitle');
  var lbText = document.getElementById('lbText'), lbClient = document.getElementById('lbClient');
  var cur = 0, slide = 0;
  function arrow(dir, fn) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'icon-btn glass lb__arrow lb__arrow--' + dir;
    b.setAttribute('aria-label', dir === 'l' ? t('prev') : t('next'));
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + (dir === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
    b.addEventListener('click', fn); return b;
  }
  function renderSet(w) {
    stage.innerHTML = '';
    var im = new Image(); im.className = 'lb__media'; im.src = w.slides[slide]; im.alt = w.t[L()]; stage.appendChild(im);
    stage.appendChild(arrow('l', function () { slide = (slide - 1 + w.slides.length) % w.slides.length; renderSet(w); }));
    stage.appendChild(arrow('r', function () { slide = (slide + 1) % w.slides.length; renderSet(w); }));
    var dots = document.createElement('div'); dots.className = 'lb__dots glass';
    w.slides.forEach(function (_, n) { var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', String(n + 1)); if (n === slide) d.setAttribute('aria-current', 'true'); d.addEventListener('click', function () { slide = n; renderSet(w); }); dots.appendChild(d); });
    stage.appendChild(dots);
  }
  function show(k) {
    var w = WK[k]; slide = 0;
    if (w.type === 'set') renderSet(w);
    else if (w.type === 'video') {
      stage.innerHTML = '';
      var v = document.createElement('video'); v.className = 'lb__media'; v.src = w.src; v.poster = w.poster; v.controls = true; v.playsInline = true; v.loop = true;
      stage.appendChild(v); if (!reduce) v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
    } else { stage.innerHTML = ''; var im = new Image(); im.className = 'lb__media'; im.src = w.src; im.alt = w.t[L()]; stage.appendChild(im); }
    lbKind.textContent = w.k[L()]; lbTitle.textContent = w.t[L()];
    lbClient.textContent = w.c ? t('client') + ': ' + w.c : (w.anon ? t('anon') : t('free'));
    lbText.textContent = w.x[L()];
  }
  function open(k) {
    cur = Math.max(0, items.indexOf(k)); show(k);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  }
  function step(d) { cur = (cur + d + items.length) % items.length; show(items[cur]); }
  document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { step(1); });
  document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  lb.addEventListener('close', function () { stage.innerHTML = ''; });
  var sx = 0, sy = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) lb.close();
  }, { passive: true });

  /* ---------- start ---------- */
  var HC = { '#posty': 'post', '#reelsy': 'reel', '#plagaty': 'poster', '#kampan': 'campaign' }[location.hash];
  if (HC) { cat = HC; items = ALL.filter(function (k) { return WK[k].cat === HC; }); }
  applyLang();
  build();
  if (location.hash === '#zoznam') setView('list');
  var rT = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(build, 200); });
})();
