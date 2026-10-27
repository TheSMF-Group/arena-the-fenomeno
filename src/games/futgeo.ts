// @ts-nocheck
import {BODEHEAD, crestImg, dayNum, esc, hash, rngOf, shuffle} from "../core";
import {GAMES, MODE, finish, freshPick, hit, isHard, miss, shareHead} from "../engine";
import {ST} from "../state";

/* 9. FUTGEO — jogo do Felipe Costa (futgeo.vercel.app): clique no mapa onde aconteceu */
export const libs={};
export function loadScript(u){if(!libs[u])libs[u]=new Promise((ok,no)=>{const s=document.createElement("script");s.crossOrigin="anonymous";s.src=u;s.onload=ok;s.onerror=no;document.head.appendChild(s)});return libs[u]}
export let GEO=null;
export function loadGeo(){if(!GEO)GEO=Promise.all([loadScript("https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.js"),fetch("/futgeo.json").then(r=>r.json()),fetch(FG_STYLE).then(r=>r.json())]).then(([_,fg,style])=>({Q:fg.Q,C:fg.C,style})).catch(e=>{GEO=null;throw e});return GEO}
/* mapa vetorial do OpenFreeMap (OpenStreetMap): ruas, bairros, estádios e lugares. Nomes em inglês no mundo todo,
   menos na América do Sul, que fica no idioma local. No difícil o mapa vem sem nome nenhum. Satélite da Esri nos dois */
export const FG_STYLE="https://tiles.openfreemap.org/styles/liberty";
export const FG_SAT="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const FG_SA={type:"Polygon",coordinates:[[[-92,-1],[-79.5,1.5],[-77.9,7.2],[-77.2,8.7],[-75,13.5],[-60,13.5],[-50,8],[-33,-3],[-33,-57],[-82,-57],[-92,-1]]]};
export function fgStyle(style,HG){const st=JSON.parse(JSON.stringify(style));
  const en=["coalesce",["get","name:en"],["get","name_en"],["get","name:latin"],["get","name"]];
  st.sources.fgsat={type:"raster",tiles:[FG_SAT],tileSize:256,maxzoom:18,attribution:"Imagens &copy; Esri, Maxar, Earthstar Geographics"};
  st.layers.splice(st.layers.findIndex(l=>l.type==="symbol"),0,{id:"fg-sat",type:"raster",source:"fgsat",layout:{visibility:"none"}});
  const out=[];
  for(const l of st.layers){out.push(l);if(l.type!=="symbol")continue;l.layout=l.layout||{};
    if(HG){l.layout.visibility="none";continue}
    const tf=l.layout["text-field"];if(!tf||!JSON.stringify(tf).includes("name"))continue;
    const f=l.filter||true;l.filter=["all",f,["within",FG_SA]];l.layout["text-field"]=["coalesce",["get","name"],["get","name:latin"],["get","name_en"]];
    out.push({...l,id:l.id+"-en",filter:["all",f,["!",["within",FG_SA]]],layout:{...l.layout,"text-field":en}})}
  st.layers=out;return st}
