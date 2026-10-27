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
import {META, ID_BY_SLUG} from "./meta";
import {idFromLocation} from "./nav";
import {initAds} from "./ads";
import {liveHost, liveJoin} from "./live";
import {pageview} from "./track";
import {applyCopy} from "./copy";
applyCopy(GAMES);
$("#home").addEventListener("click",e=>{e.preventDefault();home()});
window.addEventListener("popstate",()=>{const id=idFromLocation(ID_BY_SLUG,GAMES);if(id)openGame(id);else home();pageview(location.pathname,document.title)});

/* ---------- carga ---------- */
(async function boot(){
  try{
    const [d,f,e,f2]=await Promise.all(["dados.json","fotos.json","escudos.json?v=2","fotos-dificil.json"].map(u=>fetch("/"+u).then(r=>{if(!r.ok)throw new Error(u);return r.json()})));
    ST.NATS=d.N;ST.CLUBS=d.C;ST.FOTOS=Object.assign(f,f2);ST.ESC=e;
    ST.P=d.P.map(a=>{const p={id:a[0],name:a[1],nat:a[2],birth:a[3],club:a[4],season:a[5],fam:a[6]};p.key=norm(p.name);p.words=p.key.split(" ");return p});
    ST.FAM=ST.P.filter(p=>p.fam===1&&ST.FOTOS[p.id]&&p.birth);
    ST.HARD=ST.P.filter(p=>p.fam===2&&ST.FOTOS[p.id]&&p.birth);
    ST.CRESTS=d.K.map(a=>{const c={id:a[0],name:a[1],pais:a[2],cc:a[3],liga:a[4],conf:a[5]};c.key=norm(c.name);c.words=c.key.split(" ");return c});
    $("#boot").remove();updateToday();
    const sala=new URLSearchParams(location.search).get("sala");
    /* sala ao vivo: sem anúncio e sem a navegação normal da Central */
    if(document.body.dataset.live==="host"){liveHost();return}
    if(sala){liveJoin(sala);return}
    const id=idFromLocation(ID_BY_SLUG,GAMES);if(id)openGame(id);else home();initAds();
  }catch(err){$("#boot").innerHTML=`<div><img src="${BODEHEAD}" alt=""><b>NÃO DEU PARA CARREGAR OS DADOS</b><span class="muted">Recarregue a página.</span></div>`}
})();
