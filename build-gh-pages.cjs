const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const outDir = path.resolve('dist-gh-pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Copy public assets
copyDir('public', outDir);

// Read page.html and padrinhos.css
let bodyHtml = fs.readFileSync('src/padrinhos/page.html', 'utf8');
// Fix any absolute asset links to relative for GitHub Pages subdirectory compatibility
bodyHtml = bodyHtml.replace(/"\/padrinhos-avatar\.webp"/g, '"./padrinhos-avatar.webp"');
bodyHtml = bodyHtml.replace('src="/padrinhos-hamburguer-hero-rosa.mp4"', 'src="./padrinhos-hamburguer-hero-rosa.mp4"');

const padrinhosCss = fs.readFileSync('src/padrinhos/padrinhos.css', 'utf8');
fs.writeFileSync(path.join(outDir, 'padrinhos.css'), padrinhosCss);

const scriptContent = `
(function() {
  var video = document.querySelector("video.burger-video");
  var scrollWrapper = document.getElementById("hero-scroll-wrapper");
  var heroSection = document.getElementById("hero-section");

  if (!video || !scrollWrapper || !heroSection) return;

  var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 760px)").matches;
  var rafId = 0;

  video.muted = true;
  video.playsInline = true;
  video.loop = false;
  video.preload = "auto";

  if (isReducedMotion) {
    video.pause();
    return;
  }

  if (isMobile) {
    function playOnce() {
      var playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(function() {});
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playOnce();
    } else {
      video.addEventListener("canplay", playOnce, { once: true });
    }
    return;
  }

  video.pause();

  function updateScrub() {
    rafId = 0;
    if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;

    var rect = scrollWrapper.getBoundingClientRect();
    var scrollDistance = rect.height - window.innerHeight;
    if (scrollDistance <= 0 || !Number.isFinite(video.duration)) {
      video.currentTime = 0;
      return;
    }

    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
    var targetTime = progress * Math.max(0, video.duration - 0.04);
    if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.04) {
      video.currentTime = targetTime;
    }
  }

  function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(updateScrub);
  }

  video.addEventListener("loadedmetadata", onScroll);
  video.addEventListener("seeked", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();
`;

const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Padrinhos — Smash com crosta e personalidade</title>
  <meta name="description" content="Padrinhos Smash Original — smash com crosta e personalidade em Brasília." />
  <meta property="og:title" content="Padrinhos — Smash com crosta e personalidade" />
  <meta property="og:description" content="Padrinhos Smash Original — smash com crosta e personalidade em Brasília." />
  <meta name="theme-color" content="#f3a1c2" />
  <link rel="icon" type="image/webp" href="./padrinhos-avatar.webp" />
  <link rel="apple-touch-icon" href="./padrinhos-avatar.webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700;800&display=swap" />
  <link rel="stylesheet" href="./padrinhos.css" />
</head>
<body>
${bodyHtml}
<script>
${scriptContent}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), fullHtml);
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log('Build static gh-pages completed.');
