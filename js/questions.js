/* ==========================================================
   EUREKA DROP · questions.js
   Carga los bancos de data/*.json, elige preguntas sin repetir
   (equilibrando bloques y nivel) y corrige respuestas.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util;
  const Q = (EZ.questions = { banks: {}, loaded: false, source: '' });

  /** Carga todos los bancos. Usa fetch (GitHub Pages / servidor) y,
   *  si falla (por ejemplo al abrir con doble clic), data/bundle.js. */
  Q.loadAll = async function () {
    const files = EZ.AREAS.map((a) => a.file);
    let ok = 0;
    for (const a of EZ.AREAS) {
      try {
        const r = await fetch('data/' + a.file + '.json', { cache: 'no-cache' });
        if (!r.ok) throw new Error(r.status);
        Q.banks[a.id] = await r.json();
        ok++;
        // Banco ampliado por cursos (opcional): 1.º-5.º y refuerzos de 6.º
        try {
          const r2 = await fetch('data/' + a.file + '-cursos.json', { cache: 'no-cache' });
          if (r2.ok) { const extra = await r2.json(); Q.banks[a.id].preguntas = Q.banks[a.id].preguntas.concat(extra.preguntas || []); }
        } catch (e2) { /* sin banco ampliado */ }
      } catch (e) {
        if (window.EZ_BUNDLE && window.EZ_BUNDLE[a.file]) {
          const b = window.EZ_BUNDLE[a.file];
          const ex = window.EZ_BUNDLE[a.file + '-cursos'];
          Q.banks[a.id] = ex ? Object.assign({}, b, { preguntas: b.preguntas.concat(ex.preguntas) }) : b;
        }
      }
    }
    Q.source = ok === files.length ? 'json' : 'bundle';
    Q.loaded = EZ.AREAS.every((a) => Q.banks[a.id] && Q.banks[a.id].preguntas);
    return Q.loaded;
  };

  Q.count = (area) => (Q.banks[area] ? Q.banks[area].preguntas.length : 0);

  /** Cursos para los que sirve una pregunta. Las del banco original (sin etiqueta) son de nivel 5.º-6.º. */
  Q.cursosDe = (q) => q.cursos || (q.nivel >= 3 ? [6, 6] : [5, 6]);
  Q.countCurso = (area, curso) => (Q.banks[area] ? Q.banks[area].preguntas.filter((q) => { const c = Q.cursosDe(q); return curso >= c[0] && curso <= c[1]; }).length : 0);
  /** Preguntas del curso; si hay pocas, se añaden de cursos inferiores (repaso), nunca de superiores. */
  Q.forCurso = function (area, curso) {
    const all = Q.banks[area].preguntas;
    const own = all.filter((q) => { const c = Q.cursosDe(q); return curso >= c[0] && curso <= c[1]; });
    if (own.length >= 24) return own;
    const lower = all.filter((q) => { const c = Q.cursosDe(q); return !(curso >= c[0] && curso <= c[1]) && c[0] <= curso; })
      .sort((x, y) => Q.cursosDe(y)[1] - Q.cursosDe(x)[1]);
    return own.concat(lower.slice(0, 24 - own.length));
  };

  /** Sesión de preguntas para una partida (evita repetir y reparte bloques). */
  Q.newSession = function () {
    return { used: new Set(), blocks: {}, adapt: 0, okRun: 0, koRun: 0 };
  };

  Q.mechanic = (area) => (Q.banks[area] && Q.banks[area].mecanica) || null;

  /** Cálculo mental generado al vuelo (1.º-5.º): variedad infinita, siempre del nivel del curso. */
  let genN = 0;
  Q.genMath = function (curso, nivel, rng) {
    const r = (a, b) => U.randInt(a, b, rng);
    let en, res, pista, expl, bloque = 'Cálculo mental';
    const sum = (a, b) => { en = `Calcula: ${a} + ${b}`; res = a + b; pista = 'Suma primero las unidades.'; expl = `${a} + ${b} = ${res}.`; };
    const sub = (a, b) => { en = `Calcula: ${a} − ${b}`; res = a - b; pista = 'Quita al mayor el menor.'; expl = `${a} − ${b} = ${res}.`; };
    const mul = (a, b) => { en = `Calcula: ${a} × ${b}`; res = a * b; pista = `Repite ${a} en grupos de ${b}.`; expl = `${a} × ${b} = ${res}.`; };
    const div = (a, b) => { en = `Calcula: ${a * b} : ${b}`; res = a; pista = `¿Qué número por ${b} da ${a * b}?`; expl = `${a} × ${b} = ${a * b}, así que ${a * b} : ${b} = ${a}.`; };
    const dec = (x) => String(x).replace('.', ',');
    const pick = (...fs) => fs[r(0, fs.length - 1)]();
    switch (curso) {
      case 1:
        if (nivel === 1) pick(() => sum(r(1, 9), r(1, 9)), () => { const a = r(2, 10); sub(a, r(1, a)); });
        else if (nivel === 2) pick(() => { const a = r(5, 12); sum(a, r(3, 20 - a > 3 ? 20 - a : 3)); }, () => { const a = r(11, 20); sub(a, r(2, 9)); });
        else pick(() => sum(r(2, 9) * 10 + r(0, 5), r(1, 4)), () => sum(r(1, 5) * 10, r(1, 5) * 10));
        break;
      case 2:
        if (nivel === 1) pick(() => sum(r(10, 30), r(5, 20)), () => { const a = r(30, 50); sub(a, r(5, 25)); });
        else if (nivel === 2) pick(() => sum(r(20, 60), r(10, 39)), () => { const a = r(50, 99); sub(a, r(11, 49)); });
        else { bloque = 'Tablas'; mul(pick(() => 2, () => 3, () => 4, () => 5, () => 10), r(2, 10)); }
        break;
      case 3:
        bloque = 'Tablas';
        if (nivel === 1) mul(r(2, 5), r(2, 10));
        else if (nivel === 2) pick(() => mul(r(6, 10), r(2, 10)), () => div(r(2, 10), r(2, 9)));
        else { bloque = 'Cálculo mental'; pick(() => sum(r(100, 600), r(100, 390)), () => sub(r(600, 999), r(100, 500)), () => mul(r(11, 25), r(2, 5))); }
        break;
      case 4:
        if (nivel === 1) mul(r(12, 49), r(2, 6));
        else if (nivel === 2) pick(() => div(r(11, 40), r(2, 9)), () => sum(r(1000, 4999), r(500, 3999)), () => sub(r(5000, 9000), r(1000, 4000)));
        else pick(() => mul(r(11, 30), r(11, 20)), () => div(r(101, 199), r(2, 5)));
        break;
      default: {
        bloque = 'Decimales y porcentajes';
        if (nivel === 1) { const a = r(11, 59) / 10, b = r(11, 39) / 10; en = `Calcula: ${dec(a)} + ${dec(b)}`; res = Math.round((a + b) * 10) / 10; pista = 'Alinea las comas.'; expl = `${dec(a)} + ${dec(b)} = ${dec(res)}.`; }
        else if (nivel === 2) pick(() => { const a = r(11, 59) / 10, b = r(2, 6); en = `Calcula: ${dec(a)} × ${b}`; res = Math.round(a * b * 10) / 10; pista = 'Multiplica como si no hubiera coma.'; expl = `${dec(a)} × ${b} = ${dec(res)}.`; },
          () => { const d = pick(() => 2, () => 4, () => 5, () => 10), q = d * r(2, 15); en = `Calcula 1/${d} de ${q}.`; res = q / d; pista = `Divide entre ${d}.`; expl = `${q} : ${d} = ${res}.`; });
        else { const p = pick(() => 10, () => 20, () => 25, () => 50), q = (100 / p) * r(2, 12) * (p === 25 || p === 50 ? 1 : 1); en = `Calcula el ${p} % de ${q}.`; res = (q * p) / 100; pista = p === 10 ? 'Divide entre 10.' : p === 50 ? 'Es la mitad.' : p === 25 ? 'Es la cuarta parte.' : 'Es la quinta parte.'; expl = `El ${p} % de ${q} es ${dec(res)}.`; }
      }
    }
    genN++;
    return { id: 'gen-mat-' + genN, area: 'mat', bloque, nivel, cursos: [curso, curso], tipo: 'input', enunciado: en, respuestas: [dec(res)], pista, explicacion: expl };
  };

  Q.pick = function (area, level, session, rng = Math.random) {
    const bank = Q.banks[area];
    if (!bank) return null;
    if (area === 'mat' && EZ.curso() <= 5 && rng() < (EZ.curso() <= 4 ? 0.5 : 0.3)) return Q.genMath(EZ.curso(), U.clamp(level + session.adapt, 1, 3), rng);
    const all = Q.forCurso(area, EZ.curso());
    const target = U.clamp(level + session.adapt, 1, 3);
    const seen = new Set(EZ.save.seen[area] || []);
    const fresh = (q) => !session.used.has(q.id);
    let pool = all.filter((q) => fresh(q) && q.nivel === target && !seen.has(q.id));
    if (pool.length < 3) pool = all.filter((q) => fresh(q) && Math.abs(q.nivel - target) <= 1 && !seen.has(q.id));
    if (pool.length < 3) { EZ.save.seen[area] = []; pool = all.filter((q) => fresh(q) && Math.abs(q.nivel - target) <= 1); }
    if (!pool.length) pool = all.filter(fresh);
    if (!pool.length) { session.used.clear(); pool = all.slice(); }
    // Bloque menos usado en esta partida
    const minUse = Math.min(...pool.map((q) => session.blocks[area + q.bloque] || 0));
    pool = pool.filter((q) => (session.blocks[area + q.bloque] || 0) === minUse);
    const q = U.pick(pool, rng);
    session.used.add(q.id);
    session.blocks[area + q.bloque] = (session.blocks[area + q.bloque] || 0) + 1;
    const list = (EZ.save.seen[area] = EZ.save.seen[area] || []);
    list.push(q.id);
    const cap = Math.max(10, Math.floor(all.length * 0.6));
    if (list.length > cap) list.splice(0, list.length - cap);
    return Object.assign({ area }, q);
  };

  /** Ajuste adaptativo: 3 aciertos seguidos → sube; 2 fallos seguidos → baja. */
  Q.adapt = function (session, correct) {
    if (correct) { session.okRun++; session.koRun = 0; if (session.okRun >= 3) { session.adapt = Math.min(1, session.adapt + 1); session.okRun = 0; } }
    else { session.koRun++; session.okRun = 0; if (session.koRun >= 2) { session.adapt = Math.max(-1, session.adapt - 1); session.koRun = 0; } }
  };

  const sameArr = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);

  Q.check = function (q, ans) {
    switch (q.tipo) {
      case 'mc': case 'listen': return ans === q.correcta;
      case 'tf': return ans === q.correcta;
      case 'hotspot': return String(ans) === String(q.correcta);
      case 'input': {
        const list = q.respuestas || [];
        const n = U.toNumber(ans);
        return list.some((r) => {
          const rn = U.toNumber(r);
          if (!isNaN(rn) && !isNaN(n)) return Math.abs(rn - n) < 1e-9;
          return U.norm(r, !q.estricto) === U.norm(ans, !q.estricto);
        });
      }
      case 'order': return sameArr(ans, q.elementos);
      case 'place': return sameArr(ans, q.huecos);
      case 'match': return Array.isArray(ans) && ans.length === q.pares.length && ans.every(([l, r]) => q.pares.some(([a, b]) => a === l && b === r));
      default: return false;
    }
  };

  Q.correctText = function (q) {
    switch (q.tipo) {
      case 'mc': case 'listen': return q.opciones[q.correcta];
      case 'tf': return q.correcta ? 'Verdadero' : 'Falso';
      case 'input': return q.respuestas[0];
      case 'order': return q.elementos.join(q.separador != null ? q.separador : ' ');
      case 'place': { let i = 0; return q.texto.replace(/___/g, () => '«' + q.huecos[i++] + '»'); }
      case 'match': return q.pares.map((p) => p[0] + ' → ' + p[1]).join(' · ');
      case 'hotspot': return q.correctaTexto || String(q.correcta);
      default: return '';
    }
  };

  Q.answerText = function (q, ans) {
    if (ans == null) return '—';
    switch (q.tipo) {
      case 'mc': case 'listen': return q.opciones[ans];
      case 'tf': return ans ? 'Verdadero' : 'Falso';
      case 'order': return ans.join(q.separador != null ? q.separador : ' ');
      case 'place': return ans.join(', ');
      case 'match': return ans.map((p) => p[0] + ' → ' + p[1]).join(' · ');
      case 'hotspot': return (q.etiquetas && q.etiquetas[ans]) || String(ans);
      default: return String(ans);
    }
  };
})(window.EZ);
