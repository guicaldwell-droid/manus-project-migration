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

const padrinhosCss = fs.readFileSync('src/padrinhos/padrinhos.css', 'utf8');
fs.writeFileSync(path.join(outDir, 'padrinhos.css'), padrinhosCss);

const scriptContent = `
(function() {
  var TOTAL_FRAMES = 53;
  var VIDEO_SRC = "./padrinhos-hamburguer-hero-rosa.mp4";

  function getFramePath(i) {
    var num = String(i + 1).padStart(4, "0");
    return "./hero-frames/frames/padrinhos_" + num + ".png";
  }

  var canvas = document.getElementById("burger-canvas");
  var mobileVideo = document.querySelector("video.burger-video-mobile");
  var counter = document.getElementById("frame-number");
  var scrollWrapper = document.getElementById("hero-scroll-wrapper");
  var heroSection = document.getElementById("hero-section");

  if (!canvas || !scrollWrapper || !heroSection) return;

  var ctx = canvas.getContext("2d", { alpha: false });
  var rafId = 0;
  var currentRenderedIndex = -1;

  var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 760px)").matches;

  var images = new Array(TOTAL_FRAMES);

  function renderFrame(index) {
    if (!ctx) return;
    var clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    var img = images[clampedIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      if (currentRenderedIndex !== clampedIndex) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentRenderedIndex = clampedIndex;
        if (counter) counter.textContent = String(clampedIndex + 1).padStart(2, "0");
      }
    } else {
      loadSingleFrame(clampedIndex, function() {
        if (currentRenderedIndex === -1 || currentRenderedIndex !== clampedIndex) {
          ctx.drawImage(images[clampedIndex], 0, 0, canvas.width, canvas.height);
          currentRenderedIndex = clampedIndex;
          if (counter) counter.textContent = String(clampedIndex + 1).padStart(2, "0");
        }
      });
    }
  }

  function loadSingleFrame(index, onLoad) {
    if (images[index]) {
      if (images[index].complete && onLoad) onLoad();
      return;
    }
    var img = new Image();
    img.src = getFramePath(index);
    img.onload = function() {
      images[index] = img;
      if (onLoad) onLoad();
    };
    images[index] = img;
  }

  var firstImg = new Image();
  firstImg.src = getFramePath(0);
  firstImg.onload = function() {
    images[0] = firstImg;
    if (currentRenderedIndex === -1) renderFrame(0);
  };
  images[0] = firstImg;

  function preloadAll() {
    for (var i = 1; i < TOTAL_FRAMES; i++) {
      loadSingleFrame(i);
    }
  }

  if (isReducedMotion) {
    if (mobileVideo) mobileVideo.style.display = "none";
    canvas.style.display = "block";
    renderFrame(0);
    return;
  }

  if (isMobile) {
    if (mobileVideo) {
      mobileVideo.src = VIDEO_SRC;
      mobileVideo.muted = true;
      mobileVideo.playsInline = true;
      mobileVideo.autoplay = true;
      mobileVideo.loop = false;
      mobileVideo.style.display = "block";
      canvas.style.display = "none";

      var p = mobileVideo.play();
      if (p !== undefined) {
        p.catch(function() {
          mobileVideo.style.display = "none";
          canvas.style.display = "block";
          renderFrame(0);
        });
      }
    }
    return;
  }

  if (mobileVideo) mobileVideo.style.display = "none";
  canvas.style.display = "block";

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preloadAll);
  } else {
    setTimeout(preloadAll, 200);
  }

  function updateScrub() {
    rafId = 0;
    var rect = scrollWrapper.getBoundingClientRect();
    var scrollDistance = rect.height - window.innerHeight;

    if (scrollDistance <= 0) {
      renderFrame(0);
      return;
    }

    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
    var targetFrameIndex = Math.round(progress * (TOTAL_FRAMES - 1));
    renderFrame(targetFrameIndex);
  }

  function onScroll() {
    if (!rafId) {
      rafId = requestAnimationFrame(updateScrub);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateScrub();
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
