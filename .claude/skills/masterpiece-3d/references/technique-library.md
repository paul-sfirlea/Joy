# Technique Library — CSP-safe recipes (tested)

All recipes are self-contained: no CDN, no external script. Canvas 2D + CSS 3D + hand-written WebGL only.
Every colour below is a placeholder — replace with tokens derived from the user's exact palette.
`--acc` = accent RGB triplet (e.g. `235,188,87`). Keep all ambient layers `opacity ≤ 0.14` under text.

## Effect catalog — pick by feeling (max 1–2 ambient systems per page)

| Feeling / subject | Ambient system | Per-scene hero |
|---|---|---|
| Premium, craft, spirits, Art-Deco | gold particle field + liquid ribbon | SVG line-art objects |
| Tech, fintech, futurist, "intelligence" | neural constellation (pulses on advance) | wireframe / HUD SVG |
| Wellness, organic, calm | gradient mesh + slow grain | soft blob / fluid SVG |
| Editorial, luxury fashion | grain + split-text + magnetic cursor | image with angle-mask |
| Data / systems | faint grid + drifting nodes | animated chart/diagram |

Always add: real brand corner/decor images as faint parallax layers + a vignette + optional film grain.

---

## 1. Gold particle field (sprite-based — NEVER shadowBlur per frame)
`shadowBlur` on every particle each frame froze scroll in testing. Pre-render one radial-gradient sprite per
colour and `drawImage` it. Cheap, glowy, 60fps.
```js
const cv=document.getElementById('stars'),ctx=cv.getContext('2d');
let W,H,DPR,parts;const COLORS=['255,231,170','235,188,87'];const sp={};
function sprite(rgb){if(sp[rgb])return sp[rgb];const S=48,c=document.createElement('canvas');c.width=c.height=S;
  const g=c.getContext('2d'),rg=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  rg.addColorStop(0,`rgba(${rgb},1)`);rg.addColorStop(.4,`rgba(${rgb},.5)`);rg.addColorStop(1,`rgba(${rgb},0)`);
  g.fillStyle=rg;g.fillRect(0,0,S,S);return sp[rgb]=c;}
COLORS.forEach(sprite);
function size(){DPR=Math.min(2,devicePixelRatio||1);W=cv.width=innerWidth*DPR;H=cv.height=innerHeight*DPR;
  cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
  const n=Math.round(Math.min(88,innerWidth*innerHeight/17000));
  parts=Array.from({length:n},()=>{const z=Math.random()*.8+.2;return{x:Math.random()*W,y:Math.random()*H,z,
    s:(Math.random()*7+3)*z*DPR,vx:(Math.random()-.5)*.14*z*DPR,vy:(-Math.random()*.2-.05)*z*DPR,
    a:Math.random()*.42+.13,c:COLORS[Math.random()*COLORS.length|0],tw:Math.random()*6.28};});}
size();addEventListener('resize',size,{passive:true});
(function tick(){if(pageVisible){ctx.clearRect(0,0,W,H);for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.tw+=.02;
  if(p.y<-20)p.y=H+20;if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;
  ctx.globalAlpha=p.a*(.55+.45*Math.sin(p.tw));ctx.drawImage(sprite(p.c),p.x-p.s/2,p.y-p.s/2,p.s,p.s);}
  ctx.globalAlpha=1;}requestAnimationFrame(tick);})();
```

## 2. Neural constellation (pulses on slide advance)
Nodes drift, connect under a distance threshold, flee the cursor. On advance a radial wave lights up links
from centre — the "neural connections that pulse". Cap ~56 nodes (O(n²)).
```js
// nodes:[{x,y,vx,vy}], LINK=Math.min(150,innerWidth*.11)*DPR, pulseT=-99
addEventListener('wc-pulse',e=>{pulseT=0;pulseBig=!!(e.detail&&e.detail.big);});
function drawNet(){ if(!(W>1)||!(H>1)||!nodes) return;            // GUARD — see gotchas
  for(const p of nodes){p.x+=p.vx;p.y+=p.vy;/* flee cursor within 80px */
    if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;}
  const cx=W/2,cy=H*0.42,on=pulseT>=0&&pulseT<1;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<LINK){let op=(1-d/LINK)*0.10;
      if(on){const md=Math.hypot((a.x+b.x)/2-cx,(a.y+b.y)/2-cy);
        const wave=Math.max(0,1-Math.abs(md-pulseT*Math.max(W,H)*.7)/(140*DPR));op=Math.min(.5,op+wave*.3);}
      if(op>.008){ctx.strokeStyle=`rgba(${ACC},${op})`;ctx.lineWidth=DPR;ctx.beginPath();
        ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}
  ctx.fillStyle=`rgba(${ACC},.55)`;for(const p of nodes){ctx.beginPath();ctx.arc(p.x,p.y,1.3*DPR,0,6.283);ctx.fill();}
  if(pulseT>=0){pulseT+=.018;if(pulseT>1)pulseT=-99;}
}
```
Fire the pulse from your `next()`/`go()`: `window.dispatchEvent(new CustomEvent('wc-pulse',{detail:{big:true}}))`.

