# Conta unificada: como ligar

O código da conta (`api/`, `src/conta.ts`) já está no repositório. Sem o banco, o site funciona como antes e o cadastro mostra erro.

## 1. Criar o Redis (uma vez)
Vercel → projeto `central-mini-games-tf` → Storage → Create Database → Upstash → Redis. Conectar em Production e Preview.
Isso cria `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_URL` e `KV_REST_API_TOKEN`; o código aceita os dois).

## 2. Testar local
```bash
npm i -g vercel
vercel link --project central-mini-games-tf
vercel env pull .env.local
vercel dev        # serve o site e a pasta api/
```
`npm run dev` (Astro) não serve `api/`: lá o cadastro sempre dá erro.

## 3. Dados no Redis
- `handle:<usuario>` → id da conta
- `user:<id>` → `{handle, pw(scrypt), created}`
- `data:<id>` → `{perfil, hist, rew, ach}` (fusão sem perda)
- `sess:<token>` → id (30 dias), `rl:*` → limite de tentativas

## Próximos
Google e e-mail (Resend) entram como novas ações em `api/auth.js`; lobbys públicos usam o mesmo Redis.
