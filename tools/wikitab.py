"""Leitura simples de tabelas wikitext da Wikipédia (jogador e números)."""
import re
def clean(s):
    s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    s=re.sub(r'<ref[^>/]*/>','',s)
    s=re.sub(r'<ref[^>]*>.*?</ref>','',s,flags=re.S)
    for _ in range(4):
        s=re.sub(r'\{\{(?:efn|refn|sfn|Efn|cn|citation needed|Tooltip|abbr|Abbr)[^{}]*\}\}','',s)
    s=re.sub(r'\{\{(?:sort ?name|sortname|Sortname|Sort name)\|([^|}]*)\|([^|}]*)[^}]*\}\}',lambda m:m.group(1)+' '+m.group(2),s,flags=re.I)
    return s
def tables(text):
    text=clean(text);out=[]
    for m in re.finditer(r'\{\|(.*?)\n\|\}',text,re.S):
        body=m.group(1);rows=[];hdr=[]
        parts=re.split(r'\n\|-[^\n]*',body)
        for ri,part in enumerate(parts):
            cells=[]
            for line in part.split('\n'):
                if line.startswith('!'):
                    for c in re.split(r'!!|\|\|',line[1:]):cells.append(('h',c))
                elif line.startswith('|') and not line.startswith('|+') and not line.startswith('|}'):
                    for c in line[1:].split('||'):cells.append(('d',c))
                elif cells and line.strip():
                    k,c=cells[-1];cells[-1]=(k,c+' '+line)
            if not cells:continue
            def val(c):
                c=c.strip()
                if '|' in c and not c.startswith('[[') and not c.startswith('{{'):
                    c=c.split('|')[-1] if not re.match(r'^\[\[',c) else c
                return c.strip()
            if all(k=='h' for k,_ in cells):hdr=[re.sub(r'\[\[|\]\]','',val(c)) for _,c in cells]
            else:rows.append([val(c) for _,c in cells])
        out.append({'hdr':hdr,'rows':rows})
    return out
def plain(s):
    s=re.sub(r"'''?",'',s);s=re.sub(r'\{\{[^{}]*\}\}','',s)
    s=re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]',r'\1',s);return re.sub(r'\s+',' ',s).strip()
def link_name(s):
    """nome do jogador: primeiro link wiki (alvo, sem parênteses) ou texto limpo"""
    m=re.search(r'\[\[(?!File:|Image:)([^\]|#]+)(?:\|([^\]]*))?\]\]',s)
    if m:
        t=m.group(1);d=m.group(2)
        return re.sub(r'\s*\(.*?\)','',t).strip(), (d or t)
    p=plain(s);return p,p
def num(s):
    m=re.search(r'\d[\d,]*',plain(s).replace(' ',''));return int(m.group(0).replace(',','')) if m else None
