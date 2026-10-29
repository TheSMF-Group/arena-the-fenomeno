# Estampa realista de nomes e números sobre a foto da camisa (em vez de texto chapado desenhado por cima).
# Cada item vira uma máscara nítida (supersample) e é composta como tinta no tecido:
#  - a tinta herda a luz e as dobras da camisa (shading) e a trama do tecido (textura de alta frequência);
#  - a máscara é levemente deslocada pelo relevo do tecido (acompanha as ondulações);
#  - número = termocolante: bisel sutil, borda interna e sombra de contato; nome = sublimação: sem relevo, tinta translúcida.
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
S=4
def hexrgb(c):c=c.lstrip("#");c="".join(x*2 for x in c) if len(c)==3 else c;return np.array([int(c[i:i+2],16) for i in (0,2,4)],float)
def fit(txt,maxw,maxh,font,cap=0.72):
    for sz in range(240,6,-1):
        f=ImageFont.truetype(font,sz*S)
        if f.getlength(txt)<=maxw*S and sz*cap<=maxh:return f,sz
    return f,sz
def masks(items,col_stroke,size):
    mf=Image.new("L",(size*S,size*S),0);mo=Image.new("L",(size*S,size*S),0);df,do=ImageDraw.Draw(mf),ImageDraw.Draw(mo)
    for txt,cx,cy,maxw,maxh,font,kind in items:
        f,sz=fit(txt,maxw,maxh,font);w=f.getlength(txt);x=cx*S-w/2;sw=int(sz*S*(0.05 if kind=="n" else 0.045)) if col_stroke else 0
        df.text((x,cy*S),txt,font=f,fill=255,anchor="lm");do.text((x,cy*S),txt,font=f,fill=255,anchor="lm",stroke_width=sw,stroke_fill=255)
    f=lambda m:cv2.resize(np.array(m),(size,size),interpolation=cv2.INTER_AREA).astype(np.float32)/255
    return f(mf),f(mo)
def render(rgba,items,col,stroke,calm=False):
    size=rgba.shape[0];base=rgba[...,:3].astype(np.float32);al=rgba[...,3].astype(np.float32)/255
    num=any(k=="n" for *_,k in items)
    mf,mo=masks(items,stroke,size)
    g=cv2.cvtColor(rgba[...,:3],cv2.COLOR_RGB2GRAY).astype(np.float32)
    # relevo/dobras do tecido: desloca a estampa de leve (≤1,2 px) acompanhando o gradiente da luz
    low=cv2.GaussianBlur(g,(0,0),6);gx=cv2.Sobel(low,cv2.CV_32F,1,0,ksize=3);gy=cv2.Sobel(low,cv2.CV_32F,0,1,ksize=3)
    sc=1.2/(np.percentile(np.hypot(gx,gy),99)+1e-3);X,Y=np.meshgrid(np.arange(size,dtype=np.float32),np.arange(size,dtype=np.float32))
    mx,my=X-gx*sc,Y-gy*sc;mf=cv2.remap(mf,mx,my,cv2.INTER_LINEAR);mo=cv2.remap(mo,mx,my,cv2.INTER_LINEAR)
    cover=np.maximum(mf,mo)*(al>0.5)
    if cover.sum()<1:return rgba
    # luz da camisa sob a estampa (sombras e brilhos) e trama
    # só as dobras/brilhos (luz local ÷ luz ampla, sem contar o fundo transparente): a cor do tecido não escurece a tinta
    nb=lambda k:cv2.GaussianBlur(g*al,(0,0),k)/(cv2.GaussianBlur(al,(0,0),k)+1e-3)
    shade=np.clip(nb(4)/(nb(26)+1e-3),0.86,1.13)[...,None]
    if calm:shade=1+(shade-1)*0.18   # camisa listrada/estampada: o desenho do tecido não pode virar listras na tinta
    tex=(g-cv2.GaussianBlur(g,(0,0),1.5))[...,None]*(0.25 if calm else 0.8)
    fill=hexrgb(col)[None,None,:]*shade+tex;edge=(hexrgb(stroke) if stroke else hexrgb(col))[None,None,:]*shade+tex
    ink=np.where((mo>mf+0.02)[...,None],edge,fill)
    if num:   # termocolante: bisel (luz de cima à esquerda) + borda interna mais escura
        h=cv2.GaussianBlur(mf,(0,0),1.1);bx=cv2.Sobel(h,cv2.CV_32F,1,0,ksize=3);by=cv2.Sobel(h,cv2.CV_32F,0,1,ksize=3)
        lit=-(bx+by)*0.5;ink=ink+lit[...,None]*70
        rim=np.clip(mf-cv2.GaussianBlur(mf,(0,0),1.8),0,1);ink=ink*(1-0.20*rim[...,None])
    # sombra de contato sob a estampa
    M=np.float32([[1,0,1.0],[0,1,1.6]]);sh=cv2.GaussianBlur(cv2.warpAffine(cover.astype(np.float32),M,(size,size)),(0,0),1.5)
    out=base*(1-sh[...,None]*(0.34 if num else 0.10)*(al[...,None]>0.5))
    a=np.clip(cover,0,1)[...,None]*(0.97 if num else 0.93)
    out=out*(1-a)+np.clip(ink,0,255)*a
    return np.dstack([np.clip(out,0,255),rgba[...,3]]).astype(np.uint8)
