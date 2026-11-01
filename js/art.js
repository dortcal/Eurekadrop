/* ==========================================================
   EUREKA DROP · art.js
   Todo el arte del juego se dibuja por código (Canvas 2D):
   personajes, enemigos, guardianes, escenarios y objetos.
   Estilo cartoon 2.5D: degradados, sombras y contornos gruesos.
   ========================================================== */
(function (EZ) {
  'use strict';
  const ART = (EZ.art = {});
  const T = (ART.T = 48);
  const FONT = (ART.FONT = '"SF Pro Rounded", ui-rounded, "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif');
  const OUT = '#1b1446';

  ART.SKINS = ['#ffe0c7', '#f1c27d', '#d9a066', '#a86b3c', '#6b4226'];
  ART.HAIR_COLORS = ['#2b1b0e', '#6b3e1d', '#e8b84a', '#d9472b', '#1d1d3a', '#ff4f8b', '#4cc9f0', '#3ddc97', '#f0f0f0'];
  ART.OUTFITS = ['#7b5cff', '#ff4f8b', '#4cc9f0', '#3ddc97', '#ffd23f', '#ff8a3d', '#2b2d42', '#e63946'];
  ART.HAIRS = ['Corto', 'Cresta', 'Coletas', 'Rizos', 'Moño', 'Melena'];
  ART.ACCS = [
    { id: 'none', name: 'Nada' }, { id: 'cap', name: 'Gorra' }, { id: 'glasses', name: 'Gafas' },
    { id: 'headphones', name: 'Cascos', unlock: 'streak5', how: 'Logro: racha de 5' },
    { id: 'bandana', name: 'Cinta', price: 300, how: '300 monedas' },
    { id: 'helmet', name: 'Casco espacial', price: 600, how: '600 monedas' },
    { id: 'cape', name: 'Capa', unlock: 'legend', how: 'Logro: supera un nivel Leyenda' },
    { id: 'wings', name: 'Alas', price: 900, how: '900 monedas' },
    { id: 'crown', name: 'Corona Eureka', unlock: 'champion', how: 'Logro: derrota al Borrón' }
  ];

  ART.THEMES = {
    mat: { floorA: '#232a66', floorB: '#283070', detail: '#3c4bb0', wallTop: '#7280ff', wallFace: '#3a43b0', wallLine: '#9aa6ff', void: '#07081f', hazard: '#ff3d7f', hazardGlow: '#ff9fc0', toggle: true, props: ['cube', 'pyramid', 'screen', 'sphere'], glyphs: ['7', '+', '÷', 'π', '9', '%', '×', '3'] },
    len: { floorA: '#9a6440', floorB: '#8c5838', detail: '#b5784f', wallTop: '#c98a4b', wallFace: '#6b3f22', wallLine: '#e0a76a', void: '#140b24', hazard: '#2e1f66', hazardGlow: '#5b48b5', toggle: false, props: ['shelf', 'books', 'lamp', 'scroll'], glyphs: ['A', 'ñ', 'B', 'v', 'H', 'á', 'G', 'j'] },
    med: { floorA: '#7cc35b', floorB: '#72b852', detail: '#e2c98c', wallTop: '#6e5c56', wallFace: '#3f3330', wallLine: '#8d7a72', void: '#1b6fb0', hazard: '#ff5a1f', hazardGlow: '#ffb03b', toggle: false, props: ['drago', 'palm', 'rock', 'cardon'], glyphs: ['●', '▲', '◆', '●'] },
    ing: { floorA: '#a7b0c0', floorB: '#9ba5b6', detail: '#8790a2', wallTop: '#d9735c', wallFace: '#a2412f', wallLine: '#f0a08e', void: '#2b78c2', hazard: '#ff9f1c', hazardGlow: '#ffd27a', toggle: false, props: ['lamp2', 'tree', 'mailbox', 'bench'], glyphs: ['✈', '✈', '✈'] },
    ef: { floorA: '#2fae5b', floorB: '#29a052', detail: '#ffffff', wallTop: '#ff7088', wallFace: '#c43a52', wallLine: '#ffb3c1', void: '#14213d', hazard: '#7a4b22', hazardGlow: '#b07a45', toggle: true, props: ['cone', 'ball', 'hurdle', 'bench'], glyphs: ['●'] },
    mix: { floorA: '#3b2a7a', floorB: '#34256e', detail: '#5a45b5', wallTop: '#8f6bff', wallFace: '#4a2fa8', wallLine: '#c2adff', void: '#0b0620', hazard: '#2b1e5c', hazardGlow: '#7b5cff', toggle: true, props: ['cube', 'books', 'drago', 'cone'], glyphs: ['?', '!', '7', 'A', '✈'] }
  };

  /* ---------- Utilidades de dibujo ---------- */
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  ART.rr = rr;
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  ART.shade = shade;
  function blob(ctx, x, y, r, col, line = OUT, lw = 3) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, shade(col, 50)); g.addColorStop(1, col);
    ctx.fillStyle = g; ctx.fill();
    if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
  }
  ART.blob = blob;
  ART.shadow = function (ctx, x, y, rx, ry, a = 0.28) {
    ctx.fillStyle = `rgba(10,5,30,${a})`;
    ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); ctx.fill();
  };
  ART.text = function (ctx, txt, x, y, size, col = '#fff', align = 'center', stroke = OUT) {
    ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (stroke) { ctx.lineWidth = Math.max(3, size / 5); ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(txt, x, y); }
    ctx.fillStyle = col; ctx.fillText(txt, x, y);
  };

  /* ---------- Mapa: pre-render de suelo y muros ---------- */
  ART.renderMap = function (map, theme, rng) {
    const W = map.w * T, H = map.h * T;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const th = ART.THEMES[theme];
    ctx.fillStyle = th.void; ctx.fillRect(0, 0, W, H);
    const at = (c, r) => (c < 0 || r < 0 || c >= map.w || r >= map.h ? 1 : map.t[r * map.w + c]);
    for (let r = 0; r < map.h; r++) for (let c = 0; c < map.w; c++) {
      const t = at(c, r), x = c * T, y = r * T;
      if (t === 1 || t === 4) continue;
      if (t === 2) continue;
      drawFloor(ctx, th, theme, x, y, c, r, rng);
    }
    // Muros (cara superior + frontal si debajo hay suelo)
    for (let r = 0; r < map.h; r++) for (let c = 0; c < map.w; c++) {
      const t = at(c, r);
      if (t !== 1 && t !== 4) continue;
      const x = c * T, y = r * T;
      const below = at(c, r + 1);
      const front = below !== 1 && below !== 4;
      const topH = front ? T - 18 : T;
      ctx.fillStyle = th.wallTop; ctx.fillRect(x, y, T, topH);
      ctx.fillStyle = shade(th.wallTop, 18); ctx.fillRect(x, y, T, 4);
      ctx.strokeStyle = th.wallLine; ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, T - 6, topH - 6); ctx.globalAlpha = 1;
      if (front) {
        const g = ctx.createLinearGradient(0, y + topH, 0, y + T);
        g.addColorStop(0, th.wallFace); g.addColorStop(1, shade(th.wallFace, -35));
        ctx.fillStyle = g; ctx.fillRect(x, y + topH, T, 18);
        if (t === 4) { // grieta sutil de la pared secreta
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(x + 14, y + topH + 2); ctx.lineTo(x + 22, y + topH + 9); ctx.lineTo(x + 18, y + T - 2);
          ctx.moveTo(x + 22, y + topH + 9); ctx.lineTo(x + 32, y + topH + 12); ctx.stroke();
        }
        // sombra sobre el suelo
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x, y + T, T, 8);
      }
    }
    return cv;
  };

  function drawFloor(ctx, th, theme, x, y, c, r, rng) {
    ctx.fillStyle = (c + r) % 2 ? th.floorA : th.floorB;
    ctx.fillRect(x, y, T, T);
    ctx.save();
    switch (theme) {
      case 'mat': case 'mix':
        ctx.strokeStyle = th.detail; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
        if (rng() < 0.08) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#7df9ff'; ctx.font = `800 14px ${FONT}`; ctx.fillText(EZ.util.pick(th.glyphs, rng), x + 16, y + 30); }
        break;
      case 'len':
        ctx.strokeStyle = 'rgba(60,30,10,0.35)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y + T / 2); ctx.lineTo(x + T, y + T / 2); ctx.stroke();
        ctx.beginPath(); const o = (r % 2) * 24; ctx.moveTo(x + o + 12, y); ctx.lineTo(x + o + 12, y + T / 2); ctx.moveTo(x + ((o + 24) % 48) + 12, y + T / 2); ctx.lineTo(x + ((o + 24) % 48) + 12, y + T); ctx.stroke();
        break;
      case 'med':
        if (rng() < 0.35) { ctx.fillStyle = th.detail; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(x + 24, y + 24, 22, 16, rng() * 3, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 0.5; ctx.fillStyle = '#5a9e3e';
        for (let i = 0; i < 3; i++) { const gx = x + rng() * T, gy = y + rng() * T; ctx.fillRect(gx, gy, 2, 6); ctx.fillRect(gx + 3, gy + 1, 2, 5); }
        break;
      case 'ing':
        ctx.strokeStyle = 'rgba(60,70,90,0.45)'; ctx.lineWidth = 2;
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { rr(ctx, x + 3 + i * 24 + (j % 2) * 6, y + 3 + j * 24, 18, 18, 6); ctx.stroke(); }
        break;
      case 'ef':
        ctx.fillStyle = c % 4 < 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; ctx.fillRect(x, y, T, T);
        if (r % 6 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x, y + T / 2 - 2, T, 4); }
        break;
    }
    ctx.restore();
  }

  /* Bloques dinámicos: vacío, peligro, suelo que se desmorona */
  ART.drawVoid = function (ctx, th, x, y, t) {
    ctx.fillStyle = th.void; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    const o = Math.sin(t * 2 + x * 0.05) * 6;
    ctx.fillRect(x + 6 + o, y + 14, 14, 3); ctx.fillRect(x + 24 - o, y + 32, 16, 3);
  };
  ART.drawHazard = function (ctx, th, theme, x, y, t, active) {
    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.35;
    const cx = x + T / 2, cy = y + T / 2;
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, T * 0.6);
    g.addColorStop(0, th.hazardGlow); g.addColorStop(1, th.hazard);
    ctx.fillStyle = g;
    rr(ctx, x + 4, y + 4, T - 8, T - 8, 14); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
    if (theme === 'mat' || theme === 'mix') { // chispas eléctricas
      if (active) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); const k = Math.floor(t * 12) % 3; ctx.moveTo(x + 10, y + 16 + k * 6); ctx.lineTo(x + 22, y + 26); ctx.lineTo(x + 28, y + 18); ctx.lineTo(x + 38, y + 30 - k * 4); ctx.stroke(); }
    } else if (theme === 'med') { // burbujas de lava
      ctx.fillStyle = '#ffe27a'; const b = (t * 1.5 + x) % 1; ctx.beginPath(); ctx.arc(x + 18, y + 26 - b * 8, 3 + b * 3, 0, 7); ctx.fill();
    } else if (theme === 'ef') { // barro
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.ellipse(x + 18, y + 20, 8, 4, 0, 0, 7); ctx.fill();
    } else { // tinta / pintura
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(x + 16, y + 16, 7, 4, -0.5, 0, 7); ctx.fill();
    }
    if (!active) { ctx.globalAlpha = 0.8; ART.text(ctx, '…', cx, cy, 16, '#fff'); }
    ctx.restore();
  };
  ART.drawCrumble = function (ctx, th, x, y, state, k) {
    if (state === 'gone') return;
    const shake = state === 'shake' ? Math.sin(k * 60) * 2 : 0;
    ctx.fillStyle = shade(th.floorA, 25); rr(ctx, x + 2 + shake, y + 2, T - 4, T - 4, 6); ctx.fill();
    ctx.fillStyle = shade(th.floorA, -40); ctx.fillRect(x + 2 + shake, y + T - 8, T - 4, 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x + 10 + shake, y + 10); ctx.lineTo(x + 22 + shake, y + 22); ctx.lineTo(x + 18 + shake, y + 36);
    ctx.moveTo(x + 22 + shake, y + 22); ctx.lineTo(x + 38 + shake, y + 18); ctx.stroke();
  };

  /* ---------- Protagonista ---------- */
  ART.drawPlayer = function (ctx, x, y, z, dir, walk, av, opts = {}) {
    const skin = ART.SKINS[av.skin] || ART.SKINS[1];
    const hairC = ART.HAIR_COLORS[av.hairColor] || ART.HAIR_COLORS[0];
    const out = ART.OUTFITS[av.outfit] || ART.OUTFITS[0];
    const s = opts.scale || 1;
    const sh = Math.max(0.35, 1 - z / 90);
    ART.shadow(ctx, x, y, 15 * s * sh, 6 * s * sh);
    ctx.save();
    ctx.translate(x, y - z);
    ctx.scale(s, s);
    if (opts.flash) ctx.globalAlpha = 0.45;
    const sw = Math.sin(walk * 10) * (opts.moving ? 1 : 0);
    const bob = opts.moving ? Math.abs(Math.sin(walk * 10)) * 2 : Math.sin(walk * 3) * 1;
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;

    if (av.acc === 'cape') { ctx.fillStyle = '#e63946'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-11, -34 - bob); ctx.lineTo(11, -34 - bob); ctx.lineTo(15 - side * 6, -6 + sw * 2); ctx.lineTo(-15 - side * 6, -6 - sw * 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (av.acc === 'wings') {
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
      const f = Math.sin(walk * 8) * 4;
      [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(k * 18, -32 - bob, 12, 7 + f * 0.3, k * -0.6, 0, 7); ctx.fill(); ctx.stroke(); });
    }
    // Piernas
    ctx.fillStyle = '#2b2d42'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    rr(ctx, -9, -16 + sw * 3, 7, 14, 3); ctx.fill(); ctx.stroke();
    rr(ctx, 2, -16 - sw * 3, 7, 14, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; rr(ctx, -10, -4 + sw * 3, 9, 5, 2); ctx.fill(); ctx.stroke(); rr(ctx, 1, -4 - sw * 3, 9, 5, 2); ctx.fill(); ctx.stroke();
    // Torso
    const g = ctx.createLinearGradient(-12, -38, 12, -12);
    g.addColorStop(0, shade(out, 40)); g.addColorStop(1, shade(out, -25));
    ctx.fillStyle = g; rr(ctx, -12, -37 - bob, 24, 23, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = `900 9px ${FONT}`; ctx.textAlign = 'center';
    if (dir !== 'up') { ctx.beginPath(); ctx.arc(side * 3, -26 - bob, 4.5, 0, 7); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); }
    // Brazos
    ctx.fillStyle = skin; ctx.lineWidth = 2.5;
    rr(ctx, -17, -34 - bob - sw * 3, 6, 15, 3); ctx.fill(); ctx.stroke();
    rr(ctx, 11, -34 - bob + sw * 3, 6, 15, 3); ctx.fill(); ctx.stroke();
    // Cabeza
    const hy = -50 - bob;
    blob(ctx, 0, hy, 14, skin, OUT, 2.5);
    drawHair(ctx, av.hair, hairC, hy, dir, side);
    if (dir !== 'up') {
      // Cara
      const ex = side * 4;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(ex - 5, hy + 1, 3.6, 4.4, 0, 0, 7); ctx.ellipse(ex + 5, hy + 1, 3.6, 4.4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = OUT;
      const blink = opts.blink ? 0.3 : 1;
      ctx.beginPath(); ctx.ellipse(ex - 5 + side, hy + 2, 2, 2.6 * blink, 0, 0, 7); ctx.ellipse(ex + 5 + side, hy + 2, 2, 2.6 * blink, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath();
      if (opts.sad) ctx.arc(ex, hy + 12, 4, 1.15 * Math.PI, 1.85 * Math.PI); else ctx.arc(ex, hy + 6, 4, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,100,120,0.35)'; ctx.beginPath(); ctx.arc(ex - 9, hy + 6, 2.5, 0, 7); ctx.arc(ex + 9, hy + 6, 2.5, 0, 7); ctx.fill();
    }
    drawAcc(ctx, av.acc, hy, dir, side);
    ctx.restore();
  };

  function drawHair(ctx, style, col, hy, dir, side) {
    ctx.fillStyle = col; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    const back = dir === 'up';
    switch (style) {
      case 1: // cresta
        ctx.beginPath(); ctx.moveTo(-12, hy - 4); ctx.lineTo(-8, hy - 22); ctx.lineTo(-3, hy - 12); ctx.lineTo(1, hy - 26); ctx.lineTo(5, hy - 12); ctx.lineTo(10, hy - 21); ctx.lineTo(13, hy - 4);
        ctx.quadraticCurveTo(0, hy - 10, -12, hy - 4); ctx.fill(); ctx.stroke(); break;
      case 2: // coletas
        [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(k * 17, hy + 2, 5, 9, k * 0.4, 0, 7); ctx.fill(); ctx.stroke(); });
        ctx.beginPath(); ctx.arc(0, hy - 2, 14.5, Math.PI, 0); ctx.fill(); ctx.stroke(); break;
      case 3: // rizos
        for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; ctx.beginPath(); ctx.arc(Math.cos(a) * 13, hy - 2 + Math.sin(a) * 13, 6.5, 0, 7); ctx.fill(); ctx.stroke(); }
        break;
      case 4: // moño
        ctx.beginPath(); ctx.arc(0, hy - 18, 7, 0, 7); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, hy - 2, 14.5, Math.PI, 0); ctx.fill(); ctx.stroke(); break;
      case 5: // melena
        ctx.beginPath(); ctx.moveTo(-15, hy + 12); ctx.lineTo(-15, hy - 2); ctx.arc(0, hy - 2, 15, Math.PI, 0); ctx.lineTo(15, hy + 12); ctx.quadraticCurveTo(10, hy + 6, 9, hy - 4); ctx.lineTo(-9, hy - 4); ctx.quadraticCurveTo(-10, hy + 6, -15, hy + 12); ctx.fill(); ctx.stroke(); break;
      default: // corto
        ctx.beginPath(); ctx.arc(0, hy - 2, 14.5, Math.PI * 1.02, -0.02); ctx.quadraticCurveTo(6 + side * 4, hy - 8, -2 + side * 3, hy - 6); ctx.quadraticCurveTo(-8, hy - 8, -14.5, hy - 2); ctx.fill(); ctx.stroke();
    }
    if (back) { ctx.beginPath(); ctx.arc(0, hy, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }
  function drawAcc(ctx, acc, hy, dir, side) {
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    switch (acc) {
      case 'cap':
        ctx.fillStyle = '#ff4f8b'; ctx.beginPath(); ctx.arc(0, hy - 4, 14.5, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        if (dir !== 'up') { ctx.beginPath(); ctx.ellipse(side * 10 + (side ? 0 : 0), hy - 4, 12, 4, 0, 0, 7); ctx.fill(); ctx.stroke(); }
        break;
      case 'glasses':
        if (dir === 'up') break;
        ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(125,249,255,0.35)';
        ctx.beginPath(); ctx.arc(side * 4 - 5, hy + 1, 5, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(side * 4 + 5, hy + 1, 5, 0, 7); ctx.fill(); ctx.stroke(); break;
      case 'headphones':
        ctx.strokeStyle = '#2b2d42'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, hy - 2, 16, Math.PI * 1.05, -0.05); ctx.stroke();
        ctx.fillStyle = '#4cc9f0'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; rr(ctx, -19, hy - 4, 7, 11, 3); ctx.fill(); ctx.stroke(); rr(ctx, 12, hy - 4, 7, 11, 3); ctx.fill(); ctx.stroke(); break;
      case 'bandana':
        ctx.fillStyle = '#e63946'; rr(ctx, -15, hy - 10, 30, 6, 3); ctx.fill(); ctx.stroke(); break;
      case 'crown':
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-10, hy - 12); ctx.lineTo(-11, hy - 24); ctx.lineTo(-5, hy - 18); ctx.lineTo(0, hy - 27); ctx.lineTo(5, hy - 18); ctx.lineTo(11, hy - 24); ctx.lineTo(10, hy - 12); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff4f8b'; ctx.beginPath(); ctx.arc(0, hy - 16, 2.2, 0, 7); ctx.fill(); break;
      case 'helmet':
        ctx.fillStyle = 'rgba(180,240,255,0.35)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, hy, 19, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-8, hy - 8, 4, 7, 0.6, 0, 7); ctx.fill(); break;
    }
  }

  /* ---------- Chispa (búho-dron) ---------- */
  ART.drawChispa = function (ctx, x, y, t, scale = 1) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 4) * 3); ctx.scale(scale, scale);
    ART.shadow(ctx, 0, 34 - Math.sin(t * 4) * 3, 9, 3, 0.18);
    ctx.strokeStyle = OUT; ctx.lineWidth = 2;
    ctx.fillStyle = '#c9d2ff'; const p = Math.sin(t * 40) * 11; ctx.beginPath(); ctx.ellipse(0, -16, Math.abs(p) + 2, 2.5, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, -10); ctx.stroke();
    blob(ctx, 0, 0, 12, '#4cc9f0', OUT, 2.5);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(-7, -14); ctx.lineTo(-3, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(7, -14); ctx.lineTo(3, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
    blob(ctx, -5, -1, 5, '#ffffff', OUT, 1.5); blob(ctx, 5, -1, 5, '#ffffff', OUT, 1.5);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(-4.5, 0, 2.2, 0, 7); ctx.arc(5.5, 0, 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.moveTo(-2, 5); ctx.lineTo(2, 5); ctx.lineTo(0, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  /* ---------- Borroncito (enemigo) ---------- */
  ART.drawBlob = function (ctx, x, y, t, kind, hurt) {
    ART.shadow(ctx, x, y, 16, 6);
    ctx.save(); ctx.translate(x, y);
    const sq = 1 + Math.sin(t * 8) * 0.08;
    ctx.scale(1 / sq, sq);
    const col = kind === 'chaser' ? '#5a1e6e' : '#2e1f66';
    ctx.fillStyle = col; ctx.strokeStyle = OUT; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-17, -2);
    ctx.quadraticCurveTo(-19, -30, 0, -32); ctx.quadraticCurveTo(19, -30, 17, -2);
    for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(13 - i * 9, 4 + (i % 2) * 3, 8.5 - i * 8.5, -1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-7, -22, 4, 6, -0.5, 0, 7); ctx.fill();
    ctx.fillStyle = hurt ? '#ff4f6d' : '#fff';
    ctx.beginPath(); ctx.ellipse(-6, -16, 4.5, 5.5, 0, 0, 7); ctx.ellipse(6, -16, 4.5, 5.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = kind === 'chaser' ? '#ff4f8b' : OUT; ctx.beginPath(); ctx.arc(-5, -15, 2.3, 0, 7); ctx.arc(7, -15, 2.3, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -23); ctx.lineTo(-3, -21); ctx.moveTo(10, -23); ctx.lineTo(3, -21); ctx.stroke();
    ctx.restore();
  };

  /* ---------- Guardianes (jefes) ---------- */
  ART.drawBoss = function (ctx, area, x, y, t, o = {}) {
    drawBossRaw(ctx, area, x, y, t, o);
    if (o.flash) { // destello al recibir un golpe: se suma luz solo sobre el propio jefe
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6;
      drawBossRaw(ctx, area, x, y, t, o); ctx.restore();
    }
  };
  function drawBossRaw(ctx, area, x, y, t, o) {
    const corrupt = !o.freed;
    ctx.save(); ctx.translate(x, y);
    const s = o.scale || 1; ctx.scale(s, s);
    ART.shadow(ctx, 0, 6, 60, 16, 0.35);
    const bob = Math.sin(t * 2.5) * 4;
    ctx.translate(0, bob);
    ctx.strokeStyle = OUT; ctx.lineWidth = 4;
    const eye = (ex, ey, r, col) => { blob(ctx, ex, ey, r, '#ffffff', OUT, 2.5); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ex, ey + 1, r * 0.5, 0, 7); ctx.fill(); };
    const eyeCol = corrupt ? '#b23cff' : OUT;
    switch (area) {
      case 'mat': {
        ctx.fillStyle = '#5a6bff'; rr(ctx, -46, -70, 92, 64, 14); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9aa6ff'; rr(ctx, -40, -150, 80, 72, 16); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#0d1033'; rr(ctx, -32, -142, 64, 50, 10); ctx.fill();
        ART.text(ctx, corrupt ? '¿?=¡!' : '= ✓', 0, -117, 18, corrupt ? '#ff6bd6' : '#7df9ff', 'center', null);
        ctx.strokeStyle = OUT; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, -170); ctx.stroke(); blob(ctx, 0, -174, 7, '#ffd23f');
        ctx.fillStyle = '#7280ff'; [-1, 1].forEach((k) => { rr(ctx, k * 50 - 9, -66 + Math.sin(t * 4 + k) * 6, 18, 46, 8); ctx.fill(); ctx.stroke(); });
        ART.text(ctx, '+ − × ÷', 0, -38, 16, '#ffd23f', 'center', OUT);
        break;
      }
      case 'len': {
        blob(ctx, 0, -70, 62, '#b07a45', OUT, 4);
        blob(ctx, 0, -55, 40, '#f2d3a1', OUT, 3);
        eye(-22, -95, 18, eyeCol); eye(22, -95, 18, eyeCol);
        ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-22, -95, 21, 0, 7); ctx.moveTo(43, -95); ctx.arc(22, -95, 21, 0, 7); ctx.moveTo(-1, -95); ctx.lineTo(1, -95); ctx.stroke();
        ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.moveTo(-7, -76); ctx.lineTo(7, -76); ctx.lineTo(0, -62); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b07a45'; ctx.beginPath(); ctx.moveTo(-40, -126); ctx.lineTo(-30, -150); ctx.lineTo(-18, -128); ctx.moveTo(40, -126); ctx.lineTo(30, -150); ctx.lineTo(18, -128); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e63946'; rr(ctx, -34, -34, 68, 24, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-2, -34, 4, 24);
        if (!corrupt) ART.text(ctx, '´', 0, -168, 40, '#ffd23f');
        break;
      }
      case 'med': {
        ctx.fillStyle = '#5b4a45';
        ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(-58, -100); ctx.lineTo(-20, -140); ctx.lineTo(25, -138); ctx.lineTo(62, -96); ctx.lineTo(70, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = corrupt ? '#b23cff' : '#ff8a1f'; ctx.lineWidth = 5; ctx.beginPath();
        ctx.moveTo(-40, -30); ctx.lineTo(-20, -60); ctx.lineTo(-30, -90); ctx.moveTo(35, -20); ctx.lineTo(20, -55); ctx.lineTo(38, -88); ctx.stroke();
        ctx.fillStyle = corrupt ? '#b23cff' : '#ffb03b'; ctx.beginPath(); ctx.ellipse(-22, -108, 10, 7, 0, 0, 7); ctx.ellipse(22, -108, 10, 7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#3ddc97'; ctx.beginPath(); ctx.moveTo(-6, -138); ctx.lineTo(0, -160); ctx.lineTo(6, -138); ctx.fill();
        ctx.fillStyle = '#ff5a1f'; ctx.globalAlpha = 0.7 + Math.sin(t * 6) * 0.3; ctx.beginPath(); ctx.ellipse(0, -132, 14, 5, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        break;
      }
      case 'ing': {
        blob(ctx, 0, -66, 52, '#e63946', OUT, 4);
        blob(ctx, 0, -50, 30, '#ffd23f', OUT, 3);
        [-1, 1].forEach((k) => { ctx.fillStyle = '#2fae5b'; ctx.beginPath(); ctx.ellipse(k * 56, -60 + Math.sin(t * 6) * 6 * k, 16, 34, k * 0.5, 0, 7); ctx.fill(); ctx.stroke(); });
        eye(-18, -88, 13, eyeCol); eye(18, -88, 13, eyeCol);
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-12, -74); ctx.quadraticCurveTo(0, -50, 12, -74); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1d3557'; rr(ctx, -40, -132, 80, 20, 8); ctx.fill(); ctx.stroke(); rr(ctx, -28, -150, 56, 22, 8); ctx.fill(); ctx.stroke();
        blob(ctx, 0, -138, 6, '#ffd23f', OUT, 2);
        break;
      }
      case 'ef': {
        blob(ctx, 0, -60, 58, '#8d99ae', OUT, 4);
        blob(ctx, 34, -70, 34, '#a3adc2', OUT, 3);
        ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.moveTo(56, -78); ctx.lineTo(82, -112); ctx.lineTo(64, -66); ctx.closePath(); ctx.fill(); ctx.stroke();
        eye(22, -88, 9, eyeCol); eye(44, -86, 8, eyeCol);
        ctx.fillStyle = '#e63946'; rr(ctx, -10, -110, 70, 12, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(10, -24, 8, 0, 7); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -32); ctx.lineTo(20, -60); ctx.stroke();
        [-1, 1].forEach((k) => { ctx.fillStyle = '#8d99ae'; ctx.strokeStyle = OUT; ctx.lineWidth = 3; rr(ctx, k * 30 - 10, -20, 20, 22, 6); ctx.fill(); ctx.stroke(); });
        break;
      }
      default: { // Borrón (jefe final)
        ctx.fillStyle = corrupt ? '#22164f' : '#c9d2ff';
        for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + t * 0.4; ctx.beginPath(); ctx.arc(Math.cos(a) * 58, -80 + Math.sin(a) * 38, 34 + Math.sin(t * 3 + i) * 4, 0, 7); ctx.fill(); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, -80, 62, 0, 7); ctx.fill();
        eye(-26, -92, 14, '#ff4f8b'); eye(26, -92, 14, '#ff4f8b'); eye(0, -58, 9, '#ff4f8b');
        ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-28, -134); ctx.lineTo(-30, -160); ctx.lineTo(-14, -146); ctx.lineTo(0, -168); ctx.lineTo(14, -146); ctx.lineTo(30, -160); ctx.lineTo(28, -134); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    if (corrupt && area !== 'final') { // salpicaduras de tinta
      ctx.fillStyle = 'rgba(46,31,102,0.85)';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(Math.sin(i * 2.1) * 40, -40 - ((i * 23) % 100), 7 + (i % 3) * 3, 0, 7); ctx.fill(); }
      ctx.fillRect(-30, -20, 6, 12 + Math.sin(t * 3) * 4); ctx.fillRect(18, -24, 5, 16 + Math.cos(t * 3) * 4);
    }
    ctx.restore();
  }

  /* ---------- Objetos del mundo ---------- */
  ART.drawCoin = function (ctx, x, y, t) {
    const w = Math.abs(Math.sin(t * 3)) * 9 + 2, by = y - 16 + Math.sin(t * 4) * 3;
    ART.shadow(ctx, x, y, 8, 3, 0.2);
    ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#a86b00'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(x, by, w, 11, 0, 0, 7); ctx.fill(); ctx.stroke();
    if (w > 5) { ctx.fillStyle = '#fff6c2'; ctx.fillRect(x - 1.5, by - 6, 3, 12); }
  };
  ART.drawPickup = function (ctx, kind, x, y, t) {
    const by = y - 18 + Math.sin(t * 4) * 3;
    ART.shadow(ctx, x, y, 10, 4, 0.2);
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    if (kind === 'heart') {
      ctx.fillStyle = '#ff4f6d'; ctx.beginPath(); ctx.moveTo(x, by + 10);
      ctx.bezierCurveTo(x - 16, by - 2, x - 8, by - 14, x, by - 5); ctx.bezierCurveTo(x + 8, by - 14, x + 16, by - 2, x, by + 10); ctx.fill(); ctx.stroke();
    } else if (kind === 'bulb') {
      blob(ctx, x, by - 2, 9, '#fff27a', '#a88600', 2.5); ctx.fillStyle = '#9aa3c7'; ctx.fillRect(x - 4, by + 6, 8, 5);
    } else if (kind === 'orb') {
      const g = ctx.createRadialGradient(x, by, 2, x, by, 22); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(125,249,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, by, 22, 0, 7); ctx.fill();
      blob(ctx, x, by, 12, '#7df9ff', '#0b5f7a', 3); ART.text(ctx, '?', x, by + 1, 15, '#0b3d5a', 'center', null);
    } else if (kind === 'relic') {
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 6 : 14; ctx.lineTo(x + Math.cos(a) * r, by + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
    } else { // objeto de misión
      const cols = { mat: '#c0c8ff', len: '#fff6e0', med: '#8bd35f', ing: '#7df9ff', ef: '#ffd23f', mix: '#ff9fc0' };
      blob(ctx, x, by, 10, cols[kind] || '#fff', OUT, 2.5);
      const g = { mat: '⚙', len: '¶', med: '✿', ing: '✉', ef: '♪', mix: '★' }[kind] || '★';
      ART.text(ctx, g, x, by + 1, 12, OUT, 'center', null);
    }
  };
  ART.drawChest = function (ctx, x, y, open, gold, t) {
    ART.shadow(ctx, x, y + 2, 22, 7);
    const base = gold ? '#ffd23f' : '#b5651d', trim = gold ? '#fff6c2' : '#ffd23f';
    ctx.strokeStyle = OUT; ctx.lineWidth = 3;
    ctx.fillStyle = base; rr(ctx, x - 22, y - 26, 44, 26, 5); ctx.fill(); ctx.stroke();
    if (open) {
      ctx.fillStyle = shade(base, -30); rr(ctx, x - 22, y - 44, 44, 16, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,240,150,0.6)'; ctx.beginPath(); ctx.moveTo(x - 16, y - 28); ctx.lineTo(x - 26, y - 60); ctx.lineTo(x + 26, y - 60); ctx.lineTo(x + 16, y - 28); ctx.fill();
    } else {
      ctx.fillStyle = shade(base, 20); rr(ctx, x - 24, y - 40, 48, 18, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = trim; ctx.fillRect(x - 4, y - 32, 8, 12); ctx.strokeRect(x - 4, y - 32, 8, 12);
      if (gold) { const s = (t * 2) % 1; ctx.fillStyle = `rgba(255,255,255,${1 - s})`; ctx.beginPath(); ctx.arc(x + 14, y - 44 - s * 10, 3, 0, 7); ctx.fill(); }
    }
  };
  ART.drawGate = function (ctx, g, theme, t) {
    const th = ART.THEMES[theme];
    const x = g.x, y = g.y; // centro de la puerta (3 baldosas de alto)
    const h = 3 * T;
    if (g.open) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x - T / 2, y - h / 2, T, h);
      ctx.fillStyle = th.wallFace; ctx.fillRect(x - T / 2 + 4, y + h / 2 - 10, T - 8, 8);
      return;
    }
    const lift = g.anim ? g.anim * h : 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(x - T / 2, y - h / 2 - 30, T, h + 30); ctx.clip();
    const top = y - h / 2 - 24 - lift;
    const grd = ctx.createLinearGradient(x - T / 2, 0, x + T / 2, 0);
    const col = g.kind === 'mech' ? '#3ddc97' : g.kind === 'boss' ? '#ff4f8b' : '#ffd23f';
    grd.addColorStop(0, shade(th.wallFace, -20)); grd.addColorStop(0.5, shade(th.wallTop, 10)); grd.addColorStop(1, shade(th.wallFace, -20));
    ctx.fillStyle = grd; ctx.strokeStyle = OUT; ctx.lineWidth = 3;
    rr(ctx, x - T / 2 + 2, top, T - 4, h + 22, 8); ctx.fill(); ctx.stroke();
    for (let i = 1; i < 4; i++) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x - T / 2 + 6, top + i * 38, T - 12, 4); }
    const py = top + (h + 22) / 2;
    const pulse = 0.6 + Math.sin(t * 4) * 0.4;
    ctx.fillStyle = OUT; rr(ctx, x - 17, py - 17, 34, 34, 8); ctx.fill();
    ctx.globalAlpha = pulse; ctx.fillStyle = col; rr(ctx, x - 14, py - 14, 28, 28, 6); ctx.fill(); ctx.globalAlpha = 1;
    const label = g.kind === 'mech' ? '⚡' : g.kind === 'boss' ? '!' : (g.need > 1 ? (g.need - g.progress) + '?' : '?');
    ART.text(ctx, label, x, py + 1, 18, OUT, 'center', null);
    ctx.restore();
  };
  ART.drawNPC = function (ctx, x, y, t, col, hat, mark) {
    ART.drawPlayer(ctx, x, y, 0, 'down', t, { skin: col.skin, hair: col.hair, hairColor: col.hairColor, outfit: col.outfit, acc: hat }, { moving: false });
    if (mark) {
      const by = y - 84 + Math.sin(t * 5) * 4;
      blob(ctx, x, by, 11, mark === '!' ? '#ffd23f' : '#3ddc97', OUT, 2.5);
      ART.text(ctx, mark, x, by + 1, 15, OUT, 'center', null);
    }
  };
  ART.drawSign = function (ctx, x, y) {
    ART.shadow(ctx, x, y, 12, 4);
    ctx.fillStyle = '#8a5a3c'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    ctx.fillRect(x - 3, y - 26, 6, 26); ctx.strokeRect(x - 3, y - 26, 6, 26);
    rr(ctx, x - 20, y - 46, 40, 24, 5); ctx.fillStyle = '#d9a066'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = OUT; ctx.fillRect(x - 12, y - 39, 24, 3); ctx.fillRect(x - 12, y - 32, 16, 3);
  };
  ART.drawSwitch = function (ctx, x, y, on) {
    ART.shadow(ctx, x, y, 14, 5);
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    ctx.fillStyle = '#6b6f8f'; rr(ctx, x - 16, y - 14, 32, 14, 5); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + (on ? 12 : -12), y - 30); ctx.stroke();
    blob(ctx, x + (on ? 12 : -12), y - 32, 6, on ? '#3ddc97' : '#ff4f6d', OUT, 2);
  };
  ART.drawBarrier = function (ctx, x, y, down, th) {
    if (down) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y - 4, 16, 7, 0, 0, 7); ctx.fill(); return; }
    ART.shadow(ctx, x, y, 18, 6);
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    const g = ctx.createLinearGradient(x - 16, 0, x + 16, 0); g.addColorStop(0, '#ff4f6d'); g.addColorStop(1, '#a01e3a');
    ctx.fillStyle = g; rr(ctx, x - 16, y - 46, 32, 46, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 16, y - 30, 32, 6); ctx.fillRect(x - 16, y - 16, 32, 6);
  };

  /** Decoración por tema (sólida). */
  ART.drawProp = function (ctx, kind, x, y, t) {
    ctx.strokeStyle = OUT; ctx.lineWidth = 3;
    switch (kind) {
      case 'cube': ART.shadow(ctx, x, y, 20, 7); ctx.fillStyle = '#4cc9f0'; ctx.beginPath(); ctx.moveTo(x - 18, y - 10); ctx.lineTo(x, y - 2); ctx.lineTo(x + 18, y - 10); ctx.lineTo(x + 18, y - 34); ctx.lineTo(x, y - 42); ctx.lineTo(x - 18, y - 34); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7df9ff'; ctx.beginPath(); ctx.moveTo(x - 18, y - 34); ctx.lineTo(x, y - 26); ctx.lineTo(x + 18, y - 34); ctx.lineTo(x, y - 42); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x, y - 2); ctx.stroke(); break;
      case 'pyramid': ART.shadow(ctx, x, y, 20, 7); ctx.fillStyle = '#ff6b9a'; ctx.beginPath(); ctx.moveTo(x - 20, y - 4); ctx.lineTo(x, y - 48); ctx.lineTo(x + 20, y - 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffa3c0'; ctx.beginPath(); ctx.moveTo(x, y - 48); ctx.lineTo(x - 20, y - 4); ctx.lineTo(x - 4, y - 4); ctx.closePath(); ctx.fill(); break;
      case 'screen': ART.shadow(ctx, x, y, 16, 5); ctx.fillStyle = '#2b2d42'; ctx.fillRect(x - 3, y - 20, 6, 20); rr(ctx, x - 22, y - 52, 44, 32, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7df9ff'; ctx.globalAlpha = 0.7 + Math.sin(t * 3) * 0.3; rr(ctx, x - 17, y - 47, 34, 22, 4); ctx.fill(); ctx.globalAlpha = 1; ART.text(ctx, ['2+2', 'x²', '¾', '√9'][Math.floor(x) % 4], x, y - 36, 11, OUT, 'center', null); break;
      case 'sphere': ART.shadow(ctx, x, y, 16, 6); blob(ctx, x, y - 20, 16, '#b98bff'); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 20, 16, 5, 0, 0, 7); ctx.stroke(); break;
      case 'shelf': ART.shadow(ctx, x, y, 22, 6); ctx.fillStyle = '#6b3f22'; rr(ctx, x - 22, y - 62, 44, 62, 4); ctx.fill(); ctx.stroke();
        ['#e63946', '#4cc9f0', '#ffd23f', '#3ddc97', '#b98bff', '#ff8a3d'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x - 18 + (i % 3) * 12, y - 56 + Math.floor(i / 3) * 28, 9, 22); }); break;
      case 'books': ART.shadow(ctx, x, y, 18, 6); ['#e63946', '#4cc9f0', '#ffd23f', '#3ddc97'].forEach((c, i) => { ctx.fillStyle = c; rr(ctx, x - 18 + (i % 2) * 4, y - 10 - i * 9, 34, 9, 2); ctx.fill(); ctx.stroke(); }); break;
      case 'lamp': ART.shadow(ctx, x, y, 12, 4); ctx.fillStyle = '#2b2d42'; ctx.fillRect(x - 2, y - 44, 4, 44); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x - 14, y - 40); ctx.lineTo(x - 6, y - 56); ctx.lineTo(x + 6, y - 56); ctx.lineTo(x + 14, y - 40); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,230,120,0.18)'; ctx.beginPath(); ctx.arc(x, y - 36, 30, 0, 7); ctx.fill(); break;
      case 'scroll': ART.shadow(ctx, x, y, 18, 5); ctx.fillStyle = '#fff6e0'; rr(ctx, x - 18, y - 22, 36, 18, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = OUT; ctx.fillRect(x - 10, y - 15, 20, 2); ctx.fillRect(x - 10, y - 10, 14, 2); break;
      case 'drago': ART.shadow(ctx, x, y, 24, 7); ctx.fillStyle = '#9a8478'; ctx.fillRect(x - 5, y - 30, 10, 30); ctx.strokeRect(x - 5, y - 30, 10, 30);
        ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x - 16, y - 46); ctx.moveTo(x, y - 30); ctx.lineTo(x + 16, y - 46); ctx.lineWidth = 6; ctx.strokeStyle = '#9a8478'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = OUT;
        [-16, 0, 16].forEach((dx, i) => { ctx.fillStyle = '#4f9d3a'; ctx.beginPath(); ctx.ellipse(x + dx, y - 52 - (i === 1 ? 6 : 0), 15, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); }); break;
      case 'palm': ART.shadow(ctx, x, y, 18, 6); ctx.strokeStyle = '#8a5a3c'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 30, x + 2, y - 58); ctx.stroke(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.7; ctx.fillStyle = '#3ddc97'; ctx.beginPath(); ctx.ellipse(x + 2 + Math.cos(a) * 16, y - 58 + Math.sin(a) * 10 + 6, 18, 5, a, 0, 7); ctx.fill(); ctx.stroke(); } break;
      case 'rock': ART.shadow(ctx, x, y, 22, 7); ctx.fillStyle = '#4a3c38'; ctx.beginPath(); ctx.moveTo(x - 22, y - 2); ctx.lineTo(x - 16, y - 24); ctx.lineTo(x + 2, y - 32); ctx.lineTo(x + 20, y - 20); ctx.lineTo(x + 22, y - 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#6e5c56'; ctx.beginPath(); ctx.moveTo(x - 16, y - 24); ctx.lineTo(x + 2, y - 32); ctx.lineTo(x - 2, y - 16); ctx.closePath(); ctx.fill(); break;
      case 'cardon': ART.shadow(ctx, x, y, 18, 6); ctx.fillStyle = '#5aa04a'; [-12, 0, 12].forEach((dx, i) => { rr(ctx, x + dx - 5, y - 34 - (i === 1 ? 12 : 0), 10, 34 + (i === 1 ? 12 : 0), 5); ctx.fill(); ctx.stroke(); }); break;
      case 'lamp2': ART.shadow(ctx, x, y, 10, 4); ctx.fillStyle = '#1d3557'; ctx.fillRect(x - 3, y - 56, 6, 56); ctx.strokeRect(x - 3, y - 56, 6, 56); blob(ctx, x, y - 60, 9, '#ffe27a', OUT, 2.5); break;
      case 'tree': ART.shadow(ctx, x, y, 20, 7); ctx.fillStyle = '#8a5a3c'; ctx.fillRect(x - 5, y - 24, 10, 24); ctx.strokeRect(x - 5, y - 24, 10, 24); blob(ctx, x, y - 40, 22, '#3ddc97'); blob(ctx, x - 12, y - 30, 12, '#2fae5b', OUT, 2); break;
      case 'mailbox': ART.shadow(ctx, x, y, 12, 4); ctx.fillStyle = '#e63946'; rr(ctx, x - 11, y - 44, 22, 44, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = OUT; ctx.fillRect(x - 7, y - 32, 14, 3); break;
      case 'bench': ART.shadow(ctx, x, y, 24, 6); ctx.fillStyle = '#b5651d'; rr(ctx, x - 24, y - 22, 48, 8, 3); ctx.fill(); ctx.stroke(); rr(ctx, x - 24, y - 36, 48, 8, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2b2d42'; ctx.fillRect(x - 20, y - 14, 4, 14); ctx.fillRect(x + 16, y - 14, 4, 14); break;
      case 'cone': ART.shadow(ctx, x, y, 14, 5); ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.moveTo(x - 14, y - 4); ctx.lineTo(x, y - 40); ctx.lineTo(x + 14, y - 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(x - 8, y - 22, 16, 5); break;
      case 'ball': ART.shadow(ctx, x, y, 14, 5); blob(ctx, x, y - 14, 14, '#ffffff'); ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x, y - 14, 5, 0, 7); ctx.fill(); break;
      case 'hurdle': ART.shadow(ctx, x, y, 22, 5); ctx.fillStyle = '#fff'; ctx.fillRect(x - 20, y - 26, 4, 26); ctx.fillRect(x + 16, y - 26, 4, 26); ctx.fillStyle = '#e63946'; rr(ctx, x - 22, y - 30, 44, 9, 3); ctx.fill(); ctx.stroke(); break;
    }
  };
})(window.EZ);
