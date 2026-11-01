/* ==========================================================
   EUREKA DROP · util.js
   Utilidades compartidas: azar (con semilla), DOM, texto.
   Todos los módulos cuelgan del espacio de nombres global EZ.
   ========================================================== */
window.EZ = window.EZ || {};

(function (EZ) {
  'use strict';
  const U = (EZ.util = {});

  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  /** Hash de cadena → entero de 32 bits (para semillas). */
  U.hash = function (str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  };

  /** Generador pseudoaleatorio reproducible (mulberry32). */
  U.seeded = function (seed) {
    let s = typeof seed === 'string' ? U.hash(seed) : seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.rand = (a, b, rng = Math.random) => a + rng() * (b - a);
  U.randInt = (a, b, rng = Math.random) => Math.floor(a + rng() * (b - a + 1));
  U.pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
  U.shuffle = function (arr, rng = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const pad = (n) => String(n).padStart(2, '0');
  U.dateStr = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  U.todayStr = () => U.dateStr(new Date());
  U.yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return U.dateStr(d); };
  U.prettyDate = (str) => { const [y, m, d] = str.split('-'); return d + '/' + m + '/' + y; };
  U.fmtTime = (secs) => { secs = Math.round(secs); return Math.floor(secs / 60) + ':' + pad(secs % 60); };
  U.fmtNum = (n) => Math.round(n).toLocaleString('es-ES');

  U.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Normaliza respuestas escritas. Las tildes se conservan salvo que se pida lo contrario. */
  U.norm = function (s, ignoreAccents) {
    let t = String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.¡!¿?]+$/g, '').replace(/^[¡¿]+/, '');
    if (ignoreAccents) t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t;
  };
  /** Convierte «3,5», «3.5» o «1.000» en número; NaN si no es numérico. */
  U.toNumber = function (s) {
    let t = String(s).trim().replace(/\s/g, '').replace(/[€%ºª°]$/, '');
    if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    t = t.replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : NaN;
  };

  /** Crea un elemento DOM rápido. */
  U.el = function (tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };
  U.$ = (sel, root = document) => root.querySelector(sel);
  U.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Nombre del jugador: solo 6 letras (privacidad de datos personales). */
  U.initials = (s) => String(s || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').slice(0, 6).toUpperCase();

  U.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  U.isTouch = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  /** Nombres de áreas compartidos por todo el juego. */
  EZ.AREAS = [
    { id: 'mat', file: 'matematicas', subject: 'Matemáticas', island: 'Numérica City', color: '#4cc9f0', guardian: 'Calculatrón', fragment: 'Cristal Pi' },
    { id: 'len', file: 'lengua', subject: 'Lengua', island: 'Biblioteca Infinita', color: '#ffb547', guardian: 'Doña Tilde', fragment: 'Pluma Infinita' },
    { id: 'med', file: 'conocimiento-medio', subject: 'Conocimiento del Medio', island: 'Isla Volcana', color: '#3ddc97', guardian: 'Magmo', fragment: 'Semilla Gaia' },
    { id: 'ing', file: 'ingles', subject: 'Inglés', island: 'Port Hello', color: '#ff6b9a', guardian: 'Captain Polyglot', fragment: 'Brújula Babel' },
    { id: 'ef', file: 'educacion-fisica', subject: 'Educación Física', island: 'Estadio Turbo', color: '#b98bff', guardian: 'Rinoturbo', fragment: 'Silbato Turbo' }
  ];
  EZ.area = (id) => EZ.AREAS.find((a) => a.id === id);
  EZ.LEVEL_NAMES = ['', 'Explorador', 'Aventurero', 'Leyenda'];
})(window.EZ);
