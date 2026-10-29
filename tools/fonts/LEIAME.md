# Fontes de camisa por clube

Coloque aqui os arquivos de fonte (`.otf` ou `.ttf`) que você comprou ou baixou. O gerador
(`tools/kits_pairs.py`) usa a fonte do clube automaticamente; sem arquivo, usa a fonte padrão
(DIN Condensed Bold nos nomes, Impact nos números).

Nomes aceitos (o slug é o do clube em `tools/kits_pairs.py`: `flamengo`, `real-madrid`, `palmeiras`,
`barcelona`, `corinthians`, `man-utd`, `sao-paulo`, `liverpool`, `fluminense`, `bayern`, `botafogo`,
`juventus`, `cruzeiro`, `arsenal`, `athletico-pr`, `chelsea`, `psg`, `inter`, `napoli`,
`atletico-madrid`, `roma`, `tottenham`):

- `<slug>.otf` ou `<slug>.ttf` — a mesma fonte para nome e número;
- `<slug>-nome.otf` / `<slug>-numero.otf` — fontes diferentes para nome e número.

Fontes de liga valem para vários clubes: copie o arquivo com o nome de cada clube
(Premier League: man-utd, liverpool, arsenal, chelsea, tottenham; LaLiga: real-madrid, barcelona,
atletico-madrid; Ligue 1: psg).

Depois rode `python3 tools/kits_pairs.py <pasta dos recortes>` e publique de novo.
