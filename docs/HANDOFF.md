# Handoff: hub jogue.thefenomeno.com (27/10/2026)

Branch de trabalho: `design-system-unificado` (parte de `main`). **Nada disso foi publicado em produção.** O `jogue.thefenomeno.com` ainda serve a versão anterior.

## O que já está pronto nesta branch

| Área | Onde | Estado |
|---|---|---|
| Design system unificado (base `#0a0a0a`/`#141414`, um amarelo `#FFD400`, verde só p/ acerto, Bebas Neue + Inter via jsDelivr do thefenomeno-assets) | `src/styles/global.css` | pronto |
| Hero, vitrine, filtros por categoria, botão "Jogar o desafio de hoje", arena nos jogos, rodapé, bordas | `src/home.ts`, `src/layouts/Shell.astro`, CSS | pronto |
| Rotas por jogo `/jogos/<slug>` (22 páginas estáticas), sitemap, robots, JSON-LD, pageview GA4 por troca de jogo | `src/meta.ts` (fonte única de copy+SEO), `src/pages/jogos/[slug].astro`, `src/nav.ts`, `src/track.ts` | pronto |
| Retenção: sequência de dias, dias jogados (nunca zera), progresso real do dia, "próximo jogo" | `src/fio.ts` | pronto |
| Jogos do grupo na grade (The Fenômeno em destaque, Conecte, Mais ou Menos), `utm_source=jogue`. **Kings League fora** (site bloqueado) | `src/promo.ts` | pronto |
| Anúncios GPT (rede 23362641595, unidades do www), barra fixa, trilhos, banner no fim da partida, **não personalizados por padrão** | `src/ads.ts` (`NON_PERSONALIZED=true`) | pronto, **não testado com anúncio real** (GAM só serve em produção) |
| Share card 1080x1350 em todos os jogos + card do dia | `src/card.ts`, `src/engine.ts` (`share()`) | pronto |
| Animações globais + próprias de Bodle, Quem É?, Conexões, Forca, Mais Velho, Grade, Impostor | `global.css`, `src/games/*.ts` | pronto, testado com partidas reais |
| **Sala ao vivo (para streamers)**: link, chat entra pelo celular, cada um por si, placar ao vivo | `src/live.ts`, `src/pages/ao-vivo.astro`, card na vitrine | **MVP funcionando**, ver abaixo |

## Sala ao vivo: como funciona e o que falta

- Host em `/ao-vivo` (feito pra captura no OBS). Jogador entra em `/?sala=CODE`, escolhe apelido e joga no celular.
- O navegador do **streamer é o servidor** da sala: sorteia o desafio, recebe respostas, confere e pontua. O jogador só assina o estado da sala e o próprio resultado, então o tráfego cresce linear.
- Transporte: broker MQTT público (mesmo das salas Draft/Velha). Tópicos em `thefenomeno-jogos/live/v1/<CODE>/{s,j/<id>,a/<id>,p/<id>}`.
- Rodadas implementadas: Mais Velho (10s), Impostor (15s), Quem é? (25s, foto clareia), Escudo (25s). Padrão em `PATTERN` no `live.ts`. Pontos: `400 + 600 * (tempo restante)` se acertar.
- Testado: host + 2 jogadores em abas, partida de 5 rodadas completa, pódio. **Não testado com muita gente nem no celular de verdade.**

Limites conhecidos (decidir antes de usar em live com prêmio):
1. A base de jogadores está no navegador, então quem abrir o DevTools acha a resposta de Mais Velho. Para premiar de verdade, mover o host para um servidor.
2. Se o host fechar a aba, a sala acaba.
3. Broker público sem garantia de capacidade (limite configurado: 300 jogadores).
4. Sem chat próprio de propósito: só o apelido aparece (ECA Digital art. 21). Filtro de apelido é uma lista curta em `BAD`; o host pode expulsar.
5. Falta: FutGeo, Top 10 e Conexões como rodada; tela de host com "Próxima" manual vs. automática configurável; card compartilhável do pódio; reconexão do host; teste de carga.

## Próximas ideias já discutidas (nada disso foi feito)
- **Duelo contra amigo** (sala + mesmo desafio + progresso do oponente) nos jogos de adivinhar.
- **Modo Streamer lendo chat da Twitch** (foi substituído pela Sala ao vivo, que o Santiago preferiu).
- Jogos novos: Pênaltis, Cara a Cara, Escalação, Rapidinha.
- Mais animações própria por jogo (restam, sem tratamento próprio: Camisa e Conta, Carreira, Entrosamento, Questionamentos, Escudo, Top 10, Pirâmide, Top 100, FutGeo, Bingo e os de sala).

