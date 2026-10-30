// @ts-nocheck
/* Arte original do avatar (SVG em camadas): rosto, cabelo, olhos, óculos, boca, barba e extras, com a camisa do clube no corpo. */
const K="#1b1b1b";                                   // cor do contorno
export const SKINS=["#ffdcb8","#f3c79b","#e0a874","#c68642","#8d5524","#5a3820"];
export const HAIRC=["#2a1a0e","#6b4423","#b9772f","#e9c46a","#c8431d","#9a9aa0","#151515","#7b5cf0"];
export const HAIRS=["Careca","Raspado","Curto","Lateral","Cacheado","Longo","Coque","Moicano","Chanel","Espetado"];
export const EYES=["Normal","Feliz","Arregalado","Sonolento"];
export const BROWS=["Reta","Brava","Erguida","Sem"];
export const GLASS=["Nenhum","Redondo","Quadrado","Escuro","Aviador"];
export const MOUTH=["Sorriso","Sorrisão","Sério","Língua","Surpreso"];
export const BEARD=["Nenhuma","Barba rala","Bigode","Cavanhaque","Barba cheia"];
export const EXTRA=["Nenhum","Boné","Boné p/ trás","Faixa","Fone","Brinco"];
export const defAv=()=>({sk:1,h:2,hc:0,ey:0,br:0,gl:0,mo:0,bd:0,ac:0});
export const randAv=()=>{const r=n=>Math.floor(Math.random()*n);return{sk:r(SKINS.length),h:r(HAIRS.length),hc:r(HAIRC.length),ey:r(EYES.length),br:r(BROWS.length),gl:r(5)<2?r(GLASS.length):0,mo:r(MOUTH.length),bd:r(5)<2?r(BEARD.length):0,ac:r(4)===0?r(EXTRA.length):0}};
const s=(d,f,w=3)=>`<path d="${d}" fill="${f}" stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const l=(d,w=3)=>`<path d="${d}" fill="none" stroke="${K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const c=(x,y,r,f,w=3)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${K}" stroke-width="${w}"/>`;
function hairBack(i,h){ // atrás da cabeça
  if(i===5)return s("M52 76 Q48 36 100 32 Q152 36 148 76 L152 150 Q138 160 126 150 L126 100 L74 100 L74 150 Q62 160 48 150 Z",h);
  if(i===8)return s("M50 96 Q44 34 100 30 Q156 34 150 96 Q150 112 138 110 L62 110 Q50 112 50 96 Z",h);
  if(i===6)return c(100,26,17,h);
  return"";}
function hairFront(i,h){
  switch(i){
  case 1:return s("M58 70 Q58 36 100 34 Q142 36 142 70 Q130 52 100 52 Q70 52 58 70 Z",h,2.5);
  case 2:return s("M55 78 Q48 30 100 28 Q152 30 145 78 Q140 52 118 48 Q104 56 84 48 Q64 52 55 78 Z",h);
  case 3:return s("M55 80 Q46 30 104 27 Q154 30 145 78 Q138 50 112 46 Q80 46 55 80 Z",h)+l("M104 28 Q96 40 90 50",2.5);
  case 4:return [[60,60,15],[76,42,16],[100,35,17],[124,42,16],[140,60,15],[54,80,11],[146,80,11]].map(([x,y,r])=>c(x,y,r,h)).join("");
  case 5:return s("M54 80 Q46 30 100 28 Q154 30 146 80 Q138 52 118 48 Q100 58 82 48 Q62 52 54 80 Z",h);
  case 6:return s("M55 78 Q50 34 100 32 Q150 34 145 78 Q138 54 100 52 Q62 54 55 78 Z",h);
  case 7:return s("M58 70 Q58 44 74 42 Q60 40 62 62 Z",h,2.5)+s("M142 70 Q142 44 126 42 Q140 40 138 62 Z",h,2.5)+s("M86 54 Q88 8 100 4 Q112 8 114 54 Z",h);
  case 8:return s("M52 88 Q44 32 100 28 Q156 32 148 88 Q142 58 100 56 Q58 58 52 88 Z",h);
  case 9:return s("M54 76 L56 40 L72 54 L80 24 L94 48 L104 18 L114 48 L128 24 L132 54 L146 40 L146 76 Q138 56 100 54 Q62 56 54 76 Z",h);
  default:return"";}}
function eyes(i){
  const L=[84,82],R=[116,82];let o="";
  for(const [x,y] of [L,R]){
    if(i===1)o+=l(`M${x-7} ${y+2} Q${x} ${y-8} ${x+7} ${y+2}`,3.5);
    else if(i===2)o+=c(x,y,8.5,"#fff",2.5)+c(x,y+1,3.6,K,0);
    else if(i===3)o+=l(`M${x-7} ${y} L${x+7} ${y}`,3.5)+`<path d="M${x-6} ${y+1} Q${x} ${y+7} ${x+6} ${y+1}" fill="none" stroke="${K}" stroke-width="2"/>`;
    else o+=`<ellipse cx="${x}" cy="${y}" rx="4.4" ry="5.6" fill="${K}"/><circle cx="${x+1.4}" cy="${y-1.8}" r="1.6" fill="#fff"/>`;}
  return o;}
function brows(i){
  if(i===3)return"";const o={0:["M76 68 L92 67","M108 67 L124 68"],1:["M76 66 L92 71","M108 71 L124 66"],2:["M76 66 Q84 60 92 66","M108 66 Q116 60 124 66"]}[i];return l(o[0],3.5)+l(o[1],3.5);}
function glasses(i){
  switch(i){
  case 1:return c(84,82,13,"rgba(255,255,255,.22)",3)+c(116,82,13,"rgba(255,255,255,.22)",3)+l("M97 82 Q100 78 103 82",3)+l("M71 80 L58 76",2.5)+l("M129 80 L142 76",2.5);
  case 2:return `<rect x="70" y="70" width="27" height="22" rx="4" fill="rgba(255,255,255,.22)" stroke="${K}" stroke-width="3"/><rect x="103" y="70" width="27" height="22" rx="4" fill="rgba(255,255,255,.22)" stroke="${K}" stroke-width="3"/>`+l("M97 80 L103 80",3)+l("M70 78 L58 75",2.5)+l("M130 78 L142 75",2.5);
  case 3:return `<rect x="68" y="71" width="29" height="19" rx="8" fill="${K}"/><rect x="103" y="71" width="29" height="19" rx="8" fill="${K}"/>`+l("M97 78 L103 78",3)+l("M68 77 L57 74",3)+l("M132 77 L143 74",3)+`<path d="M73 75 L82 75" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
  case 4:return s("M68 72 Q84 68 98 74 Q98 92 84 94 Q68 92 68 72 Z","rgba(60,60,70,.78)",3)+s("M102 74 Q116 68 132 72 Q132 92 116 94 Q102 92 102 74 Z","rgba(60,60,70,.78)",3)+l("M98 76 L102 76",3)+l("M68 74 L58 72",2.5)+l("M132 74 L142 72",2.5);
  default:return"";}}
