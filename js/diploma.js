/* ==========================================================
   EUREKA DROP · diploma.js
   Diploma personalizado descargable como imagen PNG o PDF,
   generado en el navegador (sin servidor ni librerías).
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, ART = EZ.art, I = EZ.icons;
  const D = (EZ.diploma = {});
  const W = 1600, H = 1131;

  function draw(cv, data) {
    const ctx = cv.getContext('2d');
    cv.width = W; cv.height = H;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#fff8e6'); g.addColorStop(1, '#ffe9f1');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // marco
    ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 14; ART.rr(ctx, 40, 40, W - 80, H - 80, 40); ctx.stroke();
    ctx.strokeStyle = '#7b5cff'; ctx.lineWidth = 6; ART.rr(ctx, 66, 66, W - 132, H - 132, 30); ctx.stroke();
    const cols = ['#4cc9f0', '#ffb547', '#3ddc97', '#ff6b9a', '#b98bff'];
    for (let i = 0; i < 26; i++) { ctx.fillStyle = cols[i % 5]; ctx.beginPath(); ctx.arc(110 + i * 53.5, 100, 9, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(110 + i * 53.5, H - 100, 9, 0, 7); ctx.fill(); }
    // logo
    ctx.save(); ctx.translate(W / 2, 205); ctx.rotate(-0.03);
    ART.text(ctx, 'EUREKA', -90, 0, 92, '#ffd23f', 'center', '#1b1446');
    ctx.fillStyle = '#ff4f8b'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 8; ART.rr(ctx, 120, -48, 230, 96, 22); ctx.fill(); ctx.stroke();
    ART.text(ctx, 'DROP', 235, 2, 70, '#fff', 'center', '#1b1446');
    ctx.restore();
    ART.text(ctx, 'DIPLOMA DE SABIDURÍA EUREKA', W / 2, 320, 46, '#1b1446', 'center', null);
    ctx.font = `700 30px ${ART.FONT}`; ctx.fillStyle = '#4a3f80'; ctx.textAlign = 'center';
    ctx.fillText('Se concede con todos los honores a', W / 2, 395);
    ART.text(ctx, data.name || 'AVENTURERO/A', W / 2, 475, 84, '#7b5cff', 'center', '#fff');
    ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 420, 530); ctx.lineTo(W / 2 + 420, 530); ctx.stroke();
    ctx.font = `700 32px ${ART.FONT}`; ctx.fillStyle = '#1b1446';
    ctx.fillText('por superar la aventura', W / 2, 590);
    ART.text(ctx, '«' + data.title + '»', W / 2, 645, 44, '#ff4f8b', 'center', null);
    ctx.font = `700 28px ${ART.FONT}`; ctx.fillStyle = '#4a3f80';
    ctx.fillText('Áreas completadas: ' + data.areas, W / 2, 715);
    ctx.fillText('Puntuación: ' + U.fmtNum(data.score) + '   ·   Aciertos: ' + data.pct + '%   ·   Fecha: ' + data.date, W / 2, 762);
    ctx.font = `italic 700 30px ${ART.FONT}`; ctx.fillStyle = '#1b1446';
    ctx.fillText(data.message, W / 2, 840);
    // medalla
    const mx = 1300, my = 930;
    ctx.fillStyle = '#4cc9f0'; ctx.beginPath(); ctx.moveTo(mx - 60, my - 170); ctx.lineTo(mx - 10, my - 170); ctx.lineTo(mx + 10, my - 60); ctx.lineTo(mx - 40, my - 50); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4f8b'; ctx.beginPath(); ctx.moveTo(mx + 60, my - 170); ctx.lineTo(mx + 10, my - 170); ctx.lineTo(mx - 10, my - 60); ctx.lineTo(mx + 40, my - 50); ctx.closePath(); ctx.fill();
    ART.blob(ctx, mx, my, 88, '#ffd23f', '#a86b00', 8);
    ctx.fillStyle = '#fff6c2'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 24 : 56; ctx.lineTo(mx + Math.cos(a) * r, my + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ART.text(ctx, data.badge, mx, my + 120, 26, '#1b1446', 'center', '#fff');
    // personaje y Chispa
    ctx.save(); ctx.translate(300, 1010); ctx.scale(3.2, 3.2);
    ART.drawPlayer(ctx, 0, 0, 0, 'down', 0.2, data.avatar, {});
    ctx.restore();
    ART.drawChispa(ctx, 470, 860, 0.3, 2.4);
    ctx.font = `700 22px ${ART.FONT}`; ctx.fillStyle = '#4a3f80';
    ctx.fillText('Firmado: Chispa, búho-dron oficial del Archipiélago Eureka', W / 2, 1000);
    ctx.font = `700 20px ${ART.FONT}`; ctx.fillStyle = '#1b1446';
    ctx.fillText('Eureka Drop · Diseñado por David OZC · 2026 · CC BY-NC-ND 4.0 · Uso gratuito en centros educativos', W / 2, 1062);
  }

  /** Construye un PDF mínimo (A4 apaisado) con la imagen JPEG del diploma. */
  function pdfFromJpeg(bytes, w, h) {
    const enc = new TextEncoder();
    const parts = []; const off = []; let len = 0;
    const push = (d) => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); len += b.length; };
    push('%PDF-1.4\n');
    off[1] = len; push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    off[2] = len; push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    off[3] = len; push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');
    off[4] = len; push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
    push(bytes); push('\nendstream\nendobj\n');
    const content = 'q 842 0 0 595 0 0 cm /Im0 Do Q';
    off[5] = len; push(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
    const xref = len;
    let x = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) x += String(off[i]).padStart(10, '0') + ' 00000 n \n';
    push(x + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  D.open = function (run, title) {
    const S = EZ.save;
    const total = run.ok + run.ko;
    const done = EZ.AREAS.filter((a) => S.story.islands[a.id] > 0 || a.id === run.area).map((a) => a.subject);
    const areas = run.mode === 'daily' || run.mode === 'final' ? 'las cinco áreas' : (done.length ? done.join(', ') : EZ.area(run.area).subject);
    const msgs = ['¡Tu curiosidad ha vencido al Borrón!', '¡El archipiélago está orgulloso de ti!', '¡Sigue explorando: el saber no tiene fin!', '¡Has demostrado cabeza, corazón y constancia!'];
    const data = {
      name: U.initials(S.profile.name), title, areas, score: run.score, pct: total ? Math.round((run.ok / total) * 100) : 0,
      date: U.prettyDate(U.todayStr()), message: U.pick(msgs), avatar: S.profile.avatar,
      badge: run.level === 3 ? 'LEYENDA' : run.level === 2 ? 'AVENTURERO/A' : 'EXPLORADOR/A'
    };
    const box = U.$('#popup');
    box.innerHTML = `<div class="pop-card diploma-card" role="dialog" aria-modal="true" aria-labelledby="dp-t"><h2 id="dp-t">Tu diploma</h2>
      <label class="field"><span>Tu nombre o apodo, hasta 6 letras (opcional)</span><input id="dp-name" class="name3" type="text" maxlength="6" value="${U.esc(data.name)}" autocomplete="off" autocapitalize="characters" placeholder="DAVID"></label>
      <p class="privacy">${I.lock} Solo hasta 6 letras para proteger la privacidad de tus datos personales.</p>
      <canvas id="dp-cv" class="dp-cv" aria-label="Vista previa del diploma"></canvas>
      <div class="row"><button class="btn btn-go" type="button" id="dp-png">${I.download}<span>Imagen PNG</span></button><button class="btn btn-go" type="button" id="dp-pdf">${I.download}<span>PDF</span></button><button class="btn btn-ghost" type="button" id="dp-close">Cerrar</button></div></div>`;
    box.classList.add('show');
    const cv = U.$('#dp-cv', box);
    draw(cv, data);
    U.$('#dp-name', box).addEventListener('input', (e) => { data.name = U.initials(e.target.value); e.target.value = data.name; S.profile.name = data.name; EZ.store.persist(); draw(cv, data); });
    U.$('#dp-png', box).addEventListener('click', () => cv.toBlob((b) => download(b, 'diploma-eureka-drop.png'), 'image/png'));
    U.$('#dp-pdf', box).addEventListener('click', () => {
      const url = cv.toDataURL('image/jpeg', 0.92);
      const bin = atob(url.split(',')[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      download(pdfFromJpeg(bytes, W, H), 'diploma-eureka-drop.pdf');
    });
    const close = () => { document.removeEventListener('keydown', key, true); box.classList.remove('show'); box.innerHTML = ''; };
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    document.addEventListener('keydown', key, true);
    U.$('#dp-close', box).addEventListener('click', close);
  };
  D._pdfFromJpeg = pdfFromJpeg;
})(window.EZ);
