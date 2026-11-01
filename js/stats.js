/* ==========================================================
   EUREKA DROP · stats.js
   Panel de seguimiento del aprendizaje: aciertos globales, por
   área y por bloque, evolución y qué conviene practicar.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, I = EZ.icons;
  const ST = (EZ.stats = {});
  const pct = (o) => (o && o.ok + o.ko ? Math.round((o.ok / (o.ok + o.ko)) * 100) : null);

  function lineChart(hist) {
    const W = 560, H = 200, L = 40, R = 14, TOP = 16, B = 30;
    if (hist.length < 2) return '<p class="muted center">Juega al menos dos partidas para ver tu evolución.</p>';
    const n = hist.length, x = (i) => L + (i * (W - L - R)) / (n - 1), y = (v) => TOP + (1 - v / 100) * (H - TOP - B);
    let s = `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del porcentaje de aciertos en las últimas ${n} partidas">`;
    [0, 50, 100].forEach((v) => { s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="viz-grid"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="viz-axis">${v}%</text>`; });
    const pts = hist.map((h, i) => `${x(i)},${y(h.pct)}`).join(' ');
    s += `<polyline points="${L},${y(0)} ${pts} ${x(n - 1)},${y(0)}" fill="rgba(76,201,240,.18)" stroke="none"/>`;
    s += `<polyline points="${pts}" fill="none" stroke="#4cc9f0" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    hist.forEach((h, i) => { s += `<circle cx="${x(i)}" cy="${y(h.pct)}" r="6" fill="${h.won ? '#ffd23f' : '#ff6b9a'}" stroke="#1b1446" stroke-width="2"><title>${U.prettyDate(h.d)} · ${h.pct}% · ${U.fmtNum(h.score)} pts${h.won ? ' · victoria' : ''}</title></circle>`; });
    s += `<text x="${L}" y="${H - 8}" class="viz-axis">más antigua</text><text x="${W - R}" y="${H - 8}" text-anchor="end" class="viz-axis">más reciente</text></svg>`;
    return s + '<p class="muted small center">Punto amarillo: victoria · punto rosa: derrota</p>';
  }

  ST.render = function (el) {
    const S = EZ.save, st = S.stats;
    const g = pct(st);
    const blocks = Object.keys(st.perBlock).map((k) => { const [a, b] = k.split('|'); const o = st.perBlock[k]; return { a, b, ok: o.ok, ko: o.ko, n: o.ok + o.ko, p: pct(o) }; });
    const rated = blocks.filter((b) => b.n >= 3).sort((x, y) => y.p - x.p);
    const strong = rated.filter((b) => b.p >= 70).slice(0, 4);
    const weak = rated.filter((b) => b.p < 70).slice(-4).reverse();
    const chip = (b) => `<li><span class="dot" style="background:${EZ.area(b.a) ? EZ.area(b.a).color : '#fff'}"></span><b>${U.esc(b.b)}</b> <small>${EZ.area(b.a) ? EZ.area(b.a).subject : ''} · ${b.p}% (${b.ok}/${b.n})</small></li>`;
    el.innerHTML = `<header class="scr-head"><button class="btn btn-icon" type="button" data-go="menu" aria-label="Volver">${I.back}</button><h1 class="scr-title">Tu progreso</h1></header>
      <div class="kpis big">
        <div><b>${st.games}</b><small>partidas</small></div><div><b>${st.completed}</b><small>completadas</small></div>
        <div><b>${U.fmtNum(st.best)}</b><small>récord</small></div><div><b>${g == null ? '—' : g + '%'}</b><small>aciertos globales</small></div>
        <div><b>${st.ok}</b><small>${I.check} acertadas</small></div><div><b>${st.ko}</b><small>${I.cross} falladas</small></div>
        <div><b>${U.fmtTime(st.playSecs)}</b><small>tiempo jugado</small></div><div><b>${EZ.progression.dailyStreak()}</b><small>${I.flame} racha diaria</small></div>
      </div>
      <div class="stats-grid">
        <section class="panel"><h2>Por asignatura</h2>${EZ.AREAS.map((a) => { const o = st.perArea[a.id], p = pct(o); return `<div class="hbar"><span class="hbar-l">${a.subject}</span><span class="hbar-t"><i style="width:${p || 0}%;background:${a.color}"></i></span><span class="hbar-v">${p == null ? 'sin datos' : p + '% · ' + o.ok + '/' + (o.ok + o.ko)}</span></div>`; }).join('')}</section>
        <section class="panel"><h2>Evolución (últimas partidas)</h2>${lineChart(st.history.slice(-15))}</section>
        <section class="panel good-panel"><h2>${I.star} Lo que mejor dominas</h2>${strong.length ? `<ul class="blk">${strong.map(chip).join('')}</ul>` : '<p class="muted">Necesitamos al menos 3 respuestas por bloque para saberlo.</p>'}</section>
        <section class="panel weak-panel"><h2>${I.bulb} Para seguir practicando</h2>${weak.length ? `<ul class="blk">${weak.map(chip).join('')}</ul><p class="muted small">Consejo: usa el Modo Rápido en esa asignatura y revisa los errores al terminar.</p>` : '<p class="muted">¡Por ahora ningún bloque por debajo del 70 %!</p>'}</section>
      </div>
      <section class="panel"><h2>Resultados por bloques de contenido</h2>${EZ.AREAS.map((a) => {
        const bl = blocks.filter((b) => b.a === a.id).sort((x, y) => x.b.localeCompare(y.b));
        return `<details class="blk-det"><summary style="--ac:${a.color}">${a.subject} <small>(${bl.length} bloques)</small></summary>${bl.length ? bl.map((b) => `<div class="hbar"><span class="hbar-l">${U.esc(b.b)}</span><span class="hbar-t"><i style="width:${b.p}%;background:${a.color}"></i></span><span class="hbar-v">${b.p}% · ${b.ok}/${b.n}</span></div>`).join('') : '<p class="muted">Aún sin datos.</p>'}</details>`;
      }).join('')}</section>
      <p class="center"><button class="btn btn-ghost" type="button" id="st-reset">Reiniciar estadísticas</button></p>`;
    U.$$('[data-go]', el).forEach((b) => b.addEventListener('click', () => EZ.ui.go('menu')));
    U.$('#st-reset', el).addEventListener('click', async () => { if (await EZ.ui.confirm('¿Borrar todas las estadísticas?')) { EZ.store.resetStats(); ST.render(el); } });
  };
})(window.EZ);
