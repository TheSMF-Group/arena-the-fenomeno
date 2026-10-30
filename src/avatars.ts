// @ts-nocheck
/* Camisas para o avatar: Brasileirão (8 com frente e costas reais + 12 só de frente) e Champions (14 com frente e costas + as de kits.json). */
import k0 from "./assets/kit-flamengo.webp?url";
import k1 from "./assets/kit-real-madrid.webp?url";
import k2 from "./assets/kit-palmeiras.webp?url";
import k3 from "./assets/kit-barcelona.webp?url";
import k4 from "./assets/kit-corinthians.webp?url";
import k5 from "./assets/kit-man-utd.webp?url";
import k6 from "./assets/kit-sao-paulo.webp?url";
import k7 from "./assets/kit-liverpool.webp?url";
import k8 from "./assets/kit-fluminense.webp?url";
import k9 from "./assets/kit-bayern.webp?url";
import k10 from "./assets/kit-botafogo.webp?url";
import k11 from "./assets/kit-juventus.webp?url";
import k12 from "./assets/kit-cruzeiro.webp?url";
import k13 from "./assets/kit-arsenal.webp?url";
import k14 from "./assets/kit-athletico-pr.webp?url";
import k15 from "./assets/kit-chelsea.webp?url";
import k16 from "./assets/kit-psg.webp?url";
import k17 from "./assets/kit-inter.webp?url";
import k18 from "./assets/kit-napoli.webp?url";
import k19 from "./assets/kit-atletico-madrid.webp?url";
import k20 from "./assets/kit-roma.webp?url";
import k21 from "./assets/kit-tottenham.webp?url";
import a0 from "./assets/av-atletico-mg.webp?url";import a1 from "./assets/av-bahia.webp?url";import a2 from "./assets/av-bragantino.webp?url";import a3 from "./assets/av-ceara.webp?url";
import a4 from "./assets/av-fortaleza.webp?url";import a5 from "./assets/av-gremio.webp?url";import a6 from "./assets/av-internacional.webp?url";import a7 from "./assets/av-juventude.webp?url";
import a8 from "./assets/av-mirassol.webp?url";import a9 from "./assets/av-santos.webp?url";import a10 from "./assets/av-sport-recife.webp?url";import a11 from "./assets/av-vasco.webp?url";

const CUR=[ // [slug, nome, liga, frente, costas]
 ["flamengo","Flamengo","br",k0],["palmeiras","Palmeiras","br",k2],["corinthians","Corinthians","br",k4],["sao-paulo","São Paulo","br",k6],["fluminense","Fluminense","br",k8],
 ["botafogo","Botafogo","br",k10],["cruzeiro","Cruzeiro","br",k12],["athletico-pr","Athletico-PR","br",k14],
 ["real-madrid","Real Madrid","eu",k1],["barcelona","Barcelona","eu",k3],["man-utd","Manchester United","eu",k5],["liverpool","Liverpool","eu",k7],["bayern","Bayern de Munique","eu",k9],
 ["juventus","Juventus","eu",k11],["arsenal","Arsenal","eu",k13],["chelsea","Chelsea","eu",k15],["psg","PSG","eu",k16],["inter","Inter de Milão","eu",k17],["napoli","Napoli","eu",k18],
 ["atletico-madrid","Atlético de Madrid","eu",k19],["roma","Roma","eu",k20],["tottenham","Tottenham","eu",k21]];
const BREX=[["atletico-mg","Atlético-MG",a0],["bahia","Bahia",a1],["bragantino","Bragantino",a2],["ceara","Ceará",a3],["fortaleza","Fortaleza",a4],["gremio","Grêmio",a5],["internacional","Internacional",a6],["juventude","Juventude",a7],["mirassol","Mirassol",a8],["santos","Santos",a9],["sport-recife","Sport",a10],["vasco","Vasco",a11]];
const EUEX=[["man-city","Manchester City"],["ac-milan","Milan"],["dortmund","Borussia Dortmund"],["leverkusen","Bayer Leverkusen"],["leipzig","RB Leipzig"],["frankfurt","Eintracht Frankfurt"],["atalanta","Atalanta"],["newcastle","Newcastle"],["athletic","Athletic Bilbao"],["villarreal","Villarreal"],["marseille","Olympique de Marseille"],["monaco","AS Monaco"],["lille","Lille"],["benfica","Benfica"],["sporting","Sporting CP"],["porto","FC Porto"],["ajax","Ajax"],["psv","PSV"],["brugge","Club Brugge"],["galatasaray","Galatasaray"],["celtic","Celtic"],["copenhagen","FC Copenhague"],["feyenoord","Feyenoord"],["sevilla","Sevilla"],["lyon","Lyon"]];

/* catálogo: Brasileirão primeiro, depois Champions; as de kits.json (data URI) entram quando o arquivo carrega */
export let CAT=[...CUR.filter(c=>c[2]==="br").map(c=>({k:c[0],n:c[1],l:"br",f:c[3],b:null})),...BREX.map(c=>({k:c[0],n:c[1],l:"br",f:c[2],b:null})),
  ...CUR.filter(c=>c[2]==="eu").map(c=>({k:c[0],n:c[1],l:"eu",f:c[3],b:null}))];
let LOADED=null;
export function loadAvKits(){if(!LOADED)LOADED=fetch("kits.json?v=1").then(r=>r.ok?r.json():{}).catch(()=>({})).then(K=>{
  EUEX.forEach(([k,n])=>{if(K[k]&&!CAT.some(c=>c.k===k))CAT.push({k,n,l:"eu",f:K[k],b:null})});return CAT});return LOADED}
export const shirtOf=k=>CAT.find(c=>c.k===k)||null;
export const shirtSrc=k=>{const s=shirtOf(k);return s?s.f:null};
export const BGS=["#22c55e","#ffd21f","#38bdf8","#f87171","#a78bfa","#fb923c","#f472b6","#94a3b8"];
/* avatar redondo: só a camisa escolhida, centralizada, sobre a cor de fundo */
export const avatarHTML=(p,px=44)=>{const sh=p&&p.k&&shirtOf(p.k);return`<span class="avt" style="--bg:${(p&&p.bg)||BGS[0]};--px:${px}px">${sh?`<img src="${sh.f}" alt="">`:""}</span>`};
