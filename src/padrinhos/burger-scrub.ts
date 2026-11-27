// Scroll-linked burger animation in the hero section.
// Desktop scrubs the generated MP4 with native scroll; mobile plays it once.
// With reduced motion enabled, the video remains on its closed first frame.

export function startBurgerScrub(): () => void {
  const video = document.querySelector<HTMLVideoElement>("video.burger-video");
  const scrollWrapper = document.getElementById("hero-scroll-wrapper");
  const heroSection = document.getElementById("hero-section");

  if (!video || !scrollWrapper || !heroSection) return () => {};

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  let isCleanedUp = false;
  let rafId = 0;

  video.muted = true;
  video.playsInline = true;
  video.loop = false;
  video.preload = "auto";

  if (isReducedMotion) {
    video.pause();
    return () => {
      isCleanedUp = true;
    };
  }

  if (isMobile) {
    const playOnce = () => {
      if (isCleanedUp) return;
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playOnce();
    } else {
      video.addEventListener("canplay", playOnce, { once: true });
    }

    return () => {
      isCleanedUp = true;
      video.removeEventListener("canplay", playOnce);
      video.pause();
    };
  }

  video.pause();

  const updateScrub = () => {
    rafId = 0;
    if (isCleanedUp || video.readyState < HTMLMediaElement.HAVE_METADATA) return;

    const rect = scrollWrapper.getBoundingClientRect();
    const scrollDistance = rect.height - window.innerHeight;
    if (scrollDistance <= 0 || !Number.isFinite(video.duration)) {
      video.currentTime = 0;
      return;
    }

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
    const targetTime = progress * Math.max(0, video.duration - 0.04);

    if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.04) {
      video.currentTime = targetTime;
    }
  };

  const onScroll = () => {
    if (!rafId) rafId = requestAnimationFrame(updateScrub);
  };

  const onSeeked = () => onScroll();
  video.addEventListener("loadedmetadata", onScroll);
  video.addEventListener("seeked", onSeeked);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  return () => {
    isCleanedUp = true;
    if (rafId) cancelAnimationFrame(rafId);
    video.removeEventListener("loadedmetadata", onScroll);
    video.removeEventListener("seeked", onSeeked);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
