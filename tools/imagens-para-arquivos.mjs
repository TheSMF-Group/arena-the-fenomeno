// Tira as imagens em base64 (data URI) dos JSONs de public/ e as grava como arquivos em public/img/,
// com o nome igual ao hash do conteúdo (imagem repetida vira um arquivo só e o nome só muda se a imagem mudar).
// O JSON mantém o mesmo formato, mas cada valor passa a ser a URL "/img/<hash>.webp".
// Os bytes do webp não são recodificados: a imagem é exatamente a que estava no JSON.
// Idempotente: valores que já são URL são mantidos. Para refazer a partir dos JSONs originais:
//   git checkout c845535 -- public/*.json public/fotos && rm -rf public/img && node tools/imagens-para-arquivos.mjs
// Uso: node tools/imagens-para-arquivos.mjs
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PUB = "public";
const OUT = path.join(PUB, "img");
const ARQUIVOS = ["fotos.json", "fotos-dificil.json", "escudos.json", "kits.json", "lendas.json"];
const EXT = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg" };

fs.mkdirSync(OUT, { recursive: true });
const gravados = new Set();
let conv = 0, bytesJson = 0, bytesImg = 0;

function arquivoDe(uri) {
  const m = /^data:([\w/+.-]+);base64,(.*)$/s.exec(uri);
  if (!m || !EXT[m[1]]) throw new Error("data URI inesperado: " + uri.slice(0, 40));
  const buf = Buffer.from(m[2], "base64");
  const nome = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12) + "." + EXT[m[1]];
  if (!gravados.has(nome)) {
    gravados.add(nome);
    fs.writeFileSync(path.join(OUT, nome), buf);
    bytesImg += buf.length;
  }
  conv++;
  return "/img/" + nome;
}

function troca(v) {
  if (typeof v === "string") return v.startsWith("data:image/") ? arquivoDe(v) : v;
  if (Array.isArray(v)) return v.map(troca);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, troca(x)]));
  return v;
}

for (const f of ARQUIVOS) {
  const p = path.join(PUB, f);
  const antes = fs.statSync(p).size;
  const novo = JSON.stringify(troca(JSON.parse(fs.readFileSync(p, "utf8"))));
  fs.writeFileSync(p, novo);
  bytesJson += antes - novo.length;
  console.log(f.padEnd(20), (antes / 1024).toFixed(0).padStart(6), "KB ->", (novo.length / 1024).toFixed(0).padStart(4), "KB");
}
console.log(`${conv} imagens, ${gravados.size} arquivos únicos em ${OUT} (${(bytesImg / 1024).toFixed(0)} KB)`);
