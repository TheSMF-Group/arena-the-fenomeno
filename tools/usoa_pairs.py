# Recorta frente e costas (fotos planas do usoa10, mesmo enquadramento) com o MESMO recorte/escala, para ficarem do mesmo tamanho.
# Uso: python3 tools/usoa_pairs.py <pasta com <clube>/0.webp (frente) e 1.webp (costas)> <pasta de saída>
import cv2, numpy as np, sys, os
SRC,OUT=sys.argv[1],sys.argv[2];os.makedirs(OUT,exist_ok=True)
def mask(im):
    h,w=im.shape[:2];fl=im.copy();ff=np.zeros((h+2,w+2),np.uint8)
    for sx,sy in [(1,1),(w-2,1),(1,h-2),(w-2,h-2),(w//2,1),(w//2,h-2),(1,h//2),(w-2,h//2)]:
        if im[sy,sx].min()>235:cv2.floodFill(fl,ff,(sx,sy),(0,0,0),(5,5,5),(5,5,5),cv2.FLOODFILL_MASK_ONLY|cv2.FLOODFILL_FIXED_RANGE|(255<<8))
    m=np.where(ff[1:-1,1:-1]>0,0,255).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    if n>1:m=np.where(lab==1+np.argmax(st[1:,4]),255,0).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
    cnt,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);f=np.zeros_like(m);cv2.drawContours(f,cnt,-1,255,-1)
    return cv2.GaussianBlur(cv2.erode(f,np.ones((3,3),np.uint8)),(0,0),1.1)
HANGER={"botafogo"}   # costas fotografadas num cabide: tira a madeira do recorte
def no_hanger(im,m):
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV);ys,xs=np.where(m>128);y0,y1=ys.min(),ys.max()
    hang=((hsv[...,0]>=6)&(hsv[...,0]<=24)&(hsv[...,1]>70)&(hsv[...,2]>45)).astype(np.uint8)*255;hang[int(y0+(y1-y0)*.3):]=0;hang=cv2.dilate(hang,np.ones((7,7),np.uint8))
    m2=cv2.bitwise_and(m,cv2.bitwise_not(hang));cl=cv2.morphologyEx((m2>128).astype(np.uint8)*255,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))
    fill=cv2.bitwise_and(cl,cv2.bitwise_not((m2>128).astype(np.uint8)*255));ink=cv2.inpaint(im,cv2.dilate(fill,np.ones((3,3),np.uint8)),7,cv2.INPAINT_TELEA);im=im.copy();im[fill>0]=ink[fill>0]
    return im,cv2.GaussianBlur(cl,(0,0),1.0)
for club in sorted(os.listdir(SRC)):
    ims=[cv2.imread(f"{SRC}/{club}/{i}.webp") for i in (0,1)]
    if any(x is None for x in ims):continue
    ims=[cv2.resize(x,(1024,1024)) if x.shape[:2]!=(1024,1024) else x for x in ims]
    ms=[mask(x) for x in ims]
    if club in HANGER:ims[1],ms[1]=no_hanger(ims[1],ms[1])
    allm=np.maximum(ms[0],ms[1]);ys,xs=np.where(allm>128)
    x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max();s=404/max(y1-y0+1,x1-x0+1)
    for tag,im,m in zip("fb",ims,ms):
        rgba=np.dstack([im,m])[y0:y1+1,x0:x1+1];rgba=cv2.resize(rgba,(max(1,int(rgba.shape[1]*s)),max(1,int(rgba.shape[0]*s))),interpolation=cv2.INTER_AREA)
        c=np.zeros((420,420,4),np.uint8);oy=(420-rgba.shape[0])//2;ox=(420-rgba.shape[1])//2;c[oy:oy+rgba.shape[0],ox:ox+rgba.shape[1]]=rgba
        cv2.imwrite(f"{OUT}/{club}_{tag}.png",c)
    print(club)
