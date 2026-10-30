// @ts-nocheck
/* Camisas para o avatar: Brasileirão (8 com frente e costas reais + 12 só de frente) e Champions (14 com frente e costas + as de kits.json). */
import k0 from "./assets/kit-flamengo.webp?url";import b0 from "./assets/kitback-flamengo.webp?url";
import k1 from "./assets/kit-real-madrid.webp?url";import b1 from "./assets/kitback-real-madrid.webp?url";
import k2 from "./assets/kit-palmeiras.webp?url";import b2 from "./assets/kitback-palmeiras.webp?url";
import k3 from "./assets/kit-barcelona.webp?url";import b3 from "./assets/kitback-barcelona.webp?url";
import k4 from "./assets/kit-corinthians.webp?url";import b4 from "./assets/kitback-corinthians.webp?url";
import k5 from "./assets/kit-man-utd.webp?url";import b5 from "./assets/kitback-man-utd.webp?url";
import k6 from "./assets/kit-sao-paulo.webp?url";import b6 from "./assets/kitback-sao-paulo.webp?url";
import k7 from "./assets/kit-liverpool.webp?url";import b7 from "./assets/kitback-liverpool.webp?url";
import k8 from "./assets/kit-fluminense.webp?url";import b8 from "./assets/kitback-fluminense.webp?url";
import k9 from "./assets/kit-bayern.webp?url";import b9 from "./assets/kitback-bayern.webp?url";
import k10 from "./assets/kit-botafogo.webp?url";import b10 from "./assets/kitback-botafogo.webp?url";
import k11 from "./assets/kit-juventus.webp?url";import b11 from "./assets/kitback-juventus.webp?url";
import k12 from "./assets/kit-cruzeiro.webp?url";import b12 from "./assets/kitback-cruzeiro.webp?url";
import k13 from "./assets/kit-arsenal.webp?url";import b13 from "./assets/kitback-arsenal.webp?url";
import k14 from "./assets/kit-athletico-pr.webp?url";import b14 from "./assets/kitback-athletico-pr.webp?url";
import k15 from "./assets/kit-chelsea.webp?url";import b15 from "./assets/kitback-chelsea.webp?url";
import k16 from "./assets/kit-psg.webp?url";import b16 from "./assets/kitback-psg.webp?url";
import k17 from "./assets/kit-inter.webp?url";import b17 from "./assets/kitback-inter.webp?url";
import k18 from "./assets/kit-napoli.webp?url";import b18 from "./assets/kitback-napoli.webp?url";
import k19 from "./assets/kit-atletico-madrid.webp?url";import b19 from "./assets/kitback-atletico-madrid.webp?url";
import k20 from "./assets/kit-roma.webp?url";import b20 from "./assets/kitback-roma.webp?url";
import k21 from "./assets/kit-tottenham.webp?url";import b21 from "./assets/kitback-tottenham.webp?url";
import a0 from "./assets/av-atletico-mg.webp?url";import a1 from "./assets/av-bahia.webp?url";import a2 from "./assets/av-bragantino.webp?url";import a3 from "./assets/av-ceara.webp?url";
import a4 from "./assets/av-fortaleza.webp?url";import a5 from "./assets/av-gremio.webp?url";import a6 from "./assets/av-internacional.webp?url";import a7 from "./assets/av-juventude.webp?url";
import a8 from "./assets/av-mirassol.webp?url";import a9 from "./assets/av-santos.webp?url";import a10 from "./assets/av-sport-recife.webp?url";import a11 from "./assets/av-vasco.webp?url";

const CUR=[ // [slug, nome, liga, frente, costas]
 ["flamengo","Flamengo","br",k0,b0],["palmeiras","Palmeiras","br",k2,b2],["corinthians","Corinthians","br",k4,b4],["sao-paulo","São Paulo","br",k6,b6],["fluminense","Fluminense","br",k8,b8],
 ["botafogo","Botafogo","br",k10,b10],["cruzeiro","Cruzeiro","br",k12,b12],["athletico-pr","Athletico-PR","br",k14,b14],
 ["real-madrid","Real Madrid","eu",k1,b1],["barcelona","Barcelona","eu",k3,b3],["man-utd","Manchester United","eu",k5,b5],["liverpool","Liverpool","eu",k7,b7],["bayern","Bayern de Munique","eu",k9,b9],
 ["juventus","Juventus","eu",k11,b11],["arsenal","Arsenal","eu",k13,b13],["chelsea","Chelsea","eu",k15,b15],["psg","PSG","eu",k16,b16],["inter","Inter de Milão","eu",k17,b17],["napoli","Napoli","eu",k18,b18],
 ["atletico-madrid","Atlético de Madrid","eu",k19,b19],["roma","Roma","eu",k20,b20],["tottenham","Tottenham","eu",k21,b21]];
const BREX=[["atletico-mg","Atlético-MG",a0],["bahia","Bahia",a1],["bragantino","Bragantino",a2],["ceara","Ceará",a3],["fortaleza","Fortaleza",a4],["gremio","Grêmio",a5],["internacional","Internacional",a6],["juventude","Juventude",a7],["mirassol","Mirassol",a8],["santos","Santos",a9],["sport-recife","Sport",a10],["vasco","Vasco",a11]];
const EUEX=[["man-city","Manchester City"],["ac-milan","Milan"],["dortmund","Borussia Dortmund"],["leverkusen","Bayer Leverkusen"],["leipzig","RB Leipzig"],["frankfurt","Eintracht Frankfurt"],["atalanta","Atalanta"],["newcastle","Newcastle"],["athletic","Athletic Bilbao"],["villarreal","Villarreal"],["marseille","Olympique de Marseille"],["monaco","AS Monaco"],["lille","Lille"],["benfica","Benfica"],["sporting","Sporting CP"],["porto","FC Porto"],["ajax","Ajax"],["psv","PSV"],["brugge","Club Brugge"],["galatasaray","Galatasaray"],["celtic","Celtic"],["copenhagen","FC Copenhague"],["feyenoord","Feyenoord"],["sevilla","Sevilla"],["lyon","Lyon"]];

/* catálogo: Brasileirão primeiro, depois Champions; as de kits.json (data URI) entram quando o arquivo carrega */
export let CAT=[...CUR.filter(c=>c[2]==="br").map(c=>({k:c[0],n:c[1],l:"br",f:c[3],b:c[4]})),...BREX.map(c=>({k:c[0],n:c[1],l:"br",f:c[2],b:null})),
  ...CUR.filter(c=>c[2]==="eu").map(c=>({k:c[0],n:c[1],l:"eu",f:c[3],b:c[4]}))];
let LOADED=null;
export function loadAvKits(){if(!LOADED)LOADED=fetch("kits.json?v=1").then(r=>r.ok?r.json():{}).catch(()=>({})).then(K=>{
  EUEX.forEach(([k,n])=>{if(K[k]&&!CAT.some(c=>c.k===k))CAT.push({k,n,l:"eu",f:K[k],b:null})});return CAT});return LOADED}
export const shirtOf=k=>CAT.find(c=>c.k===k)||null;
export const shirtSrc=k=>{const s=shirtOf(k);return s?s.f:null};
export const BGS=["#22c55e","#ffd21f","#38bdf8","#f87171","#a78bfa","#fb923c","#f472b6","#94a3b8"];
/* avatar redondo: fundo colorido e a camisa escolhida */
export const avatarHTML=(p,px=44)=>{const s=p&&p.k&&shirtOf(p.k);return`<span class="avt" style="--bg:${(p&&p.bg)||BGS[0]};--px:${px}px">${s?`<img src="${s.f}" alt="">`:""}</span>`};