function mouth(i){
  switch(i){
  case 1:return s("M82 100 Q100 126 118 100 Z","#7a1f2b",3)+`<path d="M86 101 L114 101 L112 107 L88 107 Z" fill="#fff"/>`;
  case 2:return l("M88 108 L112 108",3.5);
  case 3:return l("M86 102 Q100 118 114 102",3.5)+s("M96 109 Q100 122 104 109 Z","#e9657a",2.5);
  case 4:return `<ellipse cx="100" cy="108" rx="6" ry="8" fill="#7a1f2b" stroke="${K}" stroke-width="3"/>`;
  default:return l("M84 102 Q100 120 116 102",3.5);}}
function beard(i,h){
  switch(i){
  case 1:return `<path d="M62 92 Q62 128 100 130 Q138 128 138 92 Q130 108 100 110 Q70 108 62 92 Z" fill="${h}" opacity=".35"/>`;
  case 2:return s("M82 98 Q91 92 100 98 Q109 92 118 98 Q110 104 100 101 Q90 104 82 98 Z",h,2.5);
  case 3:return s("M92 112 Q100 108 108 112 Q108 128 100 130 Q92 128 92 112 Z",h,2.5)+s("M84 99 Q92 94 100 99 Q108 94 116 99 Q108 103 100 101 Q92 103 84 99 Z",h,2.5);
  case 4:return s("M60 88 Q60 134 100 136 Q140 134 140 88 Q136 112 118 108 Q100 114 82 108 Q64 112 60 88 Z",h,2.5);
  default:return"";}}
function extra(i,h){
  switch(i){
  case 1:return s("M56 72 Q54 30 100 28 Q146 30 144 72 Q100 60 56 72 Z","#2f6fed")+s("M56 72 Q100 58 144 72 L156 78 Q100 66 50 80 Z","#1f4fb4");
  case 2:return s("M56 72 Q54 30 100 28 Q146 30 144 72 Q100 60 56 72 Z","#d63b3b")+s("M58 72 Q100 62 142 72 L148 66 Q100 54 52 66 Z","#a82a2a");
  case 3:return s("M55 62 Q100 50 145 62 L145 72 Q100 60 55 72 Z","#ffd21f",3);
  case 4:return l("M52 84 Q50 28 100 26 Q150 28 148 84",6)+s("M44 76 Q40 76 40 88 Q40 100 46 100 L54 100 L54 76 Z","#3a3a44",3)+s("M156 76 Q160 76 160 88 Q160 100 154 100 L146 100 L146 76 Z","#3a3a44",3);
  case 5:return c(58,96,4.5,"#ffd21f",2.5);
  default:return"";}}
/* monta o SVG completo; shirt = URL da imagem da camisa (ou null para só a cabeça) */
export function avatarSVG(a,shirt,uid="x"){a={...defAv(),...(a||{})};const sk=SKINS[a.sk]||SKINS[1],h=HAIRC[a.hc]||HAIRC[0];
  const hairOver=a.ac===1||a.ac===2||a.ac===3?(a.h===5||a.h===8||a.h===6?hairFront(a.h,h):""):hairFront(a.h,h);
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
   +(shirt?`<image href="${shirt}" x="14" y="112" width="172" height="172" preserveAspectRatio="xMidYMin meet"/>`:"")
   +hairBack(a.h,h)+c(57,86,8,sk)+c(143,86,8,sk)
   +s("M58 80 Q58 34 100 34 Q142 34 142 80 Q142 130 100 134 Q58 130 58 80 Z",sk)
   +hairOver+brows(a.br)+eyes(a.ey)+l("M100 88 Q96 96 101 98",2.5)+beard(a.bd,h)+mouth(a.mo)+glasses(a.gl)+extra(a.ac,h)+`</svg>`;}
