/* common.js: usado pelas DUAS páginas. Aqui ficam os dados e as funções de ler/salvar. */

// [EDITAR] Para adicionar rede: id = nome do ícone em simpleicons.org
const SOCIALS = {
  discord:'Discord', instagram:'Instagram', tiktok:'TikTok', x:'X / Twitter', pinterest:'Pinterest',
  snapchat:'Snapchat', youtube:'YouTube', spotify:'Spotify', github:'GitHub', twitch:'Twitch',
  telegram:'Telegram', reddit:'Reddit'
};

// [EDITAR] Para adicionar fonte: importe no <link> do Google Fonts nas 2 páginas e acrescente aqui
const FONTS = {
  gothic:  ['Gótica (Unifraktur)', "'UnifrakturMaguntia',cursive"],
  pirata:  ['Gótica (Pirata One)', "'Pirata One',cursive"],
  cinzel:  ['Cinzel Decorative', "'Cinzel Decorative',serif"],
  script:  ['Cursiva (Great Vibes)', "'Great Vibes',cursive"],
  typewr:  ['Máquina de escrever', "'Special Elite',monospace"],
  courier: ['Courier', "'Courier Prime',monospace"],
  serif:   ['Serif clássica', "'Playfair Display',serif"],
  inter:   ['Moderna (Inter)', "'Inter',sans-serif"]
};

const DEFAULTS = {
  username:'seu_nome', desc:'✦ sua bio aqui ✦', location:'Rio de Janeiro, BR',
  bg:'', audio:'', avatar:'', cursor:'',
  nameFont:'gothic', descFont:'inter',
  bgEffect:'tv', nameEffect:'none', opacity:60, blur:12, profileInvisible:false,
  glowName:true, glowSocials:false, glowBadges:false,
  accent:'#ffffff', text:'#ffffff', bgColor:'#0b0b0b', icon:'#b3b3b3', fxColor:'#ffffff',
  gradient:false, mono:false, animTitle:false, invert:false, volume:true,
  discordAvatar:false, avatarDecor:false, socials:{}
};

const KEY = 'dolllink';  // nome da "gaveta" no localStorage
const load = () => ({ ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') });
const save = S => localStorage.setItem(KEY, JSON.stringify(S));
const iconURL = id => `url(https://cdn.jsdelivr.net/npm/simple-icons@11/icons/${id}.svg)`;