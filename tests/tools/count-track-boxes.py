import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('L'); w,h=im.size; px=im.load()
frac=float(sys.argv[2]) if len(sys.argv)>2 else 0.9
cols=[sum(1 for y in range(h) if px[x,y]<120) for x in range(w)]
def runs(thr):
    out=[];inr=False
    for x,d in enumerate(cols):
        if d>=thr and not inr: inr=True;s=x
        elif d<thr and inr: inr=False;out.append((s+x-1)//2)
    if inr: out.append((s+w-1)//2)
    return out
print("full-height (sections):", runs(h*frac))
print("half-height (boxes):", runs(h*0.35))
