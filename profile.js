/* profile.js: só LÊ o localStorage e aplica no DOM. Nunca grava nada. */
const $ = s => document.querySelector(s);
let S = load(), lastAudio, lastFx, titleTimer, nameTimer;

/* ---------- 1. EFEITOS DE CANVAS ----------
   [EDITAR] Novo efeito: adicione uma chave aqui + <option> no index.html com o mesmo value */
const cv = $('#fx'), cx = cv.getContext('2d');
let P = [], current = 'none';
const rnd = Math.random;
const FX = {
    petals:   { init:(w,h) => P = Array.from({length:30}, () => ({x:rnd()*w, y:rnd()*h, s:rnd()*5+7, v:rnd()*.8+.6, a:rnd()*6, sw:rnd()*6, f:rnd()*6})),
              draw:(w,h) => { cx.globalAlpha = .85; P.forEach(p => { p.y += p.v; p.sw += .02; p.x += Math.sin(p.sw)*.8 + .3; p.a += .01; p.f += .04;
                if (p.y > h+20) { p.y = -20; p.x = rnd()*w; } if (p.x > w+20) p.x = -20;
                cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(Math.cos(p.f), 1);
                cx.beginPath(); cx.moveTo(0, p.s);
                cx.bezierCurveTo(-p.s*1.1, p.s*.2, -p.s*.9, -p.s, -p.s*.15, -p.s*.9);
                cx.quadraticCurveTo(0, -p.s*.65, p.s*.15, -p.s*.9);
                cx.bezierCurveTo(p.s*.9, -p.s, p.s*1.1, p.s*.2, 0, p.s);
                cx.fill(); cx.restore(); }); cx.globalAlpha = 1; } },
    bats:     { init:(w,h) => P = Array.from({length:6}, () => ({x:rnd()*w, y:rnd()*h*.7+40, v:(rnd()*1.4+.8)*(rnd()<.5?-1:1), s:rnd()*30+40, t:rnd()*6})),
              draw:(w,h) => {
                const B = [100,-27,96,-29,85,-34,76,-36,65,-38,55,-38,39,-38,33,-37,27,-37,26,-37,29,-35,29,-31,28,-27,26,-23,22,-18,17,-15,13,-13,9,-24,7,-29,4,-31,3,-31,2,-27,2,-17,-2,-15,-3,-15,-7,-23,-10,-26,-12,-26,-12,-24,-13,-19,-12,-10,-10,-6,-10,-5,-16,-4,-25,-4,-29,-6,-31,-8,-30,-12,-29,-13,-29,-14,-31,-14,-40,-10,-52,-4,-65,4,-72,10,-78,19,-82,29,-83,35,-76,29,-69,26,-67,25,-64,25,-61,26,-57,29,-56,31,-52,27,-44,24,-40,23,-38,24,-36,24,-33,26,-31,28,-28,32,-27,30,-22,27,-15,25,-13,25,-9,24,-5,24,-3,26,-1,28,-1,32,0,32,2,34,4,32,6,32,5,30,5,29,12,36,14,38,13,31,14,30,14,26,15,26,16,29,18,27,21,28,21,25,22,24,23,24,20,24,18,22,18,19,25,13,31,10,40,10,39,8,41,5,45,2,50,-1,55,-2,65,-3,62,-5,62,-10,65,-13,70,-18,77,-21,88,-25];
                P.forEach(p => {
                  p.x += p.v; p.t += .18; p.y += Math.sin(p.t/2)*.8;
                  if (p.v > 0 && p.x > w+100) p.x = -100; if (p.v < 0 && p.x < -100) p.x = w+100;
                  const k = p.s/100, u = Math.sin(p.t), d = p.v > 0 ? 1 : -1;
                  cx.globalAlpha = .55 + p.s/120; cx.shadowBlur = 12; cx.shadowColor = S.fxColor; cx.beginPath();
                  for (let i = 0; i < B.length; i += 2) {
                    const a = Math.abs(B[i])/100, x = p.x + d*B[i]*k*(1 - .15*Math.abs(u)), y = p.y + (B[i+1] - u*a*a*40)*k;
                    i ? cx.lineTo(x, y) : cx.moveTo(x, y); }
                  cx.closePath(); cx.fill(); });
                cx.globalAlpha = 1; cx.shadowBlur = 0; } },
          
  aurora:   { init:(w,h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w/10); c.height = Math.ceil(h/10); P = {c, t:0}; },
              draw:(w,h) => { const c = P.c, g = c.getContext('2d'), cw = c.width, ch = c.height, hex = S.fxColor;
                const r = parseInt(hex.slice(1,3),16), gr = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
                P.t += .012; g.clearRect(0, 0, cw, ch); g.globalCompositeOperation = 'lighter';
                for (let k = 0; k < 3; k++) for (let x = 0; x < cw; x++) {
                  const yc = ch*(.25 + k*.12) + Math.sin(x*.07 + P.t*(1+k*.4) + k*2)*ch*.12 + Math.sin(x*.19 - P.t*2)*ch*.03;
                  const a = (.16 + .12*Math.sin(x*.11 + P.t*2.5 + k*3)) * (1 - k*.2);
                  const gd = g.createLinearGradient(0, yc - ch*.3, 0, yc + ch*.4);
                  gd.addColorStop(0, `rgba(${r},${gr},${b},0)`); gd.addColorStop(.4, `rgba(${r},${gr},${b},${a})`); gd.addColorStop(1, `rgba(${r},${gr},${b},0)`);
                  g.fillStyle = gd; g.fillRect(x, 0, 1, ch); }
                cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
                cx.drawImage(c, 0, 0, w, h); } },
  lightning:{ init:() => P = {bolts:[]},
              draw:(w,h) => {
                if (rnd() < .035 && P.bolts.length < 3) {
                  const segs = [], grow = (x, y, ang, len, wd, depth) => {
                    for (let i = 0, n = len/18; i < n && y < h; i++) {
                      ang += (rnd()-.5)*.8 - ang*.12; const l = 12 + rnd()*14, nx = x + Math.sin(ang)*l, ny = y + Math.cos(ang)*l;
                      segs.push([x, y, nx, ny]); x = nx; y = ny;
                      if (depth < 2 && rnd() < .07) grow(x, y, ang + (rnd()-.5)*1.6, len*.45, wd*.6, depth+1); } };
                  grow(rnd()*w, 0, (rnd()-.5)*.4, h*1.1, 1, 0);
                  P.bolts.push({segs, f:1, age:0, big:rnd()<.5}); }
                P.bolts = P.bolts.filter(b => b.f > .03);
                P.bolts.forEach(b => {
                  b.age++; if (b.age === 5 && b.big) b.f = 1;
                  cx.globalAlpha = b.f*.10; cx.fillRect(0, 0, w, h);
                  cx.lineCap = 'round'; cx.lineJoin = 'round';
                  [[12, .14, S.fxColor], [5, .4, S.fxColor], [2, 1, '#ffffff']].forEach(([lw, al, col]) => {
                    cx.globalAlpha = b.f*al; cx.strokeStyle = col; cx.lineWidth = lw; cx.beginPath();
                    b.segs.forEach(([x1,y1,x2,y2]) => { cx.moveTo(x1,y1); cx.lineTo(x2,y2); }); cx.stroke(); });
                  b.f *= .86; });
                cx.globalAlpha = 1; } },
  fog:      { init:(w,h) => P = Array.from({length:18}, () => ({x:rnd()*w, y:rnd()*h, r:rnd()*100+70, v:rnd()*.35+.1, a:rnd()*6})),
              draw:(w,h) => { P.forEach(p => { p.x += p.v; p.a += .008; if (p.x-p.r > w) p.x = -p.r;
                const g = cx.createRadialGradient(p.x, p.y + Math.sin(p.a)*18, 0, p.x, p.y, p.r);
                g.addColorStop(0, 'rgba(210,210,210,.075)'); g.addColorStop(1, 'rgba(210,210,210,0)');
                cx.fillStyle = g; cx.fillRect(p.x-p.r, p.y-p.r, p.r*2, p.r*2); }); } },
  blood:    { init:(w,h) => P = Array.from({length:16}, () => ({x:rnd()*w, y:rnd()*h, len:rnd()*150+70, v:rnd()*.9+.8, r:rnd()*11+8})),
              draw:(w,h) => { P.forEach(p => { p.y += p.v; if (p.y > h+p.len) { p.y = -p.len-rnd()*h*.5; p.x = rnd()*w; p.len = rnd()*150+70; }
                const top = Math.max(0, p.y-p.len);
                const edge = cx.createLinearGradient(p.x-p.r*2, 0, p.x+p.r*2, 0);
                edge.addColorStop(0, 'rgba(70,0,8,0)');
                edge.addColorStop(.28, 'rgba(75,0,10,.14)');
                edge.addColorStop(.5, 'rgba(105,3,15,.34)');
                edge.addColorStop(.72, 'rgba(75,0,10,.14)');
                edge.addColorStop(1, 'rgba(70,0,8,0)');
                cx.save(); cx.filter = `blur(${p.r*1.25}px)`; cx.shadowColor = 'rgba(110,0,15,.5)'; cx.shadowBlur = p.r*3;
                cx.fillStyle = edge; cx.beginPath(); cx.moveTo(p.x-p.r, top);
                cx.bezierCurveTo(p.x-p.r*.8, top+p.len*.35, p.x-p.r*1.1, p.y-p.r*1.8, p.x-p.r*.45, p.y-p.r*.7);
                cx.quadraticCurveTo(p.x, p.y+p.r*.7, p.x+p.r*.45, p.y-p.r*.7);
                cx.bezierCurveTo(p.x+p.r*1.1, p.y-p.r*1.8, p.x+p.r*.8, top+p.len*.35, p.x+p.r, top);
                cx.closePath(); cx.fill(); cx.restore(); }); } },
  tvFail:   { init:() => P = {tick:0, flash:0},
              draw:(w,h) => { P.tick++; P.flash = Math.max(0, P.flash-.08);
                if (rnd() < .025) P.flash = rnd()*.45;
                cx.fillStyle = `rgba(255,255,255,${P.flash})`; cx.fillRect(0, 0, w, h);
                for (let i = 0, n = 4 + Math.floor(rnd()*7); i < n; i++) {
                  const y = rnd()*h, bandH = rnd()*12+2;
                  cx.fillStyle = `rgba(220,220,220,${rnd()*.16})`; cx.fillRect(0, y, w, bandH);
                }
                cx.fillStyle = 'rgba(0,0,0,.18)';
                for (let y = P.tick % 4; y < h; y += 4) cx.fillRect(0, y, w, 1);
                if (rnd() < .035) { cx.fillStyle = 'rgba(0,0,0,.45)'; cx.fillRect(0, rnd()*h, w, rnd()*24+4); } } },
  snow:   { init:(w,h) => P = Array.from({length:90}, () => ({x:rnd()*w, y:rnd()*h, r:rnd()*2+1, v:rnd()+.5})),
            draw:(w,h) => P.forEach(p => { p.y += p.v; if (p.y > h) p.y = 0; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); }) },
  rain:   { init:(w,h) => P = Array.from({length:140}, () => ({x:rnd()*w, y:rnd()*h, v:rnd()*6+8})),
            draw:(w,h) => { cx.globalAlpha = .6; P.forEach(p => { p.y += p.v; if (p.y > h) p.y = -20; cx.fillRect(p.x, p.y, 1, 14); }); cx.globalAlpha = 1; } },
  matrix: { init:w => P = Array.from({length:Math.ceil(w/16)}, () => rnd()*50),
            draw:(w,h) => { cx.font = '14px monospace';
              P.forEach((y, i) => { for (let j = 0; j < 8; j++) { cx.globalAlpha = 1 - j/8; cx.fillText(String.fromCharCode(0x30A0 + rnd()*96), i*16, (y-j)*16); }
                P[i] = y*16 > h + 150 ? 0 : y + .3; }); cx.globalAlpha = 1; } },
  static: { init:() => {},
            draw:(w,h) => { cx.globalAlpha = .35; for (let i = 0; i < 500; i++) cx.fillRect(rnd()*w, rnd()*h, 2, 2); cx.globalAlpha = 1; } },
  stars:    { init:(w,h) => P = Array.from({length:120}, () => ({x:rnd()*w, y:rnd()*h, r:rnd()*1.5+.3, t:rnd()*6})),
            draw:(w,h) => { P.forEach(p => { p.t += .03; cx.globalAlpha = .4 + .6*Math.abs(Math.sin(p.t)); cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); }); cx.globalAlpha = 1; } },
  fireflies:{ init:(w,h) => P = Array.from({length:40}, () => ({x:rnd()*w, y:rnd()*h, a:rnd()*6, t:rnd()*6})),
              draw:(w,h) => { P.forEach(p => { p.a += (rnd()-.5)*.2; p.x += Math.cos(p.a)*.6; p.y += Math.sin(p.a)*.6; p.t += .04;
                if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
                cx.globalAlpha = .3 + .7*Math.abs(Math.sin(p.t)); cx.shadowBlur = 12; cx.shadowColor = S.fxColor;
                cx.beginPath(); cx.arc(p.x, p.y, 2.5, 0, 7); cx.fill(); }); cx.globalAlpha = 1; cx.shadowBlur = 0; } },
  embers:   { init:(w,h) => P = Array.from({length:70}, () => ({x:rnd()*w, y:rnd()*h, r:rnd()*2+1, v:rnd()*1.2+.4, s:rnd()*6})),
              draw:(w,h) => { P.forEach(p => { p.y -= p.v; p.s += .05; p.x += Math.sin(p.s)*.6; if (p.y < -5) { p.y = h+5; p.x = rnd()*w; }
                cx.globalAlpha = .8; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); }); cx.globalAlpha = 1; } },
  crosses:  { init:(w,h) => P = Array.from({length:40}, () => ({x:rnd()*w, y:rnd()*h, v:rnd()+.5, s:rnd()*14+10})),
              draw:(w,h) => P.forEach(p => { p.y += p.v; if (p.y > h+20) { p.y = -20; p.x = rnd()*w; }
                cx.font = p.s + 'px serif'; cx.fillText('†', p.x, p.y); }) },
};
function setFx(name) {
  current = name; cv.width = innerWidth; cv.height = innerHeight;
  FX[name]?.init(cv.width, cv.height);
}
(function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.fillStyle = S.fxColor;
  FX[current]?.draw(cv.width, cv.height);
  requestAnimationFrame(loop);
})();

