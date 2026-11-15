(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var mouse = { x: innerWidth / 2, y: innerHeight * 0.4, active: false };

  /* liquid fill buttons: wrap the label, add the liquid layer */
  document.querySelectorAll('.btn').forEach(function (b) {
    var t = document.createElement('span'); t.className = 'btn__t';
    while (b.firstChild) t.appendChild(b.firstChild);
    var l = document.createElement('span'); l.className = 'btn__liquid'; l.setAttribute('aria-hidden', 'true');
    b.appendChild(l); b.appendChild(t);
  });

  /* =========================================================
     Liquid glass cursor: a lens that bends what is under it.
     The displacement map is drawn here, not loaded.
     ========================================================= */
  if (fine && !reduce) {
    root.classList.add('has-cursor');
    var cur = document.querySelector('.cursor');
    var lens = cur.querySelector('.cursor__lens');
    var spot = document.querySelector('.spot');

    var isChromium = !!window.chrome && /Chrome\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent);
    if (isChromium) {
      var S = 72, c = document.createElement('canvas');
      c.width = c.height = S;
      var g = c.getContext('2d'), img = g.createImageData(S, S);
      for (var y = 0; y < S; y++) {
        for (var x = 0; x < S; x++) {
          var nx = (x + 0.5) / S * 2 - 1, ny = (y + 0.5) / S * 2 - 1;
          var d = Math.sqrt(nx * nx + ny * ny), k = 0;
          if (d < 1) k = Math.pow(d, 2.4);
          var i4 = (y * S + x) * 4;
          img.data[i4] = 128 - 127 * nx * k;
          img.data[i4 + 1] = 128 - 127 * ny * k;
          img.data[i4 + 2] = 128;
          img.data[i4 + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      document.getElementById('lensMap').setAttribute('href', c.toDataURL());
      lens.style.backdropFilter = 'url(#lens) brightness(1.12) saturate(1.2)';
    }

    var cx = mouse.x, cy = mouse.y, sx = cx, sy = cy;
    addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; cur.classList.remove('is-out'); }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.add('is-out'); mouse.active = false; });
    addEventListener('mousedown', function () { cur.classList.add('is-down'); });
    addEventListener('mouseup', function () { cur.classList.remove('is-down'); });
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add(el.dataset.cursor === 'media' ? 'is-media' : 'is-link'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('is-media', 'is-link'); });
    });
    (function loop() {
      cx += (mouse.x - cx) * 0.2; cy += (mouse.y - cy) * 0.2;
      sx += (mouse.x - sx) * 0.06; sy += (mouse.y - sy) * 0.06;
      cur.style.translate = cx + 'px ' + cy + 'px';
      spot.style.translate = sx + 'px ' + sy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* =========================================================
     Hero halftone: a print-style dot screen, like a riso poster,
     that swells around the cursor.
     ========================================================= */
  var cv = document.getElementById('halftone'), ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), STEP = 16, heroOn = true;
  var cBlue = [86, 97, 255], cLav = [168, 143, 255], cMag = [255, 0, 109];
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function size() {
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener('resize', size);
  var hx = W / 2, hy = H * 0.35;
  function paint(t) {
    ctx.clearRect(0, 0, W, H);
    var rect = cv.getBoundingClientRect();
    var mx = mouse.active ? mouse.x - rect.left : W / 2 + Math.cos(t * 0.0004) * W * 0.25;
    var my = mouse.active ? mouse.y - rect.top : H * 0.4 + Math.sin(t * 0.0005) * H * 0.12;
    hx += (mx - hx) * 0.08; hy += (my - hy) * 0.08;
    for (var y = STEP / 2; y < H; y += STEP) {
      var fadeY = Math.max(0, 1 - y / (H * 0.95));
      for (var x = STEP / 2; x < W; x += STEP) {
        var wave = (Math.sin(x * 0.012 + t * 0.0008) + Math.cos(y * 0.016 - t * 0.0006)) * 0.25 + 0.5;
        var dx = x - hx, dy = y - hy, near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 260);
        var edge = Math.min(1, Math.abs(x - W / 2) / (W * 0.5) + 0.15);
        var r = (0.3 + wave * 2.1 * edge + near * near * 5.2) * fadeY;
        if (r < 0.35) continue;
        var tx = x / W, col = tx < 0.5 ? lerp(cBlue, cLav, tx * 2) : lerp(cLav, cMag, (tx - 0.5) * 2);
        ctx.fillStyle = 'rgba(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ',' + Math.min(0.9, 0.18 + r * 0.12 + near * 0.35).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }
    }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { heroOn = e[0].isIntersecting; }).observe(cv);
  if (reduce) paint(0); else (function tick(t) { if (heroOn) paint(t); requestAnimationFrame(tick); })(0);

  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });

  /* =========================================================
     Statement: each word lights up as the line passes the middle
     ========================================================= */
  var st = document.getElementById('statement'), words = [];
  function splitWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement('span'); s.className = 'wd'; s.textContent = p; frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else splitWords(n);
    });
    words = st.querySelectorAll('.wd');
  }
  if (st) splitWords(st);

  /* =========================================================
     Scroll scenes
     ========================================================= */
  var nav = document.getElementById('nav'), lastY = scrollY, navIdle = 0, sheetOpen = false;
  var dock = document.getElementById('dock'), cta = document.getElementById('kontakt');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  cards.forEach(function (c) { var s = document.createElement('div'); s.className = 'card__shade'; c.appendChild(s); });

  var morph = document.querySelector('.morph'), mList = document.querySelectorAll('#morphList li');
  var mFrame = document.getElementById('morphFrame'), mRatio = document.getElementById('morphRatio'), mUse = document.getElementById('morphUse');
  var RATIOS = { '916': 9 / 16, '45': 4 / 5, '11': 1, 'a': 1 / 1.414, '169': 16 / 9, '1610': 16 / 10 };
  var mIdx = -1;
  function setMorph(i) {
    if (i === mIdx) return; mIdx = i;
    var li = mList[i], r = RATIOS[li.dataset.ratio], x = 0, t = 0;
    if (r < 1) x = (1 - r) / 2 * 100; else t = (1 - 1 / r) / 2 * 100;
    mFrame.style.setProperty('--x', x.toFixed(2) + '%');
    mFrame.style.setProperty('--t', t.toFixed(2) + '%');
    mFrame.dataset.r = li.dataset.ratio;
    mRatio.textContent = li.dataset.name;
    mUse.textContent = li.dataset.use;
    mList.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
  }
  setMorph(0);

  var tl = document.querySelector('.timeline'), tc = document.getElementById('tc');
  var head = document.getElementById('playhead'), track = document.querySelector('.tl__track--v');
  var clips = document.querySelectorAll('.clip'), steps = document.querySelectorAll('#steps li');
  var STARTS = [0, 18, 40, 74];
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function progress(el) {
    var r = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  }

  function onScroll() {
    var y = scrollY;
    if (!sheetOpen) {
      if (y > lastY + 6 && y > 300) nav.classList.add('is-hidden');
      else if (y < lastY - 2 || y < 300) nav.classList.remove('is-hidden');
      clearTimeout(navIdle);
      navIdle = setTimeout(function () { nav.classList.remove('is-hidden'); }, 700);
    }
    lastY = y;
    dock.classList.toggle('is-on', y > innerHeight * 0.8 && cta.getBoundingClientRect().top > innerHeight * 0.7);

    // statement words
    if (st) {
      var r = st.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.3)));
      var lit = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
    }

    // stacking cards: the one underneath shrinks and darkens
    for (var k = 0; k < cards.length - 1; k++) {
      var next = cards[k + 1].getBoundingClientRect(), cur = cards[k].getBoundingClientRect();
      var q = Math.min(1, Math.max(0, 1 - (next.top - cur.top) / cur.height));
      if (reduce) q = 0;
      cards[k].style.transform = 'scale(' + (1 - q * 0.06).toFixed(4) + ')';
      cards[k].lastChild.style.opacity = (q * 0.55).toFixed(3);
    }

    // morphing format frame
    if (morph && mList.length) {
      var mp = progress(morph);
      setMorph(Math.min(mList.length - 1, Math.floor(mp * mList.length * 0.999)));
    }

    // edit timeline
    if (!tl) return;
    var tp = progress(tl);
    head.style.setProperty('--p', (tp * track.clientWidth) + 'px');
    var frames = Math.round(tp * 24 * 30), s = Math.floor(frames / 24), f = frames % 24;
    tc.textContent = '00:00:' + pad(s) + ':' + pad(f);
    var at = 0; for (var j = 0; j < STARTS.length; j++) if (tp * 100 >= STARTS[j]) at = j;
    clips.forEach(function (c, n) { c.classList.toggle('is-on', n === at); });
    steps.forEach(function (c, n) { c.classList.toggle('is-on', n === at); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* =========================================================
     One reveal, once
     ========================================================= */
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('is-in'); });

  /* =========================================================
     Detail of a work: every frame opens it, with the real media
     ========================================================= */
  var lb = document.getElementById('lb'), stage = document.getElementById('lbStage');
  var lbKind = document.getElementById('lbKind'), lbTitle = document.getElementById('lbTitle');
  var lbText = document.getElementById('lbText'), lbClient = document.getElementById('lbClient');
  var WK = window.WORKS || {};
  var group = [], at = 0, slide = 0, hadCursor = false;
  function L() { return lang === 'en' ? 1 : 0; }
  function arrowBtn(dir, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'icon-btn glass lb__arrow lb__arrow--' + dir;
    b.setAttribute('aria-label', dir === 'l' ? t('lb.prev') : t('lb.next'));
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + (dir === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
    b.addEventListener('click', fn);
    return b;
  }
  function renderSet(w) {
    stage.innerHTML = '';
    var img = new Image(); img.className = 'lb__media'; img.src = w.slides[slide]; img.alt = w.t[L()] + ' ' + (slide + 1);
    stage.appendChild(img);
    stage.appendChild(arrowBtn('l', function () { slide = (slide - 1 + w.slides.length) % w.slides.length; renderSet(w); }));
    stage.appendChild(arrowBtn('r', function () { slide = (slide + 1) % w.slides.length; renderSet(w); }));
    var dots = document.createElement('div'); dots.className = 'lb__dots glass';
    w.slides.forEach(function (_, n) {
      var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', String(n + 1));
      if (n === slide) d.setAttribute('aria-current', 'true');
      d.addEventListener('click', function () { slide = n; renderSet(w); });
      dots.appendChild(d);
    });
    stage.appendChild(dots);
  }
  function show(id) {
    var w = WK[id]; if (!w) return;
    slide = 0;
    if (w.type === 'set') renderSet(w);
    else if (w.type === 'video') {
      stage.innerHTML = '';
      var v = document.createElement('video');
      v.className = 'lb__media lb__media--v'; v.src = w.src; v.poster = w.poster;
      v.controls = true; v.playsInline = true; v.loop = true; v.autoplay = !reduce;
      stage.appendChild(v);
      if (!reduce) v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
    } else {
      stage.innerHTML = '';
      var im = new Image(); im.className = 'lb__media'; im.src = w.src; im.alt = w.t[L()];
      stage.appendChild(im);
    }
    lbKind.textContent = w.k[L()];
    lbTitle.textContent = w.t[L()];
    lbClient.hidden = false;
    lbClient.textContent = w.c ? t('lb.client') + ': ' + w.c : (w.anon ? t('anon') : t('free'));
    if (!w.c && id === 'showreel') lbClient.hidden = true;
    lbText.textContent = w.x[L()];
  }
  function openFrom(f) {
    var box = f.closest('.card__media') || f.closest('.hero__frames') || f.closest('.strip') || f.closest('.bd') || f.closest('.gallery');
    group = box ? Array.prototype.slice.call(box.querySelectorAll('button.frame')).filter(function (b) {
      var it = b.closest('.g-item'); return !(it && it.hidden);
    }) : [f];
    at = Math.max(0, group.indexOf(f));
    show(f.dataset.id);
    hadCursor = root.classList.contains('has-cursor');
    root.classList.remove('has-cursor');
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  }
  var frames = Array.prototype.slice.call(document.querySelectorAll('button.frame[data-id]'));
  frames.forEach(function (f) { f.addEventListener('click', function () { stopV(f); openFrom(f); }); });
  function step(d) { if (group.length < 2) return; at = (at + d + group.length) % group.length; show(group[at].dataset.id); }
  document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { step(1); });
  document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  lb.addEventListener('close', function () { stage.innerHTML = ''; if (hadCursor) root.classList.add('has-cursor'); var c = document.querySelector('.cursor'); if (c) c.classList.remove('is-media', 'is-link'); });

  /* videos in frames: load late, play on hover (mouse) or when centred (touch) */
  function loadV(v) { if (!v.src && v.dataset.src) v.src = v.dataset.src; }
  function playV(f) {
    var v = f.querySelector('.fm--v'); if (!v || reduce) return;
    loadV(v);
    v.play().then(function () { f.classList.add('is-playing'); }).catch(function () {});
  }
  function stopV(f) { var v = f.querySelector('.fm--v'); if (!v) return; v.pause(); f.classList.remove('is-playing'); }
  var vFrames = frames.filter(function (f) { return f.querySelector('.fm--v') && !f.classList.contains('showreel__frame') && !f.closest('.bd'); });
  if (fine) {
    vFrames.forEach(function (f) {
      f.addEventListener('mouseenter', function () { playV(f); });
      f.addEventListener('mouseleave', function () { stopV(f); });
    });
  } else if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? playV(e.target) : stopV(e.target); }); }, { threshold: 0.75 });
    vFrames.forEach(function (f) { vio.observe(f); });
  }
  var sr = document.querySelector('.showreel__frame');
  if (sr && 'IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? playV(sr) : stopV(sr); }, { threshold: 0.35 }).observe(sr);
  }

  /* all-work filter */
  var chips = document.querySelectorAll('.gallery-sec .chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var cat = c.dataset.filter;
      chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
      document.querySelectorAll('.g-item').forEach(function (it) {
        it.hidden = !(cat === 'all' || it.dataset.cat === cat);
        if (!it.hidden) it.classList.add('is-in');
      });
    });
  });

  /* =========================================================
     Contact form: sends to e-mail through FormSubmit
     ========================================================= */
  var form = document.getElementById('form'), msg = document.getElementById('formMsg');
  var TO = 'jozeflavko3@gmail.com';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form__msg'; msg.textContent = '';
    var ok = true;
    ['meno', 'email', 'sprava'].forEach(function (n) {
      var el = form.elements[n];
      var bad = !el.value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) ok = false;
    });
    if (!ok) { msg.classList.add('is-err'); msg.textContent = t('f.err.fill'); return; }
    if (form.elements._honey.value) return;
    var typ = Array.prototype.slice.call(form.querySelectorAll('input[name="typ"]:checked')).map(function (c) { return c.value; }).join(', ');
    var data = {
      meno: form.elements.meno.value.trim(),
      email: form.elements.email.value.trim(),
      potrebuje: typ || 'neuvedené',
      sprava: form.elements.sprava.value.trim(),
      _subject: 'Nová správa z portfólia od ' + form.elements.meno.value.trim(),
      _template: 'table',
      _captcha: 'false'
    };
    form.classList.add('is-sending');
    msg.textContent = t('f.sending');
    fetch('https://formsubmit.co/ajax/' + TO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res && (res.success === true || res.success === 'true')) {
        msg.classList.add('is-ok'); msg.textContent = t('f.ok');
        form.reset();
      } else throw new Error('fail');
    }).catch(function () {
      msg.classList.add('is-err');
      msg.textContent = t('f.err.send') + ' ' + TO + '.';
    }).then(function () { form.classList.remove('is-sending'); });
  });

  /* =========================================================
     Before / after slider
     ========================================================= */
  var ba = document.getElementById('ba'), baRange = document.getElementById('baRange');
  if (ba && baRange) {
    baRange.addEventListener('input', function () { ba.style.setProperty('--pos', baRange.value + '%'); });
  }

  /* =========================================================
     Slovak / English
     ========================================================= */
  var T = {
    sk: {
      'nav.work': 'Práce', 'nav.camp': 'Kampaň', 'nav.services': 'Čo robím', 'nav.reviews': 'Recenzie', 'nav.about': 'O mne', 'nav.cta': 'Napíšte mi',
      'hero.l1': 'Dizajn, ktorý nepreskrolujete.', 'hero.l2': 'A videá, ktoré dopozeráte.',
      'hero.lede': 'Som Jozef Lavko, grafický dizajnér a editor z Popradu. Navrhujem grafiku na sociálne siete, kampane a plagáty a strihám reelsy, videá a reklamy.',
      'hero.b1': 'Pozrieť práce', 'hero.b2': 'Pustiť showreel',
      'statement': 'Dobrý vizuál nestojí na jednom formáte. Stojí na nápade, ktorý funguje v mobile, na plagáte aj vo videu. Cieľ je vždy rovnaký: <em>aby si to ľudia všimli.</em>',
      'reel.note': 'Najlepšie strihy v jednom videu.', 'reel.play': 'Pustiť showreel',
      'reel.text': 'Sem príde váš showreel: 20 až 30 sekúnd najlepších strihov.',
      'work.h': 'Práce', 'work.note': 'Posty, reelsy a plagáty pre značky, agentúru a školu. Kliknite na ktorúkoľvek prácu.',
      'c1.h': 'Posty', 'c1.p': 'Posty, carousely a stories, ktoré držia jeden štýl naprieč celou značkou.',
      'c2.h': 'Reelsy', 'c2.p': 'Strih, titulky a pohyb. Krátke videá, ktoré ľudia dopozerajú aj bez zvuku.',
      'c3.h': 'Plagáty', 'c3.p': 'Pre tlač aj obrazovku, od typografie po finálny súbor.',
      'p.posts': 'Posty', 'p.carousels': 'Carousely', 'p.ads': 'Reklamy', 'p.edit': 'Strih', 'p.print': 'Tlač', 'p.type': 'Typografia', 'p.screen': 'Obrazovka',
      'ba.h': 'Pred a po', 'ba.note': 'Potiahnite posuvník a uvidíte, čo z podkladu urobím.', 'ba.raw': 'Surový záber', 'ba.done': 'Hotový výsledok',
      'svc.h': 'Čo robím',
      'svc.1h': 'Reelsy a reklamy', 'svc.1p': 'Krátke videá s rytmom, titulkami a pohybom, ktoré fungujú aj bez zvuku.', 'svc.1u': 'Reels, TikTok, reklamy',
      'svc.2h': 'Sociálne siete', 'svc.2p': 'Posty a kampane v jednom vizuálnom štýle.', 'svc.2u': 'Post do feedu',
      'svc.3h': 'Carousely', 'svc.3p': 'Príbeh na niekoľko slajdov, každý ťahá na ďalší.', 'svc.3u': 'Carousel',
      'svc.4h': 'Plagáty', 'svc.4p': 'Pre tlač aj obrazovku.', 'svc.4u': 'Tlač, plagát na stenu',
      'svc.5h': 'Videá', 'svc.5p': 'Upútavky, zostrihy a reklamné videá od nápadu po hotový strih.', 'svc.5u': 'YouTube, plátno, reklama',
      'proc.h': 'Postup',
      'proc.1h': 'Zadanie', 'proc.1p': 'Zistím, čo potrebujete, pre koho to je, dokedy a kde to pôjde von.',
      'proc.2h': 'Nápad', 'proc.2p': 'Navrhnem smer a jeden hlavný vizuál, na ktorom celý projekt stojí.',
      'proc.3h': 'Návrh a strih', 'proc.3p': 'Z neho pripravím grafiku aj video, aby všetko ladilo.',
      'proc.4h': 'Odovzdanie', 'proc.4p': 'Dostanete všetky formáty pripravené na zverejnenie.',
      'rev.h': 'Recenzie', 'rev.note': 'Čo hovoria ľudia, s ktorými som spolupracoval.',
      'rev1.text': 'Na Jozefovi si cením najmä jeho proaktivitu a samostatnosť. Je kreatívny a vždy prichádza s čerstvými nápadmi. Jeho štýl sa vyznačuje čistou estetikou. Čo je však dôležitejšie, za jeho prácou sú vidieť reálne výsledky, nielen pekné obrázky a videá. Ak hľadáte niekoho spoľahlivého, tvorivého a zapáleného pre vec, Jozefa môžem iba odporučiť.', 'rev1.name': 'J. Karasová', 'rev1.role': 'Nontoxic Brands With Soul',
      'rev2.text': 'Odkedy nám pán Lavko spravuje sociálne siete, máme permanentný nábeh sledovateľov a interakcií, čo nám prináša nových klientov. Jeho práca je svieža a plná nových nápadov.', 'rev2.name': 'R. Karas', 'rev2.role': 'Key Art Agency',
      'rev3.text': 'Práca s Jožkom je pre mňa vždy zárukou vizuálnej kvality. Grafický dizajn je jeho jednoznačná doména, má skvelé oko pre detail, zmysel pre estetiku a dokáže vymyslieť riešenia, ktoré majú nápad aj pevné základy. Veľmi si cením, že okrem talentu má aj pragmatický prístup a výbornú komunikáciu. Je to presne ten typ kolegu, o ktorého sa tím môže pri vizuálnej stránke projektov kedykoľvek oprieť.', 'rev3.name': 'Filip Rosina', 'rev3.role': 'Kolega',
      'about.h': 'O mne',
      'about.p1': 'Som Jozef Lavko, grafický dizajnér a editor z Popradu. Navrhujem grafiku na sociálne siete, kampane a plagáty a strihám reelsy, videá a reklamy.',
      'about.p2': 'Moje práce použili napríklad Nontoxic a agentúra Key Art. Beriem nové zákazky aj dlhodobú spoluprácu.',
      'about.p3': 'Popri tom robím aj weby, napríklad <a href="https://chcemvodicak.sostpoprad.sk" target="_blank" rel="noopener" data-cursor="link">ChcemVodicak</a>.',
      'about.study': 'Štúdium', 'about.studyv': 'Grafik digitálnych médií, SOŠ technická Poprad, 2024 – 2028', 'about.city': 'Mesto',
      'about.cv': 'Stiahnuť CV', 'about.photo': 'Vaša fotka',
      'menu': 'Menu', 'nav.contact': 'Kontakt', 'more.h': 'Ďalšie práce', 'more.all': 'Všetky práce', 'more.end': 'prác na mape. Ťahajte, klikajte, objavujte.', 'case.h': 'Jedna značka, každý formát', 'case.p': 'Gimber, zázvorový koncentrát z e-shopu Nontoxic. Rovnaká značka v reeloch, postoch aj na plagáte. Prepnite formát a pozrite sa.', 'pk.h': 'Spolupráca', 'pk.note': 'Tri spôsoby spolupráce. Cenu vám pripravím podľa rozsahu.', 'pk.1h': 'Sociálne siete na mesiac', 'pk.1p': 'Starám sa o vaše sociálne siete v jednom vizuálnom štýle.', 'pk.1a': 'Posty a carousely', 'pk.1b': 'Stories', 'pk.1c': 'Reelsy', 'pk.1d': 'Plán na celý mesiac', 'pk.2h': 'Kampaň', 'pk.2p': 'Jeden hlavný vizuál a z neho všetky formáty, ktoré kampaň potrebuje.', 'pk.2a': 'Kľúčový vizuál', 'pk.2b': 'Posty, stories a reel', 'pk.2c': 'Plagát alebo banner', 'pk.2d': 'Súbory pre každú platformu', 'pk.3h': 'Podujatie', 'pk.3p': 'Všetko, čo potrebujete, aby ľudia o vašej akcii vedeli.', 'pk.3a': 'Plagát do tlače', 'pk.3b': 'Posty a stories', 'pk.3c': 'Pozvánka vo videu', 'pk.3d': 'Zostrih po akcii', 'pk.cta': 'Napíšte mi, čo potrebujete', 'camp.h': 'Celá kampaň od jedného človeka', 'camp.p': 'Doplnky výživy Laveen pre e-shop Nontoxic. Dva koncepty, reklamy pre Metu aj Google a videá, všetko pripravené na spustenie.', 'camp.s1': 'koncepty', 'camp.s2': 'vizuálov', 'camp.s3': 'videí', 'camp.s4': 'platformy', 'camp.a': 'Produkt a zloženie', 'camp.b': 'Rodinný život', 'camp.all': 'Celá kampaň na mape', 'copy': 'Kopírovať', 'copied': 'E-mail skopírovaný', 'totop': 'Späť hore',
      'cl.h': 'Spolupracoval som s', 'anon': 'Klientska práca', 'gal.h': 'Všetky práce', 'gal.note': 'Kliknite na prácu a otvorí sa vo väčšom.', 'gal.all': 'Všetko', 'gal.social': 'Sociálne siete', 'gal.video': 'Videá', 'gal.poster': 'Plagáty', 'gal.school': 'Škola', 'gal.parish': 'Farnosť', 'free': 'Voľná tvorba', 'cta.call': 'Rezervovať 15 min hovor',
      'cta.h1': 'Máte projekt?', 'cta.h2': 'Napíšte mi.', 'cta.p': 'Grafika alebo video, zákazka alebo spolupráca. Pošlite pár viet a ozvem sa.',
      'f.name': 'Meno', 'f.email': 'E-mail', 'f.need': 'Čo potrebujete', 'f.msg': 'Správa', 'f.send': 'Odoslať správu',
      'f.c1': 'Sociálne siete', 'f.c2': 'Kampaň', 'f.c3': 'Plagát', 'f.c4': 'Reel alebo video', 'f.c5': 'Reklama', 'f.c6': 'Iné',
      'f.err.fill': 'Vyplňte meno, platný e-mail a správu.', 'f.sending': 'Odosielam…',
      'f.ok': 'Ďakujem, správa prišla. Ozvem sa vám.', 'f.gdpr': 'Údaje z formulára použijem len na odpoveď na vašu správu.', 'f.err.send': 'Správu sa nepodarilo odoslať. Napíšte mi priamo na',
      'foot.role': 'Grafický dizajnér a editor, Poprad', 'foot.site': 'Stránka', 'foot.contact': 'Kontakt',
      'dock': 'Beriem nové projekty',
      'lb.prev': 'Predošlá', 'lb.next': 'Ďalšia', 'lb.client': 'Klient',
      'lb.text': 'Sem príde vaša práca: obrázok alebo video, krátke zadanie a čo z toho vzniklo.',
      'title': 'Jozef Lavko, grafický dizajnér a editor'
    },
    en: {
      'nav.work': 'Work', 'nav.camp': 'Campaign', 'nav.services': 'Services', 'nav.reviews': 'Reviews', 'nav.about': 'About', 'nav.cta': 'Get in touch',
      'hero.l1': 'Design you won’t scroll past.', 'hero.l2': 'And videos you’ll watch to the end.',
      'hero.lede': 'I’m Jozef Lavko, a graphic designer and video editor from Poprad, Slovakia. I design social media graphics, campaigns and posters, and edit reels, videos and ads.',
      'hero.b1': 'See work', 'hero.b2': 'Play showreel',
      'statement': 'Good design doesn’t depend on one format. It depends on an idea that works on a phone, on a poster and in a video. The goal is always the same: <em>make people notice.</em>',
      'reel.note': 'My best edits in one video.', 'reel.play': 'Play showreel',
      'reel.text': 'Your showreel goes here: 20 to 30 seconds of your best edits.',
      'work.h': 'Work', 'work.note': 'Posts, reels and posters for brands, an agency and my school. Click any piece.',
      'c1.h': 'Posts', 'c1.p': 'Posts, carousels and stories that keep one style across the whole brand.',
      'c2.h': 'Reels', 'c2.p': 'Editing, captions and motion. Short videos people watch to the end, even on mute.',
      'c3.h': 'Posters', 'c3.p': 'For print and screen, from typography to the final file.',
      'p.posts': 'Posts', 'p.carousels': 'Carousels', 'p.ads': 'Ads', 'p.edit': 'Editing', 'p.print': 'Print', 'p.type': 'Typography', 'p.screen': 'Screen',
      'ba.h': 'Before and after', 'ba.note': 'Drag the slider to see what I make from the raw material.', 'ba.raw': 'Raw footage', 'ba.done': 'Final result',
      'svc.h': 'Services',
      'svc.1h': 'Reels and ads', 'svc.1p': 'Short videos with rhythm, captions and motion that work with the sound off.', 'svc.1u': 'Reels, TikTok, ads',
      'svc.2h': 'Social media', 'svc.2p': 'Posts and campaigns in one visual style.', 'svc.2u': 'Feed post',
      'svc.3h': 'Carousels', 'svc.3p': 'A story over several slides, each one pulling to the next.', 'svc.3u': 'Carousel',
      'svc.4h': 'Posters', 'svc.4p': 'For print and screen.', 'svc.4u': 'Print, wall poster',
      'svc.5h': 'Video', 'svc.5p': 'Trailers, edits and video ads, from idea to final cut.', 'svc.5u': 'YouTube, screen, ads',
      'proc.h': 'Process',
      'proc.1h': 'Brief', 'proc.1p': 'I find out what you need, who it is for, the deadline and where it will be published.',
      'proc.2h': 'Idea', 'proc.2p': 'I propose a direction and one key visual the whole project is built on.',
      'proc.3h': 'Design and edit', 'proc.3p': 'From it I create the graphics and video so everything fits together.',
      'proc.4h': 'Delivery', 'proc.4p': 'You get every format ready to publish.',
      'rev.h': 'Reviews', 'rev.note': 'What people I’ve worked with say. Translated from Slovak.',
      'rev1.text': 'What I value most about Jozef is his proactivity and independence. He is creative and always comes with fresh ideas. His style stands out for its clean aesthetic. More importantly, his work brings real results, not just nice pictures and videos. If you are looking for someone reliable, creative and passionate, I can only recommend Jozef.', 'rev1.name': 'J. Karasová', 'rev1.role': 'Nontoxic Brands With Soul',
      'rev2.text': 'Since Mr. Lavko has been running our social media, we have seen a steady rise in followers and engagement, which brings us new clients. His work is fresh and full of new ideas.', 'rev2.name': 'R. Karas', 'rev2.role': 'Key Art Agency',
      'rev3.text': 'Working with Jožko always guarantees visual quality for me. Graphic design is clearly his domain: he has a great eye for detail, a sense of aesthetics and comes up with solutions that have both an idea and solid foundations. I really value that besides talent he has a pragmatic approach and great communication. He is exactly the kind of colleague a team can always rely on for the visual side of projects.', 'rev3.name': 'Filip Rosina', 'rev3.role': 'Colleague',
      'about.h': 'About',
      'about.p1': 'I’m Jozef Lavko, a graphic designer and video editor from Poprad, Slovakia. I design social media graphics, campaigns and posters, and edit reels, videos and ads.',
      'about.p2': 'My work has been used by Nontoxic and the Key Art agency, among others. Open to new projects and long-term collaboration.',
      'about.p3': 'On the side I also build websites, such as <a href="https://chcemvodicak.sostpoprad.sk" target="_blank" rel="noopener" data-cursor="link">ChcemVodicak</a>.',
      'about.study': 'Studies', 'about.studyv': 'Digital Media Graphics, Secondary Technical School Poprad, 2024 – 2028', 'about.city': 'Based in',
      'about.cv': 'Download CV', 'about.photo': 'Your photo',
      'menu': 'Menu', 'nav.contact': 'Contact', 'more.h': 'More work', 'more.all': 'All work', 'more.end': 'pieces on the map. Drag, click, explore.', 'case.h': 'One brand, every format', 'case.p': 'Gimber, a ginger concentrate sold by Nontoxic. The same brand across reels, posts and a poster. Switch the format and see.', 'pk.h': 'Working together', 'pk.note': 'Three ways to work together. I will price it to the scope.', 'pk.1h': 'Social media, monthly', 'pk.1p': 'I take care of your social media in one visual style.', 'pk.1a': 'Posts and carousels', 'pk.1b': 'Stories', 'pk.1c': 'Reels', 'pk.1d': 'A plan for the whole month', 'pk.2h': 'Campaign', 'pk.2p': 'One key visual and every format the campaign needs.', 'pk.2a': 'Key visual', 'pk.2b': 'Posts, stories and a reel', 'pk.2c': 'Poster or banner', 'pk.2d': 'Files for every platform', 'pk.3h': 'Event', 'pk.3p': 'Everything you need so people know about your event.', 'pk.3a': 'Print poster', 'pk.3b': 'Posts and stories', 'pk.3c': 'Video invite', 'pk.3d': 'Recap edit after the event', 'pk.cta': 'Tell me what you need', 'camp.h': 'A whole campaign, one person', 'camp.p': 'Laveen supplements for the Nontoxic online store. Two concepts, ads for Meta and Google, and videos, all ready to launch.', 'camp.s1': 'concepts', 'camp.s2': 'visuals', 'camp.s3': 'videos', 'camp.s4': 'platforms', 'camp.a': 'Product and ingredients', 'camp.b': 'Family life', 'camp.all': 'The whole campaign on the map', 'copy': 'Copy', 'copied': 'Email copied', 'totop': 'Back to top',
      'cl.h': 'Worked with', 'anon': 'Client work', 'gal.h': 'All work', 'gal.note': 'Click any piece to open it larger.', 'gal.all': 'All', 'gal.social': 'Social media', 'gal.video': 'Video', 'gal.poster': 'Posters', 'gal.school': 'School', 'gal.parish': 'Parish', 'free': 'Personal work', 'cta.call': 'Book a 15-minute call',
      'cta.h1': 'Got a project?', 'cta.h2': 'Get in touch.', 'cta.p': 'Design or video, one-off or ongoing. Send a few lines and I’ll get back to you.',
      'f.name': 'Name', 'f.email': 'Email', 'f.need': 'What you need', 'f.msg': 'Message', 'f.send': 'Send message',
      'f.c1': 'Social media', 'f.c2': 'Campaign', 'f.c3': 'Poster', 'f.c4': 'Reel or video', 'f.c5': 'Ad', 'f.c6': 'Other',
      'f.err.fill': 'Please fill in your name, a valid email and a message.', 'f.sending': 'Sending…',
      'f.ok': 'Thanks, your message is in. I’ll be in touch.', 'f.gdpr': 'I only use the details from this form to reply to your message.', 'f.err.send': 'The message could not be sent. Write to me directly at',
      'foot.role': 'Graphic designer and video editor, Poprad', 'foot.site': 'Site', 'foot.contact': 'Contact',
      'dock': 'Taking new projects',
      'lb.prev': 'Previous', 'lb.next': 'Next', 'lb.client': 'Client',
      'lb.text': 'Your work goes here: an image or a video, a short brief and what came out of it.',
      'title': 'Jozef Lavko, graphic designer and video editor'
    }
  };
  var lang = 'sk';
  function t(k) { return (T[lang] && T[lang][k]) || T.sk[k] || ''; }
  function setText(el, v) {
    var inner = el.querySelector(':scope > .btn__t');
    (inner || el).textContent = v;
  }
  function setLang(l) {
    lang = T[l] ? l : 'sk';
    root.lang = lang;
    document.title = t('title');
    document.querySelectorAll('[data-i]').forEach(function (el) { setText(el, t(el.dataset.i)); });
    document.querySelectorAll('[data-ih]').forEach(function (el) { el.innerHTML = t(el.dataset.ih); });
    document.querySelectorAll('[data-wt]').forEach(function (el) { var w = WK[el.dataset.wt]; if (w) el.textContent = w.t[lang === 'en' ? 1 : 0]; });
    document.querySelectorAll('[data-wc]').forEach(function (el) { var w = WK[el.dataset.wc]; if (w && !w.c) el.textContent = w.anon ? t('anon') : t('free'); });
    splitWords(st);
    mList.forEach(function (li, n) { li.dataset.use = t('svc.' + (n + 1) + 'u'); });
    mIdx = -1; setMorph(Math.max(0, Array.prototype.findIndex.call(mList, function (li) { return li.classList.contains('is-on'); })));
    document.querySelectorAll('.lang__b').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    msg.textContent = '';
    try { localStorage.setItem('jl-lang', lang); } catch (e) {}
    onScroll();
  }
  document.querySelectorAll('.lang__b').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  var saved = null;
  try { saved = localStorage.getItem('jl-lang'); } catch (e) {}
  if (saved && saved !== 'sk') setLang(saved);


  /* =========================================================
     Frames: tilt toward the cursor with a moving glare
     ========================================================= */
  if (fine && !reduce) {
    document.querySelectorAll('button.frame').forEach(function (f) {
      var g = document.createElement('span'); g.className = 'glare'; f.appendChild(g);
      var big = !!f.closest('.hero__frames');
      var max = f.classList.contains('showreel__frame') ? 3 : (big ? 9 : 6);
      f.addEventListener('mouseenter', function () { f.classList.add('is-tilt'); });
      f.addEventListener('mousemove', function (e) {
        var r = f.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        f.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        f.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
        f.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        f.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      f.addEventListener('mouseleave', function () {
        f.classList.remove('is-tilt');
        f.style.setProperty('--rx', '0deg'); f.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* =========================================================
     v7: menu sheet, strip drag, format switcher, copy, swipe,
     peek, easter egg
     ========================================================= */
  var menuBtn = document.getElementById('menuBtn'), sheet = document.getElementById('sheet');
  function openSheet() {
    sheet.hidden = false; sheetOpen = true;
    requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    menuBtn.setAttribute('aria-expanded', 'true');
    nav.classList.remove('is-hidden');
    var first = sheet.querySelector('a'); if (first) first.focus({ preventScroll: true });
  }
  function closeSheet() {
    sheet.classList.remove('is-open'); sheetOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!sheetOpen) sheet.hidden = true; }, 350);
  }
  if (menuBtn && sheet) {
    menuBtn.addEventListener('click', function () { sheetOpen ? closeSheet() : openSheet(); });
    sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target.closest('a')) closeSheet(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetOpen) { closeSheet(); menuBtn.focus(); } });
  }

  /* strip: drag sideways with the mouse */
  var strip = document.getElementById('strip');
  if (strip && fine) {
    var sx0 = 0, sl0 = 0, down = false, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx0 = e.clientX; sl0 = strip.scrollLeft; });
    addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx0;
      if (Math.abs(dx) > 6) { moved = true; strip.classList.add('is-drag'); }
      if (moved) strip.scrollLeft = sl0 - dx;
    });
    addEventListener('mouseup', function () {
      if (!down) return; down = false;
      setTimeout(function () { strip.classList.remove('is-drag'); }, 0);
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  /* campaign: switch concept A / B, play what is on screen */
  var campTabs = document.querySelectorAll('.camp__tab'), boardWrap = document.querySelector('.camp__board'), campVisible = false;
  function boardFrames(c) { var bd = document.querySelector('.bd[data-c="' + c + '"]'); return bd ? Array.prototype.slice.call(bd.querySelectorAll('button.frame')) : []; }
  function campPlay() {
    var cur = (document.querySelector('.camp__tab[aria-pressed="true"]') || {}).dataset;
    ['a', 'b'].forEach(function (c) { boardFrames(c).forEach(function (f) { (campVisible && cur && cur.c === c) ? playV(f) : stopV(f); }); });
  }
  function setConcept(c) {
    campTabs.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === c ? 'true' : 'false'); });
    document.querySelectorAll('.bd').forEach(function (bd) {
      var on = bd.dataset.c === c;
      if (on) { bd.hidden = false; bd.classList.remove('is-in'); void bd.offsetWidth; bd.classList.add('is-in'); }
      else bd.hidden = true;
    });
    if (boardWrap) boardWrap.dataset.c = c;
    campPlay();
  }
  campTabs.forEach(function (b) { b.addEventListener('click', function () { setConcept(b.dataset.c); }); });
  if (boardWrap) {
    var firstBd = boardWrap.querySelector('.bd'); if (firstBd) firstBd.classList.add('is-in');
    boardWrap.dataset.c = 'a';
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (es) { campVisible = es[0].isIntersecting; campPlay(); }, { threshold: 0.25 }).observe(boardWrap);
    }
  }

  /* copy e-mail */
  var toast = document.createElement('div'); toast.className = 'toast glass'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  function say(msg) { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('is-on'); }, 1800); }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy;
      var done = function () { say(t('copied')); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done).catch(function () { fallbackCopy(v); done(); });
      else { fallbackCopy(v); done(); }
    });
  });
  function fallbackCopy(v) {
    var ta = document.createElement('textarea'); ta.value = v; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }

  /* detail: swipe sideways for next, swipe down to close */
  var tsx = 0, tsy = 0;
  lb.addEventListener('touchstart', function (e) { tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tsx, dy = e.changedTouches[0].clientY - tsy;
    if (e.target.closest('video') && Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) lb.close();
  }, { passive: true });

  /* peek: hold a finger on a work to see it big, let go to hide */
  if (!fine) {
    var peek = document.createElement('div'); peek.className = 'peek'; peek.setAttribute('aria-hidden', 'true'); document.body.appendChild(peek);
    var holdT = 0, peeking = false;
    document.querySelectorAll('button.frame[data-id]').forEach(function (f) {
      f.addEventListener('touchstart', function () {
        holdT = setTimeout(function () {
          var w = WK[f.dataset.id]; if (!w) return;
          peeking = true; peek.innerHTML = '';
          var el;
          if (w.type === 'video') { el = document.createElement('video'); el.src = w.src; el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = true; }
          else { el = new Image(); el.src = w.slides ? w.slides[0] : w.src; }
          peek.appendChild(el); peek.classList.add('is-on');
          if (navigator.vibrate) navigator.vibrate(10);
        }, 420);
      }, { passive: true });
      var end = function (e) {
        clearTimeout(holdT);
        if (peeking) { if (e && e.cancelable) e.preventDefault(); peek.classList.remove('is-on'); setTimeout(function () { peek.innerHTML = ''; }, 250); }
      };
      f.addEventListener('touchend', end);
      f.addEventListener('touchmove', function () { clearTimeout(holdT); }, { passive: true });
      f.addEventListener('click', function (e) { if (peeking) { peeking = false; e.preventDefault(); e.stopImmediatePropagation(); } }, true);
      f.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
  }

  /* easter egg: type "gimber" */
  var typed = '';
  addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    typed = (typed + (e.key || '')).slice(-6).toLowerCase();
    if (typed === 'gimber' && !reduce) {
      var rain = document.createElement('div'); rain.className = 'rain'; rain.setAttribute('aria-hidden', 'true');
      var pics = ['media/gimber-zima.webp', 'media/gimber-pernik.webp', 'media/gimber-plagat.webp', 'media/gimber-istota.webp', 'media/gimber-100.webp', 'media/gimber-chatgpt.webp'];
      for (var n = 0; n < 16; n++) {
        var im = new Image(); im.src = pics[n % pics.length]; im.alt = '';
        im.style.left = (Math.random() * 92) + 'vw';
        im.style.setProperty('--d', (1.8 + Math.random() * 1.6).toFixed(2) + 's');
        im.style.setProperty('--r', (Math.random() * 120 - 60).toFixed(0) + 'deg');
        im.style.animationDelay = (Math.random() * 0.8).toFixed(2) + 's';
        rain.appendChild(im);
      }
      document.body.appendChild(rain);
      say('Na zdravie!');
      setTimeout(function () { rain.remove(); }, 4200);
    }
  });

})();
