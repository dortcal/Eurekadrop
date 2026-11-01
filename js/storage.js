/* ==========================================================
   EUREKA DROP · storage.js
   Guardado automático en localStorage (siempre con try/catch:
   en modo privado o con el almacenamiento bloqueado el juego
   sigue funcionando, solo que no recuerda nada).
   ========================================================== */
(function (EZ) {
  'use strict';
  const KEY = 'eureka-drop-save-v1';

  function defaults() {
    return {
      v: 1,
      profile: { name: '', avatar: { skin: 1, hair: 0, hairColor: 0, outfit: 0, acc: 'none' } },
      settings: { music: 0.55, sfx: 0.8, mute: false, reduceMotion: false, bigText: false, lives: 5, speedBonus: true, touch: 'auto' },
      wallet: { coins: 0, hints: 2, totalCoins: 0 },
      owned: ['none', 'cap', 'glasses'],
      story: { introSeen: false, islands: { mat: 0, len: 0, med: 0, ing: 0, ef: 0 }, final: false, visited: [] },
      achievements: {},
      collectibles: [],
      diary: [],
      best: {},
      stats: { games: 0, completed: 0, best: 0, ok: 0, ko: 0, perArea: {}, perBlock: {}, history: [], playSecs: 0, stomps: 0, secrets: 0, quests: 0 },
      seen: {},
      phrases: { lose: [], win: [] },
      daily: { lastDone: '', streak: 0, bestStreak: 0, done: [], bestScore: 0 }
    };
  }

  /** Mezcla profunda: conserva campos nuevos si el guardado es antiguo. */
  function merge(base, saved) {
    if (saved == null || typeof saved !== 'object' || Array.isArray(base)) return saved == null ? base : saved;
    const out = Object.assign({}, base);
    for (const k in saved) {
      out[k] = (k in base && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], saved[k]) : saved[k];
    }
    return out;
  }

  let available = true;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? merge(defaults(), JSON.parse(raw)) : defaults();
      data.profile.name = EZ.util.initials(data.profile.name);
      return data;
    } catch (e) {
      available = false;
      return defaults();
    }
  }

  EZ.save = load();
  EZ.store = {
    persist() {
      try { localStorage.setItem(KEY, JSON.stringify(EZ.save)); return true; }
      catch (e) { available = false; return false; }
    },
    isAvailable: () => available,
    resetProgress() {
      const keep = { settings: EZ.save.settings };
      EZ.save = Object.assign(defaults(), keep);
      EZ.store.persist();
    },
    resetStats() {
      EZ.save.stats = defaults().stats;
      EZ.save.best = {};
      EZ.store.persist();
    },
    /** Añade una entrada al diario de aventuras (máximo 120). */
    log(icon, text) {
      EZ.save.diary.unshift({ d: EZ.util.todayStr(), icon, text });
      if (EZ.save.diary.length > 120) EZ.save.diary.length = 120;
    }
  };
})(window.EZ);
