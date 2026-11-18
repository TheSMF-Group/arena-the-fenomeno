// @ts-nocheck
import "./games/quem";
import "./games/top100";
import "./games/bodle";
import "./games/grade";
import "./games/conexoes";
import "./games/impostor";
import "./games/escudo";
import "./games/bingo";
import "./games/velho";
import "./games/futgeo";
import "./games/forca";
import "./games/questoes";
import "./games/carreira";
import "./games/entrosa";
import "./games/piramide";
import "./games/top10";
import "./games/velha";
import "./games/velha-play";
import "./games/draft-core";
import "./games/draft";
import "./games/draft-play";
import "./games/leilao";
import "./games/maleta";
import "./games/camisa";
import "./games/reconstruindo";
import {$, BODEHEAD, norm} from "./core";
import {ST} from "./state";
import {GAMES} from "./engine";
import {home, openGame, updateToday} from "./home";
import {perfilScreen, renderMe} from "./vestiario";
import {loadAvKits} from "./avatars";
import {contaBoot} from "./conta";
import {conferir} from "./conquistas";
import {checkGift, renderObj} from "./rewards";
import {onboarding, onbPendente} from "./onboarding";
import {DAILY} from "./home";
import {dayResult} from "./engine";
$("#home").addEventListener("click",home);
$("#meBtn").addEventListener("click",perfilScreen);
document.addEventListener("fen:perfil",perfilScreen);
renderMe();

/* primeira visita: o onboarding abre já, enquanto os dados carregam; no fim vai para o jogo do link ou para o próximo desafio do dia */
let ONB_DADOS=false,ONB_FIM=null;
if(onbPendente()){const link=location.hash.slice(1);
  onboarding(()=>{renderMe();const vai=()=>{if(GAMES[link]){openGame(link);return}const g=DAILY().find(id=>!dayResult(id));if(g)openGame(g)};ONB_DADOS?vai():(ONB_FIM=vai)})}

/* ---------- carga ---------- */
(async function boot(){
  try{
    const [d,f,e,f2]=await Promise.all(["dados.json?v=1","fotos.json?v=3","escudos.json?v=3","fotos-dificil.json?v=3"].map(u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.json()})));
    ST.NATS=d.N;ST.CLUBS=d.C;ST.FOTOS=Object.assign(f,f2);ST.ESC=e;
    ST.P=d.P.map(a=>{const p={id:a[0],name:a[1],nat:a[2],birth:a[3],club:a[4],season:a[5],fam:a[6]};p.key=norm(p.name);p.words=p.key.split(" ");return p});
    ST.FAM=ST.P.filter(p=>p.fam===1&&ST.FOTOS[p.id]&&p.birth);
    ST.HARD=ST.P.filter(p=>p.fam===2&&ST.FOTOS[p.id]&&p.birth);
    ST.CRESTS=d.K.map(a=>{const c={id:a[0],name:a[1],pais:a[2],cc:a[3],liga:a[4],conf:a[5]};c.key=norm(c.name);c.words=c.key.split(" ");return c});
    $("#boot").remove();updateToday();
    loadAvKits().then(renderMe);renderObj();contaBoot().then(renderMe);conferir(true);setTimeout(checkGift,900);
    const h=location.hash.slice(1);if(h==="perfil")perfilScreen();else if(GAMES[h])openGame(h);else home();
    ONB_DADOS=true;if(ONB_FIM){const f=ONB_FIM;ONB_FIM=null;f()}
  }catch(err){$("#boot").innerHTML=`<div><img src="${BODEHEAD}" alt=""><b>NÃO DEU PARA CARREGAR OS DADOS</b><span class="muted">Recarregue a página.</span></div>`}
})();
