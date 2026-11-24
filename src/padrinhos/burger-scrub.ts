// Scroll-linked burger video (anime.js onScroll drives video.currentTime). Browser-only.
import { animate, onScroll } from "animejs";
import burgerVideo from "@/assets/padrinhos-hamburguer-fundo-rosa.mp4.asset.json";

const TOTAL_FRAMES = 82;

export function startBurgerScrub(): () => void {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video.burger-video"));
  const counter = document.getElementById("frame-number");
  const track = document.getElementById("scrub-track");
  if (!videos.length || !track) return () => {};

  videos.forEach((v) => {
    v.muted = true; v.loop = false; v.autoplay = false; v.controls = false;
    v.src = burgerVideo.url; v.load();
  });

  let progress = 0, raf = 0;
  const seek = () => {
    raf = 0;
    videos.forEach((v) => {
      if (v.readyState < 1 || !v.duration) return;
      const t = Math.min(v.duration - 0.01, progress * v.duration);
      if (Math.abs(v.currentTime - t) > 0.004) v.currentTime = t;
    });
    if (counter) counter.textContent = String(Math.round(progress * (TOTAL_FRAMES - 1)) + 1).padStart(2, "0");
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(seek); };
  videos.forEach((v) => v.addEventListener("loadeddata", schedule));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    progress = 1; schedule();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }

  const state = { p: 0 };
  const anim = animate(state, {
    p: [0, 1],
    duration: 1000,
    ease: "linear",
    autoplay: onScroll({ target: track, enter: "bottom top", leave: "top bottom", sync: true }),
    onUpdate: () => { progress = state.p; schedule(); },
  });

  return () => { anim.revert(); if (raf) cancelAnimationFrame(raf); };
}
