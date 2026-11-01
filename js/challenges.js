/* ==========================================================
   EUREKA DROP · challenges.js
   Interfaz de los retos educativos. Cada formato tiene su propia
   presentación. Todo funciona con ratón, táctil y teclado.
   Formatos: mc, tf, input, order, place, match, hotspot, listen
   (+ «visual»: barras, tabla, cuadrícula, ángulo, fracción,
   figura, reloj, mapa de Canarias).
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, I = EZ.icons;
  const C = (EZ.challenge = {});
  let keyHandler = null;

  /* ---------------- Visuales SVG ---------------- */
  const ISLANDS = [
    { id: 'la-palma', n: 'La Palma', d: 'M48 70 L64 74 L70 100 L66 128 L56 150 L46 132 L40 104 Z' },
    { id: 'el-hierro', n: 'El Hierro', d: 'M20 232 L40 222 L58 228 L52 240 L36 238 L26 246 Z' },
    { id: 'la-gomera', n: 'La Gomera', d: 'M114 182 L130 172 L146 180 L144 198 L128 204 L114 196 Z' },
    { id: 'tenerife', n: 'Tenerife', d: 'M166 186 L184 160 L208 150 L236 132 L248 138 L238 160 L222 184 L198 200 L176 200 Z' },
    { id: 'gran-canaria', n: 'Gran Canaria', d: 'M296 206 L304 184 L326 176 L350 186 L354 210 L340 232 L316 236 L300 226 Z' },
    { id: 'fuerteventura', n: 'Fuerteventura', d: 'M446 206 L458 196 L476 176 L494 150 L512 128 L530 100 L542 104 L536 128 L518 156 L500 180 L478 200 L462 214 Z' },
    { id: 'lanzarote', n: 'Lanzarote', d: 'M528 88 L540 72 L556 60 L572 46 L584 48 L580 64 L566 78 L548 92 L534 96 Z' },
    { id: 'la-graciosa', n: 'La Graciosa', d: 'M560 30 L570 24 L578 30 L570 36 Z' }
  ];
  C.ISLANDS = ISLANDS;

  function svgBars(v, clickable) {
    const n = v.valores.length, top = Math.max(...v.valores) * 1.1, W = 520, H = 230, L = 46, B = 196;
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000].find((k) => k * 4 >= top) || Math.ceil(top / 4), max = step * 4;
    const bw = (W - L - 20) / n;
    let g = `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras: ${U.esc(v.titulo || '')}">`;
    if (v.titulo) g += `<text x="${W / 2}" y="18" class="viz-title" text-anchor="middle">${U.esc(v.titulo)}</text>`;
    for (let k = 0; k <= 4; k++) {
      const val = step * k, y = B - (val / max) * (B - 30);
      g += `<line x1="${L}" x2="${W - 10}" y1="${y}" y2="${y}" class="viz-grid"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" class="viz-axis">${Math.round(val)}</text>`;
    }
    const cols = ['#4cc9f0', '#ffd23f', '#ff6b9a', '#3ddc97', '#b98bff', '#ff9f43', '#7df9ff'];
    v.valores.forEach((val, i) => {
      const h = (val / max) * (B - 30), x = L + 8 + i * bw;
      const attrs = clickable ? `class="hot bar-hot" data-id="${i}" tabindex="0" role="button" aria-label="${U.esc(v.etiquetas[i])}: ${val}"` : '';
      g += `<g ${attrs}><rect x="${x}" y="${B - h}" width="${bw - 16}" height="${h}" rx="6" fill="${cols[i % cols.length]}" stroke="#1b1446" stroke-width="2"/>`;
      if (v.mostrarValores) g += `<text x="${x + (bw - 16) / 2}" y="${B - h - 6}" text-anchor="middle" class="viz-val">${val}</text>`;
      g += `<text x="${x + (bw - 16) / 2}" y="${B + 18}" text-anchor="middle" class="viz-axis">${U.esc(v.etiquetas[i])}</text></g>`;
    });
    if (v.unidad) g += `<text x="10" y="40" class="viz-axis">${U.esc(v.unidad)}</text>`;
    return g + '</svg>';
  }
  function svgTable(v) {
    let h = '<table class="viz-table"><thead><tr>' + v.cabecera.map((c) => `<th>${U.esc(c)}</th>`).join('') + '</tr></thead><tbody>';
    v.filas.forEach((f) => { h += '<tr>' + f.map((c) => `<td>${U.esc(c)}</td>`).join('') + '</tr>'; });
    return h + '</tbody></table>';
  }
  function svgGrid(v, clickable) {
    const m = v.max || 6, S = 34, O = 34, W = O + m * S + 20;
    let g = `<svg class="viz viz-grid-svg" viewBox="0 0 ${W} ${W}" role="img" aria-label="Cuadrícula de coordenadas">`;
    for (let i = 0; i <= m; i++) {
      g += `<line x1="${O + i * S}" y1="${O - 14}" x2="${O + i * S}" y2="${O + m * S}" class="viz-grid"/>`;
      g += `<line x1="${O}" y1="${O + i * S}" x2="${O + m * S + 14}" y2="${O + i * S}" class="viz-grid"/>`;
      g += `<text x="${O + i * S}" y="${O + m * S + 18}" text-anchor="middle" class="viz-axis">${i}</text>`;
      g += `<text x="${O - 10}" y="${O + (m - i) * S + 4}" text-anchor="end" class="viz-axis">${i}</text>`;
    }
    g += `<line x1="${O}" y1="${O + m * S}" x2="${O + m * S + 14}" y2="${O + m * S}" class="viz-axisline"/><line x1="${O}" y1="${O - 14}" x2="${O}" y2="${O + m * S}" class="viz-axisline"/>`;
    (v.puntos || []).forEach((p) => {
      const x = O + p.x * S, y = O + (m - p.y) * S;
      g += `<circle cx="${x}" cy="${y}" r="7" fill="#ff4f8b" stroke="#fff" stroke-width="2"/><text x="${x + 10}" y="${y - 8}" class="viz-val">${U.esc(p.n)}</text>`;
    });
    if (clickable) {
      for (let x = 0; x <= m; x++) for (let y = 0; y <= m; y++) {
        g += `<circle class="hot grid-hot" data-id="${x},${y}" cx="${O + x * S}" cy="${O + (m - y) * S}" r="11" tabindex="0" role="button" aria-label="Punto (${x}, ${y})"/>`;
      }
    }
    return g + '</svg>';
  }
  function svgAngle(v) {
    const a = (v.grados * Math.PI) / 180, cx = 70, cy = 150, R = 120;
    const x2 = cx + R * Math.cos(-a), y2 = cy + R * Math.sin(-a);
    const ar = 40, ax = cx + ar * Math.cos(-a), ay = cy + ar * Math.sin(-a);
    return `<svg class="viz" viewBox="0 0 260 180" role="img" aria-label="Ángulo"><line x1="${cx}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#4cc9f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>
      <path d="M${cx + ar} ${cy} A${ar} ${ar} 0 ${v.grados > 180 ? 1 : 0} 0 ${ax} ${ay}" fill="none" stroke="#ff6b9a" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="#fff"/>${v.mostrar ? `<text x="${cx + 48}" y="${cy - 14}" class="viz-val">${v.grados}°</text>` : ''}</svg>`;
  }
  function svgFraction(v) {
    const cx = 90, cy = 90, r = 72;
    let g = `<svg class="viz" viewBox="0 0 180 180" role="img" aria-label="Círculo dividido en ${v.den} partes, ${v.num} coloreadas">`;
    for (let i = 0; i < v.den; i++) {
      const a0 = (i / v.den) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / v.den) * Math.PI * 2 - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      g += `<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z" fill="${i < v.num ? '#ffd23f' : '#2a2350'}" stroke="#fff" stroke-width="3"/>`;
    }
    return g + '</svg>';
  }
  function svgShape(v) {
    const u = v.unidad || 'cm';
    if (v.forma === 'triangulo') {
      return `<svg class="viz" viewBox="0 0 280 190" role="img" aria-label="Triángulo de base ${v.base} y altura ${v.altura}"><path d="M30 160 L250 160 L110 30 Z" fill="#3ddc97" stroke="#fff" stroke-width="3"/>
        <line x1="110" y1="30" x2="110" y2="160" stroke="#ffd23f" stroke-width="3" stroke-dasharray="7 5"/><rect x="110" y="148" width="12" height="12" fill="none" stroke="#ffd23f" stroke-width="2"/>
        <text x="140" y="182" text-anchor="middle" class="viz-val">${v.base} ${u}</text><text x="118" y="100" class="viz-val">${v.altura} ${u}</text></svg>`;
    }
    return `<svg class="viz" viewBox="0 0 280 180" role="img" aria-label="Rectángulo de ${v.base} por ${v.altura}"><rect x="40" y="30" width="200" height="110" rx="4" fill="#4cc9f0" stroke="#fff" stroke-width="3"/>
      <text x="140" y="165" text-anchor="middle" class="viz-val">${v.base} ${u}</text><text x="248" y="90" class="viz-val">${v.altura} ${u}</text></svg>`;
  }
  function svgClock(v) {
    const cx = 90, cy = 90, r = 76;
    let g = `<svg class="viz" viewBox="0 0 180 180" role="img" aria-label="Reloj analógico"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#1b1446" stroke-width="6"/>`;
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      g += `<text x="${cx + 58 * Math.cos(a)}" y="${cy + 58 * Math.sin(a) + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#1b1446">${i}</text>`;
    }
    const ma = (v.m / 60) * Math.PI * 2 - Math.PI / 2, ha = (((v.h % 12) + v.m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    g += `<line x1="${cx}" y1="${cy}" x2="${cx + 40 * Math.cos(ha)}" y2="${cy + 40 * Math.sin(ha)}" stroke="#1b1446" stroke-width="7" stroke-linecap="round"/>`;
    g += `<line x1="${cx}" y1="${cy}" x2="${cx + 62 * Math.cos(ma)}" y2="${cy + 62 * Math.sin(ma)}" stroke="#ff4f8b" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="#1b1446"/>`;
    return g + '</svg>';
  }
  function svgCanarias(clickable, marked) {
    let g = `<svg class="viz viz-map" viewBox="0 0 600 270" role="img" aria-label="Mapa de las islas Canarias">`;
    g += `<rect width="600" height="270" rx="16" fill="#1d5d9b"/><text x="16" y="258" class="viz-axis" fill="#cfe8ff">Océano Atlántico</text>`;
    ISLANDS.forEach((is) => {
      const attrs = clickable ? `class="hot isle-hot" data-id="${is.id}" tabindex="0" role="button" aria-label="${is.n}"` : '';
      const fill = marked === is.id ? '#ffd23f' : '#3ddc97';
      g += `<path ${attrs} d="${is.d}" fill="${fill}" stroke="#0f3b2a" stroke-width="2.5" stroke-linejoin="round"/>`;
    });
    return g + '</svg>';
  }
  C.renderVisual = function (v, clickable) {
    if (!v) return '';
    switch (v.tipo) {
      case 'barras': return svgBars(v, clickable);
      case 'tabla': return svgTable(v);
      case 'cuadricula': return svgGrid(v, clickable);
      case 'angulo': return svgAngle(v);
      case 'fraccion': return svgFraction(v);
      case 'figura': return svgShape(v);
      case 'reloj': return svgClock(v);
      case 'canarias': return svgCanarias(clickable, v.marcada);
      default: return '';
    }
  };

  /* ---------------- Presentación por formato ---------------- */
  const TYPE_INFO = {
    mc: 'Elige la respuesta', tf: '¿Verdadero o falso?', input: 'Escribe la respuesta', order: 'Ordena las piezas',
    place: 'Coloca cada palabra en su hueco', match: 'Relaciona las parejas', hotspot: 'Señala en la imagen', listen: 'Escucha y elige'
  };

  /**
   * Muestra un reto y devuelve una promesa con el resultado.
   * opts: { kind, title, icon, theme, canRetreat, hintCost, getHint(), onResult(correct, q, secs) → {title, lines[]} }
   */
  C.ask = function (q, opts = {}) {
    return new Promise((resolve) => {
      const modal = U.$('#modal');
      const t0 = performance.now();
      let answer = null, usedHint = false, done = false;
      const shuffledIdx = (q.tipo === 'mc' || q.tipo === 'listen') ? U.shuffle(q.opciones.map((_, i) => i)) : null;

      modal.innerHTML = '';
      const card = U.el('div', { class: `ch-card ch-${q.tipo} theme-${opts.theme || q.area}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ch-q' });
      card.innerHTML = `
        <header class="ch-head">
          <span class="ch-kind">${opts.icon || ''}${U.esc(opts.title || 'Reto')}</span>
          <span class="ch-tag">${U.esc(q.bloque || '')} · Nv ${q.nivel}</span>
        </header>
        <div class="ch-type">${TYPE_INFO[q.tipo] || ''}</div>
        <p class="ch-q" id="ch-q">${U.esc(q.enunciado)}</p>
        ${EZ.audio.canSpeak() && q.tipo !== 'listen' ? `<button class="btn btn-ghost ch-read" type="button" aria-label="Leer la pregunta en voz alta">${I.speaker}<span>Leer</span></button>` : ''}
        <div class="ch-visual"></div>
        <div class="ch-answer"></div>
        <div class="ch-hint" hidden></div>
        <footer class="ch-foot">
          ${opts.canRetreat ? '<button class="btn btn-ghost ch-retreat" type="button">Dejarlo</button>' : ''}
          <button class="btn btn-hint ch-hint-btn" type="button">${I.bulb}<span>Pista</span></button>
          <button class="btn btn-go ch-submit" type="button" hidden>Comprobar</button>
        </footer>
        <div class="ch-feedback" hidden aria-live="assertive"></div>`;
      modal.appendChild(card);
      modal.classList.add('show');
      const visual = U.$('.ch-visual', card), area = U.$('.ch-answer', card), submit = U.$('.ch-submit', card);
      const hintBox = U.$('.ch-hint', card), hintBtn = U.$('.ch-hint-btn', card);
      const readBtn = U.$('.ch-read', card);
      if (readBtn) {
        const lang = q.area === 'ing' ? 'en-GB' : 'es-ES';
        const letters = 'ABCD';
        const say = () => {
          let txt = (q.texto ? q.texto.replace(/___/g, ' hueco ') + '. ' : '') + q.enunciado;
          if (q.tipo === 'mc' && q.opciones) txt += '. ' + q.opciones.map((o, i) => letters[i] + ': ' + o).join('. ');
          EZ.audio.speak(txt, lang, EZ.curso() <= 2 ? 0.8 : 0.9);
        };
        readBtn.addEventListener('click', say);
        if (EZ.save.settings.readAloud && q.tipo !== 'listen') setTimeout(say, 400);
      }

      const finish = () => {
        if (done) return;
        done = true;
        const secs = (performance.now() - t0) / 1000;
        const correct = EZ.questions.check(q, answer);
        const fb = opts.onResult ? opts.onResult(correct, q, secs, usedHint, answer) : { title: correct ? '¡Correcto!' : '¡Ups!' };
        showFeedback(correct, fb, () => close({ correct, answer, secs, usedHint, retreat: false }));
      };
      const close = (res) => {
        if (keyHandler) document.removeEventListener('keydown', keyHandler, true);
        keyHandler = null;
        modal.classList.remove('show');
        modal.innerHTML = '';
        if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* nada */ }
        resolve(res);
      };

      // Pistas
      const hintCost = opts.hintCost ? opts.hintCost() : null;
      if (!hintCost) hintBtn.hidden = true;
      else hintBtn.querySelector('span').textContent = 'Pista · ' + hintCost.label;
      hintBtn.addEventListener('click', () => {
        if (usedHint) return;
        if (!opts.spendHint || !opts.spendHint()) { hintBox.hidden = false; hintBox.textContent = 'No tienes pistas ni monedas suficientes.'; return; }
        usedHint = true; hintBtn.disabled = true;
        EZ.audio.play('pickup');
        hintBox.hidden = false;
        if (q.pista) hintBox.innerHTML = I.bulb + ' ' + U.esc(q.pista);
        else if (shuffledIdx) {
          const wrong = U.shuffle(shuffledIdx.filter((i) => i !== q.correcta)).slice(0, 2);
          wrong.forEach((i) => { const b = area.querySelector(`[data-i="${i}"]`); if (b) { b.disabled = true; b.classList.add('struck'); } });
          hintBox.innerHTML = I.bulb + ' He tachado dos respuestas incorrectas.';
        } else hintBox.textContent = 'Lee el enunciado despacio y busca la palabra clave.';
      });
      if (opts.canRetreat) U.$('.ch-retreat', card).addEventListener('click', () => close({ correct: false, retreat: true }));

      // Visual
      const clickable = q.tipo === 'hotspot';
      if (q.visual) visual.innerHTML = C.renderVisual(q.visual, clickable);
      else visual.remove();

      // Respuesta según formato
      const builders = {
        mc() {
          area.className = 'ch-answer opts';
          shuffledIdx.forEach((i, k) => {
            const b = U.el('button', { class: 'opt', type: 'button', 'data-i': i }, `<span class="opt-key">${'ABCD'[k]}</span><span>${U.esc(q.opciones[i])}</span>`);
            b.addEventListener('click', () => { answer = i; finish(); });
            area.appendChild(b);
          });
        },
        tf() {
          area.className = 'ch-answer tf';
          [[true, 'VERDADERO', I.check], [false, 'FALSO', I.cross]].forEach(([v, txt, ic], k) => {
            const b = U.el('button', { class: 'opt opt-tf ' + (v ? 'tf-v' : 'tf-f'), type: 'button', 'data-k': k }, ic + `<span>${txt}</span>`);
            b.addEventListener('click', () => { answer = v; finish(); });
            area.appendChild(b);
          });
        },
        input() {
          area.className = 'ch-answer inp';
          const numeric = q.respuestas.every((r) => !isNaN(U.toNumber(r)));
          const inp = U.el('input', { type: 'text', class: 'ch-input', 'aria-label': 'Tu respuesta', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: numeric ? 'decimal' : 'text' });
          area.appendChild(inp);
          if (q.unidad) area.appendChild(U.el('span', { class: 'ch-unit' }, U.esc(q.unidad)));
          submit.hidden = false;
          const go = () => { if (inp.value.trim()) { answer = inp.value; finish(); } else inp.focus(); };
          submit.addEventListener('click', go);
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); go(); } });
          setTimeout(() => inp.focus(), 60);
        },
        order() {
          area.className = 'ch-answer ord';
          const placed = [];
          const slot = U.el('div', { class: 'ord-row', 'aria-label': 'Tu orden' });
          const pool = U.el('div', { class: 'ord-pool' });
          area.append(slot, pool);
          let items = U.shuffle(q.elementos.map((t, i) => ({ t, i })));
          if (items.every((x, k) => x.i === k)) items = items.reverse();
          const render = () => {
            slot.innerHTML = placed.length ? '' : '<span class="ord-empty">Pulsa las piezas en orden</span>';
            placed.forEach((it, k) => {
              const b = U.el('button', { class: 'chip chip-placed', type: 'button' }, `<b>${k + 1}</b> ${U.esc(it.t)}`);
              b.addEventListener('click', () => { placed.splice(k, 1); EZ.audio.play('click'); render(); });
              slot.appendChild(b);
            });
            pool.innerHTML = '';
            items.filter((it) => !placed.includes(it)).forEach((it) => {
              const b = U.el('button', { class: 'chip', type: 'button' }, U.esc(it.t));
              b.addEventListener('click', () => { placed.push(it); EZ.audio.play('click'); render(); });
              pool.appendChild(b);
            });
            submit.hidden = placed.length !== items.length;
          };
          submit.addEventListener('click', () => { answer = placed.map((p) => p.t); finish(); });
          render();
        },
        place() {
          area.className = 'ch-answer plc';
          const parts = q.texto.split('___');
          const fill = new Array(q.huecos.length).fill(null);
          let sel = 0;
          const textEl = U.el('div', { class: 'plc-text' });
          const bank = U.el('div', { class: 'ord-pool' });
          area.append(textEl, bank);
          const words = U.shuffle(q.huecos.concat(q.distractores || []).map((t, i) => ({ t, i })));
          const render = () => {
            textEl.innerHTML = '';
            parts.forEach((p, k) => {
              textEl.appendChild(document.createTextNode(p));
              if (k < fill.length) {
                const g = U.el('button', { class: 'gap' + (k === sel ? ' gap-sel' : '') + (fill[k] ? ' gap-full' : ''), type: 'button', 'aria-label': 'Hueco ' + (k + 1) }, fill[k] ? U.esc(fill[k].t) : (k + 1) + '');
                g.addEventListener('click', () => { if (fill[k]) fill[k] = null; sel = k; render(); });
                textEl.appendChild(g);
              }
            });
            bank.innerHTML = '';
            words.filter((w) => !fill.includes(w)).forEach((w) => {
              const b = U.el('button', { class: 'chip', type: 'button' }, U.esc(w.t));
              b.addEventListener('click', () => {
                let k = fill[sel] ? fill.indexOf(null) : sel;
                if (k < 0) return;
                fill[k] = w; EZ.audio.play('click');
                const nx = fill.indexOf(null); sel = nx < 0 ? k : nx; render();
              });
              bank.appendChild(b);
            });
            submit.hidden = fill.includes(null);
          };
          submit.addEventListener('click', () => { answer = fill.map((w) => w.t); finish(); });
          render();
        },
        match() {
          area.className = 'ch-answer mtc';
          const left = q.pares.map((p) => p[0]), right = U.shuffle(q.pares.map((p) => p[1]));
          const pairs = {}; // left -> right
          let selL = null;
          const colL = U.el('div', { class: 'mtc-col' }), colR = U.el('div', { class: 'mtc-col' });
          area.append(colL, colR);
          const num = (l) => Object.keys(pairs).indexOf(l) + 1;
          const render = () => {
            colL.innerHTML = ''; colR.innerHTML = '';
            left.forEach((l) => {
              const n = pairs[l] ? num(l) : '';
              const b = U.el('button', { class: 'chip mtc-item' + (selL === l ? ' sel' : '') + (n ? ' paired p' + n : ''), type: 'button' }, (n ? `<b class="badge">${n}</b>` : '') + U.esc(l));
              b.addEventListener('click', () => { if (pairs[l]) delete pairs[l]; selL = l; EZ.audio.play('click'); render(); });
              colL.appendChild(b);
            });
            right.forEach((r) => {
              const owner = Object.keys(pairs).find((l) => pairs[l] === r);
              const n = owner ? num(owner) : '';
              const b = U.el('button', { class: 'chip mtc-item' + (n ? ' paired p' + n : ''), type: 'button' }, (n ? `<b class="badge">${n}</b>` : '') + U.esc(r));
              b.addEventListener('click', () => {
                if (owner) delete pairs[owner];
                if (selL) { pairs[selL] = r; selL = left.find((x) => !pairs[x]) || null; EZ.audio.play('click'); }
                render();
              });
              colR.appendChild(b);
            });
            submit.hidden = Object.keys(pairs).length !== left.length;
          };
          selL = left[0];
          submit.addEventListener('click', () => { answer = Object.keys(pairs).map((l) => [l, pairs[l]]); finish(); });
          render();
        },
        hotspot() {
          area.className = 'ch-answer hs';
          area.innerHTML = '<p class="hs-tip">Pulsa sobre la imagen (o usa Tab y Enter).</p>';
          U.$$('.hot', visual).forEach((h) => {
            const go = () => { answer = h.getAttribute('data-id'); finish(); };
            h.addEventListener('click', go);
            h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
          });
        },
        listen() {
          area.className = 'ch-answer opts';
          const bar = U.el('div', { class: 'listen-bar' });
          const es = (q.idioma || 'en-GB').startsWith('es');
          const play = U.el('button', { class: 'btn btn-listen', type: 'button' }, I.speaker + `<span>${es ? 'Escuchar' : 'Listen'}</span>`);
          const slow = U.el('button', { class: 'btn btn-ghost', type: 'button' }, es ? 'Más lento' : 'Slow');
          const show = U.el('button', { class: 'btn btn-ghost', type: 'button' }, 'Ver texto');
          const txt = U.el('p', { class: 'listen-text', hidden: '' }, '«' + U.esc(q.audio) + '»');
          bar.append(play, slow, show);
          area.before(bar, txt);
          const canSpeak = EZ.audio.canSpeak();
          play.addEventListener('click', () => EZ.audio.speak(q.audio, q.idioma || 'en-GB'));
          slow.addEventListener('click', () => EZ.audio.speak(q.audio, q.idioma || 'en-GB', 0.6));
          show.addEventListener('click', () => { txt.hidden = false; show.disabled = true; });
          if (!canSpeak) { txt.hidden = false; play.disabled = slow.disabled = show.disabled = true; play.querySelector('span').textContent = 'Audio no disponible'; }
          else setTimeout(() => EZ.audio.speak(q.audio, q.idioma || 'en-GB'), 350);
          builders.mc();
        }
      };
      (builders[q.tipo] || builders.mc)();
      // Gancho para pruebas automáticas (responder sin interfaz)
      C._test = { q, answer: (a) => { answer = a; finish(); }, next: () => { const b = U.$('.ch-feedback .btn-go', card); if (b) b.click(); } };

      // Teclado: 1-4 / A-D en opciones, Enter para comprobar
      keyHandler = (e) => {
        if (!modal.classList.contains('show')) return;
        const fbBtn = U.$('.ch-feedback:not([hidden]) .btn-go', card);
        if (fbBtn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); fbBtn.click(); return; }
        if (done) return;
        if (e.target && e.target.tagName === 'INPUT') return;
        const opts2 = U.$$('.opt:not([disabled])', area);
        // Flechas del teclado: mueven la selección entre las opciones; Enter o espacio eligen
        if (e.key.startsWith('Arrow') && (q.tipo === 'mc' || q.tipo === 'listen' || q.tipo === 'tf') && opts2.length) {
          e.preventDefault(); e.stopPropagation();
          const cols = Math.max(1, opts2.filter((b) => b.offsetTop === opts2[0].offsetTop).length);
          let i = opts2.indexOf(document.activeElement);
          if (i < 0) i = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? opts2.length : -1;
          const n = opts2.length;
          const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
          let j = i + step;
          if (j < 0 || j >= n) j = ((j % n) + n) % n;
          opts2[j].focus({ preventScroll: true });
          EZ.audio.play('tick');
          return;
        }
        const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3, v: 0, f: 1 };
        const k = map[e.key.toLowerCase()];
        if (q.tipo === 'tf' && (e.key === 'v' || e.key === 'f' || e.key === '1' || e.key === '2')) { e.preventDefault(); area.querySelectorAll('.opt')[k].click(); return; }
        if ((q.tipo === 'mc' || q.tipo === 'listen') && k != null && area.querySelectorAll('.opt')[k]) {
          const b = area.querySelectorAll('.opt')[k]; if (!b.disabled) { e.preventDefault(); b.click(); } return;
        }
        if (e.key === 'Enter' && !submit.hidden && document.activeElement && !document.activeElement.classList.contains('chip') && !document.activeElement.classList.contains('gap')) { e.preventDefault(); submit.click(); }
        if (e.key === 'Escape') e.preventDefault();
        void opts2;
      };
      document.addEventListener('keydown', keyHandler, true);
      if (q.tipo === 'mc' || q.tipo === 'listen' || q.tipo === 'tf') {
        const tip = U.el('p', { class: 'ch-keys muted small' }, 'Teclado: flechas ← ↑ ↓ → para moverte y Enter para elegir (también 1-4 o A-D).');
        area.after(tip);
      }
      setTimeout(() => { const f = card.querySelector('.opt, .chip, .hot, .gap, input'); if (f && q.tipo !== 'input') f.focus({ preventScroll: true }); }, 80);

      function showFeedback(correct, fb, next) {
        const box = U.$('.ch-feedback', card);
        card.classList.add(correct ? 'is-correct' : 'is-wrong');
        if (correct) EZ.audio.play('correct'); else EZ.audio.play('wrong');
        let html = `<div class="fb-icon">${correct ? I.check : I.cross}</div><h3 class="fb-title">${U.esc(fb.title || '')}</h3>`;
        (fb.lines || []).forEach((l) => { html += `<p class="fb-line">${l}</p>`; });
        if (!correct) html += `<p class="fb-answer"><b>Respuesta correcta:</b> ${U.esc(EZ.questions.correctText(q))}</p>`;
        if (q.explicacion && (!correct || q.nivel >= 2)) html += `<p class="fb-explain">${U.esc(q.explicacion)}</p>`;
        html += `<button class="btn btn-go" type="button">Continuar</button>`;
        box.innerHTML = html;
        box.hidden = false;
        const btn = U.$('.btn-go', box);
        btn.addEventListener('click', next);
        setTimeout(() => btn.focus({ preventScroll: true }), 50);
      }
    });
  };
})(window.EZ);
