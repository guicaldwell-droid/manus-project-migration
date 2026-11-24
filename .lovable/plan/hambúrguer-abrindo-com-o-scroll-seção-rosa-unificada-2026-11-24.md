# Hambúrguer abrindo com o scroll + seção rosa unificada

## O que muda
- A seção logo abaixo da hero ("Olho no smash" / "Uma ideia, quadro a quadro.") passa a ter fundo rosa #ED72A8, igual à hero, formando um bloco contínuo. Textos e posição ficam iguais; sem faixas ou molduras pretas.
- A animação passa a usar o seu vídeo com fundo rosa (82 quadros, 1920×1080) em vez das imagens antigas de fundo preto.
- O hambúrguer se abre conforme rola para baixo e se fecha ao rolar para cima. O vídeo não toca sozinho, sem som, loop ou controles.
- Desktop: área grande e fixa durante a rolagem, quase da largura da tela, hambúrguer inteiro e sem distorção.
- Celular: enquadramento mais vertical, hambúrguer grande e centralizado, sem cortar o produto.
- Quem prefere menos movimento vê um quadro fixo do hambúrguer montado.
- O resto do site (hero, cardápio, localizações, botões) fica igual.

## Detalhes técnicos
- Enviar o MP4 via lovable-assets (src/assets/padrinhos-hamburguer-fundo-rosa.mp4.asset.json) e trocar os canvases da hero e do scrub-track por `<video muted playsinline preload="auto">`.
- Reescrever src/padrinhos/burger-scrub.ts com anime.js v4 (`bun add animejs`): `onScroll({ target: '#scrub-track', sync: true })` controlando um objeto de progresso; no onUpdate, definir `video.currentTime = p * duration` dentro de requestAnimationFrame, só após `loadeddata`/`canplaythrough`. Contador 01–82 = round(p*81)+1.
- CSS em padrinhos.css: `.scrub-track` e `.scrub-sticky` com background #ED72A8, remover max-width estreito, vídeo `width:min(100vw, 177.78vh)` com aspect-ratio 16/9 e object-fit contain; media query mobile com altura maior e object-fit contain centralizado.
- `prefers-reduced-motion`: sem scrub, currentTime no último quadro.
- Apagar public/frames/ se nada mais usar; atualizar AGENTS.md (vídeo substitui frames).
- Verificar no navegador em 1280px e 390px: fundo rosa contínuo e currentTime avançando com o scroll.