/* ---------- 2. RENDER: estado -> DOM ---------- */
function render() {
  const root = document.documentElement.style;
  const vars = { '--accent':S.accent, '--text':S.text, '--bg':S.bgColor, '--icon':S.icon, '--op':S.opacity/100, '--blur':S.blur+'px' };
  for (const k in vars) root.setProperty(k, vars[k]);

  document.body.style.backgroundImage = [S.gradient && `linear-gradient(135deg,${S.bgColor},${S.accent}55)`, S.bg && `url(${S.bg})`]
    .filter(Boolean).join(',') || 'none';

  // Cursor: injeta uma regra CSS global
  let cs = $('#cursorStyle');
  if (!cs) { cs = document.createElement('style'); cs.id = 'cursorStyle'; document.head.append(cs); }
  cs.textContent = S.cursor ? `body, body * { cursor: url("${S.cursor}") 0 0, auto !important; }` : '';

  const pr = $('#profile');
  ['glowName','glowSocials','glowBadges','mono','invert'].forEach(k => pr.classList.toggle(k, S[k]));
  pr.classList.toggle('decor', S.avatarDecor);
  pr.classList.toggle('profileInvisible', S.profileInvisible);

    clearInterval(nameTimer);
  const nm = $('#pName');
  nm.textContent = S.username;
  if (S.nameEffect === 'typewriter') {
    let n = 0;
    nameTimer = setInterval(() => { n = (n + 1) % (S.username.length + 6); nm.textContent = S.username.slice(0, n) + '|'; }, 250);
  } else if (S.nameEffect === 'scramble') {
    const chars = '█▓▒░<>/#@$%&*'; let n = 0;
    nameTimer = setInterval(() => {
      n++;
      nm.textContent = [...S.username].map((c, i) => i < n/2 ? c : chars[Math.floor(Math.random()*chars.length)]).join('');
      if (n/2 >= S.username.length) { clearInterval(nameTimer); nm.textContent = S.username; }
    }, 60);
  }
  $('#pName').className = 'name ' + S.nameEffect;
  $('#pName').style.fontFamily = FONTS[S.nameFont]?.[1];
  $('#pDesc').textContent = S.desc;
  $('#pDesc').style.fontFamily = FONTS[S.descFont]?.[1];
  $('.badges').style.display = S.hideBadges ? 'none' : '';
  $('#pLoc').textContent = S.location;
  $('#pLoc').classList.toggle('has', !!S.location);
  $('#pAvatar').src = S.discordAvatar ? 'https://cdn.discordapp.com/embed/avatars/0.png' : S.avatar;

  $('#pSocials').innerHTML = Object.entries(S.socials).map(([id, url]) =>
    `<a href="${url || '#'}" target="_blank" rel="noopener" title="${SOCIALS[id]}"><span class="ico" style="--url:${iconURL(id)}"></span></a>`).join('');

  $('.tv').classList.toggle('on', S.bgEffect === 'tv');
  if (S.bgEffect !== lastFx) { lastFx = S.bgEffect; setFx(S.bgEffect); }

  // Áudio: só troca o src se mudou; tenta tocar e, se o navegador bloquear, toca no 1º clique
  const a = $('#audio');
  if (S.audio !== lastAudio) {
    lastAudio = S.audio; a.src = S.audio;
    if (S.audio) a.play().then(() => $('#hint').hidden = true).catch(() => { $('#hint').hidden = false; addEventListener('click', () => { a.play(); $('#hint').hidden = true; }, { once:true }); });
  }
  $('#vol').style.display = S.volume ? 'block' : 'none';

  clearInterval(titleTimer);
  if (S.animTitle) { let n = 0; titleTimer = setInterval(() => document.title = S.username.slice(0, ++n % (S.username.length + 1)) || '_', 400); }
  else document.title = S.username;
}

/* ---------- 3. TEMPO REAL ----------
   'storage' dispara quando OUTRA aba/iframe da mesma origem altera o localStorage */
addEventListener('storage', e => { if (e.key === KEY) { S = load(); render(); } });
$('#vol').oninput = e => $('#audio').volume = e.target.value;
addEventListener('resize', () => setFx(current));
render();