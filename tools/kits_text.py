# Apaga o patrocinador do peito de cada camisa e escreve o nome do jogo no lugar.
# Origem: tools/kits-orig/kit-<clube>.webp  ->  saída: src/assets/kit-<clube>.webp
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
F="/System/Library/Fonts/Supplemental/"
BLACK,NARROW,BOLD=F+"Arial Black.ttf",F+"Arial Narrow Bold.ttf",F+"Arial Bold.ttf"
# clube: (nome do jogo, caixa do patrocinador, origem do clone (dx,dy) ou ("row",x) ou None=inpaint, cor do texto, contorno|None, fonte)
K={
"flamengo":("DRAFT",(136,152,284,186),("row",130),"#fff",None,BLACK),
"real-madrid":("LEILÃO",(166,138,358,228),(0,95),"#14213d",None,BLACK),
"palmeiras":("MALETA",(150,196,340,240),(0,50),"#fff",None,BLACK),
"barcelona":("RECONSTRUINDO",(178,185,268,280),(0,95),"#ffd21f","#0b1b4d",NARROW),
"corinthians":("CAMISA E CONTA",(136,136,286,206),(0,75),"#111",None,NARROW),
"man-utd":("CARREIRA",(156,150,314,240),None,"#fff",None,BLACK),
"sao-paulo":("QUESTIONAMENTOS",(160,246,340,292),(0,50),"#14213d",None,NARROW),
"liverpool":("FORCA",(166,168,324,230),(0,70),"#fff",None,BLACK),
"santos":("JOGO DA VELHA",(176,180,344,270),(0,95),"#111",None,NARROW),
"bayern":("ENTROSAMENTO",(198,148,300,262),None,"#fff","#b00012",NARROW),
"gremio":("PIRÂMIDE",(160,200,336,270),(0,70),"#fff","#111",BLACK),
"juventus":("TOP 10",(170,146,316,216),(0,65),"#fff","#111",BLACK),
"internacional":("TOP 100",(155,144,346,200),(0,70),"#fff",None,BLACK),
"ac-milan":("FUTGEO",(165,180,340,252),(0,75),"#fff","#111",BLACK),
"fluminense":("QUEM É?",(146,160,340,226),(0,70),"#fff","#0b3b2a",BLACK),
"psg":("GRADE",(172,165,316,230),(0,70),"#fff",None,BLACK),
"vasco":("CONEXÕES",(155,190,340,240),(22,60),"#fff","#111",BLACK),
"chelsea":("BODLE",(150,150,270,205),"none","#fff",None,BLACK),
"botafogo":("IMPOSTOR",(156,200,326,270),(0,75),"#fff","#111",BLACK),
"arsenal":("ESCUDO",(166,160,352,244),(0,85),"#fff",None,BLACK),
"cruzeiro":("BINGO",(136,146,292,196),(0,55),"#fff",None,BLACK),
"dortmund":("MAIS VELHO?",(190,166,325,276),(0,115),"#111",None,BLACK),
}
def erase(a,box,src):
    x0,y0,x1,y1=box
    if src=="none":return a
    m=np.zeros(a.shape[:2],np.float32)
    if src is None:
        mask=np.zeros(a.shape[:2],np.uint8);mask[y0:y1,x0:x1]=255
        return cv2.inpaint(a[:,:,:3],mask,6,cv2.INPAINT_TELEA) if False else np.dstack([cv2.inpaint(np.ascontiguousarray(a[:,:,:3]),mask,6,cv2.INPAINT_TELEA),a[:,:,3]])
    b=a.copy()
    if src[0]=="row":
        col=a[y0:y1,src[1]:src[1]+1];b[y0:y1,x0:x1]=np.repeat(col,x1-x0,axis=1)
    else:
        dx,dy=src;b[y0:y1,x0:x1]=a[y0+dy:y1+dy,x0+dx:x1+dx]
    m[y0:y1,x0:x1]=1;m=cv2.GaussianBlur(m,(0,0),1.6)[...,None]
    return (a*(1-m)+b*m).astype(np.uint8)
TW={"bayern":172,"barcelona":170}
def text(im,name,box,col,stroke,font,club):
    S=4;x0,y0,x1,y1=box;cx,cy=(x0+x1)/2,(y0+y1)/2
    W=TW.get(club,x1-x0);Hh=y1-y0
    lines=[name]
    if " " in name and len(name)>9:
        w=name.split(" ");h=len(w)//2+ (len(w)%2);lines=[" ".join(w[:h]) if len(w)<3 else " ".join(w[:2])," ".join(w[h:]) if len(w)<3 else " ".join(w[2:])]
    best=None
    for sz in range(60,5,-1):
        f=ImageFont.truetype(font,sz*S);ws=[f.getlength(l) for l in lines]
        if max(ws)<=W*S*1.0 and sz*S*1.05*len(lines)<=max(Hh,34)*S*1.1:best=(f,ws,sz);break
    f,ws,sz=best
    ov=Image.new("RGBA",(im.width*S,im.height*S),(0,0,0,0));d=ImageDraw.Draw(ov)
    lh=sz*S*1.02;y=cy*S-lh*len(lines)/2
    for l,w in zip(lines,ws):
        d.text((cx*S-w/2,y),l,font=f,fill=col,stroke_width=int(sz*S*0.07) if stroke else 0,stroke_fill=stroke or col);y+=lh
    ov=ov.resize(im.size,Image.LANCZOS)
    sh=Image.new("RGBA",im.size,(0,0,0,0));sh.paste((0,0,0,70),(0,1),ov.split()[3]);im=Image.alpha_composite(im,sh)
    return Image.alpha_composite(im,ov)
for club,(name,box,src,col,stroke,font) in K.items():
    im=Image.open(f"tools/kits-orig/kit-{club}.webp").convert("RGBA")
    a=erase(np.array(im),box,src)
    out=text(Image.fromarray(a),name,box,col,stroke,font,club)
    out.save(f"src/assets/kit-{club}.webp","WEBP",quality=88,method=4)
    print(club,name)
