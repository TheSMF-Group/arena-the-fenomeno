# Costas com foto real (usoa10, recortadas por usoa_cut.py): apaga o texto do pescoço e escreve nome do jogo e número.
# Uso: python3 tools/kits_back2.py <pasta dos recortes>   (rode antes tools/kits_back.py: ele gera as costas de reserva)
import re, sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
exec(open("tools/kits_back.py").read().split("def erase")[0].split("# clube:")[0])   # F, BLACK, NARROW, C
src=open("tools/kits_back.py").read();K=eval(src[src.index("K={")+2:src.index("\ndef erase")].replace("\n","")[:-0] if False else "{"+src[src.index("K={")+3:src.index("}\ndef erase")]+"}")
CUT=sys.argv[1]
ERASE={"bayern":[((125,84,300,118),"i")],"dortmund":[((138,56,276,96),"i")],"palmeiras":[((138,64,266,102),"i")],"sao-paulo":[((128,44,284,82),"i")],"barcelona":[((160,306,306,340),C(0,-45))]}
def erase(a,box,mode):
    x0,y0,x1,y1=box
    if mode=="i":
        m=np.zeros(a.shape[:2],np.uint8);m[y0:y1,x0:x1]=255;b=a.copy();b[:,:,:3]=cv2.inpaint(np.ascontiguousarray(a[:,:,:3]),m,5,cv2.INPAINT_TELEA);return b
    _,dx,dy=mode;b=a.copy();b[y0:y1,x0:x1]=a[y0+dy:y1+dy,x0+dx:x1+dx];return b
def put(ov,txt,cx,cy,maxw,maxh,font,col,stroke,S):
    for sz in range(220,6,-1):
        f=ImageFont.truetype(font,sz*S);w=f.getlength(txt)
        if w<=maxw*S and sz*0.74<=maxh:break
    ImageDraw.Draw(ov).text((cx*S-w/2,cy*S),txt,font=f,fill=col,stroke_width=int(sz*S*0.06) if stroke else 0,stroke_fill=stroke or col,anchor="lm")
import os
for club,(num,name,items,col,stroke) in K.items():
    f=f"{CUT}/{club}.png"
    if not os.path.exists(f):continue
    a=cv2.cvtColor(cv2.imread(f,cv2.IMREAD_UNCHANGED),cv2.COLOR_BGRA2RGBA)
    for box,mode in ERASE.get(club,[]):a=erase(a,box,mode)
    ys,xs=np.where(a[...,3]>128);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max();h,w=y1-y0,x1-x0;cx=(x0+x1)/2
    im=Image.fromarray(a);S=4;ov=Image.new("RGBA",(420*S,420*S),(0,0,0,0));nm=name.replace("?","")
    mw=w*0.46
    put(ov,nm,cx,y0+h*0.22,mw,h*0.07,NARROW if len(nm)>8 else BLACK,col,stroke,S)
    put(ov,f"{num:02d}",cx,y0+h*0.46,mw,h*0.27,BLACK,col,stroke,S)
    ov=ov.resize(im.size,Image.LANCZOS);sh=Image.new("RGBA",im.size,(0,0,0,0));sh.paste((0,0,0,50),(0,1),ov.split()[3])
    Image.alpha_composite(Image.alpha_composite(im,sh),ov).save(f"src/assets/kitback-{club}.webp","WEBP",quality=88,method=4);print(club)
