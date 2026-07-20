# Guardrails, Motion Psychology & the Quality Loop

## Motion-psychology thresholds (human-comfort budget)
Tuned so the page feels alive but never chaotic, dizzy, or distracting. Text always wins.

| Parameter | Value | Why |
|---|---|---|
| Ambient loop speed | 20–60 s / cycle | The background "breathes", it doesn't race. |
| Accent on advance | 0.6–1.2 s, once | A single deliberate beat per interaction. |
| Background opacity under text | ≤ 0.14 | Text stays the star; anything higher competes. |
| Background opacity at margins | ≤ 0.30 | A little more presence away from copy. |
| Simultaneous moving layers | max 2 + particles | More = chaos, "dizzy", loss of focus. |
| Easing (everywhere) | `cubic-bezier(.16,1,.3,1)` | One luxurious motion signature. |
| Parallax planes | 3 (far/mid/near) | Real depth without seasick amplitude. |
| Transition flash | ≤ 350 ms, opacity ≤ .12, once | Elegant "bar light", never a strobe. |
| Target FPS | ≥ 55 desktop / ≥ 30 mobile | Below this, cut density. |

**Vestibular safety:** no large, fast, full-field motion; no continuous spinning behind text; no strobe
(< 3 flashes/sec, keep flashes low-opacity). Motion should be peripheral and slow, focal and rare.
**Psychology:** things that pulse/flow on interaction reward the user and signal "alive & intelligent" — but
elements must not appear/disappear randomly (reads as broken). Enter smoothly, persist, leave smoothly.

## Performance & accessibility guardrails (ship every one)
- **`prefers-reduced-motion`**: kill all animation, keep a clean static premium layout (fade-only reveals).
  `@media (prefers-reduced-motion:reduce){*{animation:none!important} .rise{opacity:1;transform:none}}`
- **Pause on hidden tab**: `let pageVisible=true; document.addEventListener('visibilitychange',()=>pageVisible=!document.hidden);`
  then guard each rAF body with `if(pageVisible){…}`.
- **DPR cap**: `Math.min(2, devicePixelRatio||1)` — never render 3× on retina.
- **Mobile density**: fewer nodes/particles, ribbon off, 3 drift icons, hide nav dots, stack grids.
- **Keyboard + focus**: arrows/space advance; visible focus states; nav controls are real `<button>`s.
- **Wide content**: any table/code in an `overflow-x:auto` container so the page never scrolls sideways.

## Gotchas (learned the hard way — check every build)
1. **Infinite-loop freeze:** `for(x=0;x<=W;x+=W/n)` loops forever if `W===0` (preview panes report 0 on load) →
   freezes the renderer, then every navigation times out. **Use a fixed segment count** (`for(s=0;s<=SEG;s++)`)
   and guard `if(!(W>1)||!(H>1))return` at the top of every draw fn.
2. **`shadowBlur` per frame** on many shapes tanks FPS/freezes scroll → use pre-rendered sprites.
3. **SVG rotation wobble:** `transform-box:fill-box;transform-origin:center` rotates around the group's bbox
   centre, which drifts if the group has asymmetric parts → use `transform-box:view-box;transform-origin:<axle>px`.
4. **Charset mojibake:** em-dash / `·` render as `â€"` if charset missing → add `<meta charset="utf-8">` first.
5. **`height:auto` SVG collapses** without a `viewBox` on the outer `<svg>` → always set the viewBox.
6. **Flex-item text break:** a `<b>` inside a flex `<li>` becomes its own flex item and columns weirdly →
   use `position:relative;padding-left` + `::before` marker so text flows inline.
7. **Reveal gated too high:** IntersectionObserver `threshold:.55` leaves content blank mid-scroll → use ~.38.
8. **Scroll-snap `mandatory` + `scroll-behavior:smooth`** fight and feel laggy → `proximity` + native wheel.

## The Quality Loop (Faza 6 — this is where the art happens)
Never ship the first version. Loop until it clears the gallery bar.

**Round shape:**
1. **Premortem / stress-test.** Ask, ruthlessly: *what makes THIS version look amateur, tiring, or broken?*
   Common failure modes: clipped/recreated logo · schematic (not detailed) hero art · motion too fast/large ·
   text hard to read over background · jitter (un-lerped) · low FPS · > 2 layers moving at once · an effect
   that pulls the eye off the copy · random appear/disappear · charset/gotcha bugs above. List every defect.
2. **10x lens.** Which single lens has the most headroom now — *more elegant, more coherent, more restrained,
   more "expensive"?* Push there, not everywhere. Restraint usually beats addition.
3. **Regenerate only what failed.** Keep what works; fix the weakest link. Repeat.
4. **Verify visually in the browser.** Screenshot EACH scene. Confirm: text fully legible on every one · a
   distinct living element per scene · zero console errors · animations running · FPS fine · reduced-motion
   path clean. A hung/degraded preview renderer times out — open a fresh tab; test an external URL first to
   confirm the tool is healthy before blaming your file.
5. Only a version that clears the checklist below leaves the loop.

## Gallery-grade checklist (the gate)
- [ ] Requested colourway preserved EXACTLY; nothing off-palette.
- [ ] Real brand assets, verified un-clipped; nothing recreated by hand.
- [ ] Text fully legible on every single scene (screenshot-checked).
- [ ] A distinct living element per scene; nothing feels repeated.
- [ ] Motion calm: ≤ 2 moving layers + particles, ambient slow, accent rare.
- [ ] Self-contained: zero CDN, all assets/fonts inline; file ≤ ~1.2MB.
- [ ] `prefers-reduced-motion` + hidden-tab pause + mobile density all handled.
- [ ] Zero console errors; ≥ 55 FPS desktop.
- [ ] No gotcha bugs (fixed-step loops, guards, charset, viewBox).
- [ ] It looks like a work of art, not just clean — and the writing is still the star.

If any box is unchecked, it hasn't left the loop yet.
