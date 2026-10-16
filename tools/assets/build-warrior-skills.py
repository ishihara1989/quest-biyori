"""Package generated PNG atlases; preserve RGBA, crop cells, nearest sampling only."""
from pathlib import Path
from PIL import Image
import json, shutil
from array import array

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'public/assets/skills/warrior'
DEV = ROOT / 'development/assets/skills/warrior'
records = json.loads((ROOT / 'development/records/warrior-generation.json').read_text(encoding='utf-8'))
ids = ['renjin','moon','fang','return','rings','zflash','pierce','rise','running','cross','hundred','earth','six','sphere','crater','eight','divide','invisible','tornado','worldcross','ultimate']
(DEV / 'source').mkdir(parents=True, exist_ok=True)
(DEST / 'icons').mkdir(exist_ok=True)
prompts = []

def unpack_icons(image):
    # Separate the 21 visible subjects rather than slicing through hilts that
    # crossed the atlas row boundary. Copy generated RGBA without recoloring.
    w,h = image.size
    alpha = image.getchannel('A').tobytes()
    labels = array('i',[-1]) * (w*h)
    parts = []
    for seed,a in enumerate(alpha):
        if a < 40 or labels[seed] >= 0: continue
        group = len(parts)
        queue = [seed]
        labels[seed] = group
        count = 0
        left=right=seed%w
        top=bottom=seed//w
        while queue:
            p=queue.pop()
            x,y=p%w,p//w
            count+=1
            left=min(left,x);right=max(right,x);top=min(top,y);bottom=max(bottom,y)
            for n in (p-1 if x else -1,p+1 if x<w-1 else -1,p-w if y else -1,p+w if y<h-1 else -1):
                if n>=0 and labels[n]<0 and alpha[n]>=40:
                    labels[n]=group
                    queue.append(n)
        parts.append((count,(left,top,right,bottom)))
    cores=[(i,box) for i,(count,box) in enumerate(parts) if count>10000]
    if len(cores)!=21: raise ValueError('Expected 21 distinct icon subjects')
    owners={}
    centers={}
    for group,(l,t,r,b) in cores:
        x,y=(l+r)/2,(t+b)/2
        owner=min(6,int(x/w*7))+7*min(2,int(y/h*3))
        owners[group]=owner
        centers[owner]=(x,y)
    if len(centers)!=21: raise ValueError('Icon ordering is ambiguous')
    small_owners={}
    for group,(_,box) in enumerate(parts):
        if group in owners: continue
        x,y=(box[0]+box[2])/2,(box[1]+box[3])/2
        small_owners[group]=min(centers,key=lambda i:(x-centers[i][0])**2+(y-centers[i][1])**2)
    bounds=[[w,h,0,0] for _ in range(21)]
    assignments=array('i',[-1])*(w*h)
    for p,a in enumerate(alpha):
        if not a: continue
        x,y=p%w,p//w
        group=labels[p]
        owner=owners.get(group,small_owners.get(group))
        if owner is None: owner=min(centers,key=lambda i:(x-centers[i][0])**2+(y-centers[i][1])**2)
        assignments[p]=owner
        box=bounds[owner]
        box[0]=min(box[0],x);box[1]=min(box[1],y);box[2]=max(box[2],x);box[3]=max(box[3],y)
    source=image.tobytes()
    result=[]
    for owner,(l,t,r,b) in enumerate(bounds):
        cw,ch=r-l+1,b-t+1
        rgba=bytearray(cw*ch*4)
        for y in range(t,b+1):
            for x in range(l,r+1):
                p=y*w+x
                if assignments[p]==owner:
                    offset=((y-t)*cw+x-l)*4
                    rgba[offset:offset+4]=source[p*4:p*4+4]
        cell=Image.frombytes('RGBA',(cw,ch),bytes(rgba))
        cell.thumbnail((112,112),Image.Resampling.NEAREST)
        output=Image.new('RGBA',(128,128))
        output.alpha_composite(cell,((128-cell.width)//2,(128-cell.height)//2))
        result.append(output)
    return result

for key, record in records.items():
    source = Path(record['source'])
    target = DEV / 'source' / (key + '-generated-v'+str(record.get('version',1))+'.png')
    if source.exists(): shutil.copyfile(source, target)
    image = Image.open(target).convert('RGBA')
    prompts.append('## ' + key + '\n\n' + record['prompt'])
    if key == 'icons':
        icons=unpack_icons(image)
        review=Image.new('RGBA',(7*128,3*128),(28,38,32,255))
        for i,icon in enumerate(icons):
            icon.save(DEST/'icons'/(ids[i]+'.png'))
            review.alpha_composite(icon,((i%7)*128,(i//7)*128))
        (DEV/'icons').mkdir(parents=True, exist_ok=True)
        review.convert('RGB').save(DEV/'icons'/'review.png')
        continue
    cols, rows = (7, 3) if key == 'icons' else (2, 2)
    frames = []
    for i in range(cols * rows):
        x, y = i % cols, i // cols
        cell = image.crop((round(x * image.width / cols), round(y * image.height / rows), round((x+1) * image.width / cols), round((y+1) * image.height / rows)))
        size = 128 if key == 'icons' else 256
        output = Image.new('RGBA', (size,size))
        if key == 'impact':
            # Generated shockwaves crossed their nominal cell boundary. These
            # source rectangles contain the whole pose; one shared scale and
            # explicit contact anchors preserve impact registration.
            rects = [(0,0,680,480),(680,0,1536,480),(0,480,800,1024),(800,480,1536,1024)]
            anchors = [(390,374),(1135,374),(390,840),(1135,840)]
            rect = rects[i]
            cell = image.crop(rect)
            scale = .27
            cell = cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.NEAREST)
            anchor = anchors[i]
            output.alpha_composite(cell, (round(128-(anchor[0]-rect[0])*scale),round(170-(anchor[1]-rect[1])*scale)))
        else:
            cell.thumbnail((size-16,size-16), Image.Resampling.NEAREST)
            output.alpha_composite(cell, ((size-cell.width)//2,(size-cell.height)//2))
        if key == 'icons':
            output.save(DEST / 'icons' / (ids[i]+'.png'))
        else:
            frames.append(output)
    if key != 'icons':
        directory = DEST / 'effects' / key
        directory.mkdir(parents=True, exist_ok=True)
        sheet = Image.new('RGBA',(1024,256))
        for i,f in enumerate(frames):
            sheet.alpha_composite(f,(i*256,0))
            f.save(directory / ('frame-'+str(i+1)+'.png'))
        sheet.save(directory / (key+'.png'))
        manifest = dict(version=1,id=key,sheet=key+'.png',frameWidth=256,frameHeight=256,frameCount=4,width=1024,height=256,columns=4,rows=1,durationMs=400,loop=False,pivot=dict(x=128,y=170 if key in ['impact','fissure','ring'] else 128),sampling='nearest-neighbor',generation='built-in image_gen; 4 frames in 2x2; preserve generated alpha',frames=[dict(index=i,x=i*256,y=0,width=256,height=256,durationMs=100) for i in range(4)])
        manifest['frameSequence'] = [0,1,2,3]
        (directory / 'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
        # A contact sheet with checkerboard makes transparency and clipping reviewable.
        qa = Image.new('RGBA',(1024,256),(28,38,32,255))
        for x in range(0,1024,16):
            for y in range(0,256,16):
                if (x//16+y//16)%2: qa.paste((43,53,46,255),(x,y,x+16,y+16))
        qa.alpha_composite(sheet)
        (DEV/'effects'/key).mkdir(parents=True, exist_ok=True)
        qa.convert('RGB').save(DEV/'effects'/key/'review.png')
        frames[0].save(DEV/'effects'/key/'preview.gif',save_all=True,append_images=frames[1:],duration=100,loop=0,disposal=2)
(DEV/'PROMPT.md').write_text('# Warrior skill assets\n\nGenerated using built-in image_gen. Source atlases preserved.\n\n'+'\n\n'.join(prompts),encoding='utf-8')
print('Packaged 21 icons and 6 four-frame effects:',DEST)
