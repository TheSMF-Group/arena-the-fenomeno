// Gera dist-single/index.html com tudo embutido (CSS, JS e imagens/fontes em data URI) para o Artifact do claude.ai.
import fs from 'fs';import path from 'path';
const dist='dist',out='dist-single';fs.mkdirSync(out,{recursive:true});
let h=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const mime={webp:'image/webp',png:'image/png',woff2:'font/woff2',jpg:'image/jpeg',svg:'image/svg+xml'};
const data=f=>{const p=path.join(dist,f.replace(/^\//,'').split('?')[0]);const e=p.split('.').pop();return `data:${mime[e]||'application/octet-stream'};base64,${fs.readFileSync(p).toString('base64')}`};
const inlineUrls=s=>s.replace(/\/_astro\/[A-Za-z0-9_.\-]+\.(webp|png|woff2|jpg|svg)/g,m=>data(m));
h=h.replace(/<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)">/g,(m,f)=>`<style>${inlineUrls(fs.readFileSync(path.join(dist,f),'utf8'))}</style>`);
h=h.replace(/<script type="module" src="(\/_astro\/[^"]+\.js)"><\/script>/g,(m,f)=>`<script type="module">${inlineUrls(fs.readFileSync(path.join(dist,f),'utf8')).replace(/<\/script/g,'<\\/script')}</script>`);
h=inlineUrls(h);
fs.writeFileSync(path.join(out,'index.html'),h);
console.log('dist-single/index.html',(h.length/1024).toFixed(0)+' KB');
