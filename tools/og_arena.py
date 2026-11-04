import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
R="/Users/leomoutinho/Documents/central-mini-games-tf-astro/"
BEB="/System/Library/PrivateFrameworks/FontServices.framework/Versions/A/Resources/Fonts/ApplicationSupport/BebasNeue.otf"
INTER="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
W,H=1200,630
bg=Image.new("RGB",(W,H),(8,12,10))
# degradê verde escuro -> preto, como o site
g=Image.new("RGB",(W,H));px=g.load()
for y in range(H):
    for x in range(W):
        t=min(1,max(0,(x*.5+y*.9)/(W*.5+H*.9)));px[x,y]=(int(10*(1-t)+6*t),int(34*(1-t)+9*t),int(22*(1-t)+8*t))
bg=g
d=ImageDraw.Draw(bg,"RGBA")
for k in range(-H,W,34):d.line([(k,H),(k+H,0)],fill=(255,255,255,9),width=2)   # listras diagonais do fundo do site
# brilho amarelo atrás das camisas
gl=Image.new("RGBA",(W,H),(0,0,0,0));ImageDraw.Draw(gl).ellipse([640,40,1220,620],fill=(255,210,31,60));gl=gl.filter(ImageFilter.GaussianBlur(90));bg=Image.alpha_composite(bg.convert("RGBA"),gl)
# camisas em leque (as mesmas do Vestiário)
kits=["real-madrid","flamengo","barcelona","man-utd","palmeiras","fluminense"]
pos=[(700,330,-14,300),(860,250,-6,320),(1020,330,10,300),(760,470,-8,250),(930,470,6,260),(1090,160,12,210)]
pos=[(760,200,-12,270),(900,160,-4,300),(1040,205,9,270),(810,415,-7,245),(950,410,3,255),(1085,415,10,235)]
for slug,(cx,cy,rot,sz) in zip(kits,pos):
    im=Image.open(R+"src/assets/kit-%s.webp"%slug).convert("RGBA");bb=im.getbbox();im=im.crop(bb);s=sz/max(im.size);im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    sh=Image.new("RGBA",im.size,(0,0,0,0));sh.putalpha(im.getchannel("A").point(lambda v:int(v*.55)));sh=sh.filter(ImageFilter.GaussianBlur(10))
    im=im.rotate(rot,expand=True,resample=Image.BICUBIC);sh=sh.rotate(rot,expand=True,resample=Image.BICUBIC)
    bg.alpha_composite(sh,(int(cx-im.width/2+8),int(cy-im.height/2+14)));bg.alpha_composite(im,(int(cx-im.width/2),int(cy-im.height/2)))
# degradê escuro à esquerda para o texto ler bem
ov=Image.new("RGBA",(W,H),(0,0,0,0));od=ImageDraw.Draw(ov)
for x in range(0,720):od.line([(x,0),(x,H)],fill=(6,9,8,int(235*(1-x/720)**1.2)))
bg.alpha_composite(ov)
d=ImageDraw.Draw(bg)
F=lambda s:ImageFont.truetype(BEB,s)
# logo do bode + título
logo=Image.open(R+"src/assets/bdc95b0ba.webp").convert("RGBA");logo.thumbnail((88,88),Image.LANCZOS);bg.alpha_composite(logo,(64,56))
d.text((166,74),"MINI GAMES DE FUTEBOL",font=F(34),fill=(93,214,150))
d.text((60,128),"ARENA",font=F(250),fill=(244,246,239))
d.text((60,338),"THE FENÔMENO",font=F(128),fill=(255,210,31))
# chips com os jogos
x,y=64,490
for t in ["22 JOGOS","DESAFIOS TODO DIA","MULTIPLAYER"]:
    w=d.textlength(t,font=F(28))+36;d.rounded_rectangle([x,y,x+w,y+44],radius=22,outline=(255,210,31),width=2,fill=(40,34,8));d.text((x+18,y+6),t,font=F(28),fill=(255,210,31));x+=w+12
d.text((64,556),"JOGUE.THEFENOMENO.COM",font=F(40),fill=(93,214,150))
bg.convert("RGB").save(sys.argv[1],optimize=True)
