# Gera as costas de cada camisa a partir da foto da frente: apaga escudo, marca e patrocinador, espelha
# e escreve o nome do jogo e o número como numa camisa de jogador.
# Origem: tools/kits-orig/kit-<clube>.webp  ->  saída: src/assets/kitback-<clube>.webp
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
F="/System/Library/Fonts/Supplemental/"
BLACK,NARROW=F+"Arial Black.ttf",F+"Arial Narrow Bold.ttf"
C=lambda dx,dy:("c",dx,dy)
# clube: (número, nome, [(caixa, modo)], cor do texto, contorno|None)   modo: "i"=inpaint, "r"=cópia da linha à esquerda, ("c",dx,dy)=clone
K={
"flamengo":(1,"DRAFT",[((136,60,172,80),"r"),((246,60,288,80),"r"),((135,92,176,120),"r"),((246,86,292,128),"r"),((136,152,284,186),"r")],"#fff",None),
"real-madrid":(2,"LEILÃO",[((166,98,236,130),"i"),((312,78,360,138),"i"),((166,138,358,228),C(0,95))],"#14213d",None),
"palmeiras":(3,"MALETA",[((158,92,204,128),"i"),((285,68,355,152),"i"),((150,196,340,240),C(0,50))],"#fff",None),
"barcelona":(4,"RECONSTRUINDO",[((138,106,192,134),"i"),((268,98,322,152),"i"),((178,185,268,280),C(0,95))],"#ffd21f","#0b1b4d"),
"corinthians":(5,"CAMISA E CONTA",[((176,82,226,106),"i"),((186,98,234,144),"i"),((136,136,286,206),C(0,75))],"#111",None),
"man-utd":(6,"CARREIRA",[((142,102,190,128),"i"),((276,82,344,128),"i"),((156,150,314,240),"i")],"#fff",None),
"sao-paulo":(7,"QUESTIONAMENTOS",[((170,108,210,134),"i"),((286,114,350,136),"i"),((212,136,286,234),"r"),((160,246,340,292),C(0,50))],"#14213d","#fff"),
"liverpool":(8,"FORCA",[((162,126,214,156),"i"),((290,106,340,160),"i"),((166,168,324,230),C(0,70))],"#fff",None),
"santos":(9,"JOGO DA VELHA",[((148,56,208,90),"i"),((286,48,352,80),"i"),((156,96,208,128),"i"),((216,108,274,130),"i"),((290,86,350,144),"i"),((176,180,344,270),C(0,95)),((168,366,332,420),C(0,-60))],"#111",None),
"bayern":(10,"ENTROSAMENTO",[((150,104,210,134),"i"),((286,76,356,134),"i"),((198,148,300,262),"i")],"#fff","#b00012"),
"gremio":(11,"PIRÂMIDE",[((150,106,198,140),"i"),((298,100,350,152),"i"),((160,200,336,270),C(0,70))],"#fff","#111"),
"juventus":(12,"TOP 10",[((156,56,194,104),"i"),((156,98,212,126),"i"),((288,66,336,132),"i"),((170,146,316,216),C(0,65))],"#fff","#111"),
"internacional":(13,"TOP 100",[((166,104,210,134),"i"),((296,94,350,146),"i"),((155,144,346,200),C(0,70))],"#fff",None),
"ac-milan":(14,"FUTGEO",[((166,116,210,150),"i"),((294,98,332,156),"i"),((165,180,340,252),C(0,75))],"#fff","#111"),
"fluminense":(15,"QUEM É?",[((150,96,206,122),"i"),((280,70,340,130),"i"),((146,160,340,226),C(0,70))],"#fff","#0b3b2a"),
"psg":(16,"GRADE",[((166,114,220,146),"i"),((280,110,336,160),"i"),((172,165,316,230),C(0,70))],"#fff",None),
"vasco":(17,"CONEXÕES",[((166,126,214,156),"i"),((288,100,342,164),C(22,60)),((155,190,340,240),C(22,60))],"#fff","#111"),
"chelsea":(18,"BODLE",[((150,112,196,140),"i"),((236,100,286,150),"i")],"#fff",None),
"botafogo":(19,"IMPOSTOR",[((146,104,206,130),"i"),((300,86,356,140),"i"),((156,200,326,270),C(0,75))],"#fff","#111"),
"arsenal":(20,"ESCUDO",[((166,110,214,142),"i"),((296,90,336,140),"i"),((166,160,352,244),C(0,85))],"#fff",None),
"cruzeiro":(21,"BINGO",[((136,90,176,122),"i"),((182,96,230,114),"i"),((240,84,290,130),"i"),((136,146,292,196),C(0,55)),((134,290,282,352),C(0,-60))],"#fff",None),
"dortmund":(22,"MAIS VELHO?",[((166,136,210,170),"i"),((288,134,330,176),"i"),((190,166,325,276),C(0,115))],"#111",None),
}
def erase(a,box,mode):
    x0,y0,x1,y1=box;b=a.copy()
    if mode=="i":
        mask=np.zeros(a.shape[:2],np.uint8);mask[y0:y1,x0:x1]=255
        b[:,:,:3]=cv2.inpaint(np.ascontiguousarray(a[:,:,:3]),mask,5,cv2.INPAINT_TELEA)
        return b
    if mode=="r":
        b[y0:y1,x0:x1]=np.repeat(a[y0:y1,x0-3:x0-2],x1-x0,axis=1)
    else:
        _,dx,dy=mode;b[y0:y1,x0:x1]=a[y0+dy:y1+dy,x0+dx:x1+dx]
    m=np.zeros(a.shape[:2],np.float32);m[y0:y1,x0:x1]=1;m=cv2.GaussianBlur(m,(0,0),1.6)[...,None]
    return (a*(1-m)+b*m).astype(np.uint8)
def put(ov,txt,cx,cy,maxw,maxh,font,col,stroke,S):
    for sz in range(200,6,-1):
        f=ImageFont.truetype(font,sz*S);w=f.getlength(txt)
        if w<=maxw*S and sz*0.74<=maxh:break
    d=ImageDraw.Draw(ov);sw=int(sz*S*0.06) if stroke else 0
    d.text((cx*S-w/2,cy*S),txt,font=f,fill=col,stroke_width=sw,stroke_fill=stroke or col,anchor="lm")
NYO={"dortmund":(128,200)}
for club,(num,name,items,col,stroke) in K.items():
    im=Image.open(f"tools/kits-orig/kit-{club}.webp").convert("RGBA");a=np.array(im)
    for box,mode in items:a=erase(a,box,mode)
    im=Image.fromarray(a).transpose(Image.FLIP_LEFT_RIGHT)
    S=4;ov=Image.new("RGBA",(im.width*S,im.height*S),(0,0,0,0))
    nm=name.replace("?","")
    NY=NYO.get(club,(100,178))
    put(ov,nm,210,NY[0],150,20,NARROW if len(nm)>8 else BLACK,col,stroke,S)
    put(ov,f"{num:02d}",210,NY[1],150,110,BLACK,col,stroke,S)
    ov=ov.resize(im.size,Image.LANCZOS)
    sh=Image.new("RGBA",im.size,(0,0,0,0));sh.paste((0,0,0,60),(0,1),ov.split()[3])
    out=Image.alpha_composite(Image.alpha_composite(im,sh),ov)
    out.save(f"src/assets/kitback-{club}.webp","WEBP",quality=88,method=4);print(club)
