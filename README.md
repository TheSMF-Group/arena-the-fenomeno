# Central Mini Games TF

Central The Fenômeno de Mini Games: 21 mini games de futebol num lugar só, em uma única página (`index.html`, JavaScript puro, sem build).

Publicado em https://thefenomeno-jogos.vercel.app

## Jogos

Desafio do dia e modo infinito (normal e difícil): Carreira, Camisa e Conta, Questionamentos, Forca, Entrosamento, Pirâmide, Top 10, FutGeo, Quem é?, Grade, Conexões, Bodle, Impostor, Escudo, Bingo e Mais Velho?.

Multiplayer (sala por código, via claude.ai ou MQTT): Jogo da Velha, Draft, Leilão, Maleta e Reconstruindo.

## Dados (arquivos `.json` na raiz)

| Arquivo | O que tem |
|---|---|
| `dados.json` | jogadores, seleções e clubes da base |
| `fotos.json`, `fotos-dificil.json`, `lendas.json`, `fotos/` | retratos dos jogadores |
| `escudos.json` | escudos dos clubes |
| `entrosa.json`, `passagens.json` | carreiras e passagens por clubes (Transfermarkt) |
| `posicoes.json` | posição principal e secundárias e maior valor de mercado |
| `atuais.json` | valor de mercado atual de quem jogou 2025/26 |
| `camisas.json` | número de camisa e altura de quem jogou 2025/26 |
| `novos.json` | listas curadas (artilheiros, etc.) |
| `futgeo.json`, `mapa.json` | estádios e mapa do FutGeo |

Fotos e escudos vêm de https://github.com/TheSMF-Group/assets e https://github.com/TheSMF-Group/thefenomeno-assets. Os dados de carreira, posição, valor de mercado e camisa foram coletados do Transfermarkt.

## Rodar localmente

```bash
python3 -m http.server 8765
# abra http://localhost:8765
```

## Deploy

Vercel, a partir desta pasta (`vercel deploy --prod`).
