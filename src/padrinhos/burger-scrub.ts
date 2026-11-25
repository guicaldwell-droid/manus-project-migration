// Scroll-linked burger animation in the hero section.
// Desktop: 53-frame PNG sequence rendered on <canvas> via requestAnimationFrame on native scroll.
// Mobile: Autoplay native <video> once, no scroll-jacking.
// Accessibility: prefers-reduced-motion displays static initial frame and leaves scroll untouched.

const TOTAL_FRAMES = 53;
const VIDEO_SRC = "/padrinhos-hamburguer-hero-rosa.mp4";

function getFramePath(index: number): string {
  const num = String(index + 1).padStart(4, "0");
  return `/hero-frames/frames/padrinhos_${num}.png`;
}

export function startBurgerScrub(): () => void {
  const canvas = document.getElementById("burger-canvas") as HTMLCanvasElement | null;
  const mobileVideo = document.querySelector<HTMLVideoElement>("video.burger-video-mobile");
  const counter = document.getElementById("frame-number");
  const scrollWrapper = document.getElementById("hero-scroll-wrapper");
  const heroSection = document.getElementById("hero-section");

  if (!canvas || !scrollWrapper || !heroSection) return () => {};

  const ctx = canvas.getContext("2d", { alpha: false });
  let isCleanedUp = false;
  let rafId = 0;
  let currentRenderedIndex = -1;

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  // Preload frames cache
  const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
  let initialFrameLoaded = false;

  const renderFrame = (index: number) => {
    if (!ctx) return;
    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    const img = images[clampedIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      if (currentRenderedIndex !== clampedIndex) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentRenderedIndex = clampedIndex;
        if (counter) {
          counter.textContent = String(clampedIndex + 1).padStart(2, "0");
        }
      }
    } else {
      // If requested frame isn't loaded yet, try to load it immediately
      loadSingleFrame(clampedIndex, () => {
        if (!isCleanedUp && (currentRenderedIndex === -1 || currentRenderedIndex !== clampedIndex)) {
          ctx.drawImage(images[clampedIndex]!, 0, 0, canvas.width, canvas.height);
          currentRenderedIndex = clampedIndex;
          if (counter) {
            counter.textContent = String(clampedIndex + 1).padStart(2, "0");
          }
        }
      });
    }
  };

  function loadSingleFrame(index: number, onLoad?: () => void) {
    if (images[index]) {
      if (images[index]!.complete && onLoad) onLoad();
      return;
    }
    const img = new Image();
    img.src = getFramePath(index);
    img.onload = () => {
      images[index] = img;
      if (onLoad) onLoad();
    };
    images[index] = img;
  }

  // Load first frame immediately to render initial state without black/empty space
  const firstImg = new Image();
  firstImg.src = getFramePath(0);
  firstImg.onload = () => {
    images[0] = firstImg;
    initialFrameLoaded = true;
    if (currentRenderedIndex === -1) {
      renderFrame(0);
    }
  };
  images[0] = firstImg;

  // Preload rest of frames in background
  const preloadAll = () => {
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      loadSingleFrame(i);
    }
  };

  // If user prefers reduced motion
  if (isReducedMotion) {
    if (mobileVideo) {
      mobileVideo.style.display = "none";
    }
    canvas.style.display = "block";
    renderFrame(0);
    return () => {
      isCleanedUp = true;
    };
  }

  // Mobile mode setup
  if (isMobile) {
    if (mobileVideo) {
      mobileVideo.src = VIDEO_SRC;
      mobileVideo.muted = true;
      mobileVideo.playsInline = true;
      mobileVideo.autoplay = true;
      mobileVideo.loop = false;
      mobileVideo.style.display = "block";
      canvas.style.display = "none";

      const playPromise = mobileVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If autoplay fails, fallback to first frame canvas
          mobileVideo.style.display = "none";
          canvas.style.display = "block";
          renderFrame(0);
        });
      }
    }
    return () => {
      isCleanedUp = true;
      if (mobileVideo) {
        mobileVideo.pause();
        mobileVideo.src = "";
      }
    };
  }

  // Desktop mode setup
  if (mobileVideo) {
    mobileVideo.style.display = "none";
  }
  canvas.style.display = "block";

  // Request idle or delayed background preload of remaining frames
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(preloadAll);
  } else {
    setTimeout(preloadAll, 200);
  }

  const updateScrub = () => {
    rafId = 0;
    if (isCleanedUp) return;

    // Calculate scroll progress through hero-scroll-wrapper
    // The wrapper has height: 200vh (or 100vh + 100vh scroll distance)
    const rect = scrollWrapper.getBoundingClientRect();
    const scrollDistance = rect.height - window.innerHeight;

    if (scrollDistance <= 0) {
      renderFrame(0);
      return;
    }

    // How far the top of the wrapper has moved past the viewport top
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

    const targetFrameIndex = Math.round(progress * (TOTAL_FRAMES - 1));
    renderFrame(targetFrameIndex);
  };

  const onScroll = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(updateScrub);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Initial update
  updateScrub();

  return () => {
    isCleanedUp = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
