# Camisas do vestiário: frente e costas do mesmo produto (recortadas por usoa_pairs.py, mesmo tamanho).
# Frente: apaga o patrocinador do peito (ou escreve no peito liso) e põe o nome do jogo. Costas: nome do jogo + número.
# Uso: python3 tools/kits_pairs.py <pasta dos recortes>   ->  src/assets/kit-<slug>.webp e kitback-<slug>.webp
import sys, os, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
F="/System/Library/Fonts/Supplemental/";BLACK,NARROW=F+"Arial Black.ttf",F+"Arial Narrow Bold.ttf"
C=lambda dy:("c",0,dy)
NAMES=["DRAFT","LEILÃO","MALETA","RECONSTRUINDO","CAMISA E CONTA","CARREIRA","QUESTIONAMENTOS","FORCA","JOGO DA VELHA","ENTROSAMENTO","PIRÂMIDE","TOP 10","TOP 100","FUTGEO","QUEM É?","GRADE","CONEXÕES","BODLE","IMPOSTOR","ESCUDO","BINGO","MAIS VELHO?"]
ORDER=["palmeiras","real-madrid","corinthians","barcelona","sao-paulo","man-utd","fluminense","liverpool","botafogo","bayern","cruzeiro","juventus","athletico-pr","arsenal","palmeiras2","chelsea","athletico-pr2","psg","inter","napoli","atletico-madrid","roma"]
# slug: (caixa do patrocinador, modo, caixa do texto se não houver patrocinador, cor, contorno, [apagar nas costas])
D={
"palmeiras":((116,140,268,196),C(90),None,"#fff",None,[((146,66,262,104),C(60)),((230,44,262,64),C(60))]),
"palmeiras2":((122,152,276,196),"i",None,"#0b5d3b",None,[((156,88,278,128),"i")]),
"real-madrid":((146,154,266,218),C(95),None,"#14213d",None,[]),
"corinthians":(None,None,(130,150,290,200),"#111",None,[]),
"barcelona":((146,156,284,200),C(95),None,"#ffd21f","#0b1b4d",[((166,296,268,328),C(-60)),((196,48,222,62),"i")]),
"sao-paulo":(None,None,(130,198,270,250),"#14213d",None,[]),
"man-utd":((136,158,286,240),"i",None,"#fff",None,[]),
"fluminense":((128,164,274,206),C(90),None,"#fff","#0b3b2a",[((196,34,226,48),"i")]),
"liverpool":((142,162,282,212),C(90),None,"#fff",None,[]),
"botafogo":((134,172,288,290),C(60),None,"#111",None,[((184,66,244,86),"i"),((194,298,240,314),"i")]),
"bayern":((154,130,240,234),C(100),None,"#fff",None,[((140,58,236,104),C(50))]),
"cruzeiro":(None,None,(130,150,290,200),"#fff",None,[((192,50,226,66),"i")]),
"juventus":(None,None,(130,150,290,200),"#111","#fff",[]),
"athletico-pr":(None,None,(130,150,290,200),"#fff","#111",[((188,40,240,60),"i")]),
"arsenal":((136,150,286,215),C(90),None,"#fff",None,[((190,48,236,64),"i")]),
"chelsea":(None,None,(130,150,290,200),"#fff",None,[((230,38,262,54),"i")]),
"athletico-pr2":(None,None,(130,150,290,200),"#111",None,[((172,24,212,44),"i")]),
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
    _,dx,dy=mode;b[y0:y1,x0:x1]=a[y0+dy:y1+dy,x0+dx:x1+dx]
    m=np.zeros(a.shape[:2],np.float32);m[y0:y1,x0:x1]=1;m=cv2.GaussianBlur(m,(0,0),1.6)[...,None];return (a*(1-m)+b*m).astype(np.uint8)
def put(ov,txt,cx,cy,maxw,maxh,font,col,stroke,S):
    for sz in range(220,6,-1):
        f=ImageFont.truetype(font,sz*S);w=f.getlength(txt)
        if w<=maxw*S and sz*0.74<=maxh:break
    ImageDraw.Draw(ov).text((cx*S-w/2,cy*S),txt,font=f,fill=col,stroke_width=int(sz*S*0.06) if stroke else 0,stroke_fill=stroke or col,anchor="lm")
def finish(a,items,col,stroke):
    im=Image.fromarray(a);S=4;ov=Image.new("RGBA",(420*S,420*S),(0,0,0,0))
    for t in items:put(ov,*t,col,stroke,S)
    ov=ov.resize(im.size,Image.LANCZOS);sh=Image.new("RGBA",im.size,(0,0,0,0));sh.paste((0,0,0,55),(0,1),ov.split()[3])
    return Image.alpha_composite(Image.alpha_composite(im,sh),ov)
for i,club in enumerate(ORDER):
    nm=NAMES[i];one=nm.replace("?","");box,mode,tb,col,stroke,berase=D[club]
    fnt=NARROW if len(one)>8 else BLACK
    # frente
    a=cv2.cvtColor(cv2.imread(f"{sys.argv[1]}/{club}_f.png",cv2.IMREAD_UNCHANGED),cv2.COLOR_BGRA2RGBA)
    if box:a=erase(a,box,mode)
    bx=box or tb;x0,y0,x1,y1=bx;cx,cy=(x0+x1)/2,(y0+y1)/2
    # centraliza no corpo da camisa quando o patrocinador está deslocado
    finish(a,[(one if nm!="QUEM É?" else nm,cx,cy,max(x1-x0,min(168,len(one)*12)),max(y1-y0,30),fnt)],col,stroke).save(f"src/assets/kit-{club}.webp","WEBP",quality=88,method=4)
    # costas
    a=cv2.cvtColor(cv2.imread(f"{sys.argv[1]}/{club}_b.png",cv2.IMREAD_UNCHANGED),cv2.COLOR_BGRA2RGBA)
    for b,m in berase:a=erase(a,b,m)
    ys,xs=np.where(a[...,3]>128);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max();h,w=y1-y0,x1-x0;cx=(x0+x1)/2;mw=w*0.46
    finish(a,[(one,cx,y0+h*0.22,mw,h*0.07,fnt),(f"{i+1:02d}",cx,y0+h*0.46,mw,h*0.27,BLACK)],col,stroke).save(f"src/assets/kitback-{club}.webp","WEBP",quality=88,method=4)
    print(club,nm)
