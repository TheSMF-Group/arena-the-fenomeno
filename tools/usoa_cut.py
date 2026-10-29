# Recorta as fotos de costas baixadas do usoa10 (fundo -> transparente) e centraliza em 420x420.
# Uso: python3 tools/usoa_cut.py <pasta com as fotos> <pasta de saída>
import cv2, numpy as np, sys, json, os
SRC,OUT=sys.argv[1],sys.argv[2];os.makedirs(OUT,exist_ok=True)
PICK={"flamengo":"flamengo/5","real-madrid":"real-madrid/7","palmeiras":"palmeiras/1","barcelona":"barcelona/1","corinthians":"corinthians/2","man-utd":"man-utd/5","sao-paulo":"sao-paulo/1","liverpool":"liverpool/1","santos":"santos/2","bayern":"bayern/1","juventus":"juventus/1","ac-milan":"ac-milan/1","psg":"psg/5","vasco":"vasco_1/1","chelsea":"chelsea/3","botafogo":"botafogo/5","arsenal":"arsenal/3","cruzeiro":"cruzeiro/1","dortmund":"dortmund/1"}
WHITE={"ac-milan","real-madrid","santos","sao-paulo","corinthians","juventus","botafogo","flamengo"}
def cut_white(im):
    h,w=im.shape[:2];fl=im.copy();ff=np.zeros((h+2,w+2),np.uint8)
    for sx,sy in [(1,1),(w-2,1),(1,h-2),(w-2,h-2)]:
        cv2.floodFill(fl,ff,(sx,sy),(0,0,0),(5,5,5),(5,5,5),cv2.FLOODFILL_MASK_ONLY|cv2.FLOODFILL_FIXED_RANGE|(255<<8))
    m=np.where(ff[1:-1,1:-1]>0,0,255).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    if n>1:m=np.where(lab==1+np.argmax(st[1:,4]),255,0).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
    cnt,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);f=np.zeros_like(m);cv2.drawContours(f,cnt,-1,255,-1)
    return cv2.GaussianBlur(cv2.erode(f,np.ones((3,3),np.uint8)),(0,0),1.1)
def cut(im):
    h,w=im.shape[:2];mask=np.full((h,w),cv2.GC_PR_BGD,np.uint8)
    mask[int(h*.04):int(h*.96),int(w*.06):int(w*.94)]=cv2.GC_PR_FGD
    mask[int(h*.3):int(h*.75),int(w*.3):int(w*.7)]=cv2.GC_FGD
    # fundo branco ligado à borda
    fl=im.copy();ff=np.zeros((h+2,w+2),np.uint8);bgm=np.zeros((h,w),np.uint8)
    for sx,sy in [(2,2),(w-3,2),(2,h-3),(w-3,h-3),(w//2,2),(w//2,h-3),(2,h//2),(w-3,h//2)]:
        if im[sy,sx].min()>235:
            ff[:]=0;cv2.floodFill(fl,ff,(sx,sy),(0,0,0),(7,7,7),(7,7,7),cv2.FLOODFILL_MASK_ONLY|(255<<8));bgm|=ff[1:-1,1:-1]
    mask[bgm>0]=cv2.GC_BGD
    bg=np.zeros((1,65));fg=np.zeros((1,65))
    cv2.grabCut(im,mask,None,bg,fg,6,cv2.GC_INIT_WITH_MASK)
    m=np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m);
    if n>1:m=np.where(lab==1+np.argmax(st[1:,4]),255,0).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8));m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    cnt,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);f=np.zeros_like(m);cv2.drawContours(f,cnt,-1,255,-1)
    f=cv2.erode(f,np.ones((3,3),np.uint8));return cv2.GaussianBlur(f,(0,0),1.1)
for k,p in PICK.items():
    im=cv2.imread(f"{SRC}/{p}.webp")
    if im is None:print("sem",k);continue
    a=cut_white(im) if k in WHITE else cut(im)
    if k=="man-utd":
        hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV);keep=((hsv[...,1]>70)|(hsv[...,2]<80)).astype(np.uint8)*255;keep=cv2.morphologyEx(keep,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8));a=cv2.bitwise_and(a,keep)
    ys,xs=np.where(a>128);x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
    rgba=np.dstack([im,a])[y0:y1+1,x0:x1+1];h,w=rgba.shape[:2];s=408/max(h,w)
    rgba=cv2.resize(rgba,(max(1,int(w*s)),max(1,int(h*s))),interpolation=cv2.INTER_AREA)
    c=np.zeros((420,420,4),np.uint8);oy=(420-rgba.shape[0])//2;ox=(420-rgba.shape[1])//2;c[oy:oy+rgba.shape[0],ox:ox+rgba.shape[1]]=rgba
    cv2.imwrite(f"{OUT}/{k}.png",c);print(k)