## Decisões e pendências que NÃO são de código
- **Publicar**: falta `git push` desta branch (feito no handoff) e `vercel deploy --prod` na pasta do projeto. O projeto Vercel `central-mini-games-tf` (team `santiagobstns-projects`) **não tem vínculo Git**: deploy é só pela CLI. Domínios `jogue.` e `play.thefenomeno.com` já estão ligados a ele (DNS no Cloudflare, TXT `_vercel` criados).
- **Bloquear categoria de apostas/bet no Ad Manager** (painel GAM): a lei (Lei 15.211/2025 art. 6º IV e Decreto 12.880/2026 art. 32-33) mira exposição de menores a apostas. É configuração na conta, não código.
- **Anúncio não personalizado** reduz receita. Constante `NON_PERSONALIZED` em `src/ads.ts`; mudar só com aval do jurídico.
- **Classificação indicativa** (Decreto 12.880 art. 8º V): não tratada, depende de processo oficial.
- **Consentimento de cookies/LGPD**: não tratado.
- **The Jogaço**: site estava em manutenção, não linkado. **Kings League**: bloqueado, removido dos links (reativar só quando o Santiago liberar).
- Regra do Santiago: **sem pausa/limite de sessão** no hub. Retenção por design (progresso real, sem FOMO, sem autoplay).

## Ambiente de teste: https://teste.thefenomeno.com (29/10/2026)

- Projeto Vercel separado `jogue-teste` (time `thesmf-group`, antigo `santiagobstns-projects`; mesmo id `team_gvt7gLqYy6DUWq3zLXB4Gc1O`), **sem vínculo Git**. Não é a produção: `jogue.thefenomeno.com` é o projeto `central-mini-games-tf`.
- DNS no Cloudflare: CNAME `teste` -> `cname.vercel-dns.com` (DNS only) e TXT `_vercel` de verificação.
- Deploy do teste: `npm run build`, copiar `dist/` para uma pasta à parte com um `vercel.json` (`cleanUrls` + header `X-Robots-Tag: noindex, nofollow`), `vercel link --project jogue-teste --scope thesmf-group` **nessa pasta** e `vercel deploy --prod`. Assim o vínculo da pasta do projeto com a produção não é tocado.
- No host `teste.*` o código **não manda GA4** e **não pede anúncio real** (mostra só os espaços de preview): `IS_TEST` em `src/track.ts` e `PREVIEW` em `src/ads.ts`.
- O escopo da CLI agora é `thesmf-group` (o antigo `santiagobstns-projects` não existe mais).

## Como rodar na outra máquina

```bash
git clone https://github.com/TheSMF-Group/central-mini-games-tf
cd central-mini-games-tf
git checkout design-system-unificado
npm ci
npm run dev        # http://localhost:4321  (use ?adpreview=1 pra ver os espaços de anúncio)
npm run build      # gera dist/ (24 páginas)
```

- Sala ao vivo local: abra `http://localhost:4321/ao-vivo`, copie o código e abra `http://localhost:4321/?sala=CODIGO` em outras abas.
- Deploy (só com aval): `vercel link --project central-mini-games-tf --scope thesmf-group` e depois `vercel deploy --prod`. O `vercel link` altera o `.gitignore` e cria `.vercel/` e `.env.local` (não commitar).
- O preview do app (Claude Code) usa uma entrada `hub` em `Ramais/.claude/launch.json` **fora do repo**; recrie se precisar.

## Armadilhas que já custaram tempo
- **Escapes em patches via shell**: em Python/heredoc, `\n` dentro de strings vira quebra de linha real e quebra o build. Use a ferramenta de edição ou `chr(92)`.
- **Busca de jogador usa `mousedown`**, não `click`, para escolher sugestão (testes automáticos precisam disparar `mousedown`).
- **Chave `forcatipo:AAAAMMDD` não é resultado de jogo.** A sequência de dias só conta chaves `fen:<idJogo>:[d:]AAAAMMDD` com valor objeto.
- **`fetch` de JSON precisa ser absoluto** (`/dados.json`), por causa das rotas `/jogos/<slug>`.
- Painel de preview oculto **desacelera animações**: capturas podem pegar o meio de uma animação.
- Repo `ctresb/leis` tem 4,2 GB: não clonar; ler arquivos por `gh api repos/ctresb/leis/contents/...`.

## Repositórios de referência (só leitura, em `Ramais/refs/`, fora do repo)
thefenomeno, theconnections, maisoumenos, thejogaco (design system e padrão de anúncios GPT).
