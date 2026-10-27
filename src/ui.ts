// @ts-nocheck
import {META} from "./meta";
/* regras em duas camadas: uma frase de objetivo (a que já alimenta o SEO) e as regras completas recolhidas.
   Quem já sabe jogar não lê parede de texto; quem não sabe abre com um clique. */
export function rulesHTML(id,full,extra=""){
  const lead=META[id]&&META[id].how;
  if(!lead||!full)return`<p class="rules">${full||""}${extra}</p>`;
  return`<div class="rules"><p class="lead">${lead}</p><details><summary>Ver regras completas</summary><p>${full}${extra}</p></details></div>`}
