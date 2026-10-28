# Arena The Fenômeno

Arena The Fenômeno: 22 mini games de futebol num lugar só. Agora em **Astro + TypeScript**.

## Estrutura
- `src/pages/index.astro`: página (head, cabeçalho, `#app`, rodapé) e entrada do script.
- `src/main.ts`: carrega os dados e registra todos os jogos.
- `src/games/*.ts`: um módulo por jogo (os multiplayer: `draft*.ts`, `leilao.ts`, `maleta.ts`, `reconstruindo.ts`, `velha*.ts`).
- `src/core.ts`, `engine.ts`, `search.ts`, `home.ts`, `profile.ts`, `mqtt.ts`: base compartilhada.
- `src/state.ts`: variáveis globais mutáveis (`ST.P`, `ST.DIFF`…), antes `let` soltos.
- `src/types.ts`: tipos centrais (`Player`, `Crest`, `GameDef`, `RoomState`…).
- `src/styles/global.css` e `src/assets/`: CSS, escudos, fontes e imagens que antes estavam em base64.
- `public/`: dados (`*.json`), fotos, `favicon.png`, `og.png`.
- `legacy/index.html`: o site antigo em arquivo único, só para referência.

## Comandos
```bash
npm install
npm run dev      # servidor local
npm run build    # gera dist/ (é o que o Vercel publica)
npm run check    # checagem de tipos
npm run single   # gera dist-single/index.html com tudo embutido (para o Artifact do claude.ai)
```

## Situação da migração
Todos os módulos começam com `// @ts-nocheck`. O próximo passo é remover essa linha módulo a módulo e tipar o que aparecer, começando por `core.ts`, `search.ts` e `engine.ts`.
