/* ==========================================================
   EUREKA DROP · icons.js
   Iconos SVG originales para la interfaz (sin fuentes externas).
   ========================================================== */
(function (EZ) {
  'use strict';
  const s = (body, vb = '0 0 24 24') => `<svg class="ico" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
  EZ.icons = {
    heart: s('<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.5 1.2 5.3 3.2 1.8-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="#ff4f6d" stroke="#7a0f2a" stroke-width="1.6"/><ellipse cx="7.5" cy="8.5" rx="2" ry="1.3" fill="#fff" opacity=".6"/>'),
    heartEmpty: s('<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.5 1.2 5.3 3.2 1.8-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="#2a2350" stroke="#6b5fb0" stroke-width="1.6"/>'),
    coin: s('<circle cx="12" cy="12" r="9" fill="#ffd23f" stroke="#a86b00" stroke-width="1.8"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#e8a400" stroke-width="1.5"/><path d="M10.5 9h3l-2 6" stroke="#a86b00" stroke-width="1.6" fill="none"/>'),
    bulb: s('<path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.8.6 1.3 1.5 1.3 2.5V18h5v-1.2c0-1 .5-1.9 1.3-2.5A6.5 6.5 0 0 0 12 2.5z" fill="#fff27a" stroke="#a88600" stroke-width="1.6"/><rect x="9.5" y="18.5" width="5" height="3" rx="1" fill="#9aa3c7"/><path d="M10 9.5c.5-1.5 1.5-2.2 3-2.2" stroke="#fff" stroke-width="1.4" fill="none"/>'),
    star: s('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="#ffd23f" stroke="#a86b00" stroke-width="1.5" stroke-linejoin="round"/>'),
    starEmpty: s('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="#2a2350" stroke="#6b5fb0" stroke-width="1.5" stroke-linejoin="round"/>'),
    check: s('<circle cx="12" cy="12" r="10" fill="#2fd07f"/><path d="M7 12.5l3.2 3.2L17.5 8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    cross: s('<circle cx="12" cy="12" r="10" fill="#ff4f6d"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'),
    lock: s('<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#b9b2e8" stroke="#3f3780" stroke-width="1.6"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#3f3780" stroke-width="2" fill="none"/>'),
    speaker: s('<path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>'),
    pause: s('<rect x="6" y="5" width="4" height="14" rx="1.5" fill="#fff"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#fff"/>'),
    trophy: s('<path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="#ffd23f" stroke="#a86b00" stroke-width="1.5"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" stroke="#a86b00" stroke-width="1.5" fill="none"/><rect x="10.5" y="12.5" width="3" height="4" fill="#e8a400"/><rect x="7" y="16.5" width="10" height="4" rx="1" fill="#7b5cff"/>'),
    medal: s('<path d="M7 2h4l1 6-3 1zM17 2h-4l-1 6 3 1z" fill="#4cc9f0"/><circle cx="12" cy="15" r="6.5" fill="#ffd23f" stroke="#a86b00" stroke-width="1.5"/><path d="M12 11.5l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" fill="#fff6c2"/>'),
    flame: s('<path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 7 13c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="#ff8a3d" stroke="#a83a00" stroke-width="1.4"/><path d="M12 13c1 1.2 2 2 2 3.5a2 2 0 0 1-4 0c0-1.2.8-2.2 2-3.5z" fill="#ffe27a"/>'),
    map: s('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="#3ddc97" stroke="#0f5c3a" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="#0f5c3a" stroke-width="1.4"/>'),
    bolt: s('<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#ffd23f" stroke="#a86b00" stroke-width="1.4" stroke-linejoin="round"/>'),
    gear: s('<circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'),
    book: s('<path d="M4 4.5c3-1 5.5-.5 8 1.5v14c-2.5-2-5-2.5-8-1.5zM20 4.5c-3-1-5.5-.5-8 1.5v14c2.5-2 5-2.5 8-1.5z" fill="#ffb547" stroke="#7a4a00" stroke-width="1.5" stroke-linejoin="round"/>'),
    chart: s('<rect x="3" y="12" width="4" height="8" rx="1" fill="#4cc9f0"/><rect x="10" y="7" width="4" height="13" rx="1" fill="#ffd23f"/><rect x="17" y="3" width="4" height="17" rx="1" fill="#ff6b9a"/>'),
    user: s('<circle cx="12" cy="8" r="4.5" fill="#ffd23f"/><path d="M3.5 21c.8-4.5 4.2-7 8.5-7s7.7 2.5 8.5 7z" fill="#7b5cff"/>'),
    calendar: s('<rect x="3" y="5" width="18" height="16" rx="3" fill="#fff" stroke="#3f3780" stroke-width="1.6"/><rect x="3" y="5" width="18" height="5" rx="2" fill="#ff4f8b"/><path d="M8 3v4M16 3v4" stroke="#3f3780" stroke-width="2" stroke-linecap="round"/><path d="M12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="#ffd23f"/>'),
    play: s('<path d="M7 4.5v15l12-7.5z" fill="#fff"/>'),
    back: s('<path d="M15 5l-7 7 7 7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    download: s('<path d="M12 3v12M6.5 10l5.5 5.5 5.5-5.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 19.5h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'),
    wifiOff: s('<path d="M3 3l18 18M5 9.5a11 11 0 0 1 4-2.2M12 7a11 11 0 0 1 7 2.5M8 13a6 6 0 0 1 2.5-1.5M15.5 12.4A6 6 0 0 1 16 13" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1.6" fill="#fff"/>'),
    ccCC: s('<circle cx="32" cy="32" r="29" fill="#fff" stroke="#000" stroke-width="4"/><path d="M27 24a8 8 0 1 0 0 16M44 24a8 8 0 1 0 0 16" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>', '0 0 64 64'),
    ccBY: s('<circle cx="32" cy="32" r="29" fill="#fff" stroke="#000" stroke-width="4"/><circle cx="32" cy="17" r="5" fill="#000"/><path d="M24 25h16v14h-4v12h-8V39h-4z" fill="#000"/>', '0 0 64 64'),
    ccNC: s('<circle cx="32" cy="32" r="29" fill="#fff" stroke="#000" stroke-width="4"/><path d="M39 22c-2-3-5-4-8-4-5 0-8 3-8 7 0 10 17 3 17 14 0 4-3 7-9 7-3 0-7-1-9-4M32 12v40" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M12 52L52 12" stroke="#fff" stroke-width="9"/><path d="M12 52L52 12" stroke="#000" stroke-width="4"/>', '0 0 64 64'),
    ccND: s('<circle cx="32" cy="32" r="29" fill="#fff" stroke="#000" stroke-width="4"/><path d="M18 25h28M18 39h28" stroke="#000" stroke-width="7" stroke-linecap="round"/>', '0 0 64 64'),
    gem: s('<path d="M6 3h12l4 6-10 12L2 9z" fill="#7df9ff" stroke="#0b5f7a" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 9h20M9 3l3 18 3-18" stroke="#0b5f7a" stroke-width="1.1" fill="none"/>')
  };
})(window.EZ);
