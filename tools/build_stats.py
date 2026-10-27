"""Lê as listas da Wikipédia (baixadas em WT) e casa os nomes com os jogadores do site (ids do Transfermarkt)."""
import json,re,sys,unicodedata,os,glob
sys.path.insert(0,os.path.dirname(__file__))
from wikitab import tables,plain,num,link_name
WT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'wiki')
D=json.load(open('public/dados.json'));PS=json.load(open('public/posicoes.json'))
def norm(s):
    s=unicodedata.normalize('NFD',s);s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9 ]',' ',s.lower().replace('ø','o').replace('ł','l').replace('đ','d').replace('ß','ss')).split()
PART={'da','de','do','dos','das','van','von','der','den','del','di','la','le','al','el','bin','ibn'}
peak=lambda i:(PS.get(str(i)) or [0])[0]
IDX={};ALL=[]
for a in D['P']:
    t=tuple(norm(a[1]));IDX.setdefault(t,[]).append(a[0]);ALL.append((a[0],set(t),t))
def find(name):
    t=norm(name)
    if not t:return None
    c=IDX.get(tuple(t))
    if c:return max(c,key=peak)
    ts=set(t);best=[]
    if len(t)>=2:
        for i,s,tt in ALL:
            if (ts<=s or s<=ts) and tt[-1]==t[-1] and len({w for w in (ts&s) if len(w)>=3 and w not in PART})>=2:best.append(i)
    return max(best,key=peak) if best else None
def rd(name):return open(os.path.join(WT,name+'.txt'),encoding='utf8').read()
def cellname(c):
    c=re.sub(r'<[^>]+>|★|♦|♦','',c)
    if '}}' in c and '[[' not in c:c=c.split('}}')[-1]
    n,d=link_name(c);return n if n else plain(c)
def rows_of(page,ti,pcol,vcol,minrows=3,norank=False):
    out=[];pv=None
    for r in tables(rd(page))[ti]['rows']:
        full=norank or bool(re.fullmatch(r'\d+\+?',plain(r[0]).replace(',','').strip())) if r else False
        if full:
            if len(r)<=max(pcol,vcol):continue
            n=cellname(r[pcol]);v=num(r[vcol]);pv=v
        else:
            if pv is None or len(r)<pcol:continue
            n=cellname(r[pcol-1]);v=pv;r=['']+r
        if n and v:out.append((n,v,r))
    return out
LISTS={}
LISTS['caps']=[(n,v,r[3].strip()) for n,v,r in rows_of('List_of_men%27s_footballers_with_100_or_more_international_caps',1,1,4)]
LISTS['wc']=[(n,v,'') for n,v,r in rows_of('List_of_FIFA_World_Cup_top_goalscorers',2,1,3)]
LISTS['eng']=[(n,v,'') for n,v,r in rows_of('List_of_footballers_in_England_by_number_of_league_appearances',1,0,2,norank=True)]
LISTS['pl']=[(n,v,'') for n,v,r in rows_of('PL100',0,1,2)]
LISTS['igoals']=[(n,v,r[3].strip()) for n,v,r in rows_of('List_of_men%27s_footballers_with_50_or_more_international_goals',1,1,4)]
LISTS['career']=[(n,v,'') for n,v,r in rows_of('List_of_footballers_with_500_or_more_goals',1,1,2)]
for k,p,t in [('laliga','List_of_La_Liga_top_scorers',0),('bundes','List_of_Bundesliga_top_scorers',0),('ligue1','List_of_Ligue_1_top_scorers',0),('seriea','List_of_Serie_A_players_with_100_or_more_goals',0)]:
    LISTS[k]=[(n,v,'') for n,v,r in rows_of(p,t,1,2)]
LISTS['ucl']=[(n,v,'') for n,v,r in rows_of('List_of_UEFA_Champions_League_top_scorers',0,1,2)]
LISTS['uclapp']=[(n,v,'') for n,v,r in rows_of('List_of_footballers_with_100_or_more_UEFA_Champions_League_appearances',0,1,3)]

def matched(key):
    seen={};out=[]
    for n,v,x in LISTS[key]:
        i=find(n)
        if i and i not in seen:seen[i]=1;out.append((i,v,x))
    return out
def theme(id_,title,sub,rows,unit,minn=30):
    rows=sorted(rows,key=lambda r:-r[1])[:100]
    if len(rows)<minn:return None
    return {'id':id_,'t':title,'s':sub,'u':unit,'ids':[r[0] for r in rows],'v':[r[1] for r in rows]}
def stat_themes():
    T=[];FW='Fonte: Wikipédia. Só entram jogadores que existem na base do jogo.'
    caps=matched('caps')
    T.append(theme('caps','Mais jogos pela seleção principal',FW,caps,'jogos'))
    for conf,lab in [('UEFA','europeus'),('CONMEBOL','sul-americanos'),('CAF','africanos'),('AFC','asiáticos'),('CONCACAF','norte e centro-americanos')]:
        T.append(theme('caps-'+conf,f'Mais jogos pela seleção entre {lab}',FW,[r for r in caps if conf in r[2]],'jogos'))
    T.append(theme('wc','Maiores artilheiros da história das Copas do Mundo',FW,matched('wc'),'gols'))
    T.append(theme('eng','Mais jogos na liga inglesa (todas as divisões)',FW,matched('eng'),'jogos'))
    T.append(theme('ucl','Maiores artilheiros da história da Champions League',FW,matched('ucl'),'gols'))
    T.append(theme('uclapp','Mais jogos na história da Champions League',FW,matched('uclapp'),'jogos'))
    T.append(theme('laliga','Maiores artilheiros da história da La Liga',FW,matched('laliga'),'gols'))
    T.append(theme('seriea','Maiores artilheiros da história da Serie A',FW,matched('seriea'),'gols'))
    T.append(theme('bundes','Maiores artilheiros da história da Bundesliga',FW,matched('bundes'),'gols'))
    T.append(theme('ligue1','Maiores artilheiros da história da Ligue 1',FW,matched('ligue1'),'gols'))
    T.append(theme('pl','Maiores artilheiros da história da Premier League',FW,matched('pl'),'gols'))
    tot={}
    for k in ['laliga','seriea','bundes','ligue1','pl']:
        for i,v,_ in matched(k):tot[i]=tot.get(i,0)+v
    T.append(theme('top5','Mais gols nas cinco grandes ligas da Europa (soma)',FW,[(i,v,'') for i,v in tot.items()],'gols'))
    T.append(theme('igoals','Maiores artilheiros de seleções da história',FW,matched('igoals'),'gols'))
    T.append(theme('career','Mais gols na carreira (500 ou mais)',FW,matched('career'),'gols'))
    return [x for x in T if x]
if __name__=='__main__':
    for k,L in LISTS.items():
        m=matched(k);print(k,len(L),'casados',len(m))
    for x in stat_themes():print(x['id'],len(x['ids']),x['t'])
