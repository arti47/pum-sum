import re, json, sys
import xml.etree.ElementTree as ET
NS='{http://www.w3.org/1999/xhtml}'

root = ET.parse('gum.xml').getroot()
pages = []
for page in root.iter(NS+'page'):
    ws=[(float(w.get('yMax')),float(w.get('yMin')),float(w.get('xMin')),float(w.get('xMax')),(w.text or '')) for w in page.iter(NS+'word')]
    ws.sort()
    rows=[]
    for w in ws:
        if rows and abs(w[0]-rows[-1][0])<7: rows[-1][1].append(w)
        else: rows.append([w[0],[w]])
    out=[]
    for y,cur in rows:
        cur.sort(key=lambda t:t[2])
        # split a visual row into runs separated by a large x gap (the column break)
        runs=[]; s=''; startx=None; prev=None
        for (ym,yn,x0,x1,t) in cur:
            if prev is None: s=t; startx=x0
            else:
                g=x0-prev
                if g<1.5: s+=t
                elif g<12: s+=' '+t
                else:
                    runs.append((startx,y,s)); s=t; startx=x0
            prev=x1
        if s: runs.append((startx,y,s))
        out.extend(runs)
    pages.append(out)

def numbered(s):
    m=re.match(r'^(\d{1,3})\.\s+(.*)$', s.strip())
    if not m: return None
    return int(m.group(1)), m.group(2).strip()

def parse_page(runs):
    entries=[]; headers=[]
    for (x,y,s) in runs:
        n=numbered(s)
        if n: entries.append({'x':x,'y':y,'n':n[0],'t':n[1]})
        else:
            st=s.strip()
            if st and not re.match(r'^Game Unfolding Machine', st) and len(st)<60:
                headers.append({'x':x,'y':y,'s':st})
    # cluster entries by x band
    bands=[]
    for e in sorted(entries,key=lambda e:e['x']):
        placed=False
        for b in bands:
            if abs(b['x']-e['x'])<=18: b['items'].append(e); b['x']=(b['x']*len(b['items'])+e['x'])/(len(b['items'])+1); placed=True; break
        if not placed: bands.append({'x':e['x'],'items':[e]})
    tables=[]
    for b in bands:
        items=sorted(b['items'], key=lambda e:e['y'])
        cur=[]
        for e in items:
            if cur and e['n']==1: tables.append(cur); cur=[]
            cur.append(e)
        if cur: tables.append(cur)
    # name each table from the nearest header above-ish in the same x band
    named=[]
    for t in tables:
        x0=min(e['x'] for e in t); y0=min(e['y'] for e in t)
        best=None; bestd=None
        for h in headers:
            if h['y'] > y0 + 4: continue
            d=abs(h['x']-x0)*1.0 + (y0-h['y'])*0.55
            if bestd is None or d<bestd: bestd=d; best=h
        named.append({'name':best['s'] if best else '?','x':x0,'y':y0,
                      'rows':[e['t'] for e in sorted(t,key=lambda e:e['n'])],
                      'nums':[e['n'] for e in sorted(t,key=lambda e:e['n'])]})
    return named

allt=[]
for i,runs in enumerate(pages,1):
    if i<4 or i>24: continue
    for t in parse_page(runs):
        t['page']=i
        allt.append(t)

for t in allt:
    ok = t['nums']==list(range(1,len(t['nums'])+1))
    print(f"p{t['page']:>2} x{t['x']:>4.0f}  {len(t['rows']):>3} rows  {'OK ' if ok else 'GAP'}  {t['name'][:45]}")
json.dump(allt, open('gum_tables.json','w'), indent=1)
print("\ntotal tables:", len(allt), " total rows:", sum(len(t['rows']) for t in allt))
