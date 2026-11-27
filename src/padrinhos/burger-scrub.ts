// Scroll-linked hero animation rendered from the extracted/interpolated frame sequence.
// The 80-frame WebP sequence is 50 fps and ends at the source frame at ~1.58 s.
const TOTAL_FRAMES = 80;
const PLAYBACK_DURATION_MS = 1600;

export function startBurgerScrub(): () => void {
  const canvas = document.getElementById("burger-canvas") as HTMLCanvasElement | null;
  const scrollWrapper = document.getElementById("hero-scroll-wrapper");
  if (!canvas || !scrollWrapper) return () => {};

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return () => {};

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const framePrefix = canvas.dataset.framePrefix || "/hero-frames/frames/padrinhos_";
  const images: (HTMLImageElement | undefined)[] = new Array(TOTAL_FRAMES);
  const states = new Uint8Array(TOTAL_FRAMES); // 0 idle, 1 loading, 2 ready, 3 failed
  let settledFrames = 0;
  let targetFrame = 0;
  let drawnFrame = -1;
  let animationFrameId = 0;
  let isCleanedUp = false;
  let mobilePlaybackStarted = false;

  const drawFrame = (index: number) => {
    const image = images[index];
    if (!image || states[index] !== 2 || isCleanedUp) return false;
    if (drawnFrame !== index) {
      // Leave a one-pixel pink safety edge above the bun without rescaling the frame.
      context.fillStyle = "#ed72a8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 1);
      drawnFrame = index;
    }
    return true;
  };

  const startMobilePlayback = () => {
    if (mobilePlaybackStarted || isCleanedUp || prefersReducedMotion) return;
    mobilePlaybackStarted = true;
    let startedAt = 0;

    const tick = (now: number) => {
      if (isCleanedUp) return;
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / PLAYBACK_DURATION_MS);
      showFrame(Math.round(progress * (TOTAL_FRAMES - 1)));
      if (progress < 1) animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
  };

  const loadFrame = (index: number) => {
    if (states[index] !== 0) return images[index];
    states[index] = 1;
    const image = new Image();
    image.decoding = "async";
    images[index] = image;
    image.onload = () => {
      states[index] = 2;
      settledFrames += 1;
      if (targetFrame === index || drawnFrame === -1) drawFrame(index);
      if (isMobile && !prefersReducedMotion && settledFrames === TOTAL_FRAMES) startMobilePlayback();
    };
    image.onerror = () => {
      states[index] = 3;
      settledFrames += 1;
      if (isMobile && !prefersReducedMotion && settledFrames === TOTAL_FRAMES) startMobilePlayback();
    };
    const paddedIndex = String(index + 1).padStart(4, "0");
    image.src = `${framePrefix}${paddedIndex}.webp`;
    return image;
  };

  const showFrame = (requestedIndex: number) => {
    targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, requestedIndex));
    const target = loadFrame(targetFrame);
    if (target && states[targetFrame] === 2) {
      drawFrame(targetFrame);
      return;
    }

    // Show the closest decoded neighbor while a fast scroll target is loading.
    for (let offset = 1; offset < TOTAL_FRAMES; offset += 1) {
      const before = targetFrame - offset;
      const after = targetFrame + offset;
      if (before >= 0 && states[before] === 2 && drawFrame(before)) return;
      if (after < TOTAL_FRAMES && states[after] === 2 && drawFrame(after)) return;
    }
  };

  loadFrame(0);
  if (prefersReducedMotion) {
    return () => {
      isCleanedUp = true;
    };
  }

  for (let index = 1; index < TOTAL_FRAMES; index += 1) loadFrame(index);

  if (isMobile) {
    return () => {
      isCleanedUp = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }

  const updateFromScroll = () => {
    animationFrameId = 0;
    if (isCleanedUp) return;
    const rect = scrollWrapper.getBoundingClientRect();
    const scrollDistance = rect.height - window.innerHeight;
    const progress = scrollDistance <= 0
      ? 0
      : Math.max(0, Math.min(1, -rect.top / scrollDistance));
    showFrame(Math.round(progress * (TOTAL_FRAMES - 1)));
  };

  const onScroll = () => {
    if (!animationFrameId) animationFrameId = requestAnimationFrame(updateFromScroll);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  return () => {
    isCleanedUp = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
