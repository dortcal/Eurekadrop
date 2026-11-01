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
      } catch (e) {
        if (window.EZ_BUNDLE && window.EZ_BUNDLE[a.file]) { Q.banks[a.id] = window.EZ_BUNDLE[a.file]; }
      }
    }
    Q.source = ok === files.length ? 'json' : 'bundle';
    Q.loaded = EZ.AREAS.every((a) => Q.banks[a.id] && Q.banks[a.id].preguntas);
    return Q.loaded;
  };

  Q.count = (area) => (Q.banks[area] ? Q.banks[area].preguntas.length : 0);
  Q.mechanic = (area) => (Q.banks[area] && Q.banks[area].mecanica) || null;

  /** Sesión de preguntas para una partida (evita repetir y reparte bloques). */
  Q.newSession = function () {
    return { used: new Set(), blocks: {}, adapt: 0, okRun: 0, koRun: 0 };
  };

  Q.pick = function (area, level, session, rng = Math.random) {
    const bank = Q.banks[area];
    if (!bank) return null;
    const all = bank.preguntas;
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
