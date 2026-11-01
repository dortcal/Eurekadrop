/* ==========================================================
   EUREKA DROP · progression.js
   Logros, desbloqueos, avance del Modo Historia, Desafío del Día,
   estadísticas por área/bloque y diario de aventuras.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util;
  const PR = (EZ.progression = {});

  PR.ACH = [
    { id: 'first_win', name: 'Primer Drop', desc: 'Gana tu primera partida.' },
    { id: 'streak5', name: 'Racha imparable', desc: 'Encadena 5 aciertos. Desbloquea los Cascos.' },
    { id: 'streak10', name: 'Cerebro legendario', desc: 'Encadena 10 aciertos seguidos.' },
    { id: 'perfect', name: 'Sin borrones', desc: 'Gana una partida sin fallar ninguna pregunta.' },
    { id: 'secret', name: 'Curiosidad infinita', desc: 'Encuentra una zona secreta.' },
    { id: 'secret5', name: 'Cazatesoros', desc: 'Encuentra 5 zonas secretas.' },
    { id: 'quest3', name: 'Buena gente', desc: 'Completa 3 misiones secundarias.' },
    { id: 'stomp20', name: 'Pisotón Eureka', desc: 'Explota 20 Borroncitos saltando encima.' },
    { id: 'coins1000', name: 'Hucha llena', desc: 'Consigue 1000 monedas en total.' },
    { id: 'answers100', name: 'Cien sabidurías', desc: 'Acierta 100 retos en total.' },
    { id: 'noDamageBoss', name: 'Intocable', desc: 'Vence a un guardián sin perder vidas en el combate.' },
    { id: 'legend', name: 'Leyenda', desc: 'Supera un nivel Leyenda. Desbloquea la Capa.' },
    { id: 'allAreas', name: 'Todoterreno', desc: 'Gana al menos una partida en cada una de las cinco áreas.' },
    { id: 'island_mat', name: 'Guardián: Calculatrón', desc: 'Libera Numérica City (fase 3).' },
    { id: 'island_len', name: 'Guardiana: Doña Tilde', desc: 'Libera la Biblioteca Infinita (fase 3).' },
    { id: 'island_med', name: 'Guardián: Magmo', desc: 'Libera Isla Volcana (fase 3).' },
    { id: 'island_ing', name: 'Guardián: Captain Polyglot', desc: 'Libera Port Hello (fase 3).' },
    { id: 'island_ef', name: 'Guardián: Rinoturbo', desc: 'Libera el Estadio Turbo (fase 3).' },
    { id: 'champion', name: 'Campeón Eureka', desc: 'Derrota al Borrón. Desbloquea la Corona.' },
    { id: 'daily1', name: 'Hoy toca', desc: 'Completa un Desafío del Día.' },
    { id: 'daily3', name: 'Constancia', desc: 'Completa el Desafío del Día 3 días seguidos.' },
    { id: 'daily7', name: 'Semana perfecta', desc: 'Completa el Desafío del Día 7 días seguidos.' }
  ];

  PR.has = (id) => !!EZ.save.achievements[id];
  function grant(id, list) {
    if (PR.has(id)) return;
    EZ.save.achievements[id] = U.todayStr();
    const a = PR.ACH.find((x) => x.id === id);
    if (a) { list.push(a); EZ.store.log('trophy', 'Logro: ' + a.name); }
    const acc = EZ.art.ACCS.find((x) => x.unlock === id);
    if (acc && !EZ.save.owned.includes(acc.id)) EZ.save.owned.push(acc.id);
  }
  /** Comprobación en vivo (rachas) durante la partida. */
  PR.liveCheck = function (run) {
    const got = [];
    if (run.streak >= 5) grant('streak5', got);
    if (run.streak >= 10) grant('streak10', got);
    return got;
  };

  PR.recordAnswer = function (area, block, ok) {
    const st = EZ.save.stats;
    st[ok ? 'ok' : 'ko']++;
    const a = (st.perArea[area] = st.perArea[area] || { ok: 0, ko: 0 });
    a[ok ? 'ok' : 'ko']++;
    const key = area + '|' + (block || 'General');
    const b = (st.perBlock[key] = st.perBlock[key] || { ok: 0, ko: 0 });
    b[ok ? 'ok' : 'ko']++;
  };

  /* ---------- Modo Historia ---------- */
  PR.islandUnlocked = function (i) {
    if (i === 0) return true;
    const prev = EZ.AREAS[i - 1].id;
    return EZ.save.story.islands[prev] >= 1;
  };
  PR.finalUnlocked = () => EZ.AREAS.every((a) => EZ.save.story.islands[a.id] >= 3);
  PR.storyPercent = function () {
    const s = EZ.AREAS.reduce((t, a) => t + EZ.save.story.islands[a.id], 0) + (EZ.save.story.final ? 1 : 0);
    return Math.round((s / 16) * 100);
  };

  /* ---------- Desafío del Día ---------- */
  PR.dailyDone = () => EZ.save.daily.lastDone === U.todayStr();
  PR.dailyStreak = function () {
    const d = EZ.save.daily;
    return d.lastDone === U.todayStr() || d.lastDone === U.yesterdayStr() ? d.streak : 0;
  };

  /**
   * Cierra una partida: guarda estadísticas, monedas, historia,
   * diario, logros y recompensas. Devuelve un resumen para la pantalla final.
   */
  PR.finish = function (run) {
    const S = EZ.save, st = S.stats, got = [];
    const out = { achievements: got, notes: [] };
    st.games++;
    st.playSecs += run.time;
    if (run.won) st.completed++;
    st.best = Math.max(st.best, run.score);
    st.stomps += run.stomps;
    if (run.secret) st.secrets++;
    if (run.quest) st.quests++;
    S.wallet.coins += run.coins;
    S.wallet.totalCoins += run.coins;
    const total = run.ok + run.ko;
    st.history.push({ d: U.todayStr(), mode: run.mode, area: run.area, level: run.level, curso: EZ.curso(), score: run.score, pct: total ? Math.round((run.ok / total) * 100) : 0, won: run.won });
    if (st.history.length > 60) st.history.shift();
    const bestKey = run.mode === 'daily' ? 'daily' : run.area + '-' + run.level;
    if (!S.best[bestKey] || run.score > S.best[bestKey]) { if (S.best[bestKey]) out.notes.push('¡Nuevo récord personal!'); S.best[bestKey] = run.score; }
    run.relics.forEach((r) => { if (!S.collectibles.includes(r)) S.collectibles.push(r); });
    if (!S.story.visited.includes(run.area)) S.story.visited.push(run.area);

    if (run.won) {
      grant('first_win', got);
      if (run.ko === 0 && run.ok > 0) grant('perfect', got);
      if (run.level === 3) grant('legend', got);
      if (run.bossNoDamage) grant('noDamageBoss', got);
      if (EZ.area(run.area)) { S.winsByArea = S.winsByArea || {}; S.winsByArea[run.area] = true; }
      if (S.winsByArea && EZ.AREAS.every((a) => S.winsByArea[a.id])) grant('allAreas', got);
      const ar = EZ.area(run.area);
      EZ.store.log('flag', `${run.mode === 'daily' ? 'Desafío del Día' : run.mode === 'final' ? 'Combate final' : (ar ? ar.island : '') + ' · ' + EZ.LEVEL_NAMES[run.level]} superado con ${U.fmtNum(run.score)} puntos`);
    } else {
      EZ.store.log('cross', `Derrota en ${run.mode === 'daily' ? 'el Desafío del Día' : (EZ.area(run.area) ? EZ.area(run.area).island : 'la nube del Borrón')} (${U.fmtNum(run.score)} pts)`);
    }
    if (run.mode === 'story' && run.won) {
      const prev = S.story.islands[run.area];
      if (run.level > prev) {
        S.story.islands[run.area] = run.level;
        if (run.level === 3) { grant('island_' + run.area, got); out.notes.push('¡Has recuperado el ' + EZ.area(run.area).fragment + '!'); EZ.store.log('gem', 'Fragmento recuperado: ' + EZ.area(run.area).fragment); }
        else out.notes.push(`Fase ${run.level + 1} desbloqueada en ${EZ.area(run.area).island}.`);
        const i = EZ.AREAS.findIndex((a) => a.id === run.area);
        if (run.level === 1 && EZ.AREAS[i + 1] && prev === 0) out.notes.push(`¡Nueva isla desbloqueada: ${EZ.AREAS[i + 1].island}!`);
        if (PR.finalUnlocked() && !S.story.final) out.notes.push('¡La nube del Borrón se ha abierto! El combate final te espera.');
      }
    }
    if (run.mode === 'final' && run.won) { S.story.final = true; grant('champion', got); EZ.store.log('crown', '¡Has derrotado al Borrón!'); }
    if (run.mode === 'daily' && run.won) {
      const d = S.daily, today = U.todayStr();
      if (d.lastDone !== today) {
        d.streak = d.lastDone === U.yesterdayStr() ? d.streak + 1 : 1;
        d.bestStreak = Math.max(d.bestStreak, d.streak);
        d.lastDone = today; d.done.push(today); if (d.done.length > 60) d.done.shift();
        S.wallet.coins += 150; S.wallet.hints += 1;
        out.daily = `Recompensa del día: +150 monedas y +1 pista. Racha: ${d.streak} ${d.streak === 1 ? 'día' : 'días'}.`;
        grant('daily1', got);
        if (d.streak >= 3) grant('daily3', got);
        if (d.streak >= 7) grant('daily7', got);
      } else out.daily = 'Ya conseguiste la recompensa de hoy. ¡Esta partida es de práctica!';
      d.bestScore = Math.max(d.bestScore, run.score);
    }
    if (st.secrets >= 1) grant('secret', got);
    if (st.secrets >= 5) grant('secret5', got);
    if (st.quests >= 3) grant('quest3', got);
    if (st.stomps >= 20) grant('stomp20', got);
    if (S.wallet.totalCoins >= 1000) grant('coins1000', got);
    if (st.ok >= 100) grant('answers100', got);
    run.liveAch.forEach((a) => { if (!got.includes(a)) got.push(a); });
    EZ.store.persist();
    return out;
  };
})(window.EZ);
