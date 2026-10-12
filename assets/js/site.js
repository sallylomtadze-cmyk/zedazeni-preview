/* ზედაზენი — site behaviour */
(function () {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } } };
  const Q = new URLSearchParams(location.search);
  const SHOT = Q.has('shot');
  const T = window.TR || (s => s);   // dictionary lookup on translated pages
  const hasG = !!(window.gsap && window.ScrollTrigger);
  const anim = hasG && !SHOT && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  if (!anim) root.classList.remove('js');
  if (SHOT) { root.classList.add('shot'); if (Q.has('chat')) root.classList.add('chat-shot'); root.classList.remove('need-gate'); if (Q.get('shot') === 'full') root.classList.add('shot-full'); }
  const E = 'expo.out';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const SIL = '<svg class="sil" viewBox="0 0 60 198" aria-hidden="true"><path d="M24 6h12v8h-1v40c0 14 14 20 14 40v92a6 6 0 0 1-6 6H17a6 6 0 0 1-6-6V94c0-20 14-26 14-40V14h-1z" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="M11 112h38M11 162h38" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>';

  /* ---------- header, menu, gate ---------- */
  const hd = $('.hd'); let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    if (hd) { hd.classList.toggle('compact', y > 24); hd.classList.toggle('hide', y > 600 && y > lastY + 4); }
    if (Math.abs(y - lastY) > 4) lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menu = $('.menu');
  const lock = on => { root.style.overflow = on ? 'hidden' : '' };
  if (menu) {
    $('.hd-burger').addEventListener('click', () => { menu.classList.add('open'); lock(true) });
    $('.menu-close').addEventListener('click', () => { menu.classList.remove('open'); lock(false) });
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { menu.classList.remove('open'); lock(false) } });
  }
  const gate = $('.gate');
  if (root.classList.contains('minor')) $$('[data-adult], a[href^="beer.html"]').forEach(el => el.remove());
  if (gate && root.classList.contains('need-gate')) {
    lock(true);
    const ins = $$('.yr input', gate), msg = $('.gate-msg', gate), now = new Date().getFullYear();
    const val = () => ins.map(i => i.value).join('');
    function submit() {
      const v = val(); if (!/^\d{4}$/.test(v)) { msg.textContent = T('შეიყვანეთ წელი ოთხი ციფრით.'); return; }
      const y = +v, age = now - y;
      if (y < 1900 || y > now) { msg.textContent = T('გთხოვთ, შეამოწმოთ წელი.'); ins.forEach(i => i.value = ''); ins[0].focus(); return; }
      if (age >= 18) { store.set('zage', '1'); root.classList.remove('need-gate'); lock(false); start(); }
      else { store.set('zage', 'soft'); location.href = 'soft-drinks.html'; }
    }
    ins.forEach((inp, k) => {
      inp.addEventListener('input', () => { const d = inp.value.replace(/\D/g, ''); msg.textContent = ''; if (d.length > 1) { let n = k; for (const ch of d) { if (!ins[n]) break; ins[n++].value = ch; } (ins[n] || ins[ins.length - 1]).focus(); } else { inp.value = d; if (d && ins[k + 1]) ins[k + 1].focus(); } if (val().length === 4) submit(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && ins[k - 1]) { ins[k - 1].focus(); ins[k - 1].value = ''; } });
      inp.addEventListener('paste', e => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4); if (t.length === 4) { e.preventDefault(); ins.forEach((i, n) => i.value = t[n]); submit(); } });
    });
    $('#gate-form').addEventListener('submit', e => { e.preventDefault(); submit(); });
    setTimeout(() => ins[0].focus(), 100);
  }

  /* ---------- reveals ---------- */
  function reveals(scope) {
    if (!anim) return;
    $$('.rv', scope).forEach(el => { if (el._rv) return; el._rv = 1; gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: E, delay: +(el.dataset.d || 0), scrollTrigger: { trigger: el, start: 'top 90%', once: true } }) });
    $$('.rvl', scope).forEach(el => { if (el._rv) return; el._rv = 1; gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', y: 40 }, { clipPath: 'inset(-10% 0 -10% 0)', y: 0, duration: 1.3, ease: E, delay: +(el.dataset.d || 0), scrollTrigger: { trigger: el, start: 'top 92%', once: true } }) });
    $$('[data-count]', scope).forEach(el => { if (el._c) return; el._c = 1; const end = +el.dataset.count, o = { v: 0 }, suf = el.dataset.suf || ''; gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate() { el.firstChild.nodeValue = Math.round(o.v) + suf } }) });
  }

  /* ---------- home hero slider ---------- */
  function hero() {
    const el = $('.hero'); if (!el) return;
    const slides = $$('.slide', el), thumbs = $$('.thumb', el), glow = $('.hero-glow', el), cnt = $('.cnt b', el);
    let i = 0, timer = null, busy = false;
    /* titles shrink until they fit their own column, so they can never run under the bottle */
    function fitTitles() {
      slides.forEach(sl => { const t = $('.s-title', sl), box = $('.s-left', sl); t.style.fontSize = ''; if (getComputedStyle(box).display === 'contents') return;
        let fs = parseFloat(getComputedStyle(t).fontSize), n = 0; while (t.offsetWidth > box.clientWidth + 1 && fs > 48 && n++ < 60) { fs -= 4; t.style.fontSize = fs + 'px'; } });
    }
    fitTitles(); let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fitTitles, 120) });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);
    function show(n, first) {
      n = (n + slides.length) % slides.length; if (n === i && !first) return; if (busy) return;
      const prev = slides[i], next = slides[n]; i = n;
      thumbs.forEach((t, k) => t.classList.toggle('on', k === n));
      if (cnt) cnt.textContent = String(n + 1).padStart(2, '0');
      glow.style.setProperty('--c', next.dataset.c);
      if (!anim) { slides.forEach(s => s.classList.toggle('on', s === next)); return; }
      busy = true;
      const inTl = () => {
        next.classList.add('on');
        gsap.set(next, { opacity: 1 });
        const tl = gsap.timeline({ onComplete() { busy = false } });
        tl.fromTo($$('.s-title span', next), { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: E, stagger: .09 }, 0)
          .fromTo($('.s-bottle img', next), { yPercent: 12, opacity: 0, rotate: -6 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.3, ease: E, transformOrigin: '50% 100%' }, .05)
          .fromTo([$('.tagl', next), $('.s-right', next), $('.s-left .btn', next)], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: E, stagger: .08 }, .25)
          .fromTo($('.s-num', next), { opacity: 0 }, { opacity: 1, duration: 1 }, .2);
      };
      if (first) { inTl(); return; }
      gsap.to(prev, { opacity: 0, duration: .35, ease: 'power2.in', onComplete() { prev.classList.remove('on'); inTl(); } });
    }
    const auto = () => { clearInterval(timer); if (anim) timer = setInterval(() => show(i + 1), 7500) };
    $('.h-prev', el).addEventListener('click', () => { show(i - 1); auto() });
    $('.h-next', el).addEventListener('click', () => { show(i + 1); auto() });
    thumbs.forEach((t, k) => t.addEventListener('click', () => { show(k); auto() }));
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : auto());
    slides.forEach(s => s.classList.remove('on'));
    show(+Q.get('slide') || 0, true); auto();
  }

  /* ---------- product stage + catalog ---------- */
  function products() {
    const st = $('.stage'); if (!st) return;
    const kind = st.dataset.kind, isBeer = kind === 'beer';
    const all = isBeer ? BEERS : SOFT, cats = isBeer ? BEER_CATS : SOFT_CATS;
    const hasPhoto = p => isBeer ? !!p.img : true;
    const items = all.filter(hasPhoto), rest = all.filter(p => !hasPhoto(p));
    let cur = 0, vi = 0, filter = 'all';
    const el = { kick: $('.st-kick', st), title: $('.st-title', st), desc: $('.st-desc', st), b: $('.st-b', st), r: $('.st-info', st), cnt: $('.st-nav .cnt', st), glow: $('.hero-glow', st), sizes: $('.st-sizes', st) };
    const grid = $('#grid'), fl = $('#filters'), count = $('#count');
    const catName = k => (cats.find(c => c[0] === k) || [])[1] || '';
    const first = p => isBeer ? p : p.v[0];
    const visual = (p, v) => {
      const img = isBeer ? p.img : v.img;
      return img ? `<img src="${img}" alt="${esc(p.n)}">` : '';
    };
    /* --- soft drinks: fruit and leaves around the bottle, rebuilt for every flavour --- */
    const fxBox = $('.fx', st), fxLayer = $('.fxl', st);
    // which sprites float around each bottle: [fruit and cut pieces], [leaves]
    const F = n => (window.ROOT || '') + 'assets/img/f/' + n + '.webp?v=3', GREEN = ['leaf', 'leaves'];
    const FX = {
      'lim-pear': [['pear', 'pear-half'], GREEN], 'lim0-pear': [['pear', 'pear-half'], GREEN], 'zeni-pear': [['pear', 'pear-half'], GREEN],
      'lim-saperavi': [['grapes', 'grapes-small'], GREEN], 'lim-tarragon': [['tarragon', 'tarragon2'], ['tarragon2', 'tarragon']], 'lim0-tarragon': [['tarragon', 'tarragon2'], ['tarragon2', 'tarragon']], 'zeni-tarragon': [['tarragon', 'tarragon2'], ['tarragon2', 'tarragon']],
      'lim-lemon': [['lemon', 'lemon-slice', 'lemon-wedge'], GREEN], 'lim-cream': [['cream'], []], 'lim-feijoa': [['feijoa-half', 'feijoa'], GREEN],
      'rc-lemon-lime': [['lemon-slice', 'lime', 'lemon-wedge'], GREEN], 'rc-orange': [['orange', 'orange-slice', 'mandarin'], GREEN], 'rc-mango': [['mango'], GREEN],
      'gurieli-peach': [['peach', 'peach-half'], GREEN], 'gurieli-raspberry': [['raspberry'], GREEN], 'gurieli-mint': [['mint'], ['mint']], 'gurieli-feijoa': [['feijoa-half', 'feijoa'], GREEN],
      'dilmah-peach': [['peach', 'peach-half'], GREEN], 'dilmah-raspberry': [['raspberry'], GREEN], 'dilmah-tropical': [['mango', 'passion', 'pineapple'], GREEN], 'dilmah-aloe': [[], GREEN],
      'cherow-lemon': [['lemon', 'lemon-slice', 'lemon-wedge'], GREEN], 'cherow-grapefruit': [['grapefruit-half', 'grapefruit-slice'], GREEN], 'cherow-strawberry': [['strawberry', 'strawberry-half'], GREEN], 'cherow-apple': [['apple', 'apple-wedge'], GREEN],
      'chero-apple': [['apple', 'apple-wedge'], GREEN], 'chero-cherry': [['cherries', 'apple-wedge', 'cherry'], GREEN], 'chero-pomegranate': [['pomegranate', 'pomegranate-wedge', 'pomegranate-seeds'], GREEN],
      'chero-orange': [['orange', 'mandarin', 'orange-slice'], GREEN], 'chero-multi': [['apple', 'orange-slice', 'peach-half', 'mango'], GREEN],
    };
    // slots: x, y (% of the stage from the bottle centre), size (vw), rotation, depth (px of parallax), blur, opacity
    const FRUIT = [[-13, -31, 8.2, -14, 34, 0, 1], [14, -36, 6, 18, 26, 0, 1], [17, 23, 7.6, 10, 38, 0, 1], [-15, 27, 5.6, -22, 24, 0, 1], [-33, 36, 4.2, 24, 16, 2, .7], [18, -34, 4.4, -12, 18, 2, .8], [6, -37, 3.4, 30, 12, 3, .6], [-6, 44, 3.6, -8, 12, 3, .6], [-41, -40, 5.4, 16, 8, 5, .4], [42, 40, 6, -20, 8, 5, .4]];
    const LEAF = [[-8, -35, 5.4, -34, 30, 0, 1], [10, -22, 4.6, 150, 28, 0, 1], [-16, 14, 4.6, 196, 22, 0, .95], [17, 3, 4, 38, 20, 1, .9], [9, 38, 5.2, -160, 30, 0, 1], [-10, 12, 3.4, 72, 14, 2, .7], [27, -31, 3.6, 110, 12, 3, .55], [-23, 44, 4, -70, 12, 3, .55], [36, -44, 4.4, 20, 8, 5, .35]];
    let fxKey = null;
    function fx(p, v, animate) {
      if (!fxBox) return;
      const name = (v.img.match(/\/p\/([^.]+)\./) || [])[1] || '', set = FX[name] || [[], []];
      const key = name in FX ? set[0].join() + '|' + set[1].join() : ''; if (key === fxKey) return; fxKey = key;
      const old = $$('.fz', fxBox);
      if (anim && old.length) gsap.to(old.map(o => o.firstChild), { scale: 0, opacity: 0, duration: .35, ease: 'power2.in', stagger: .012, onComplete: () => old.forEach(o => o.remove()) }); else old.forEach(o => o.remove());
      if (!key) return;
      const mk = (src, a, i) => `<span class="fz" style="--x:${a[0]};--y:${a[1]};--s:${a[2]};--r:${a[3]}deg;--d:${a[4]};--bl:${a[5]}px;--o:${a[6]};--f:${(5 + (i * 1.37) % 4).toFixed(2)}s;--fd:${(-(i * .83) % 5).toFixed(2)}s"><i><img src="${F(src)}" alt=""></i></span>`;
      const pick = (list, slots, off) => list.length ? slots.map((a, i) => mk(list[i % list.length], a, i + off)).join('') : '';
      const html = pick(set[0], FRUIT, 0) + pick(set[1], LEAF, 3);
      const tmp = document.createElement('div'); tmp.innerHTML = html; const fresh = [...tmp.children]; fresh.forEach(n => fxBox.appendChild(n));
      if (anim) {
        const r = fxLayer.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .56;
        fresh.forEach((n, i) => { const b = n.getBoundingClientRect();
          gsap.fromTo(n.firstChild, { x: cx - (b.left + b.width / 2), y: cy - (b.top + b.height / 2), scale: .1, opacity: 0, rotation: (i % 2 ? -1 : 1) * 140 },
            { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, duration: 1.25, ease: 'back.out(1.35)', delay: (animate ? .12 : .5) + i * .035 }) });
      }
    }
    if (fxLayer && anim) { let raf = 0; st.addEventListener('pointermove', e => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const r = st.getBoundingClientRect(); fxLayer.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); fxLayer.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)) }) }); }

    function fitTitle() {
      const t = el.title; t.style.fontSize = ''; let s = parseFloat(getComputedStyle(t).fontSize), n = 0;
      while (t.scrollWidth > t.clientWidth + 1 && s > 44 && n++ < 40) { s -= 4; t.style.fontSize = s + 'px'; }
    }
    function stage(animate) {
      const p = items[cur], v = isBeer ? p : p.v[vi];
      const c = (isBeer ? p.c : v.c) || p.c || '#CA9E67';
      el.glow.style.setProperty('--c', c); st.style.setProperty('--c', c); if (!isBeer) fx(p, v, animate);
      el.kick.textContent = p.k || catName(p.cat);
      el.title.textContent = p.n; fitTitle();
      el.desc.textContent = isBeer ? p.d : v.d;
      el.sizes.innerHTML = (p.sizes || []).map(s => `<span>${esc(s)}</span>`).join('');
      el.sizes.parentNode.style.display = (p.sizes || []).length ? '' : 'none';
      let h = '';
      if (isBeer) {
        const sp = [p.abv && [T('ალკოჰოლი'), p.abv], p.bu && [T('სიმწარე, BU'), p.bu], p.kcal && [T('კკალ / 100 მლ'), p.kcal]].filter(Boolean);
        if (sp.length) h += `<div class="specs" style="grid-template-columns:repeat(${sp.length},1fr)">${sp.map(([k, x]) => `<div><b>${esc(x)}</b><span>${k}</span></div>`).join('')}</div>`;
        h += `<h4>${T('სტილი')}</h4><p>${esc(p.style || '')}</p>`;
        if (p.ing) h += `<h4>${T('შემადგენლობა')}</h4><p>${esc(p.ing)}</p>`;
      } else {
        if (p.v.length > 1) h += `<h4 style="margin-top:0">${T('გემო')}</h4><div class="flv">${p.v.map((x, k) => `<button class="pill ${k === vi ? 'on' : ''} ${x.ic ? '' : 'noic'}" data-v="${k}">${x.ic ? `<img src="${x.ic}" alt="">` : ''}${esc(x.f)}</button>`).join('')}</div>`;
        if (v.ing) h += `<h4>${T('შემადგენლობა, 100 მლ')}</h4><p>${esc(v.ing)}</p>`;
      }
      el.r.innerHTML = h;
      $$('.flv .pill', el.r).forEach(b => b.addEventListener('click', () => { vi = +b.dataset.v; stage(true) }));
      el.cnt.innerHTML = `<b>${String(cur + 1).padStart(2, '0')}</b> / ${String(items.length).padStart(2, '0')}`;
      el.b.innerHTML = visual(p, v);
      $$('.pc', grid).forEach(c => c.classList.toggle('on', c.dataset.id === p.id));
      if (history.replaceState) history.replaceState(null, '', '#' + p.id);
      if (anim && animate) {
        gsap.fromTo(el.b.children, { yPercent: 8, opacity: 0, rotate: -4 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1, ease: E, transformOrigin: '50% 100%' });
        gsap.fromTo([el.kick, el.title, el.desc, el.r], { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: E, stagger: .06 });
      }
    }
    function select(id, scroll) {
      const k = items.findIndex(p => p.id === id); if (k < 0) return;
      cur = k; vi = 0; stage(true);
      if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function catalog() {
      const n = k => items.filter(p => k === 'all' || p.cat === k).length;
      fl.innerHTML = cats.map(([k, l]) => `<button class="pill ${filter === k ? 'on' : ''}" data-f="${k}">${l}<i>${n(k)}</i></button>`).join('');
      $$('.pill', fl).forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; catalog() }));
      const list = items.filter(p => filter === 'all' || p.cat === filter);
      count.textContent = list.length + T(' პროდუქტი');
      grid.innerHTML = list.map((p, k) => {
        const v = first(p), c = (isBeer ? p.c : v.c) || p.c;
        const meta = isBeer ? `${p.abv ? `<b>${p.abv}</b>` : ''}<span>${esc(p.style || '')}</span>` : `<span>${p.v.length > 1 ? p.v.length + T(' გემო') : esc(p.k)}</span><span class="fl">${p.v.filter(x => x.ic).slice(0, 6).map(x => `<img src="${x.ic}" alt="">`).join('')}</span>`;
        return `<button class="pc ${p.id === items[cur].id ? 'on' : ''}" data-id="${p.id}" style="--c:${c};animation-delay:${k * 35}ms">${p.isNew ? '<span class="badge">' + T('ახალი') + '</span>' : ''}<div class="pc-img">${visual(p, v)}</div><div class="pc-b"><span class="kick">${esc(catName(p.cat))}</span><h4>${esc(p.n)}</h4><p>${esc(p.s || '')}</p><div class="pc-m">${meta}</div></div></button>`;
      }).join('');
      $$('.pc', grid).forEach(b => b.addEventListener('click', () => select(b.dataset.id, true)));
      if (hasG) ScrollTrigger.refresh();
    }
    $('.st-prev', st).addEventListener('click', () => { cur = (cur - 1 + items.length) % items.length; vi = 0; stage(true) });
    $('.st-next', st).addEventListener('click', () => { cur = (cur + 1) % items.length; vi = 0; stage(true) });
    addEventListener('resize', () => { clearTimeout(products._t); products._t = setTimeout(fitTitle, 150) });
    const more = $('#more');
    if (more) {
      if (rest.length) more.innerHTML = `<div class="more-c head"><span class="kick">${rest.length}${T(' ბრენდი')}</span><h3>${T('ასევე<br>პორტფელში')}</h3><p>${T('იმპორტირებული და ჩამოსასხმელი ბრენდები, რომლებსაც ზედაზენი აწარმოებს ან წარმოადგენს.')}</p></div>` + rest.map(p => `<div class="more-c" id="${p.id}"><div class="more-lg">${p.logo ? `<img src="${p.logo}" alt="${esc(p.n)}" loading="lazy">` : `<span class="wm">${esc(p.n)}</span>`}</div><span class="kick">${esc(p.k || '')}</span><b>${esc([p.style, p.abv].filter(Boolean).join(' · '))}</b><p>${esc(p.s || '')}</p></div>`).join('');
      else more.remove();
    }
    const h = decodeURIComponent(location.hash.slice(1)); const k = items.findIndex(p => p.id === h); if (k >= 0) cur = k;
    const jump = rest.find(p => p.id === h);
    if (Q.get('p')) { const kk = items.findIndex(p => p.id === Q.get('p')); if (kk >= 0) cur = kk; }
    catalog(); stage(false);
    if (jump) setTimeout(() => { const t = document.getElementById(jump.id); if (t) { history.replaceState(null, '', '#' + jump.id); t.classList.add('hl'); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 140, behavior: 'instant' }); } }, 120);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);
  }

  /* ---------- roadmap ---------- */
  function road() {
    const el = $('.road'); if (!el) return;
    const track = $('.road-track', el), ms = $$('.ms', el), svg = $('svg.curve', el), base = $('.base', el), lit = $('.lit', el), bar = $('.road-ui .bar i', el);
    const desk = matchMedia('(min-width: 1001px)');
    let xs = [], lens = [], L = 0, W = 0;
    function layout() {
      if (!desk.matches) { ms.forEach(m => { m.classList.add('on'); m.style.left = m.style.top = '' }); track.style.width = ''; return false; }
      const H = track.clientHeight, step = 330, pad = 220, n = ms.length;
      W = pad * 2 + (n - 1) * step; track.style.width = W + 'px';
      const pts = ms.map((m, i) => [pad + i * step, H * (.5 + Math.sin(i * 1.05) * .13 - (i / (n - 1) - .5) * .1)]);
      ms.forEach((m, i) => { m.style.left = pts[i][0] + 'px'; m.style.top = pts[i][1] + 'px'; m.classList.toggle('up', i % 2 === 1) });
      const all = [[0, pts[0][1] + 30], ...pts, [W, pts[n - 1][1] - 30]];
      let d = `M${all[0][0]},${all[0][1]}`;
      for (let i = 0; i < all.length - 1; i++) {
        const p0 = all[Math.max(0, i - 1)], p1 = all[i], p2 = all[i + 1], p3 = all[Math.min(all.length - 1, i + 2)];
        d += `C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
      }
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      base.setAttribute('d', d); lit.setAttribute('d', d);
      L = lit.getTotalLength(); lit.style.strokeDasharray = L; xs = pts.map(p => p[0]);
      lens = xs.map(x => { let a = 0, b = L; for (let k = 0; k < 22; k++) { const mid = (a + b) / 2; lit.getPointAtLength(mid).x < x ? a = mid : b = mid } return a });
      return true;
    }
    function head(x) {
      if (x <= xs[0]) return lens[0] * x / xs[0];
      for (let i = 0; i < xs.length - 1; i++) if (x <= xs[i + 1]) return lens[i] + (lens[i + 1] - lens[i]) * (x - xs[i]) / (xs[i + 1] - xs[i]);
      return L;
    }
    function paint(shift) {
      const pr = Math.min(1, shift / Math.max(1, W - innerWidth));
      const hx = Math.min(W, shift + innerWidth * (.5 + .5 * pr));
      lit.style.strokeDashoffset = L - head(hx);
      ms.forEach((m, i) => m.classList.toggle('on', xs[i] <= hx + 2));
      if (bar) bar.style.transform = `scaleX(${pr})`;
    }
    if (!layout() || !anim) {
      if (desk.matches) { el.style.overflowX = 'auto'; lit.style.strokeDashoffset = 0; ms.forEach(m => m.classList.add('on')) }
      return;
    }
    const dist = () => Math.max(0, W - innerWidth);
    paint(0);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1001px)', () => {
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .5, invalidateOnRefresh: true, anticipatePin: 1, onRefresh() { layout() }, onUpdate(s) { paint(s.progress * dist()) } } });
      return () => { gsap.set(track, { clearProps: 'transform' }) };
    });
    desk.addEventListener('change', () => { layout(); ScrollTrigger.refresh() });
  }

  /* ---------- maps ---------- */
  function maps() {
    $$('.mapbox').forEach(box => {
      const svg = $('svg.map', box), card = $('.mcard', box), dots = $$('.dot', box), rows = $$('.rg[data-k]', box.closest('.sec') || document);
      let cur = null;
      function open(d) {
        if (cur) cur.classList.remove('on'); cur = d; d.classList.add('on');
        rows.forEach(r => r.classList.toggle('on', r.dataset.k === d.dataset.k));
        if (!card) return;
        $('h4', card).textContent = d.dataset.t; $('p', card).textContent = d.dataset.p || ''; $('small', card).textContent = d.dataset.s || '';
        const im = $('img', card); if (d.dataset.img) { im.src = d.dataset.img; im.style.display = '' } else im.style.display = 'none';
        card.classList.toggle('noimg', !d.dataset.img);
        const b = box.getBoundingClientRect(), c = d.getBoundingClientRect();
        let x = c.left - b.left + c.width / 2 + 22, y = c.top - b.top - 40;
        const cw = card.offsetWidth, ch = card.offsetHeight;
        if (x + cw > b.width) x = c.left - b.left - cw - 16;
        if (x < 0) x = Math.max(0, (b.width - cw) / 2);
        y = Math.max(d.dataset.img ? 70 : 0, Math.min(b.height - ch, y));
        card.style.left = x + 'px'; card.style.top = y + 'px'; card.classList.add('on');
      }
      dots.forEach(d => { d.addEventListener('pointerenter', () => open(d)); d.addEventListener('click', () => open(d)); d.setAttribute('tabindex', '0'); d.addEventListener('focus', () => open(d)); });
      rows.forEach(r => r.addEventListener('pointerenter', () => { const d = dots.find(x => x.dataset.k === r.dataset.k); if (d) open(d) }));
      const init = dots.find(d => d.dataset.init); if (init) { if (anim) ScrollTrigger.create({ trigger: box, start: 'top 70%', once: true, onEnter: () => open(init) }); else open(init); }
      if (anim) gsap.from(dots, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: .8, ease: 'back.out(2)', stagger: .04, scrollTrigger: { trigger: box, start: 'top 80%', once: true } });
    });
  }

  /* story hero: a living liquid surface. Three slow sine layers, a slosh that settles after the pour, a ripple under the pointer.
     The same curve clips the liquid (so the gold year follows the surface) and draws the highlight line. */
  { const pour = $('.pour');
    if (pour) {
      const body = $('.pour-body', pour), line = $('.surf .line', pour), glow = $('.surf .glow', pour), host = pour.closest('.sth');
      const PAD = 56, STEP = 14; let W = 0, px = -9999, energy = 0, t0 = 0, on = true;
      const size = () => { W = pour.clientWidth };
      const draw = now => {
        const t = t0 ? (now - t0) / 1000 : 30, slosh = 1 + 2.1 * Math.exp(-t / 1.15); energy *= .965;
        let poly = '', d = '';
        for (let x = 0; x <= W + STEP; x += STEP) {
          let y = PAD + slosh * (6.5 * Math.sin(x * .0052 + t * .9) + 4.2 * Math.sin(x * .0113 - t * 1.35) + 2.2 * Math.sin(x * .0231 + t * 2.1));
          if (energy > .01) { const k = (x - px) / 130; y -= energy * 13 * Math.exp(-k * k) * Math.cos((x - px) / 36 - t * 7); }
          y = Math.max(2, y); poly += x + 'px ' + y.toFixed(1) + 'px,'; d += (d ? 'L' : 'M') + x + ' ' + y.toFixed(1);
        }
        body.style.clipPath = 'polygon(' + poly + '100% 100%,0 100%)'; line.setAttribute('d', d); glow.setAttribute('d', d);
      };
      // "15 წელი": the number counts up 1 -> 15 in place (fixed cells, the tens cell stays empty below 10)
      if (anim) { const yrs = $$('.yr', host), set = n => yrs.forEach(y => { const c = y.children; c[0].textContent = n > 9 ? String(n)[0] : ''; c[1].textContent = String(n % 10) }), o = { v: 1 };
        set(1); gsap.to(yrs, { opacity: 1, duration: .7 }); gsap.to(o, { v: 15, duration: 2.4, delay: .4, ease: 'power2.out', snap: { v: 1 }, onUpdate: () => set(o.v) }); }
      else $$('.yr', host).forEach(y => { y.style.opacity = 1 });
      size(); addEventListener('resize', () => { size(); if (!anim) draw(0) });
      if (!anim) draw(0);
      else {
        const loop = now => { if (!t0) t0 = now; if (on) draw(now); requestAnimationFrame(loop) };
        requestAnimationFrame(loop);
        new IntersectionObserver(e => { on = e[0].isIntersecting }).observe(host);
        host.addEventListener('pointermove', e => { const r = pour.getBoundingClientRect(); if (Math.abs(e.clientY - (r.top + PAD)) < 90) { px = e.clientX - r.left; energy = Math.min(1, energy + .25) } });
        const h0 = matchMedia('(max-width:700px)').matches ? '38%' : '41%';   // explicit start: the CSS pour-in is still running when this is set up
        gsap.fromTo(pour, { height: h0 }, { height: '82%', ease: 'none', scrollTrigger: { trigger: '.sth', start: 'top top', end: 'bottom top', scrub: .6 } });
      }
    } }

  /* story: the marker climbs the golden line while the depth counts down and the steps light up */
  { const src = $('.src');
    if (src) { const fig = $('.src-fig', src), num = $('.src-depth b', src), steps = $$('.src-steps li', src), A = 85.2, B = 0.9;
      const set = p => { fig.style.setProperty('--t', (A + (B - A) * p).toFixed(2) + '%'); num.textContent = Math.round(150 * (1 - p)); const k = Math.min(2, Math.floor(p * 3)); steps.forEach((li, i) => li.classList.toggle('on', i <= k)) };
      if (anim && matchMedia('(min-width:901px)').matches) ScrollTrigger.create({ trigger: src, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: t => set(t.progress) });
      else { if (!anim) root.classList.add('no-pin'); set(1) } } }

  /* buttons: wrap the label so it can roll on hover */
  $$('.btn').forEach(b => { const t = b.textContent.trim(); if (!t || b.querySelector('.bt')) return; const s = document.createElement('span'); s.className = 'bt'; s.dataset.t = t; const i = document.createElement('b'); i.textContent = t; s.appendChild(i); b.textContent = ''; b.appendChild(s); });

  /* long product copy is clamped on phones; tap to read it all */
  document.addEventListener('click', e => { const d = e.target.closest('.st-desc'); if (d) d.classList.toggle('open'); });

  /* ---------- simple filter groups (news) ---------- */
  $$('[data-fgroup]').forEach(g => {
    const target = document.getElementById(g.dataset.fgroup), pills = $$('.pill', g);
    pills.forEach(b => b.addEventListener('click', () => {
      pills.forEach(x => x.classList.toggle('on', x === b));
      $$('[data-cat]', target).forEach(c => { c.style.display = (b.dataset.f === 'all' || c.dataset.cat === b.dataset.f) ? '' : 'none' });
      if (hasG) ScrollTrigger.refresh();
    }));
  });

  /* ---------- contact form ---------- */
  const form = $('#form');
  if (form) form.addEventListener('submit', e => { e.preventDefault(); const f = new FormData(form); location.href = `mailto:info@zedazeni.ge?subject=${encodeURIComponent(f.get('topic') + ' | ' + f.get('name'))}&body=${encodeURIComponent(f.get('msg') + '\n\n' + f.get('email'))}`; });

  /* ---------- boot ---------- */
  let started = false;
  function start() {
    if (started) return; started = true;
    hero(); products(); road(); maps(); reveals(document);
    if (anim) {
      $$('[data-par]').forEach(el => gsap.to(el, { yPercent: +el.dataset.par, ease: 'none', scrollTrigger: { trigger: el.closest('.sec,.ph,.ft') || el, start: 'top bottom', end: 'bottom top', scrub: true } }));
      const intro = $$('.ph .in'); if (intro.length) gsap.fromTo(intro, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: E, stagger: .1, delay: .1 });
      ScrollTrigger.sort(); ScrollTrigger.refresh();   // triggers made before the roadmap pin (story scenes) must be measured after it
    }
    if (SHOT) { const id = Q.get('shot'); const t = id && document.getElementById(id); if (t) setTimeout(() => window.scrollTo({ top: t.getBoundingClientRect().top + scrollY + (+Q.get('dy') || 0), behavior: 'instant' }), 50); if (Q.has('menu') && menu) menu.classList.add('open'); }
  }
  window.__ok = 1;
  if (!root.classList.contains('need-gate')) start();
})();
