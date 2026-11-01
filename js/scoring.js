/* ==========================================================
   EUREKA DROP · scoring.js
   Reglas de puntuación (separadas del motor para poder ajustarlas).
   ========================================================== */
(function (EZ) {
  'use strict';
  const SC = (EZ.scoring = {
    COIN: 10, STOMP: 50, CHEST: 200, SECRET: 300, MECH: 400, QUEST: 500, BOSS: 1000, LIFE_BONUS: 100
  });

  /** Multiplicador por racha de aciertos. */
  SC.multiplier = (streak) => (streak >= 8 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1);

  /** Puntos por respuesta correcta. Nunca se resta por tardar. */
  SC.answer = function (q, secs, streak, usedHint) {
    const base = 100 * [1, 1, 1.5, 2][q.nivel || 1];
    let bonus = 0;
    if (EZ.save.settings.speedBonus) bonus = secs < 10 ? 50 : secs < 20 ? 25 : 0;
    const raw = (base + bonus) * (usedHint ? 0.5 : 1);
    return Math.round(raw * SC.multiplier(streak));
  };
})(window.EZ);
