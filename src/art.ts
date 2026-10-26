// @ts-nocheck
import {BODEHEAD, flag} from "./core";
import {ST} from "./state";

/* ---------- artes da vitrine ---------- */
export function art(id){
  const byName=n=>ST.FAM.find(p=>p.name===n)||ST.FAM[0];
  const im=p=>ST.FOTOS[p.id]||"";
  switch(id){
    case"quem":return`<img class="blurface" src="${im(byName("Ronaldinho"))}" alt=""><span class="q">?</span>`;
    case"bodle":return`<div class="mini-word"><i class="g">M</i><i>E</i><i class="y">S</i><i class="g">S</i><i>I</i></div>`;
    case"grade":{const cs=["flamengo","real-madrid","barcelona"],fl=["BR","AR","FR"];return`<div class="mini-grid"><span><img src="${BODEHEAD}" alt=""></span>${cs.map(c=>`<span><img src="${ST.ESC[c]||""}" alt=""></span>`).join("")}${fl.map(f=>`<span class="flag">${flag(f)}</span><span></span><span style="background:rgba(34,197,94,.35)"></span><span></span>`).join("")}</div>`}
    case"conexoes":return`<div class="mini-bars"><i class="c0"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i></div>`;
    case"impostor":return`<div class="mini-faces">${["Lionel Messi","Kaká","Neymar","Paolo Maldini"].map((n,i)=>`<img class="${i===3?"bad":""}" src="${im(byName(n))}" alt="">`).join("")}</div>`;
    case"escudo":return`<img class="zoomcrest" src="${ST.ESC["corinthians"]||""}" alt="">`;
    case"bingo":{const c=["palmeiras","psg","flamengo","juventus"];return`<div class="mini-grid">${["BR","AR","PT","IT"].map((f,i)=>`<span class="flag">${flag(f)}</span><span><img src="${ST.ESC[c[i]]||""}" alt=""></span><span style="${i%2?"background:rgba(34,197,94,.35)":""}"></span><span class="d" style="font-size:13px;color:var(--yellow)">${[80,90,70,0][i]||"00"}</span>`).join("")}</div>`}
    case"futgeo":return`<svg class="mini-map" viewBox="0 0 200 110" aria-hidden="true"><rect width="200" height="110" fill="#0f2a33"/><path d="M18 30c14-10 40-12 52-4 10 7 4 18-6 22-12 5-14 16-8 26 4 8-2 14-10 12-14-4-22-20-26-34-3-10-8-16-2-22zM92 22c16-8 44-10 62-2 14 6 30 4 34 14 3 9-8 14-20 14-10 0-14 8-22 12-10 5-8 18-18 22-8 3-14-6-12-16 2-9-6-12-14-14-12-3-20-10-16-18 2-5 2-9 6-12z" fill="#1f3a28" stroke="#3b5d45"/><circle cx="58" cy="70" r="3" fill="#97a59b"/><circle cx="128" cy="34" r="3" fill="#97a59b"/><path d="M128 34c-2-6-9-10-9-17a9 9 0 0 1 18 0c0 7-7 11-9 17z" fill="#ffd21f" stroke="#1c1600"/><path d="M58 70c-2-6-9-10-9-17a9 9 0 0 1 18 0c0 7-7 11-9 17z" fill="#22c55e" stroke="#04210f"/><path d="M58 53 128 17" stroke="#fff" stroke-dasharray="4 4" opacity=".7"/></svg>`;
    case"draft":return`<div class="mini-draft"><div class="mp">${[[1,1],[1,3],[1,5],[2,2],[2,3],[2,4],[3,1],[3,2],[3,4],[3,5],[4,3]].map(([r,c],i)=>`<i style="grid-row:${r};grid-column:${c}" class="${i%3===0?"on":""}"></i>`).join("")}</div><b>VS</b><div class="mp o">${[[1,1],[1,3],[1,5],[2,2],[2,3],[2,4],[3,1],[3,2],[3,4],[3,5],[4,3]].map(([r,c],i)=>`<i style="grid-row:${r};grid-column:${c}" class="${i%4===1?"on":""}"></i>`).join("")}</div></div>`;
    case"camisa":return`<div class="mini-cam"><svg viewBox="0 0 100 95"><path d="M31 4 6 19l9 20 11-6v58h48V33l11 6 9-20L69 4c-4 9-11 13-19 13S35 13 31 4Z" fill="#232b24" stroke="#ffd21f" stroke-width="3"/></svg><b>10</b></div>`;
    case"reconstruindo":return`<div class="mini-rc"><span>VENDE</span><b>→</b><span class="g">COMPRA</span></div>`;
    case"maleta":return`<div class="mini-ma">${[1,2,3,4,5].map(n=>`<span class="${n===3?"on":""}">${n}</span>`).join("")}</div>`;
    case"leilao":return`<div class="mini-le"><div class="a"><b>€ 80 mi</b><small>QUER?</small></div><div class="b"><i>SIM</i><i>SIM</i></div><b class="g">€ 95 mi</b></div>`;
    case"carreira":return`<div class="mini-car">${["santos","barcelona","psg","al-hilal"].map(c=>`<span>${ST.ESC[c]?`<img src="${ST.ESC[c]}" alt="">`:""}</span>`).join("")}<b>?</b></div>`;
    case"questoes":return`<div class="mini-qs"><ul><li>Seleção: Brasil <em class="y">SIM</em></li><li>Nasceu em 1990 ou depois <em class="n">NÃO</em></li><li>Passou por: Barcelona <em class="y">SIM</em></li></ul></div>`;
    case"forca":return`<div class="mini-forca"><svg viewBox="0 0 110 100" aria-hidden="true"><path d="M8 96H60M20 96V6M14 6H78M20 26 40 6" stroke="#8a6a3a" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M66 6V24" stroke="#d9c79a" stroke-width="3"/></svg><img src="${BODEHEAD}" alt=""><div class="w"><i>N</i><i></i><i>Y</i><i>M</i><i></i><i>R</i></div></div>`;
    case"velha":return`<div class="mini-velha">${["x","o","","","x","o","o","","x"].map(c=>`<i class="${c}">${c==="x"?"✕":c==="o"?"◯":""}</i>`).join("")}</div>`;
    case"entrosa":return`<div class="mini-link">${["Hristo Stoichkov","Kaká","Romário"].map(n=>`<img src="${im(byName(n))}" alt="">`).join("<i></i>")}<i></i><b>?</b></div>`;
    case"piramide":return`<div class="mini-pyr"><div><i class="y"></i></div><div><i class="g"></i><i class="g"></i></div><div><i class="g"></i><i></i><i class="g"></i></div><div><i></i><i class="g"></i><i></i><i></i></div></div>`;
    case"top10":return`<div class="mini-t10">${[1,2,3,4,5,6,7,8,9,10].map(i=>`<span class="${[1,2,4,7,9].includes(i)?"ok":""}">${i}<i></i></span>`).join("")}</div>`;
    case"velho":return`<div class="vs"><img src="${im(byName("Cafu"))}" alt=""><b>VS</b><img src="${im(byName("Cristiano Ronaldo"))}" alt=""></div>`;
  }return""}