export const FG_CAT={estadio:"Estádios",nascimento:"Onde nasceu",["sede-clube"]:"Cidade do clube",final:"Finais",classico:"Clássicos",gols:"Gols históricos",extra:"Curiosidades",escudo:"Casa do clube"};
export function kmBetween(a,b){const r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dg=r(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dg/2)**2;return 2*6371*Math.asin(Math.min(1,Math.sqrt(h)))}
export function geoPoints(km,hard){if(km==null)return 0;if(km<=1)return 5000;return Math.max(0,Math.min(5000,Math.round(5000*Math.exp(-Math.pow(km/(hard?120:180),1.3)))))}
export const geoTier=p=>p>=4500?"🟩":p>=3000?"🟨":p>=1500?"🟧":"⬛";
export const fmtN=n=>Math.round(n).toLocaleString("pt-BR");
export const fmtKm=k=>k<1?`${Math.round(k*1000)} m`:(k<10?k.toFixed(1).replace(".",",")+" km":fmtN(k)+" km");
GAMES.futgeo={name:"FUTGEO",hard:"perguntas mais cabeludas, mapa sem nenhuma cidade, 60 segundos por pergunta e a pontuação cai mais rápido com a distância.",
desc:"Onde foi? Clique no mapa.",
rules:"Jogo criado por Felipe Costa (futgeo.vercel.app). Cinco perguntas: estádios, finais, gols históricos, onde o craque nasceu e a casa de cada clube. Arraste e dê zoom no mapa, clique onde acha que é e confirme. Quanto mais perto, mais pontos: até 5.000 por pergunta, 25.000 no total.",
start(st,r){
  const HG=isHard(),TIME=HG?60:120,ROUNDS=5;
  st.innerHTML=`<div class="fg"><div class="fg-load"><img src="${BODEHEAD}" alt=""><b>CARREGANDO O MAPA…</b></div></div>`;
  let timer=null,alive=true,fgMap=null;ST.CLEAN=()=>{alive=false;clearInterval(timer);fgMap&&fgMap.remove()};
  loadGeo().then(G=>{if(!alive)return;
    const pool=G.Q.filter(q=>HG?q.dif===3:q.dif<3);
    let qs;if(MODE.free){qs=[];for(let k=0;k<ROUNDS;k++)qs.push(freshPick("futgeo",pool.filter(q=>!qs.includes(q)),r))}else{const ord=shuffle(rngOf(hash("futgeo-ordem:"+ST.DIFF)),pool.slice().sort((a,b)=>a.id<b.id?-1:1));const n=dayNum()-1;qs=Array.from({length:ROUNDS},(_,k)=>ord[(((n*ROUNDS+k)%ord.length)+ord.length)%ord.length])}
    const res=[];let qi=0,guess=null,locked=false,deadline=0;
    st.innerHTML=`<div class="fg">
      <div class="fg-top"><div class="fg-q"><span class="fg-kick"></span><div class="fg-prompt"></div></div>
        <div class="fg-side"><div class="fg-crest"></div><div class="fg-stats"><span><small>Pergunta</small><b class="fg-round"></b></span><span><small>Pontos</small><b class="fg-score">0</b></span><span><small>Tempo</small><b class="fg-time"></b></span></div></div></div>
      <div class="fg-bar"><i></i></div>
      <div class="fg-map"><div class="fg-leaf" role="application" aria-label="Mapa: arraste para mover, use a roda ou os botões para dar zoom e clique para marcar o palpite"></div>
        <div class="fg-zoom"><button type="button" data-z="in" aria-label="Aproximar">+</button><button type="button" data-z="out" aria-label="Afastar">−</button><button type="button" data-z="home" aria-label="Ver o mundo todo">⌂</button><button type="button" data-z="sat" aria-pressed="false" aria-label="Ver em satélite" title="Satélite">🛰</button></div>
        <div class="fg-hint">Dê zoom até as ruas e clique exatamente no lugar</div></div>
      <div class="fg-act"><button class="btn y" data-a="ok" disabled>Confirmar palpite</button></div>
      <div class="fg-res" hidden></div></div>`;
    const box0=st.querySelector(".fg-leaf"),Z0=Math.max(0,Math.log2(box0.clientWidth/512)),HOME={center:[5,25],zoom:Z0};
    const map=fgMap=new maplibregl.Map({container:st.querySelector(".fg-leaf"),style:fgStyle(G.style,HG),...HOME,minZoom:Z0,maxZoom:19,dragRotate:false,pitchWithRotate:false,touchPitch:false,attributionControl:{compact:true}});
    map.touchZoomRotate.disableRotation();map.keyboard.disableRotation();
    const LINE={type:"FeatureCollection",features:[]};
    map.on("load",()=>{map.addSource("fgline",{type:"geojson",data:LINE});map.addLayer({id:"fgline",type:"line",source:"fgline",paint:{"line-color":"#ffffff","line-width":2.5,"line-dasharray":[2,2],"line-opacity":.9}})});
    const setLine=c=>{const src=map.getSource("fgline");src&&src.setData(c?{type:"Feature",geometry:{type:"LineString",coordinates:c}}:LINE)};
    const pinEl=c=>{const d=document.createElement("div");d.innerHTML=`<svg class="fg-pin" width="26" height="34" viewBox="-13 -32 26 34"><path class="${c}" d="M0 0C-2-6-11-11-11-19a11 11 0 0 1 22 0c0 8-9 13-11 19z"/><circle class="fg-pin-dot" cx="0" cy="-19" r="4"/></svg>`;return d};
    const mark=(c,ll)=>new maplibregl.Marker({element:pinEl(c),anchor:"bottom",offset:[0,2]}).setLngLat(ll).addTo(map);
    let gMark=null,aMark=null;
    const wrapLng=x=>((x+180)%360+360)%360-180;
    const clearPins=()=>{gMark&&gMark.remove();aMark&&aMark.remove();gMark=aMark=null;setLine(null)};
    map.on("click",e=>{if(locked)return;guess={lat:e.lngLat.lat,lng:wrapLng(e.lngLat.lng)};
      if(gMark)gMark.setLngLat(e.lngLat);else gMark=mark("fg-pin-g",e.lngLat);okb.disabled=false});
    st.querySelector(".fg-zoom").addEventListener("click",e=>{const b=e.target.closest("button"),z=b?.dataset.z;if(!z)return;
      if(z==="in")map.zoomIn();else if(z==="out")map.zoomOut();else if(z==="home")map.flyTo({...HOME,duration:600});
      else{const on=map.getLayoutProperty("fg-sat","visibility")!=="visible";map.setLayoutProperty("fg-sat","visibility",on?"visible":"none");b.setAttribute("aria-pressed",on)}});
    const okb=st.querySelector("[data-a=ok]"),resEl=st.querySelector(".fg-res"),bar=st.querySelector(".fg-bar i");
    function show(){const q=qs[qi];guess=null;locked=false;okb.disabled=true;okb.hidden=false;resEl.hidden=true;clearPins();
      st.querySelector(".fg-kick").textContent=FG_CAT[q.categoria]||q.categoria;
      st.querySelector(".fg-prompt").textContent=q.prompt;
      st.querySelector(".fg-crest").innerHTML=q.crest?crestImg(q.crest,"","crest"):"";
      st.querySelector(".fg-round").textContent=`${qi+1}/${ROUNDS}`;
      map.jumpTo(HOME);setTimeout(()=>map.resize(),50);
      deadline=Date.now()+TIME*1000;clearInterval(timer);tick();timer=setInterval(tick,250)}
    function tick(){const left=Math.max(0,deadline-Date.now()),s=Math.ceil(left/1000);
      st.querySelector(".fg-time").textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
      bar.style.transform=`scaleX(${left/(TIME*1000)})`;bar.classList.toggle("low",s<=15);
      if(left<=0)submit(true)}
    function submit(timeout){if(locked)return;locked=true;clearInterval(timer);
      const q=qs[qi],g=timeout?null:guess,km=g?kmBetween(g,q):null,pts=geoPoints(km,HG);
      res.push({pts,km});pts>=3000?hit():miss();
      st.querySelector(".fg-score").textContent=fmtN(res.reduce((s,x)=>s+x.pts,0));
      okb.hidden=true;
      aMark=mark("fg-pin-a",[q.lng,q.lat]);
      if(g){const G=gMark.getLngLat(),A2=[G.lng+wrapLng(q.lng-G.lng),q.lat];aMark.setLngLat(A2);setLine([[G.lng,G.lat],A2]);
        map.fitBounds([[Math.min(G.lng,A2[0]),Math.min(G.lat,A2[1])],[Math.max(G.lng,A2[0]),Math.max(G.lat,A2[1])]],{padding:80,maxZoom:16,duration:800})}
      else map.flyTo({center:[q.lng,q.lat],zoom:14,duration:800});
      const last=qi===ROUNDS-1;
      resEl.hidden=false;resEl.innerHTML=`<div class="fg-pts ${pts>=4500?"g":pts>=3000?"y":pts>=1500?"o":"x"}"><b>${fmtN(pts)}</b><small>pontos</small></div>
        <div class="fg-info"><div class="fg-dist">${g?`Você errou por <b>${fmtKm(km)}</b>`:"<b>Tempo esgotado</b>"}</div><div><b>${esc(q.resposta)}</b></div><p>${esc(q.curiosidade||"")}</p></div>
        <div class="row"><button class="btn" data-a="near">Ver o lugar de perto</button><button class="btn y" data-a="next">${last?"Ver resultado":"Próxima pergunta →"}</button></div>`;
      resEl.querySelector("[data-a=near]").addEventListener("click",()=>{map.flyTo({center:aMark.getLngLat(),zoom:16.5,duration:900});box.scrollIntoView({behavior:"smooth",block:"center"})});
      resEl.querySelector("[data-a=next]").addEventListener("click",()=>{if(last)end();else{qi++;show()}});
      resEl.scrollIntoView({behavior:"smooth",block:"nearest"})}
    okb.addEventListener("click",()=>guess&&submit(false));
    function end(){resEl.hidden=true;const tot=res.reduce((s,x)=>s+x.pts,0);
      finish("futgeo",st,{won:tot>=15000,score:tot,label:`Você fez ${fmtN(tot)} de 25.000 pontos.`,chip:fmtN(tot),share:`${shareHead("FUTGEO")} ${fmtN(tot)}/25.000\n${res.map(x=>geoTier(x.pts)).join("")}`})}
    show();
  }).catch(()=>{st.innerHTML=`<p class="muted">Não deu para carregar o mapa. Recarregue a página.</p>`});
}};
