/* dashboard.js: lê os campos e ESCREVE no localStorage. Nunca mexe na página pública. */
const $ = s => document.querySelector(s);
let S = load();

// Links blob: morrem quando a aba fecha, então limpamos os velhos
['audio'].forEach(k => { if (String(S[k]).startsWith('blob:')) S[k] = ''; });

/* ---------- 1. SALVAR (ponto único) ---------- */
function setValue(k, v) {
  S[k] = v;
  try { save(S); }                                   // dispara o evento 'storage' na profile.html
  catch (e) { alert('Arquivo grande demais para o localStorage. Use o campo de URL.'); }
}

/* ---------- 2. GERAR CONTROLES REPETITIVOS ---------- */
const UPLOAD_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16"/></svg>';
const MEDIA = [  // [chave, rótulo, tipos aceitos]
  ['bg','Plano de fundo (.webp)','image/*'], ['audio','Áudio (.mp3)','audio/*'],
  ['avatar','Avatar (.webp)','image/*'],     ['cursor','Cursor (.png / .cur)','.png,.cur,image/png']
];
$('#media').innerHTML = MEDIA.map(([k, name, acc]) => `
  <label class="up">${UPLOAD_ICON} ${name}<em id="st-${k}">${S[k] ? '✓' : ''}</em>
    <input type="file" accept="${acc}" data-up="${k}"></label>
  <input type="url" placeholder="ou cole uma URL" data-key="${k}" style="margin:0 0 8px">`).join('');

const toggles = (id, list) => $(id).innerHTML = list.map(([k, n]) =>
  `<label class="tg">${n}<input type="checkbox" data-key="${k}"><i></i></label>`).join('');
toggles('#glow',   [['glowName','Nome de usuário'], ['glowSocials','Redes'], ['glowBadges','Badges']]);
toggles('#grad',   [['gradient','Ativar gradiente do perfil']]);
toggles('#others', [['mono','Ícones monocromáticos'], ['animTitle','Título animado'], ['invert','Inverter cores das caixas'],
                    ['volume','Controle de volume'], ['discordAvatar','Usar avatar do Discord'], ['avatarDecor','Decoração de avatar'],
                    ['hideBadges','Ocultar badges'], ['profileInvisible','Cartão do perfil invisível']]);
$('#colors').innerHTML = [['accent','Destaque'], ['text','Texto'], ['bgColor','Fundo'], ['icon','Ícones'], ['fxColor','Efeito de fundo']]
  .map(([k, n]) => `<label class="cl">${n}<input type="color" data-key="${k}"></label>`).join('');
document.querySelectorAll('.fonts').forEach(sel =>
  sel.innerHTML = Object.entries(FONTS).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join(''));

/* ---------- 3. BINDING: input -> localStorage ---------- */
document.querySelectorAll('[data-key]').forEach(el => {
  const k = el.dataset.key, t = el.type;
  if (t === 'checkbox') el.checked = S[k]; else el.value = /^(blob|data):/.test(S[k]) ? '' : (S[k] ?? '');
  el.addEventListener('input', () => setValue(k, t === 'checkbox' ? el.checked : t === 'range' ? Number(el.value) : el.value));
});

/* ---------- 4. UPLOADS LOCAIS ---------- */
document.querySelectorAll('[data-up]').forEach(inp => inp.addEventListener('change', () => {
  const file = inp.files[0], k = inp.dataset.up;
  if (!file) return;
  const done = v => { setValue(k, v); $('#st-' + k).textContent = '✓'; };

  if (k === 'audio') {
    done(URL.createObjectURL(file));            // URL temporária (vale enquanto esta aba estiver aberta)
  } else {
    const r = new FileReader();                 // Base64: fica salvo mesmo fechando o navegador
    r.onload = () => done(r.result);
    r.readAsDataURL(file);
  }
}));

/* ---------- 5. REDES SOCIAIS ---------- */
function buildSocials() {
  $('#grid').innerHTML = $('#urls').innerHTML = '';
  for (const [id, name] of Object.entries(SOCIALS)) {
    const b = document.createElement('button');
    b.title = name; b.className = id in S.socials ? 'on' : '';
    b.innerHTML = `<span class="ico" style="--url:${iconURL(id)}"></span>`;
    b.onclick = () => { id in S.socials ? delete S.socials[id] : S.socials[id] = ''; setValue('socials', S.socials); buildSocials(); };
    $('#grid').append(b);
    if (id in S.socials) {
      const i = document.createElement('input');
      i.type = 'url'; i.placeholder = `Link do ${name}`; i.value = S.socials[id];
      i.oninput = () => { S.socials[id] = i.value; setValue('socials', S.socials); };
      $('#urls').append(i);
    }
  }
}
buildSocials();