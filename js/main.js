/* ================================================================
   Seraluz — main.js
================================================================ */

// ── Hamburger menu ──────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('nav-list');

hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  hamburger.classList.toggle('active');
  navList.classList.toggle('aberto');
  document.body.style.overflow = !expanded ? 'hidden' : '';
});

navList.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('active');
    navList.classList.remove('aberto');
    document.body.style.overflow = '';
  });
});

// ── Sombra no header ao rolar ────────────────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// ── Link ativo no nav conforme scroll ───────────────────────────
const secoes    = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

const secaoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.remove('active'));
    const ativo = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
    if (ativo) ativo.classList.add('active');
  });
}, { rootMargin: '-40% 0px -55% 0px' });

secoes.forEach(s => secaoObserver.observe(s));

// ── Animações fade-in ao rolar ───────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visivel');
    fadeObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ── Accordion — Política de Troca ───────────────────────────────
const toggle  = document.getElementById('politica-toggle');
const content = document.getElementById('politica-content');

function togglePolitica() {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  content.classList.toggle('aberto');
}

toggle.addEventListener('click', togglePolitica);
toggle.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    togglePolitica();
  }
});

// ── Smooth scroll para links âncora (fallback Safari) ────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const alvo = document.querySelector(a.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Montador de vela (modelo + quantidade + essência → WhatsApp) ──
(function () {
  const grid     = document.getElementById('essencias-grid');
  const modeloEl = document.getElementById('montador-modelo');
  const qtdEl    = document.getElementById('montador-qtd');
  const maisEl   = document.getElementById('qtd-mais');
  const menosEl  = document.getElementById('qtd-menos');
  const selecao  = document.getElementById('montador-selecao');
  const cta      = document.getElementById('montador-cta');
  if (!grid || !modeloEl || !selecao || !cta) return;

  const WPP = 'https://wa.me/5581982114120?text=';
  let essencia = null;

  function qtd() {
    let n = parseInt(qtdEl.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 99) n = 99;
    return n;
  }

  function atualizar() {
    const modelo = modeloEl.value;
    const n = qtd();
    const plural = n > 1 ? 'velas' : 'vela';
    let resumo, msg;

    if (modelo && essencia) {
      resumo = `${n}× Vela ${modelo} · Essência ${essencia}`;
      msg = `Olá! Quero ${n} ${plural} ${modelo} na essência ${essencia} 🕯️`;
    } else if (modelo) {
      resumo = `${n}× Vela ${modelo}`;
      msg = `Olá! Quero ${n} ${plural} ${modelo} 🕯️`;
    } else if (essencia) {
      resumo = `${n}× Vela · Essência ${essencia}`;
      msg = `Olá! Quero ${n} ${plural} na essência ${essencia} 🕯️`;
    } else {
      resumo = 'Escolha um modelo e/ou uma essência para montar seu pedido.';
      msg = 'Olá! Gostaria de montar uma vela personalizada 🕯️';
    }

    selecao.textContent = resumo;
    cta.href = WPP + encodeURIComponent(msg);
    cta.classList.toggle('is-disabled', !modelo && !essencia);
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('.essencia-card');
    if (!card) return;

    const jaAtivo = card.getAttribute('aria-pressed') === 'true';
    grid.querySelectorAll('.essencia-card').forEach(c => c.setAttribute('aria-pressed', 'false'));

    if (jaAtivo) {
      essencia = null;
    } else {
      card.setAttribute('aria-pressed', 'true');
      essencia = card.dataset.essencia;
    }
    atualizar();
  });

  if (maisEl)  maisEl.addEventListener('click', () => { qtdEl.value = qtd() + 1; atualizar(); });
  if (menosEl) menosEl.addEventListener('click', () => { qtdEl.value = Math.max(1, qtd() - 1); atualizar(); });
  if (qtdEl)   qtdEl.addEventListener('input', atualizar);

  modeloEl.addEventListener('change', atualizar);
  atualizar();
})();
