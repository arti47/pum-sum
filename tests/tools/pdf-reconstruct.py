import sys, xml.etree.ElementTree as ET
NS='{http://www.w3.org/1999/xhtml}'
def recon(xmlfile,out,tol):
    root=ET.parse(xmlfile).getroot(); lines=[]
    for pi,page in enumerate(root.iter(NS+'page'),1):
        ws=[(float(w.get('yMax')),float(w.get('xMin')),float(w.get('xMax')),(w.text or '')) for w in page.iter(NS+'word')]
        ws.sort(); lines.append(f"\n########## PAGE {pi} ##########")
        rows=[]
        for w in ws:
            if rows and abs(w[0]-rows[-1][0])<tol: rows[-1][1].append(w)
            else: rows.append([w[0],[w]])
        for y,cur in rows:
            cur.sort(key=lambda t:t[1]); s='';prev=None
            for (yy,x0,x1,t) in cur:
                if prev is None: s=f"[{x0:.0f}] "+t
                else:
                    g=x0-prev
                    if g<1.5: s+=t
                    elif g<12: s+=' '+t
                    else: s+=f"   ||[{x0:.0f}] "+t
                prev=x1
            lines.append(s)
    open(out,'w').write('\n'.join(lines)); print(out,'ok')
recon(sys.argv[1],sys.argv[2],float(sys.argv[3]))