## 3. Liquid-gold ribbon (flowing background band) — FIXED-STEP loop
Two Bézier-ish sine curves undulating slowly in the lower third. **Iterate a fixed segment count**, never
`x+=W/n` (if W=0 that's an infinite loop that freezes the renderer — this actually happened).
```js
function drawRibbon(t){ if(!(W>1)||!(H>1)) return;
  const SEG=44; ctx.lineWidth=2*DPR; ctx.lineCap='round';
  for(let k=0;k<2;k++){ctx.beginPath();const baseY=H*(.74+k*.10);
    for(let s=0;s<=SEG;s++){const x=W*s/SEG;                       // fixed step, safe
      const y=baseY+Math.sin(x*.0026+t*.00016*(k?1.3:1)+k*2)*H*.028;
      s===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.strokeStyle=`rgba(${ACC},${.05+k*.02})`;ctx.stroke();}}
```

## 4. SVG line-art hero — correct rotation (the amateur-vs-art difference)
Build hero objects (a product, a device, a scene) as real technical illustrations: correct geometry,
line-weight hierarchy (thick tubes ~3.4, thin details ~1.5), subtle glow, ground shadow, 3D tilt + float.
Generate dense repeated parts (spokes, teeth, holes) in JS, don't hand-write 40 lines.
```js
const mk=(t,a)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',t);for(k in a)e.setAttribute(k,a[k]);return e;};
const radial=(g,cx,cy,r0,r1,n,w,op)=>{for(let i=0;i<n;i++){const a=i/n*6.283,c=Math.cos(a),s=Math.sin(a);
  g.appendChild(mk('line',{x1:cx+r0*c,y1:cy+r0*s,x2:cx+r1*c,y2:cy+r1*s,stroke:'url(#grad)','stroke-width':w,opacity:op}));}};
```
**Rotation the reliable way:** on the spinning `<g>` use `transform-box:view-box; transform-origin:<cx>px <cy>px`
(explicit axle in viewBox units) + CSS `animation:rot 3s linear infinite`. `transform-box:fill-box` + `center`
wobbles when the group's bbox isn't centred on the axle (e.g. a crank hanging below). Always name the axle.
```css
@keyframes rot{to{transform:rotate(360deg)}}
.wheel{transform-box:view-box;transform-origin:128px 222px;animation:rot 2.9s linear infinite}
```
Use a shared gradient `<defs><linearGradient id="grad">…brand golds…</linearGradient></defs>` for all strokes.

## 5. 3D depth — tilt with LERP (no jitter)
Don't set transforms directly on `pointermove`. Store a target, ease toward it in a rAF loop, expose as CSS vars.
```js
let tmx=0,tmy=0,cmx=0,cmy=0;
addEventListener('pointermove',e=>{tmx=(e.clientX/innerWidth)*2-1;tmy=(e.clientY/innerHeight)*2-1;},{passive:true});
(function loop(){if(pageVisible){cmx+=(tmx-cmx)*.08;cmy+=(tmy-cmy)*.08;
  root.style.setProperty('--mx',cmx.toFixed(3));root.style.setProperty('--my',cmy.toFixed(3));}
  requestAnimationFrame(loop);})();
```
```css
.deck{perspective:1300px}
.hero{transform:rotateY(calc(var(--mx,0)*6deg)) rotateX(calc(var(--my,0)*-4deg));transition:transform .4s ease-out}
.corner-far{transform:translate3d(calc(var(--mx)*-15px),calc(var(--my)*-13px),0)}  /* farther layer moves more */
```

## 6. Slide transition flash + watermark breathe
```css
.flash{position:fixed;inset:0;z-index:3;pointer-events:none;background:radial-gradient(60% 50% at 50% 42%,rgba(var(--acc),.16),transparent 70%);opacity:0}
.flash.lit{animation:flashpulse .55s cubic-bezier(.16,1,.3,1)}
@keyframes flashpulse{0%{opacity:0}22%{opacity:1}100%{opacity:0}}
```
Trigger in `go()`: `flash.classList.remove('lit');void flash.offsetWidth;flash.classList.add('lit');`

## 7. Film grain (removes digital sterility — cheap, premium)
One tiling noise data-URI (or a tiny canvas noise), `mix-blend-mode:overlay`, opacity ~0.03, `pointer-events:none`,
fixed full-screen. Optional very slow drift. Instantly reads as "shot on film / expensive".

## 8. Real-icon ambient drift
Real brand icons (extracted), 6–8 small instances (`3–5vmin`), `opacity .05–.09`, drifting on the brand's 45°
axis, 50–70s per crossing, ±8° rotation. Feels like texture, not objects. Reduce to 3 on mobile.

## 9. Gradient mesh (soft futurist ground)
2–3 large `radial-gradient` blobs in accent tints on the dark ground, each animated on a long slow path
(30–50s) via `@keyframes` translating background-position. `mix-blend-mode:screen`. Very subtle.

## 10. Magnetic cursor / hover
On interactive controls, lerp the element toward the pointer within a radius; a custom ring cursor follows with
lerp. Keep it optional and off on touch. (User once asked to remove a plain follow-dot — make the cursor earn
its place or drop it.)

## Navigation patterns
- **Click-driven deck (live presentation):** slides stacked absolute, one `.active`; click / arrows advance;
  `.frag` elements reveal one-by-one before moving to the next slide (multi-box slides reveal on click). Fire a
  pulse on every advance.
- **Cinematic scroll (shared link):** `scroll-snap-type:y proximity` (proximity, not mandatory — gentler),
  `scroll-behavior:auto` for native wheel (JS smooth only for dot/keyboard nav), IntersectionObserver
  (`threshold~.38`) adds `.in` to reveal — add-only, never remove. Both: text reveals with
  `transition:opacity/transform .9s cubic-bezier(.16,1,.3,1)`, staggered delays.

## Typography for premium feel
Display = a condensed grotesque (Trade-Gothic/Oswald family) inline as woff2 data-URI; body = Helvetica/Arial
grotesque stack. Uppercase display + letter-spacing on labels. `text-wrap:balance` on headings.
