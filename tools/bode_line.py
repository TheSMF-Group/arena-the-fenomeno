# Contorno preto do bode do The Fenômeno (só linhas): bordas entre as áreas de cor + silhueta. Saída: tools/bode-contorno.png (preto com alfa).
import cv2, numpy as np
im=cv2.imread("src/assets/adc95b0ba.webp",cv2.IMREAD_UNCHANGED)
K=6;im=cv2.resize(im,None,fx=K,fy=K,interpolation=cv2.INTER_CUBIC)
rgb=cv2.GaussianBlur(im[...,:3],(0,0),3);al=(cv2.GaussianBlur(im[...,3],(0,0),2)>128).astype(np.uint8)
Z=rgb.reshape(-1,3).astype(np.float32);crit=(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,30,0.5)
_,lab,_=cv2.kmeans(Z,10,None,crit,3,cv2.KMEANS_PP_CENTERS);lab=lab.reshape(rgb.shape[:2]).astype(np.uint8)
lab=cv2.medianBlur(lab,17)
edge=np.zeros(lab.shape,np.uint8)
for dx,dy in ((1,0),(0,1)):
    d=np.roll(lab,(-dy,-dx),(0,1))!=lab;edge|=d.astype(np.uint8)
edge=cv2.bitwise_and(edge,al)
sil=cv2.morphologyEx(al,cv2.MORPH_GRADIENT,np.ones((3,3),np.uint8))
line=cv2.dilate(np.maximum(edge,sil)*255,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
n,l,st,_=cv2.connectedComponentsWithStats(line);keep=np.zeros_like(line)
for i in range(1,n):
    if st[i,4]>1800:keep[l==i]=255
keep=cv2.GaussianBlur(keep,(0,0),2)
out=np.zeros((*keep.shape,4),np.uint8);out[...,3]=keep
ys,xs=np.where(keep>40);out=out[ys.min():ys.max()+1,xs.min():xs.max()+1]
cv2.imwrite("tools/bode-contorno.png",out);print(out.shape)
