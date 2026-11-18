// Copia o pacote do mascote (repo thefenomeno-mascote, `npm run build:arena` + `scripts/pool-arena.mjs`) para
// public/mascote/<versão>/ e grava a versão em src/mascote-versao.ts. A pasta muda a cada versão: cache longo seguro.
// Uso: node tools/puxa-mascote.mjs [../thefenomeno-mascote]
import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';

const repo = process.argv[2] || join(homedir(), 'thefenomeno-mascote');
const origem = join(repo, 'dist-arena');
if (!existsSync(join(origem, 'mascote.js')) || !existsSync(join(origem, 'pool', 'pool.json'))) {
  console.error(`faltam ${origem}/mascote.js ou pool/pool.json: rode lá "npm run build:arena" e "node scripts/pool-arena.mjs"`); process.exit(1);
}
const hash = execFileSync('git', ['-C', repo, 'rev-parse', '--short=7', 'HEAD']).toString().trim();
const versao = 'm' + hash;
for (const d of existsSync('public/mascote') ? readdirSync('public/mascote') : []) if (d !== versao) rmSync(join('public/mascote', d), { recursive: true });
cpSync(origem, join('public/mascote', versao), { recursive: true });
writeFileSync('src/mascote-versao.ts', `// gerado por tools/puxa-mascote.mjs (commit ${hash} do thefenomeno-mascote)\nexport const MASCOTE = "/mascote/${versao}/";\n`);
console.log('mascote', versao);
