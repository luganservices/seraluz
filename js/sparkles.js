/* ================================================================
   Sparkles — efeito de partículas cintilantes em Canvas puro
   Inspirado no componente SparklesCore (tsparticles), recriado
   sem dependências e com a cor dourada da marca Seraluz.
================================================================ */
(function () {
  const canvas = document.getElementById('sparkles');
  if (!canvas) return;

  // Respeita usuários que preferem menos movimento
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = canvas.getContext('2d');
  let largura = 0;
  let altura = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particulas = [];
  let animId = null;

  // Cores douradas/areia da marca — tons que contrastam com o fundo creme
  const cores = ['#A8883A', '#C4A35A', '#B8923F', '#9AAB8A'];

  // Densidade: ~1 partícula a cada 9000px², com teto para telas grandes
  function qtdAlvo() {
    return Math.min(160, Math.floor((largura * altura) / 9000));
  }

  function rnd(min, max) {
    return Math.random() * (max - min) + min;
  }

  function criarParticula() {
    return {
      x: Math.random() * largura,
      y: Math.random() * altura,
      r: rnd(0.5, 1.8),                       // raio (minSize/maxSize)
      vx: rnd(-0.25, 0.25),                   // deriva horizontal suave
      vy: rnd(-0.25, 0.25),                   // deriva vertical suave
      cor: cores[Math.floor(Math.random() * cores.length)],
      opacidade: rnd(0.1, 1),                 // opacity min/max
      faseTwinkle: rnd(0, Math.PI * 2),       // início aleatório do brilho
      velTwinkle: rnd(0.01, 0.04)             // velocidade do piscar
    };
  }

  function redimensionar() {
    const rect = canvas.getBoundingClientRect();
    largura = rect.width;
    altura = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particulas = [];
    const total = qtdAlvo();
    for (let i = 0; i < total; i++) particulas.push(criarParticula());
  }

  function desenhar() {
    ctx.clearRect(0, 0, largura, altura);

    for (const p of particulas) {
      // cintilar: opacidade oscila com seno
      p.faseTwinkle += p.velTwinkle;
      const brilho = (Math.sin(p.faseTwinkle) + 1) / 2; // 0..1
      const alpha = 0.1 + brilho * (p.opacidade - 0.1) + 0.1;

      // movimento sutil
      p.x += p.vx;
      p.y += p.vy;

      // reentra pelo lado oposto ao sair
      if (p.x < -2) p.x = largura + 2;
      else if (p.x > largura + 2) p.x = -2;
      if (p.y < -2) p.y = altura + 2;
      else if (p.y > altura + 2) p.y = -2;

      ctx.globalAlpha = Math.min(1, alpha);
      ctx.fillStyle = p.cor;
      ctx.shadowColor = p.cor;
      ctx.shadowBlur = p.r * 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    animId = requestAnimationFrame(desenhar);
  }

  // Fade-in suave do canvas ao iniciar (espelha o motion do componente)
  function iniciar() {
    redimensionar();
    canvas.style.opacity = '1';

    if (reduzMovimento) {
      // desenha um quadro estático, sem animação
      desenharEstatico();
      return;
    }
    cancelAnimationFrame(animId);
    desenhar();
  }

  function desenharEstatico() {
    ctx.clearRect(0, 0, largura, altura);
    for (const p of particulas) {
      ctx.globalAlpha = p.opacidade;
      ctx.fillStyle = p.cor;
      ctx.shadowColor = p.cor;
      ctx.shadowBlur = p.r * 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Pausa a animação quando a aba não está visível (economia de CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!reduzMovimento) {
      cancelAnimationFrame(animId);
      desenhar();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(iniciar, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
