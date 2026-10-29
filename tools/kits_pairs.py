# Camisas do vestiário: frente e costas do mesmo produto (recortadas por usoa_pairs.py, mesmo tamanho).
# Frente: apaga o patrocinador do peito (ou escreve no peito liso) e põe o nome do jogo. Costas: nome do jogo + número.
# Uso: python3 tools/kits_pairs.py <pasta dos recortes>   ->  src/assets/kit-<slug>.webp e kitback-<slug>.webp
import sys, os, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
F="/System/Library/Fonts/Supplemental/";LV=os.path.join(os.path.dirname(os.path.abspath(__file__)),"fonts","livres")
NAMEF,NUMF=os.path.join(LV,"BarlowCondensed-ExtraBold.ttf"),os.path.join(LV,"Anton-Regular.ttf")   # fontes livres (OFL): nome e número de camisa
C=lambda dy:("c",0,dy)
FD=os.path.join(os.path.dirname(os.path.abspath(__file__)),"fonts")
def font_of(club,kind,default):   # fonte do clube em tools/fonts/ (ver LEIAME.md); sem arquivo, a padrão
    for nm in (f"{club}-{'nome' if kind=='t' else 'numero'}",club):
        for ext in (".otf",".ttf"):
            f=os.path.join(FD,nm+ext)
            if os.path.exists(f):return f
    return default
# ordem das camisas = ordem dos jogos na tela inicial (desafio do dia primeiro, depois os só de multiplayer)
NAMES=["CAMISA E CONTA","CARREIRA","QUESTIONAMENTOS","FORCA","ENTROSAMENTO","PIRÂMIDE","TOP 10","TOP 100","FUTGEO","QUEM É?","GRADE","CONEXÕES","BODLE","IMPOSTOR","ESCUDO","BINGO","MAIS VELHO?","DRAFT","LEILÃO","MALETA","RECONSTRUINDO","JOGO DA VELHA"]
ORDER=["flamengo","real-madrid","palmeiras","barcelona","corinthians","man-utd","sao-paulo","liverpool","fluminense","bayern","botafogo","juventus","cruzeiro","arsenal","athletico-pr","chelsea","psg","inter","napoli","atletico-madrid","roma","tottenham"]
# slug: (caixa do patrocinador, modo, caixa do texto se não houver patrocinador, cor, contorno, [apagar nas costas])
D={
"flamengo":(None,None,(140,138,292,184),"#fff","#111",[((120,86,182,150),"r"),((228,96,276,124),"r")]),
"tottenham":((142,142,276,208),C(100),None,"#132257",None,[((206,48,262,64),"i")]),
"palmeiras":((116,140,268,196),C(90),None,"#fff",None,[((146,66,262,104),C(60)),((230,44,262,64),C(60))]),
"real-madrid":((146,154,266,218),C(95),None,"#14213d",None,[]),
"corinthians":(None,None,(130,150,290,200),"#111",None,[]),
"barcelona":((146,156,284,200),C(95),None,"#ffd21f","#0b1b4d",[((166,296,268,328),C(-60)),((196,48,222,62),"i")]),
"sao-paulo":(None,None,(130,198,270,250),"#14213d",None,[]),
"man-utd":((136,158,286,240),"i",None,"#fff",None,[]),
"fluminense":((128,164,274,206),C(46),None,"#fff","#0b3b2a",[((196,34,226,48),"i")]),
"liverpool":((142,162,282,212),C(90),None,"#fff",None,[]),
"botafogo":((138,214,276,282),C(60),None,"#111",None,[((180,64,240,84),"i"),((194,298,240,314),"i")]),
"bayern":((154,130,240,234),C(100),None,"#fff",None,[((140,58,236,104),C(50))]),
"cruzeiro":(None,None,(130,150,290,200),"#fff",None,[((192,50,226,66),"i")]),
"juventus":(None,None,(130,150,290,200),"#111","#fff",[]),
"athletico-pr":(None,None,(130,150,290,200),"#fff","#111",[((188,40,240,60),"i")]),
"arsenal":((136,150,286,215),C(90),None,"#fff",None,[((190,48,236,64),"i")]),
"chelsea":(None,None,(130,150,290,200),"#fff",None,[((230,38,262,54),"i")]),
"psg":((146,150,274,206),C(90),None,"#fff",None,[]),
"inter":((126,134,276,190),C(80),None,"#fff","#0b1b4d",[]),
"napoli":((146,156,294,204),C(100),None,"#fff",None,[]),
"atletico-madrid":((146,160,300,265),C(105),None,"#14213d","#fff",[((200,56,230,72),"i")]),
"roma":((178,142,268,262),"i",None,"#ffd21f",None,[]),
}
def erase(a,box,mode):
    x0,y0,x1,y1=box;b=a.copy()
    if mode=="i":
        m=np.zeros(a.shape[:2],np.uint8);m[y0:y1,x0:x1]=255;b[:,:,:3]=cv2.inpaint(np.ascontiguousarray(a[:,:,:3]),m,5,cv2.INPAINT_TELEA);return b
    if mode=="r":
        b[y0:y1,x0:x1]=np.repeat(a[y0:y1,x0-3:x0-2],x1-x0,axis=1);m=np.zeros(a.shape[:2],np.float32);m[y0:y1,x0:x1]=1;m=cv2.GaussianBlur(m,(0,0),1.6)[...,None];return (a*(1-m)+b*m).astype(np.uint8)
    _,dx,dy=mode;b[y0:y1,x0:x1]=a[y0+dy:y1+dy,x0+dx:x1+dx]
    m=np.zeros(a.shape[:2],np.float32);m[y0:y1,x0:x1]=1;m=cv2.GaussianBlur(m,(0,0),1.6)[...,None];return (a*(1-m)+b*m).astype(np.uint8)
