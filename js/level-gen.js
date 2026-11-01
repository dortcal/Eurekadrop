/* ==========================================================
   EUREKA DROP · level-gen.js
   Genera cada fase: una cadena de salas con un pasillo central
   siempre transitable (los obstáculos sólidos nunca lo bloquean),
   puertas con reto, sala de mecánica, zona secreta, puente que
   se desmorona, trampas, enemigos, cofres y la sala del guardián.
   Tipos de baldosa: 0 suelo · 1 muro · 2 vacío · 3 peligro ·
   4 muro secreto (atravesable) · 5 suelo que se desmorona.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, T = EZ.art.T;
  const RW = 15, RH = 11, BW = 19;

  EZ.levelGen = {
    RW, RH,
    /**
     * cfg: { theme, level (1-3), rng, gateAreas[], mechArea, bossArea, final }
     */
    generate(cfg) {
      const rng = cfg.rng, lv = cfg.level;
      const nRooms = lv === 3 ? 5 : 4;
      const w = nRooms * (RW - 1) + BW, h = RH * 2 - 1;
      const t = new Uint8Array(w * h).fill(1);
      const idx = (c, r) => r * w + c;
      const L = {
        map: { w, h, t }, rooms: [], gates: [], coins: [], pickups: [], chests: [], enemies: [], props: [],
        npcs: [], signs: [], switches: [], barriers: [], questItems: [], hazards: [], crumbles: {}, theme: cfg.theme
      };
      const occ = new Set();
      const y0 = RH - 1;
      const mid = y0 + Math.floor(RH / 2);

      // ---- Salas principales ----
      const roles = lv === 3 ? ['start', 'danger', 'mech', 'bridge', 'gauntlet'] : ['start', 'danger', 'mech', 'bridge'];
      for (let i = 0; i <= nRooms; i++) {
        const isBoss = i === nRooms;
        const room = { i, x0: i * (RW - 1), y0, w: isBoss ? BW : RW, h: RH, role: isBoss ? 'boss' : roles[i], mid };
        for (let r = y0 + 1; r < y0 + RH - 1; r++) for (let c = room.x0 + 1; c < room.x0 + room.w - 1; c++) t[idx(c, r)] = 0;
        room.cx = (room.x0 + room.w / 2) * T; room.cy = (mid + 0.5) * T;
        L.rooms.push(room);
      }
      const isPath = (r) => r >= mid - 1 && r <= mid + 1;
      const tileXY = (c, r) => ({ x: (c + 0.5) * T, y: (r + 0.5) * T + 12 });
      const free = (room, o = {}) => {
        for (let k = 0; k < 200; k++) {
          const c = U.randInt(room.x0 + (o.margin || 1), room.x0 + room.w - 1 - (o.margin || 1), rng);
          const r = U.randInt(room.y0 + 1, room.y0 + room.h - 2, rng);
          if (o.avoidPath !== false && isPath(r)) continue;
          if (o.onlyPath && !isPath(r)) continue;
          if (t[idx(c, r)] !== 0 || occ.has(idx(c, r))) continue;
          // no pegado a las puertas
          if (isPath(r) && (c <= room.x0 + 1 || c >= room.x0 + room.w - 2)) continue;
          occ.add(idx(c, r));
          return Object.assign(tileXY(c, r), { c, r });
        }
        return null;
      };
      L.free = free; L.tileXY = tileXY;

      // ---- Puertas entre salas ----
      for (let i = 0; i < nRooms; i++) {
        const col = L.rooms[i + 1].x0;
        for (let r = mid - 1; r <= mid + 1; r++) t[idx(col, r)] = 0;
        const role = L.rooms[i].role;
        const kind = role === 'mech' ? 'mech' : 'q';
        const need = lv === 3 && i === nRooms - 1 ? 2 : 1;
        L.gates.push({ x: (col + 0.5) * T, y: (mid + 0.5) * T, c: col, kind, need, progress: 0, open: false, room: i, area: cfg.gateAreas[i % cfg.gateAreas.length] });
        for (let r = mid - 1; r <= mid + 1; r++) { occ.add(idx(col - 1, r)); occ.add(idx(col + 1, r)); }
      }

      // ---- Zona secreta sobre la sala de mecánica ----
      const mech = L.rooms.find((r) => r.role === 'mech');
      const sx0 = mech.x0 + 3, sw = 9;
      for (let r = 3; r <= 8; r++) for (let c = sx0 + 1; c < sx0 + sw - 1; c++) t[idx(c, r)] = 0;
      const pc = mech.x0 + 7;
      t[idx(pc, 9)] = 0; t[idx(pc, y0)] = 4;
      L.secret = { x0: sx0, y0: 2, w: sw, h: 8, found: false, px: (pc + 0.5) * T };
      const sChest = tileXY(pc, 5);
      L.chests.push({ x: sChest.x, y: sChest.y, gold: true, open: false, secret: true });
      for (let c = sx0 + 2; c < sx0 + sw - 2; c++) if (c !== pc) { const p = tileXY(c, 7); L.coins.push({ x: p.x, y: p.y }); }
      occ.add(idx(pc, mid - 4)); occ.add(idx(pc, mid - 3)); // deja libre el acceso

      // ---- Contenido por sala ----
      const nEnemies = [0, 1, 2, 3][lv];
      const speeds = [0, 55, 72, 90][lv];
      const addEnemy = (room, kind) => {
        const p = free(room, { avoidPath: false, margin: 2 });
        if (!p) return;
        occ.delete(idx(p.c, p.r));
        const horiz = rng() < 0.6;
        const span = U.randInt(2, 4, rng) * T;
        L.enemies.push({ x: p.x, y: p.y, ox: p.x, oy: p.y, horiz, span, kind, t: rng() * 10, speed: speeds * (kind === 'chaser' ? 0.8 : 1), dir: 1, alive: true, room: room.i, pop: 0 });
      };
      const addProps = (room, n) => {
        const th = EZ.art.THEMES[cfg.theme];
        for (let k = 0; k < n; k++) { const p = free(room, { margin: 1 }); if (p) L.props.push({ x: p.x, y: p.y - 4, kind: U.pick(th.props, rng), c: p.c, r: p.r }); }
      };
      const addCoins = (room, n, path) => { for (let k = 0; k < n; k++) { const p = free(room, { avoidPath: !path }); if (p) L.coins.push({ x: p.x, y: p.y }); } };
      const hazardColumn = (room, col) => { for (let r = mid - 1; r <= mid + 1; r++) { t[idx(col, r)] = 3; occ.add(idx(col, r)); } };
      const hazardsRandom = (room, n) => { for (let k = 0; k < n; k++) { const p = free(room, { margin: 2 }); if (p) t[idx(p.c, p.r)] = 3; } };

      L.rooms.forEach((room) => {
        switch (room.role) {
          case 'start': {
            L.spawn = tileXY(room.x0 + 2, mid);
            occ.add(idx(room.x0 + 2, mid));
            const s = tileXY(room.x0 + 4, mid - 2); occ.add(idx(room.x0 + 4, mid - 2));
            L.signs.push({ x: s.x, y: s.y, text: 'Muévete con las flechas. ESPACIO salta. ENTER interactúa. ¡Salta encima de los Borroncitos!' });
            const n = tileXY(room.x0 + 8, mid - 3); occ.add(idx(room.x0 + 8, mid - 3));
            L.npcs.push({ x: n.x, y: n.y, role: 'quest', look: { skin: U.randInt(0, 4, rng), hair: U.randInt(0, 5, rng), hairColor: U.randInt(0, 8, rng), outfit: U.randInt(0, 7, rng) }, hat: U.pick(['cap', 'none', 'glasses'], rng), state: 'new' });
            addProps(room, 3); addCoins(room, 6, true);
            break;
          }
          case 'danger': {
            hazardColumn(room, room.x0 + 6);
            hazardsRandom(room, 2 + lv);
            // Caché con barreras e interruptor (esquina superior izquierda)
            const cx = room.x0 + 1, cy = room.y0 + 1;
            for (let c = cx; c <= cx + 2; c++) for (let r = cy; r <= cy + 1; r++) occ.add(idx(c, r));
            const cache = [tileXY(cx, cy), tileXY(cx + 1, cy), tileXY(cx + 2, cy), tileXY(cx, cy + 1), tileXY(cx + 1, cy + 1)];
            cache.forEach((p) => L.coins.push({ x: p.x, y: p.y }));
            const hp = tileXY(cx + 2, cy + 1); L.pickups.push({ x: hp.x, y: hp.y, kind: 'heart' });
            const bar = [[cx, cy + 2], [cx + 1, cy + 2], [cx + 2, cy + 2], [cx + 3, cy + 2], [cx + 3, cy + 1], [cx + 3, cy]];
            bar.forEach(([c, r]) => { occ.add(idx(c, r)); const p = tileXY(c, r); L.barriers.push({ x: p.x, y: p.y, c, r, down: false }); });
            const sp = free(room, { margin: 2 });
            if (sp) L.switches.push({ x: sp.x, y: sp.y, on: false });
            const ch = free(room, { margin: 2 });
            if (ch) L.chests.push({ x: ch.x, y: ch.y, gold: false, open: false, area: cfg.gateAreas[1 % cfg.gateAreas.length] });
            for (let k = 0; k < nEnemies; k++) addEnemy(room, 'patrol');
            addProps(room, 3); addCoins(room, 5, true);
            break;
          }
          case 'mech': {
            room.mechArea = cfg.mechArea;
            // las dos filas superiores quedan para zonas, edificios o estaciones
            for (let c = room.x0 + 1; c < room.x0 + room.w - 1; c++) for (let r = room.y0 + 1; r <= room.y0 + 3; r++) occ.add(idx(c, r));
            break;
          }
          case 'bridge': {
            const c0 = room.x0 + 6;
            for (let c = c0; c < c0 + 3; c++) for (let r = room.y0 + 1; r < room.y0 + room.h - 1; r++) {
              t[idx(c, r)] = isPath(r) ? 5 : 2; occ.add(idx(c, r));
              if (isPath(r)) L.crumbles[idx(c, r)] = { state: 'solid', k: 0 };
            }
            if (lv >= 2) { t[idx(c0 + 1, mid)] = 2; delete L.crumbles[idx(c0 + 1, mid)]; }
            for (let k = 0; k < nEnemies; k++) addEnemy(room, lv === 3 && k === 0 ? 'chaser' : 'patrol');
            const ch = free(room, { margin: 2 });
            if (ch) L.chests.push({ x: ch.x, y: ch.y, gold: false, open: false, area: cfg.gateAreas[3 % cfg.gateAreas.length] });
            hazardsRandom(room, lv);
            addProps(room, 3); addCoins(room, 6, true);
            break;
          }
          case 'gauntlet': {
            hazardColumn(room, room.x0 + 4); hazardColumn(room, room.x0 + 9);
            hazardsRandom(room, 4);
            for (let k = 0; k < 3; k++) addEnemy(room, k === 0 ? 'chaser' : 'patrol');
            const ch = free(room, { margin: 2 });
            if (ch) L.chests.push({ x: ch.x, y: ch.y, gold: false, open: false, area: cfg.gateAreas[4 % cfg.gateAreas.length] });
            addProps(room, 3); addCoins(room, 6, true);
            break;
          }
          case 'boss': {
            room.bossArea = cfg.bossArea;
            // columnas decorativas en las esquinas
            [[3, 2], [room.w - 4, 2], [3, room.h - 3], [room.w - 4, room.h - 3]].forEach(([dc, dr]) => {
              const p = tileXY(room.x0 + dc, room.y0 + dr); occ.add(idx(room.x0 + dc, room.y0 + dr));
              L.props.push({ x: p.x, y: p.y - 4, kind: U.pick(EZ.art.THEMES[cfg.theme].props, rng), c: room.x0 + dc, r: room.y0 + dr });
            });
            break;
          }
        }
      });

      // Objetos de la misión secundaria (uno en cada sala 1-3)
      [1, 2, 3].forEach((i) => { const p = free(L.rooms[i], { margin: 2 }); if (p) L.questItems.push({ x: p.x, y: p.y, got: false }); });
      // Pistas y corazones extra
      { const p = free(L.rooms[2], { margin: 2 }); if (p) L.pickups.push({ x: p.x, y: p.y, kind: 'bulb' }); }
      { const p = free(L.rooms[nRooms - 1], { margin: 2 }); if (p) L.pickups.push({ x: p.x, y: p.y, kind: 'heart' }); }

      // Lista de peligros (con fase para las trampas intermitentes)
      for (let i = 0; i < t.length; i++) if (t[i] === 3) L.hazards.push({ i, phase: ((i % w) % 4) * 0.4 });
      return L;
    }
  };
})(window.EZ);
