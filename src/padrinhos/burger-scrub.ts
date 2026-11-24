// Scroll-linked 82-frame burger sequence (ported from the Manus app.js). Browser-only.
export function startBurgerScrub(): () => void {
  const total = 82;
  const paths = Array.from({ length: total }, (_, i) => `/frames/frame-${String(i).padStart(3, "0")}.webp`);
  const imgs = paths.map((src) => { const im = new Image(); im.src = src; return im; });
  const hero = document.getElementById("burger-canvas") as HTMLCanvasElement | null;
  const scrub = document.getElementById("scrub-canvas") as HTMLCanvasElement | null;
  const counter = document.getElementById("frame-number");
  const track = document.getElementById("scrub-track");
  if (!hero || !scrub || !counter || !track) return () => {};
  const heroCtx = hero.getContext("2d")!, scrubCtx = scrub.getContext("2d")!;
  let frame = 0, raf = 0;
  const fit = (c: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
  };
  const draw = (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    if (!img?.complete || !img.naturalWidth) return;
    const s = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  };
  const render = () => {
    raf = 0;
    const rect = track.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
    const idx = Math.round(p * (total - 1));
    frame = idx;
    if (imgs[idx]?.complete) { const img = imgs[idx]!; draw(hero, heroCtx, img); draw(scrub, scrubCtx, img); }
    counter.textContent = String(idx + 1).padStart(2, "0");
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  const resize = () => { fit(hero); fit(scrub); schedule(); };
  imgs.forEach((im, i) => (im.onload = () => { if (i === 0 || i === frame) schedule(); }));
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", resize);
  resize();
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", resize);
    if (raf) cancelAnimationFrame(raf);
  };
}