def tone(a,y0,y1,x0,x1):
    r=a[y0:y1,x0:x1];r=r[r[...,3]>200][:,:3].astype(float);return np.median(r,axis=0) if len(r) else np.array([120,120,120.])
def darker(c,k):return "#%02x%02x%02x"%tuple(int(v*k) for v in c)
sys.path.insert(0,os.path.dirname(__file__))
from print_fx import render
CALM={"flamengo","fluminense","botafogo","juventus","inter","atletico-madrid","athletico-pr","barcelona","sao-paulo","liverpool","bayern","psg"}   # tecidos listrados/estampados
def finish(a,items,col,stroke,calm=False,halo=False):
    return Image.fromarray(render(a,items,col,stroke,calm,halo))
BODE=os.path.join(os.path.dirname(os.path.abspath(__file__)),"bode-contorno.png")
INK="#0a0a0a"
def center_x(a,y0,h):
    rows=range(int(y0+h*.30),int(y0+h*.52),3);ex=[(np.where(a[r,:,3]>128)[0].min(),np.where(a[r,:,3]>128)[0].max()) for r in rows];return float(np.median([(l+r)/2 for l,r in ex]))
for i,club in enumerate(ORDER):
    box,mode,tb,col,stroke,berase=D[club];TR={"botafogo":[(170,0,262,28)]}
    fa=cv2.cvtColor(cv2.imread(f"{sys.argv[1]}/{club}_f.png",cv2.IMREAD_UNCHANGED),cv2.COLOR_BGRA2RGBA)
    ba=cv2.cvtColor(cv2.imread(f"{sys.argv[1]}/{club}_b.png",cv2.IMREAD_UNCHANGED),cv2.COLOR_BGRA2RGBA)
    for t0,t1,t2,t3 in TR.get(club,[]):fa[t1:t3,t0:t2,3]=0
    for b,m in berase:ba=erase(ba,b,m)
    ys,xs=np.where(ba[...,3]>128);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max();h,w=y1-y0,x1-x0
    gw=w*0.30;gh=gw*745/916                      # mesmo tamanho na frente e nas costas
    Image.fromarray(fa).save(f"src/assets/kit-{club}.webp","WEBP",quality=88,method=4)   # frente: a camisa real, sem alteração
    for tag,a in (("b",ba),):
        cx=center_x(a,y0,h);cy=y0+h*0.38
        dark=np.median(cv2.cvtColor(a[int(cy-gh/2):int(cy+gh/2),int(cx-gw/2):int(cx+gw/2),:3],cv2.COLOR_RGB2GRAY))<85
        out=finish(a,[(BODE,cx,cy,gw,gh,None,"g")],INK,None,club in CALM,dark)
        out.save(f"src/assets/{'kit' if tag=='f' else 'kitback'}-{club}.webp","WEBP",quality=88,method=4)
    print(club)
