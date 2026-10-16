'use strict';
// All effect silhouettes come from generated PNGs. Canvas compositing below
// only recolors their existing pixels; it never manufactures effect geometry.
window.ImageEffects = (() => {
  let assets = {}, pending;
  const tints = new Map(), masks = new Map(), BUDGET = 16 * 1024 * 1024;
  let bytes = 0;
  async function load() {
    if (!pending) pending = (async () => {
      const base = '/assets/effects/common/';
      const response = await fetch(base + 'index.json');
      if (!response.ok) throw Error(base + 'index.json');
      const index = await response.json();
      const entries = await Promise.all(index.assets.map(async entry => {
        const r = await fetch(base + entry.manifest);
        if (!r.ok) throw Error(base + entry.manifest);
        const data = await r.json(), image = new Image();
        image.src = base + data.sheet;
        await image.decode();
        return [entry.id, { data, image }];
      }));
      assets = Object.fromEntries(entries);
    })().catch(error => { pending = undefined; throw error; });
    return pending;
  }
  function colored(id, color) {
    const asset = assets[id];
    if (!asset || !color) return asset?.image;
    const key = id + ':' + color;
    if (tints.has(key)) {
      const value = tints.get(key); tints.delete(key); tints.set(key, value); return value;
    }
    const image = new OffscreenCanvas(asset.image.width, asset.image.height), ctx = image.getContext('2d');
    ctx.drawImage(asset.image, 0, 0);
    // Alpha is copied back from the generated image after multiplying its RGB.
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = color;
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(asset.image, 0, 0);
    const size = image.width * image.height * 4;
    while (tints.size && bytes + size > BUDGET) {
      const first = tints.keys().next().value, old = tints.get(first);
      bytes -= old.width * old.height * 4; tints.delete(first);
    }
    if (size <= BUDGET) { tints.set(key, image); bytes += size; }
    return image;
  }
  function frameAt(data, time) {
    let clock = ((time % data.durationMs) + data.durationMs) % data.durationMs;
    for (const frame of data.frames) { if (clock < frame.durationMs) return frame; clock -= frame.durationMs; }
    return data.frames.at(-1);
  }
  function sprite(ctx, id, time, x, y, w, h = w, color = null, alpha = 1, angle = 0, blend = 'source-over') {
    const asset = assets[id];
    if (!asset || !(w > 0 && h > 0 && alpha > 0) || ![time,x,y,w,h,angle,alpha].every(Number.isFinite)) return;
    const f = frameAt(asset.data, time);
    ctx.save(); ctx.globalAlpha *= Math.min(1, alpha); ctx.globalCompositeOperation = blend;
    ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(angle);
    ctx.drawImage(colored(id, color), f.x, f.y, f.width, f.height, -w/2, -h/2, w, h);
    ctx.restore();
  }
  function mote(ctx, x, y, size, color, alpha = 1, time = 0) {
    sprite(ctx, 'mote', time, x, y, size, size, color, alpha);
  }
  function glow(ctx, x, y, radius, color, alpha = 1, time = 0) {
    sprite(ctx, 'aura', time, x, y, radius*2, radius*2, color, alpha, 0, 'screen');
  }
  function ring(ctx, time, x, y, rx, ry, color, alpha = 1, angle = 0) {
    sprite(ctx, 'ring', time, x, y, rx*2, ry*2, color, alpha, angle);
  }
  function link(ctx, from, to, color, alpha = 1, width = 12, time = 0, kind = 'streak') {
    const dx = to.x-from.x, dy = to.y-from.y, length = Math.hypot(dx,dy);
    if (length < .5) return;
    sprite(ctx, kind, time, (from.x+to.x)/2, (from.y+to.y)/2, length, width, color, alpha, Math.atan2(dy,dx));
  }
  function burst(ctx, x, y, age, count, color, spread = 1, alpha = 1) {
    const fade = Math.max(0,1-age/800)*alpha;
    for (let i=0;i<count;i++) {
      const a=i*2.399, r=(18+age*(.12+i%5*.05))*spread;
      mote(ctx,x+Math.cos(a)*r,y+Math.sin(a)*r*.55+age*age*.0001,8+i%3*3,Array.isArray(color)?color[i%color.length]:color,fade,age+i*83);
    }
  }
  function screen(ctx, color, alpha, time = 0) {
    // The oversize textured aura covers the viewport without a primitive fill.
    sprite(ctx,'aura',time,512,288,2400,1500,color,alpha);
  }
  function arc(ctx, time, x, y, rx, ry, start, end, color, alpha = 1, width = 14) {
    const count = Math.max(2,Math.ceil(Math.abs(end-start)*rx/36));
    for (let i=0;i<count;i++) {
      const a=start+(end-start)*i/count, b=start+(end-start)*(i+1)/count;
      link(ctx,{x:x+Math.cos(a)*rx,y:y+Math.sin(a)*ry},{x:x+Math.cos(b)*rx,y:y+Math.sin(b)*ry},color,alpha,width,time+i*21);
    }
  }
  function mask(ctx, x, y, w, h) {
    const asset=assets.aura; if (!asset) return;
    // Use the generated aura's alpha for the reflection aperture. No ellipse clip.
    if (!masks.has('aperture')) {
      const f=asset.data.frames[0], image=new OffscreenCanvas(f.width,f.height), paint=image.getContext('2d');
      paint.drawImage(asset.image,f.x,f.y,f.width,f.height,0,0,f.width,f.height);
      masks.set('aperture',image);
    }
    ctx.drawImage(masks.get('aperture'),x-w/2,y-h/2,w,h);
  }
  return {load,sprite,mote,glow,ring,link,burst,screen,arc,mask,cacheStats:()=>({entries:tints.size,bytes,budget:BUDGET})};
})();
