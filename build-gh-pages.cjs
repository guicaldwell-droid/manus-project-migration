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
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Copy public assets, including the optimized 50 fps WebP frame sequence.
copyDir('public', outDir);

let bodyHtml = fs.readFileSync('src/padrinhos/page.html', 'utf8');
bodyHtml = bodyHtml.replace(/"\/padrinhos-avatar\.webp"/g, '"./padrinhos-avatar.webp"');

const padrinhosCss = fs.readFileSync('src/padrinhos/padrinhos.css', 'utf8');
const overridesCss = fs.readFileSync('src/padrinhos/padrinhos-overrides.css', 'utf8');
fs.writeFileSync(path.join(outDir, 'padrinhos.css'), `${padrinhosCss}\n${overridesCss}`);

const scriptContent = `
(function() {
  var TOTAL_FRAMES = 80;
  var PLAYBACK_DURATION_MS = 1600;
  var canvas = document.getElementById("burger-canvas");
  var scrollWrapper = document.getElementById("hero-scroll-wrapper");
  if (!canvas || !scrollWrapper) return;
  var context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 760px)").matches;
  var framePrefix = canvas.dataset.framePrefix || "./hero-frames/frames/padrinhos_";
  var images = new Array(TOTAL_FRAMES);
  var states = new Uint8Array(TOTAL_FRAMES);
  var settledFrames = 0;
  var targetFrame = 0;
  var drawnFrame = -1;
  var animationFrameId = 0;
  var isCleanedUp = false;
  var mobilePlaybackStarted = false;

  function drawFrame(index) {
    var image = images[index];
    if (!image || states[index] !== 2 || isCleanedUp) return false;
    if (drawnFrame !== index) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      drawnFrame = index;
    }
    return true;
  }

  function startMobilePlayback() {
    if (mobilePlaybackStarted || isCleanedUp || prefersReducedMotion) return;
    mobilePlaybackStarted = true;
    var startedAt = 0;
    function tick(now) {
      if (isCleanedUp) return;
      if (!startedAt) startedAt = now;
      var progress = Math.min(1, (now - startedAt) / PLAYBACK_DURATION_MS);
      showFrame(Math.round(progress * (TOTAL_FRAMES - 1)));
      if (progress < 1) animationFrameId = requestAnimationFrame(tick);
    }
    animationFrameId = requestAnimationFrame(tick);
  }

  function loadFrame(index) {
    if (states[index] !== 0) return images[index];
    states[index] = 1;
    var image = new Image();
    image.decoding = "async";
    images[index] = image;
    image.onload = function() {
      states[index] = 2;
      settledFrames += 1;
      if (targetFrame === index || drawnFrame === -1) drawFrame(index);
      if (isMobile && !prefersReducedMotion && settledFrames === TOTAL_FRAMES) startMobilePlayback();
    };
    image.onerror = function() {
      states[index] = 3;
      settledFrames += 1;
      if (isMobile && !prefersReducedMotion && settledFrames === TOTAL_FRAMES) startMobilePlayback();
    };
    var paddedIndex = String(index + 1).padStart(4, "0");
    image.src = framePrefix + paddedIndex + ".webp";
    return image;
  }

  function showFrame(requestedIndex) {
    targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, requestedIndex));
    var target = loadFrame(targetFrame);
    if (target && states[targetFrame] === 2) {
      drawFrame(targetFrame);
      return;
    }
    for (var offset = 1; offset < TOTAL_FRAMES; offset += 1) {
      var before = targetFrame - offset;
      var after = targetFrame + offset;
      if (before >= 0 && states[before] === 2 && drawFrame(before)) return;
      if (after < TOTAL_FRAMES && states[after] === 2 && drawFrame(after)) return;
    }
  }

  loadFrame(0);
  if (prefersReducedMotion) return;
  for (var index = 1; index < TOTAL_FRAMES; index += 1) loadFrame(index);

  if (isMobile) return;

  function updateFromScroll() {
    animationFrameId = 0;
    if (isCleanedUp) return;
    var rect = scrollWrapper.getBoundingClientRect();
    var scrollDistance = rect.height - window.innerHeight;
    var progress = scrollDistance <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / scrollDistance));
    showFrame(Math.round(progress * (TOTAL_FRAMES - 1)));
  }

  function onScroll() {
    if (!animationFrameId) animationFrameId = requestAnimationFrame(updateFromScroll);
  }

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
  <meta name="theme-color" content="#ED72A8" />
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
