(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSheetLayout = () => !matchMedia('(min-width: 640px)').matches;

  /* ================= mascote ================= */

  const EAR = '<path d="M-16 6C-22-34-16-80 0-90C16-80 22-34 16 6Z" fill="url(#mEar)"/>' +
              '<path d="M-6-8C-9-36-6-66 0-76C6-66 9-36 6-8Z" fill="url(#mEarIn)"/>';
  const BODY = 'M100 62C144 62 171 96 171 140C171 181 140 205 100 205C60 205 29 181 29 140C29 96 56 62 100 62Z';

  function mimoMarkup({ peek = false, paws = peek } = {}) {
    return `
<svg class="mimo" viewBox="0 -12 200 232" aria-hidden="true" focusable="false">
  <g transform="translate(76 88)"><g class="m-ear m-ear-l">${EAR}</g></g>
  <g transform="translate(124 88)"><g class="m-ear m-ear-r">${EAR}</g></g>
  <g class="m-core"${peek ? ' clip-path="url(#mPeekClip)"' : ''}>
    <ellipse cx="78" cy="203" rx="16" ry="9" fill="#1b0b24"/>
    <ellipse cx="122" cy="203" rx="16" ry="9" fill="#1b0b24"/>
    <path d="${BODY}" fill="url(#mBody)"/>
    <path d="${BODY}" fill="url(#mRim)"/>
    <ellipse cx="68" cy="96" rx="21" ry="10" fill="#fff" opacity=".08" transform="rotate(-32 68 96)"/>
    <ellipse class="m-cheek" cx="61" cy="160" rx="12" ry="7"/>
    <ellipse class="m-cheek" cx="139" cy="160" rx="12" ry="7"/>
    <g class="m-look" filter="url(#mGlow)">
      <ellipse class="m-eye" cx="80" cy="136" rx="10.5" ry="15.5"/>
      <ellipse class="m-eye" cx="120" cy="136" rx="10.5" ry="15.5"/>
      <path class="m-happy" d="M69 141Q80 125 91 141M109 141Q120 125 131 141"/>
    </g>
    <path class="m-nose" d="M95.5 157.5Q100 153.5 104.5 157.5Q102.4 162 100 162Q97.6 162 95.5 157.5Z"/>
    <path class="m-mouth" d="M92 166Q100 174 108 166"/>
  </g>${paws ? `
  <g class="m-paw m-paw-l"><ellipse cx="64" cy="176" rx="15" ry="11"/></g>
  <g class="m-paw m-paw-r"><ellipse cx="136" cy="176" rx="15" ry="11"/></g>` : ''}
</svg>`;
  }

  class Mimo {
    constructor(host, opts) {
      host.innerHTML = mimoMarkup(opts);
      this.svg = host.firstElementChild;
      this.look = $('.m-look', this.svg);
      this.cur = { x: 0, y: 0 };
      this.tgt = { x: 0, y: 0 };
      this.state = 'idle';
      this.svg.dataset.state = 'idle';
      this.blinkLoop();
      this.twitchLoop();
    }
    set(state) {
      this.state = state;
      this.svg.dataset.state = state;
    }
    lookAt(px, py, range = 260) {
      const r = this.svg.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.62);
      const d = Math.hypot(dx, dy) || 1;
      const f = Math.min(1, d / range);
      this.tgt.x = (dx / d) * 9 * f;
      this.tgt.y = (dy / d) * 7 * f;
    }
    lookDir(x, y) { this.tgt.x = x; this.tgt.y = y; }
    step() {
      this.cur.x += (this.tgt.x - this.cur.x) * 0.16;
      this.cur.y += (this.tgt.y - this.cur.y) * 0.16;
      this.look.setAttribute('transform', `translate(${this.cur.x.toFixed(2)} ${this.cur.y.toFixed(2)})`);
    }
    blink() {
      if (this.state === 'sleep' || this.state === 'happy') return;
      this.svg.classList.add('is-blink');
      setTimeout(() => this.svg.classList.remove('is-blink'), 130);
    }
    blinkLoop() {
      setTimeout(() => {
        this.blink();
        if (Math.random() < 0.25) setTimeout(() => this.blink(), 250);
        this.blinkLoop();
      }, rand(2200, 5200));
    }
    twitchLoop() {
      setTimeout(() => {
        if (this.state === 'idle') this.wiggle(Math.random() < 0.5 ? 'l' : 'r');
        this.twitchLoop();
      }, rand(4500, 9000));
    }
    wiggle(side) {
      const cls = side ? `wig-${side}` : 'wig';
      this.svg.classList.remove(cls);
      this.svg.getBoundingClientRect();
      this.svg.classList.add(cls);
      setTimeout(() => this.svg.classList.remove(cls), 800);
    }
    blush(ms = 1400) {
      this.svg.classList.add('is-blush');
      clearTimeout(this._blush);
      this._blush = setTimeout(() => this.svg.classList.remove('is-blush'), ms);
    }
  }

  /* ================= efeitos ================= */

  function restart(el, cls) {
    el.classList.remove(cls);
    el.getBoundingClientRect();
    el.classList.add(cls);
    el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
  }

  const COLORS = ['#ff7fb8', '#b79cff', '#ffa8d4', '#9b7cf6', '#ffc2a8'];
  function burst(host, x, y, n = 8, spread = 1) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const dist = rand(70, 150) * spread;
      p.className = 'p';
      p.innerHTML = `<svg viewBox="0 0 24 24"><use href="#${Math.random() < 0.35 ? 'spark' : 'heart'}"/></svg>`;
      p.style.cssText =
        `left:${x}px;top:${y}px;color:${COLORS[i % COLORS.length]};` +
        `--dx:${(Math.cos(a) * dist).toFixed(1)}px;--dy:${(Math.sin(a) * dist).toFixed(1)}px;` +
        `--r:${rand(-60, 60).toFixed(0)}deg;--sc:${rand(0.6, 1.25).toFixed(2)};animation-delay:${i * 18}ms`;
      host.appendChild(p);
      p.addEventListener('animationend', () => p.remove(), { once: true });
    }
  }

  /* ================= hero ================= */

  const hero = $('#hero');
  const stage = $('#stage');
  const dragEl = $('#mimoDrag');
  const squishEl = $('#mimoSquish');
  const fx = $('#fx');
  const bubble = $('#bubble');
  const hint = $('#hint');
  const brand = $('#brand');
  const heroMimo = new Mimo($('#heroMimo'));

  // fala da mascote
  const POKE = ['oi, sumida! 💜', 'ai, cócegas!', 'me conta do seu dia?', 'manda um áudio?', 'de novo! de novo!', 'psiu… entra na lista', 'guardei isso ✦'];
  const FLING = ['uiii!', 'weeee!', 'me solta, doida 😂', 'que voltaaa'];
  let pokeN = 0, flingN = 0, sayTimer;

  function say(text, ms = 2100) {
    bubble.textContent = text;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  let hintDone = false;
  function hideHint() {
    if (hintDone) return;
    hintDone = true;
    hint.classList.add('gone');
  }

  function mimoCenter() {
    const s = stage.getBoundingClientRect();
    const m = dragEl.getBoundingClientRect();
    return { x: m.left - s.left + m.width / 2, y: m.top - s.top + m.height * 0.42 };
  }

  let moodTimer;
  function mood(state, ms) {
    clearTimeout(moodTimer);
    heroMimo.set(state);
    if (ms) moodTimer = setTimeout(() => heroMimo.state === state && heroMimo.set('idle'), ms);
  }

  function poke() {
    hideHint();
    wake(true);
    restart(squishEl, 'squish');
    heroMimo.blush();
    heroMimo.wiggle();
    mood('happy', 950);
    const c = mimoCenter();
    burst(fx, c.x, c.y - 20, 8);
    say(POKE[pokeN++ % POKE.length]);
  }

  // arrastar com mola
  const sp = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, on: false, moved: false, sx: 0, sy: 0 };

  dragEl.addEventListener('pointerdown', (e) => {
    sp.on = true;
    sp.moved = false;
    sp.sx = e.clientX;
    sp.sy = e.clientY;
    dragEl.setPointerCapture(e.pointerId);
    dragEl.classList.add('grabbing');
  });
  dragEl.addEventListener('pointermove', (e) => {
    if (!sp.on) return;
    const dx = e.clientX - sp.sx, dy = e.clientY - sp.sy;
    if (!sp.moved && Math.hypot(dx, dy) > 8) {
      sp.moved = true;
      hideHint();
      mood('surprised');
    }
    if (sp.moved) {
      sp.tx = 150 * Math.tanh(dx / 190);
      sp.ty = 130 * Math.tanh(dy / 170);
    }
  });
  const release = () => {
    if (!sp.on) return;
    sp.on = false;
    sp.tx = sp.ty = 0;
    dragEl.classList.remove('grabbing');
    if (!sp.moved) return poke();
    mood('happy', 700);
    heroMimo.wiggle();
    say(FLING[flingN++ % FLING.length], 1500);
  };
  dragEl.addEventListener('pointerup', release);
  dragEl.addEventListener('pointercancel', release);
  dragEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
  });

  brand.addEventListener('click', () => {
    if (!brand.classList.contains('settled')) return;
    brand.classList.remove('wave');
    void brand.offsetWidth;
    brand.classList.add('wave');
    heroMimo.wiggle();
  });

  // olhar, sono e acordar
  let pointer = null, pointerIsMouse = false, lastInput = performance.now();
  let zTimer = null;

  function wake(silent) {
    lastInput = performance.now();
    if (heroMimo.state !== 'sleep') return;
    clearInterval(zTimer);
    zTimer = null;
    mood('surprised', 650);
    heroMimo.wiggle();
    if (!silent) say('hã? tô acordada!', 1600);
  }

  function sleep() {
    mood('sleep');
    clearInterval(zTimer);
    const puff = () => {
      if (heroMimo.state !== 'sleep') return;
      const c = mimoCenter();
      const z = document.createElement('span');
      z.className = 'z';
      z.textContent = 'z';
      z.style.left = `${c.x + stage.offsetWidth * 0.14}px`;
      z.style.top = `${c.y - stage.offsetWidth * 0.18}px`;
      fx.appendChild(z);
      z.addEventListener('animationend', () => z.remove(), { once: true });
    };
    puff();
    zTimer = setInterval(puff, 1100);
  }

  const onPointer = (e) => {
    pointer = { x: e.clientX, y: e.clientY };
    pointerIsMouse = e.pointerType === 'mouse';
    wake();
  };
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerdown', onPointer, { passive: true });
  addEventListener('keydown', () => wake(), { passive: true });
  addEventListener('scroll', () => wake(true), { passive: true });

  let wanderAt = 0;
  function wander(now) {
    if (now < wanderAt) return;
    wanderAt = now + rand(1300, 3200);
    if (Math.random() < 0.3) heroMimo.lookDir(0, 1);
    else heroMimo.lookDir(rand(-9, 9), rand(-6, 6));
  }

  // órbita de memórias em volta da mascote
  const tiles = $$('.tile');
  let orbitA = 0, stageW = stage.offsetWidth;
  addEventListener('resize', () => { stageW = stage.offsetWidth; });

  const par = { x: 0, y: 0 };

  function orbit(dt) {
    orbitA += reduced ? 0 : dt * 0.00017;
    const rx = stageW * 0.46, ry = stageW * 0.15;
    const tilt = -0.17 + par.x * 0.08;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const n = tiles.length;
    for (let i = 0; i < n; i++) {
      const a = orbitA + (i / n) * Math.PI * 2;
      const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
      const x = ex * ct - ey * st;
      const y = ex * st + ey * ct + stageW * 0.07;
      const depth = (Math.sin(a) + 1) / 2;
      const t = tiles[i];
      t.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(0.6 + depth * 0.5).toFixed(3)})`;
      t.style.opacity = (0.4 + depth * 0.6).toFixed(2);
      t.style.zIndex = depth > 0.5 ? 7 : 2;
    }
  }

  /* ================= notificações ================= */

  const notif = $('#notif');
  const notifMsg = $('#notifMsg');
  const NOTIFS = [
    'seu áudio de 0:42 virou o capítulo de hoje ✦',
    'capítulo 47: o dia em que você riu até chorar 💗',
    '1 ano atrás: seu primeiro show sozinha. bora lembrar?',
    'sua semana numa palavra: coragem.'
  ];
  let notifN = 0, notifTimer;

  function cycleNotif(delay) {
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
      if (sheetOpen || celebrating || document.hidden) return cycleNotif(4000);
      notifMsg.textContent = NOTIFS[notifN++ % NOTIFS.length];
      notif.classList.add('show');
      notifTimer = setTimeout(() => {
        notif.classList.remove('show');
        cycleNotif(5200);
      }, 4600);
    }, delay);
  }
  function hideNotif() {
    notif.classList.remove('show');
    cycleNotif(6000);
  }

  /* ================= pré-cadastro ================= */

  const overlay = $('#overlay');
  const sheetWrap = $('#sheetWrap');
  const sheet = $('#sheet');
  const sheetHead = $('#sheetHead');
  const peekHost = $('#peekHost');
  const fxSheet = $('#fxSheet');
  const err = $('#err');
  const googleBtn = $('#googleBtn');
  const cta = $('#openSheet');
  const ctaLabel = $('#ctaLabel');
  const peek = new Mimo($('#peekMimo'), { peek: true });

  let sheetOpen = false, lastFocus = null, registered = false, regLabel = '';

  // Integração: troque o corpo desta função pelo login real com Google.
  // Ex. com Supabase: supabase.auth.signInWithOAuth({ provider: 'google' })
  function salvarPreCadastro(dados) {
    return new Promise((resolve) => setTimeout(() => resolve(dados), 1100));
  }

  // mantém a tela acima do teclado do iPhone
  const vv = window.visualViewport;
  function syncViewport() {
    if (!vv) return;
    overlay.style.setProperty('--vvh', `${vv.height}px`);
    overlay.style.setProperty('--vvt', `${vv.offsetTop}px`);
  }
  if (vv) {
    vv.addEventListener('resize', () => sheetOpen && syncViewport());
    vv.addEventListener('scroll', () => sheetOpen && syncViewport());
  }

  function showView(name) {
    $$('.view', sheet).forEach((v) => { v.hidden = v.dataset.view !== name; });
  }

  function openSheet() {
    if (sheetOpen) return;
    sheetOpen = true;
    lastFocus = document.activeElement;
    showView(registered ? 'done' : 'form');
    peek.set(registered ? 'happy' : 'idle');
    peekHost.style.visibility = '';
    overlay.hidden = false;
    syncViewport();
    document.body.classList.add('lock');
    sheetWrap.style.removeProperty('--drag');
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
    hideNotif();
    bubble.classList.remove('show');
    setTimeout(() => peek.wiggle(), 700);
    sheet.focus({ preventScroll: true });
  }

  function closeSheet({ quiet = false } = {}) {
    if (!sheetOpen) return;
    sheetOpen = false;
    overlay.classList.remove('open');
    document.activeElement?.blur?.();
    if (!quiet) document.body.classList.remove('lock');
    setTimeout(() => {
      if (sheetOpen) return;
      overlay.hidden = true;
      sheetWrap.style.removeProperty('--drag');
    }, 560);
    if (quiet) return;
    lastFocus?.focus?.({ preventScroll: true });
    if (registered) setTimeout(() => { mood('happy', 1400); say('te espero no teste! 💌'); }, 450);
  }

  cta.addEventListener('click', () => (registered ? showThanks() : openSheet()));
  $('#closeSheet').addEventListener('click', () => closeSheet());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });

  function trapTab(e, box) {
    const f = $$('button, input, a[href]', box).filter((el) => !el.closest('[hidden]') && !el.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === box)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  addEventListener('keydown', (e) => {
    if (celebrating) {
      if (!landed) return;
      if (e.key === 'Escape') return closeThanks();
      if (e.key === 'Tab') trapTab(e, thanks);
      return;
    }
    if (!sheetOpen) return;
    if (e.key === 'Escape') return closeSheet();
    if (e.key === 'Tab') trapTab(e, sheet);
  });

  // arrastar pra baixo pra fechar (iPhone)
  let sd = null;
  sheetHead.addEventListener('pointerdown', (e) => {
    if (!isSheetLayout() || e.target.closest('button')) return;
    sd = { y: e.clientY, dy: 0, t: performance.now() };
    sheetHead.setPointerCapture(e.pointerId);
    sheetWrap.classList.add('dragging');
  });
  sheetHead.addEventListener('pointermove', (e) => {
    if (!sd) return;
    const raw = e.clientY - sd.y;
    sd.dy = raw > 0 ? raw : raw * 0.15;
    sheetWrap.style.setProperty('--drag', `${sd.dy.toFixed(1)}px`);
  });
  const endSheetDrag = () => {
    if (!sd) return;
    sheetWrap.classList.remove('dragging');
    const v = sd.dy / Math.max(1, performance.now() - sd.t);
    if (sd.dy > 110 || (sd.dy > 30 && v > 0.7)) closeSheet();
    else sheetWrap.style.setProperty('--drag', '0px');
    sd = null;
  };
  sheetHead.addEventListener('pointerup', endSheetDrag);
  sheetHead.addEventListener('pointercancel', endSheetDrag);

  // a mascote fica animada quando o dedo/mouse chega no botão do Google
  googleBtn.addEventListener('pointerenter', () => {
    if (googleBtn.disabled || registered) return;
    peek.blush(900);
    peek.wiggle();
  });

  function setLoading(btn, on) {
    btn.classList.toggle('loading', on);
    btn.disabled = on;
  }

  async function success(label) {
    registered = true;
    regLabel = label;
    try { localStorage.setItem('mimo-lista', label); } catch (_) { /* modo privado */ }
    $('#tkMail').textContent = label;
    showView('done');
    peek.set('happy');
    peek.wiggle();
    const s = sheetWrap.getBoundingClientRect();
    const p = peekHost.getBoundingClientRect();
    burst(fxSheet, p.left - s.left + p.width / 2, p.top - s.top + p.height * 0.4, 14, 1.3);
    setTimeout(() => burst(fxSheet, s.width * 0.5, 120, 10, 1.1), 260);
    ctaLabel.textContent = 'você já tá na lista ✓';
    cta.classList.add('is-done');

    await wait(reduced ? 400 : 1600);
    if (sheetOpen) sendInvite(label);
  }

  googleBtn.addEventListener('click', async () => {
    err.textContent = '';
    peek.set('surprised');
    setLoading(googleBtn, true);
    try {
      await salvarPreCadastro({ metodo: 'google' });
      success('conta Google conectada');
    } catch (_) {
      peek.set('sad');
      restart($('#peekMimo'), 'shake');
      setTimeout(() => { if (peek.state === 'sad') peek.set('idle'); }, 1100);
      err.textContent = 'não deu pra conectar com o Google agora. tenta de novo?';
    } finally {
      setLoading(googleBtn, false);
    }
  });

  /* ================= convite + voo + agradecimento ================= */

  const cel = $('#celebrate');
  const thanks = $('#thanks');
  const gift = $('#gift');
  const envFly = $('#envFly');
  const envBox = $('#envBox');
  const envCard = $('#envCard');
  const envFlap = $('#envFlap');
  const envSeal = $('#envSeal');
  const envParts = [$('#envBack'), $('#envFront'), envFlap];
  const flyHost = $('#flyHost');
  const flySquish = $('#flySquish');
  const celSay = $('#celSay');
  const fxCel = $('#fxCel');
  const thanksShare = $('#thanksShare');
  const flyMimo = new Mimo($('#flyMimo'), { paws: true });

  const FLY_W = 120, FLY_H = FLY_W * 232 / 200;
  const FEET = FLY_H * (224 / 232 - 0.5);      // centro → pés
  const GRIP = FLY_H * (219 / 232 - 0.5) - 8;  // centro → patinhas segurando
  const ENV_W = 260, ENV_H = 170;

  const fly = { x: -999, y: -999, r: 0, s: 1 };
  const env = { x: 0, y: 0, r: 0, s: 1 };       // x = centro, y = borda de cima
  let celebrating = false, landed = false, bankT = 0, trailAt = 0, celSayT;

  const EASE = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const lerpPt = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const quad = (a, c, b, t) => ({
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y
  });

  // curva suave passando por todos os pontos (catmull-rom)
  function spline(pts, t) {
    const n = pts.length - 1;
    const f = t * n;
    const i = Math.min(n - 1, Math.floor(f));
    const u = f - i, u2 = u * u, u3 = u2 * u;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const c = (a, b, cc, d) => 0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u2 + (-a + 3 * b - 3 * cc + d) * u3);
    return { x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) };
  }

  function tween(ms, fn, ease = EASE.out) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        fn(ease(t), now);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  // move a mascote e inclina na direção do voo
  function bank(p, now = performance.now()) {
    const dt = Math.max(8, now - (bankT || now - 16));
    bankT = now;
    const vx = (p.x - fly.x) / dt;
    fly.r += (clamp(vx * 22, -26, 26) - fly.r) * 0.25;
    fly.x = p.x;
    fly.y = p.y;
  }

  function renderFly() {
    flyHost.style.transform = `translate3d(${(fly.x - FLY_W / 2).toFixed(1)}px, ${(fly.y - FLY_H / 2).toFixed(1)}px, 0) rotate(${fly.r.toFixed(2)}deg) scale(${fly.s.toFixed(3)})`;
    if (celSay.classList.contains('show')) {
      const w = celSay.offsetWidth;
      const x = clamp(fly.x + FLY_W * 0.3, 10, innerWidth - w - 10);
      celSay.style.transform = `translate3d(${x.toFixed(1)}px, ${(fly.y - FLY_H * 0.78).toFixed(1)}px, 0)`;
    }
  }

  function renderEnv() {
    envFly.style.transform = `translate3d(${(env.x - ENV_W / 2).toFixed(1)}px, ${env.y.toFixed(1)}px, 0) rotate(${env.r.toFixed(2)}deg) scale(${env.s.toFixed(3)})`;
  }

  function celTalk(text, ms = 1600) {
    celSay.firstElementChild.textContent = text;
    celSay.classList.remove('show');
    void celSay.offsetWidth;
    celSay.classList.add('show');
    renderFly();
    clearTimeout(celSayT);
    celSayT = setTimeout(() => celSay.classList.remove('show'), ms);
  }

  function trail(now) {
    if (reduced || now < trailAt) return;
    trailAt = now + 45;
    const p = document.createElement('span');
    p.className = 'trail';
    p.innerHTML = `<svg viewBox="0 0 24 24"><use href="#${Math.random() < 0.5 ? 'heart' : 'spark'}"/></svg>`;
    p.style.cssText =
      `left:${(fly.x + rand(-16, 16)).toFixed(1)}px;top:${(fly.y + rand(0, 34)).toFixed(1)}px;` +
      `color:${COLORS[(Math.random() * COLORS.length) | 0]};--dx:${rand(-24, 24).toFixed(1)}px;--dy:${rand(20, 60).toFixed(1)}px;--sc:${rand(0.5, 1.05).toFixed(2)}`;
    fxCel.appendChild(p);
    p.addEventListener('animationend', () => p.remove(), { once: true });
  }

  function confetti(n = 30) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      const heart = Math.random() < 0.3;
      c.className = 'conf';
      if (heart) c.innerHTML = '<svg viewBox="0 0 24 24"><use href="#heart"/></svg>';
      c.style.cssText =
        `left:${rand(0, innerWidth).toFixed(0)}px;color:${COLORS[i % COLORS.length]};` +
        `--x:${rand(-70, 70).toFixed(0)}px;--r:${rand(-540, 540).toFixed(0)}deg;--d:${rand(1.9, 3.2).toFixed(2)}s;animation-delay:${rand(0, 0.6).toFixed(2)}s;` +
        (heart ? '' : `width:${rand(6, 10).toFixed(0)}px;height:${rand(10, 16).toFixed(0)}px;background:currentColor;border-radius:2px;`);
      fxCel.appendChild(c);
      c.addEventListener('animationend', () => c.remove(), { once: true });
    }
  }

  function resetEnvelope() {
    [envCard, envFlap, envSeal, envBox, ...envParts].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    envFlap.style.zIndex = '';
    envFly.style.visibility = '';
    env.r = 0;
    env.s = 1;
  }

  function openLayer() {
    celebrating = true;
    landed = false;
    cel.classList.remove('closing');
    cel.hidden = false;
    document.body.classList.add('lock');
    bubble.classList.remove('show');
    notif.classList.remove('show');
    requestAnimationFrame(() => cel.classList.add('on'));
  }

  // 1. o ingresso vira convite, entra no envelope e ganha o selo
  // 2. a mascote pega o envelope e sai voando pela tela
  // 3. agradecimento com os brindes
  async function sendInvite(label) {
    if (reduced) {
      closeSheet({ quiet: true });
      return showThanks();
    }

    openLayer();
    resetEnvelope();
    thanks.hidden = true;
    $('#envMail').textContent = label;

    const W = innerWidth, H = innerHeight;
    const ex = W / 2, eTop = H * 0.54 - ENV_H / 2;
    env.x = ex;
    env.y = eTop;
    renderEnv();

    // FLIP: o card sai exatamente de onde o ingresso estava
    const tk = $('.ticket', sheet);
    const from = tk.getBoundingClientRect();
    const to = envCard.getBoundingClientRect();
    const flip = `translate(${(from.left + from.width / 2 - (to.left + to.width / 2)).toFixed(1)}px, ` +
                 `${(from.top + from.height / 2 - (to.top + to.height / 2)).toFixed(1)}px) scale(${(from.width / to.width).toFixed(3)}) rotate(-1.5deg)`;
    const above = 'translate(0px, -122px) scale(1) rotate(-4deg)';
    envCard.animate([{ transform: flip }, { transform: flip }], { duration: 1, fill: 'forwards' });
    tk.style.visibility = 'hidden';

    // a mascote pula de onde estava espiando
    const pr = $('svg', peekHost).getBoundingClientRect();
    fly.x = pr.left + pr.width / 2;
    fly.y = pr.top + pr.height / 2;
    fly.s = pr.width / FLY_W;
    fly.r = 0;
    flyMimo.set('fly');
    renderFly();
    flyHost.style.visibility = 'visible';
    flyHost.style.pointerEvents = 'none';
    peekHost.style.visibility = 'hidden';

    closeSheet({ quiet: true });

    envParts.forEach((el) => {
      const rot = el === envFlap ? ' rotateX(180deg)' : '';
      el.animate(
        [{ opacity: 0, transform: `translateY(50px)${rot}` }, { opacity: 1, transform: `translateY(0px)${rot}` }],
        { duration: 560, delay: 260, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
      );
    });

    const hover = { x: ex + Math.min(W * 0.3, 160), y: eTop - 86 };
    const hop = { x: (fly.x + hover.x) / 2, y: Math.min(fly.y, hover.y) - 150 };
    const p0 = { x: fly.x, y: fly.y }, s0 = fly.s;
    const jump = tween(820, (t, now) => {
      bank(quad(p0, hop, hover, t), now);
      fly.s = s0 + (1 - s0) * t;
      renderFly();
    }, EASE.inOut);

    await envCard.animate([{ transform: flip }, { transform: above }], { duration: 760, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished;
    await jump;
    celTalk('fechando seu convite ✦', 1700);

    // o convite desliza pra dentro
    await envCard.animate([{ transform: above }, { transform: 'translate(0px, 6px) scale(1) rotate(0deg)' }], { duration: 440, easing: 'cubic-bezier(.55,0,.75,.2)', fill: 'forwards' }).finished;
    envBox.animate([{ transform: 'none' }, { transform: 'scale(1.05, .93)' }, { transform: 'scale(.98, 1.02)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });

    // a aba fecha
    const flapAnim = envFlap.animate([{ opacity: 1, transform: 'rotateX(180deg)' }, { opacity: 1, transform: 'rotateX(0deg)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.3,1.25)', fill: 'forwards' });
    setTimeout(() => { envFlap.style.zIndex = 4; }, 230);
    await flapAnim.finished;

    // selo de coração
    envSeal.animate([
      { opacity: 0, transform: 'scale(2.6) rotate(-35deg)' },
      { opacity: 1, transform: 'scale(.86) rotate(6deg)', offset: 0.7 },
      { opacity: 1, transform: 'scale(1) rotate(0deg)' }
    ], { duration: 460, easing: 'cubic-bezier(.3,0,.3,1)', fill: 'forwards' });
    await wait(300);
    envBox.animate([{ transform: 'none' }, { transform: 'scale(1.03, .96)' }, { transform: 'none' }], { duration: 260 });
    burst(fxCel, ex, eTop + ENV_H * 0.62, 12, 1.1);
    await wait(520);

    // pega o envelope
    celTalk('deixa comigo! ✈', 1400);
    const g0 = { x: fly.x, y: fly.y }, g1 = { x: ex, y: eTop - GRIP };
    await tween(520, (t, now) => { bank(lerpPt(g0, g1, t), now); renderFly(); }, EASE.inOut);
    restart(flySquish, 'squish');
    await wait(160);
    const liftY = fly.y;
    await tween(360, (t) => {
      env.s = 1 - 0.38 * t;
      fly.y = liftY - 24 * t;
      env.y = fly.y + GRIP;
      renderFly();
      renderEnv();
    }, EASE.out);

    // voa pela tela com o convite pendurado
    const pts = [
      { x: fly.x, y: fly.y },
      { x: W * 0.8, y: H * 0.3 },
      { x: W * 0.62, y: H * 0.11 },
      { x: W * 0.26, y: H * 0.2 },
      { x: W * 0.28, y: H * 0.47 },
      { x: W * 0.64, y: H * 0.4 },
      { x: W * 0.9, y: H * 0.12 },
      { x: W + 280, y: -300 }
    ];
    let lag = fly.x;
    await tween(3000, (t, now) => {
      bank(spline(pts, t), now);
      fly.s = 1 + Math.sin(t * Math.PI) * 0.14;
      lag += (fly.x - lag) * 0.18;
      env.x = fly.x;
      env.y = fly.y + GRIP * fly.s;
      env.r = clamp((fly.x - lag) * 0.22, -22, 22);
      renderFly();
      renderEnv();
      trail(now);
    }, EASE.inOut);

    envFly.style.visibility = 'hidden';
    flyHost.style.visibility = 'hidden';
    await wait(220);
    showThanks();
  }

  function landingPoint() {
    const g = gift.getBoundingClientRect();
    return { x: g.left + g.width * 0.62, y: g.top + g.height * (34 / 140) - FEET + 5 };
  }

  async function showThanks() {
    if (!celebrating) openLayer();
    envFly.style.visibility = 'hidden';
    $('#thanksMail').textContent = regLabel || 'seu e-mail';
    thanks.hidden = false;
    landed = false;
    thanks.focus({ preventScroll: true });

    // a mascote volta voando e pousa no presente
    await wait(reduced ? 0 : 480);
    const L = landingPoint();
    flyMimo.set('fly');
    fly.s = 1;
    if (reduced) {
      fly.x = L.x;
      fly.y = L.y;
    } else {
      const W = innerWidth, H = innerHeight;
      const pts = [{ x: -110, y: H * 0.8 }, { x: W * 0.2, y: H * 0.52 }, { x: L.x + 70, y: L.y - 110 }, { x: L.x, y: L.y }];
      fly.x = pts[0].x;
      fly.y = pts[0].y;
      flyHost.style.visibility = 'visible';
      await tween(1200, (t, now) => { bank(spline(pts, t), now); renderFly(); trail(now); }, EASE.out);
    }
    if (!celebrating) return;

    fly.r = 0;
    renderFly();
    flyHost.style.visibility = 'visible';
    flyHost.style.pointerEvents = '';
    landed = true;
    flyMimo.set('happy');
    flyMimo.wiggle();
    restart(flySquish, 'squish');
    restart(gift, 'bump');
    burst(fxCel, L.x, L.y + FEET - 10, 12, 1.2);
    confetti(34);
    celTalk('prontinho! 💜', 2000);
    setTimeout(() => { if (landed && flyMimo.state === 'happy') flyMimo.set('idle'); }, 1500);
    thanksShare.focus({ preventScroll: true });
  }

  function closeThanks() {
    if (!celebrating) return;
    celebrating = false;
    landed = false;
    cel.classList.add('closing');
    celSay.classList.remove('show');
    document.body.classList.remove('lock');
    setTimeout(() => {
      if (celebrating) return;
      cel.hidden = true;
      cel.classList.remove('on', 'closing');
      thanks.hidden = true;
      flyHost.style.visibility = 'hidden';
      fxCel.replaceChildren();
      resetEnvelope();
      peekHost.style.visibility = '';
      $('.ticket', sheet).style.visibility = '';
    }, 480);
    cta.focus({ preventScroll: true });
    setTimeout(() => { mood('happy', 1400); heroMimo.wiggle(); say('te espero no teste! 💌'); }, 420);
  }

  $('#thanksClose').addEventListener('click', closeThanks);

  // tocar na mascote depois que ela pousou
  const THANKS_POKE = ['eba!! 💜', 'vai ser lindo', 'te aviso primeiro', 'chama as amigas!'];
  let thanksPokeN = 0;
  flyHost.addEventListener('click', () => {
    if (!landed) return;
    restart(flySquish, 'squish');
    restart(gift, 'bump');
    flyMimo.set('happy');
    flyMimo.blush();
    flyMimo.wiggle();
    burst(fxCel, fly.x, fly.y - 20, 8);
    celTalk(THANKS_POKE[thanksPokeN++ % THANKS_POKE.length], 1500);
    setTimeout(() => { if (landed && flyMimo.state === 'happy') flyMimo.set('idle'); }, 900);
  });

  addEventListener('resize', () => {
    if (!landed) return;
    const L = landingPoint();
    fly.x = L.x;
    fly.y = L.y;
    renderFly();
  });

  thanksShare.addEventListener('click', async () => {
    const data = { title: 'mimo', text: 'entra comigo no teste da mimo 💜 manda um áudio, ganha um diário.', url: location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch (_) { /* cancelou */ }
      return;
    }
    const label = $('.btn-label', thanksShare);
    try {
      await navigator.clipboard.writeText(data.url);
      label.textContent = 'link copiado ✓';
    } catch (_) {
      label.textContent = data.url;
    }
    setTimeout(() => { label.textContent = 'chamar uma amiga pro teste'; }, 2200);
  });

  try {
    const saved = localStorage.getItem('mimo-lista');
    if (saved) {
      registered = true;
      regLabel = saved;
      $('#tkMail').textContent = saved;
      ctaLabel.textContent = 'você já tá na lista ✓';
      cta.classList.add('is-done');
    }
  } catch (_) { /* sem storage */ }

  /* ================= loop ================= */

  let last = performance.now(), acc = 0, tilt = 0;
  const STEP = 1000 / 60;

  function physics(now) {
    // mola do arrasto
    const k = sp.on ? 0.3 : 0.075;
    const damp = sp.on ? 0.6 : 0.86;
    sp.vx = (sp.vx + (sp.tx - sp.x) * k) * damp;
    sp.vy = (sp.vy + (sp.ty - sp.y) * k) * damp;
    sp.x += sp.vx;
    sp.y += sp.vy;

    // olhos
    const fresh = now - lastInput < 2500;
    if (sheetOpen) {
      heroMimo.lookDir(0, 7);
    } else if (pointer && (pointerIsMouse || fresh || sp.on)) {
      heroMimo.lookAt(pointer.x, pointer.y);
    } else {
      wander(now);
    }
    heroMimo.step();

    if (sheetOpen) {
      if (pointer && (pointerIsMouse || fresh)) peek.lookAt(pointer.x, pointer.y, 220);
      else peek.lookDir(4, 6);
      peek.step();
    }

    if (landed) {
      if (pointer && (pointerIsMouse || fresh)) flyMimo.lookAt(pointer.x, pointer.y, 240);
      else flyMimo.lookDir(0, 3);
      flyMimo.step();
    }

    // inclina na direção do dedo/mouse + paralaxe
    const vw = innerWidth, vh = innerHeight;
    const tx = pointer ? (pointer.x / vw - 0.5) * 2 : 0;
    const ty = pointer ? (pointer.y / vh - 0.5) * 2 : 0;
    par.x += (tx - par.x) * 0.05;
    par.y += (ty - par.y) * 0.05;
    tilt += ((pointer && !sheetOpen ? tx * 5 : 0) - tilt) * 0.06;

    // dormir depois de um tempo parada
    if (!sheetOpen && !celebrating && !sp.on && heroMimo.state === 'idle' && now - lastInput > 16000) sleep();
  }

  function frame(now) {
    const dt = Math.min(64, now - last);
    last = now;
    acc += dt;
    while (acc >= STEP) { physics(now); acc -= STEP; }

    const sx = clamp(1 + Math.abs(sp.vx) * 0.008 - Math.abs(sp.vy) * 0.005, 0.84, 1.18);
    const sy = clamp(1 + Math.abs(sp.vy) * 0.008 - Math.abs(sp.vx) * 0.005, 0.84, 1.18);
    dragEl.style.transform = `translate3d(${sp.x.toFixed(2)}px, ${sp.y.toFixed(2)}px, 0) rotate(${(sp.x * 0.1 + tilt).toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

    hero.style.setProperty('--px', par.x.toFixed(3));
    hero.style.setProperty('--py', par.y.toFixed(3));

    orbit(dt);
    requestAnimationFrame(frame);
  }

  /* ================= entrada ================= */

  function start() {
    document.documentElement.classList.add('ready');
    stageW = stage.offsetWidth;
    requestAnimationFrame(frame);

    const lastLetter = $$('span', brand).pop();
    lastLetter.addEventListener('animationend', () => brand.classList.add('settled'), { once: true });

    setTimeout(() => {
      heroMimo.wiggle();
      mood('happy', 900);
      if (!registered) say('oi! eu sou a mimo', 2000);
      else say('oi de novo! 💜', 1800);
    }, 1300);
    setTimeout(() => { if (!hintDone) hint.classList.add('show'); }, 3200);
    cycleNotif(4800);
  }

  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(start);
  } else {
    start();
  }
})();
