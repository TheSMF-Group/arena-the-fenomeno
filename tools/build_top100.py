"""Gera public/top100.json: temas de ranking com 100 jogadores cada (valor de mercado atual e de pico)."""
import json,collections
D=json.load(open('public/dados.json'));A=json.load(open('public/atuais.json'));PS=json.load(open('public/posicoes.json'))
P={a[0]:a for a in D['P']};C=D['C'];K={k[0]:k for k in D['K']};N=D['N']
nat=lambda i:N[P[i][2]][0]
def liga(i):
    c=P[i][4]
    if c is None or c>=len(C):return None
    s=C[c][1];return K[s][4] if s in K else None
GRP={'Goleiros':{1},'Zagueiros':{2,3},'Laterais':{4,5},'Meio-campistas':{6,7,8,9,10},'Pontas':{11,12},'Atacantes':{13,14}}
GRP1={'Goleiros':{1},'Zagueiros':{2,3},'Laterais':{4,5},'Volantes e meias':{6,7,8,9,10},'Pontas e atacantes':{11,12,13,14}}
def grp(i,G):
    pos=set(PS[str(i)][1:]) if str(i) in PS else set()
    # posição principal: a primeira listada
    first=PS[str(i)][1] if str(i) in PS and len(PS[str(i)])>1 else None
    return [g for g,s in G.items() if first in s]
cur=[(int(i),v) for i,v in A.items() if int(i) in P]
peak=[(int(i),e[0]) for i,e in PS.items() if int(i) in P and e[0]>0]
themes=[]
def add(id_,title,sub,rows):
    rows=sorted(rows,key=lambda x:(-x[1],x[0]))[:100]
    if len(rows)<100:return
    themes.append({'id':id_,'t':title,'s':sub,'ids':[r[0] for r in rows],'v':[round(r[1]/1e6,1) for r in rows]})
def best(rows,n=100):return rows
CS='Valor de mercado atual (Transfermarkt), só jogadores em atividade'
PK='Maior valor de mercado da carreira (Transfermarkt)'
add('atual','Maiores valores de mercado do mundo hoje',CS,cur)
add('pico','Maiores valores de mercado da história',PK,peak)
for n,lab in [('Inglaterra','ingleses'),('Espanha','espanhóis'),('França','franceses'),('Brasil','brasileiros'),('Itália','italianos'),('Alemanha','alemães'),('Holanda','holandeses'),('Portugal','portugueses')]:
    add('atual-'+n,f'Maiores valores de mercado entre {lab} hoje',CS,[r for r in cur if nat(r[0])==n])
for n,lab in [('Brasil','brasileiros'),('Itália','italianos'),('Alemanha','alemães'),('Inglaterra','ingleses'),('França','franceses'),('Argentina','argentinos'),('Espanha','espanhóis'),('Holanda','holandeses'),('Turquia','turcos'),('Portugal','portugueses'),('Bélgica','belgas'),('Dinamarca','dinamarqueses'),('Uruguai','uruguaios'),('Sérvia','sérvios'),('Colômbia','colombianos'),('Croácia','croatas')]:
    add('pico-'+n,f'Maiores valores de mercado da história entre {lab}',PK,[r for r in peak if nat(r[0])==n])
for l,lab in [('Premier League','da Premier League'),('Serie A','da Serie A'),('Bundesliga','da Bundesliga'),('La Liga','da La Liga'),('Ligue 1','da Ligue 1'),('Süper Lig','da Süper Lig'),('Eredivisie','da Eredivisie'),('Championship','da Championship'),('Primeira Liga','da Primeira Liga')]:
    add('liga-'+l,f'Maiores valores de mercado hoje {lab}',CS,[r for r in cur if liga(r[0])==l])
for g in GRP1:
    add('atualpos-'+g,f'Maiores valores de mercado hoje: {g.lower()}',CS,[r for r in cur if g in grp(r[0],GRP1)])
for g in GRP:
    add('picopos-'+g,f'Maiores valores de mercado da história: {g.lower()}',PK,[r for r in peak if g in grp(r[0],GRP)])
for yr,lab in [(2005,'até 21 anos'),(2003,'até 23 anos'),(2000,'até 26 anos')]:
    add(f'jovem-{yr}',f'Maiores valores de mercado hoje entre jogadores {lab}',CS,[r for r in cur if P[r[0]][3] and P[r[0]][3]//10000>=yr])
add('veterano','Maiores valores de mercado hoje entre jogadores com 31 anos ou mais',CS,[r for r in cur if P[r[0]][3] and P[r[0]][3]//10000<=1995])
for d0,lab in [(1980,'dos anos 80'),(1990,'dos anos 90'),(2000,'dos anos 2000')]:
    add(f'pico-nasc{d0}',f'Maiores valores de mercado da história entre nascidos {lab}',PK,[r for r in peak if P[r[0]][3] and d0<=P[r[0]][3]//10000<d0+10])
add('atual-br-jovens','Maiores valores de mercado hoje: brasileiros até 23 anos',CS,[r for r in cur if nat(r[0])=='Brasil' and P[r[0]][3] and P[r[0]][3]//10000>=2003])
json.dump({'themes':themes},open('public/top100.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(themes));[print(t['id'],'|',t['t'],'|',t['ids'][0],t['v'][0],t['v'][-1]) for t in themes]
