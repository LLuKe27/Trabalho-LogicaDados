/* =========================================================
   HEAP SORT — Apresentação
   - Escala o palco 1440x810 para a janela
   - Navegação (setas, espaço, clique, PageUp/Down, Home/End, F)
   - Desenha decorações vetoriais e as árvores heap
   ========================================================= */
(() => {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  let current = 0;

  /* ---------- Escala ---------- */
  function fit() {
    const s = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    stage.style.transform = `scale(${s})`;
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Decorações vetoriais (SVG) ---------- */
  const DECOS = {
    // »»»»»» canto superior direito (slides internos)
    chevrons: (w, h) => {
      let s = '';
      for (let i = 0; i < 6; i++) {
        const x = i * 21, op = 0.25 + i * 0.13;
        s += `<path d="M${x} 2 L${x + 9} 2 L${x + 21} ${h / 2} L${x + 9} ${h - 2} L${x} ${h - 2} L${x + 12} ${h / 2} Z" fill="#1fb5b0" opacity="${op}"/>`;
      }
      return s;
    },
    // Chevrons grandes da capa
    'chevrons-big': (w, h) => {
      let s = '<defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="#0b4f5a"/><stop offset="1" stop-color="#20d5cf"/></linearGradient></defs>';
      const step = w / 4.2, t = step * 0.55;
      for (let i = 0; i < 4; i++) {
        const x = i * step;
        s += `<path d="M${x} 0 L${x + t} 0 L${x + t + h / 2} ${h / 2} L${x + t} ${h} L${x} ${h} L${x + h / 2} ${h / 2} Z" fill="url(#cg)" opacity="${0.45 + i * 0.18}"/>`;
      }
      return s;
    },
    // Barra de carregamento da capa
    loadbar: (w, h) => {
      let s = `<path d="M4 6 H${w - 4} V${h - 6} H4 Z" fill="none" stroke="#1fb5b0" stroke-width="2" opacity=".8"/>`;
      s += `<path d="M0 ${h - 2} H${w * 0.5}" stroke="#1fb5b0" stroke-width="3"/>`;
      for (let i = 0; i < 10; i++) {
        const x = 14 + i * 27;
        const filled = i < 7;
        s += `<path d="M${x + 8} 12 H${x + 24} L${x + 16} ${h - 12} H${x} Z" ${filled ? 'fill="#1fb5b0"' : 'fill="none" stroke="#1fb5b0" stroke-width="1.5"'}/>`;
      }
      return s;
    },
    // Barra de progresso inferior esquerda
    progress: (w, h) => {
      let s = `<path d="M0 6 H${w - 4} V${h - 10} H0 Z" fill="none" stroke="#1fb5b0" stroke-width="1.5" opacity=".7"/>`;
      s += `<path d="M6 ${h - 3} H${w * 0.85}" stroke="#1fb5b0" stroke-width="3" opacity=".8"/>`;
      for (let i = 0; i < 10; i++) {
        const x = 8 + i * 20.5;
        const filled = i < 7;
        s += `<path d="M${x + 6} 11 H${x + 17} L${x + 11} ${h - 15} H${x} Z" ${filled ? 'fill="#1fb5b0"' : 'fill="none" stroke="#1fb5b0" stroke-width="1.2"'}/>`;
      }
      return s;
    },
    // Ícone de camadas (logo superior esquerdo)
    logo: () => `
      <g fill="none" stroke="#3aa3a0" stroke-width="3.5" stroke-linejoin="round" opacity=".85">
        <path d="M24 3 L45 13 L24 23 L3 13 Z"/>
        <path d="M3 20 L24 30 L45 20"/>
        <path d="M3 27 L24 35 L45 27" opacity=".7"/>
      </g>`,
    // Seta curva (slide 2)
    'curve-arrow': () => `
      <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 10 C 45 0, 70 30, 72 70"/>
        <path d="M58 58 L72 72 L84 56"/>
      </g>`,
    // Seta curva (slide 7)
    'curve-arrow2': () => `
      <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 4 C 10 40, 40 62, 80 64"/>
        <path d="M64 50 L82 64 L64 76"/>
      </g>`,
    // Seta curva pequena (slide 5)
    'curve-small': () => `
      <g fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 2 C 2 18, 4 40, 18 56"/>
        <path d="M8 50 L18 58 L22 46"/>
      </g>`,
    // Seta reta (slide 4)
    arrow: (w, h) => `
      <g stroke="#fff" stroke-width="3" fill="#fff">
        <path d="M0 ${h / 2} H${w - 12}"/>
        <path d="M${w - 14} ${h / 2 - 7} L${w} ${h / 2} L${w - 14} ${h / 2 + 7} Z" stroke="none"/>
      </g>`,
    // Ícone de árvore (slide 2)
    'tree-icon': () => `
      <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 98 C 8 98, 2 74, 14 62 C 2 50, 10 28, 28 30 C 30 10, 56 2, 68 18 C 86 10, 106 26, 98 44 C 110 56, 104 80, 86 84 C 84 96, 70 100, 62 96"/>
        <path d="M55 160 V 70"/>
        <path d="M55 120 L 36 98"/>
        <path d="M55 104 L 72 84"/>
        <path d="M55 140 L 66 128"/>
        <path d="M20 160 H 92"/>
      </g>`,
    // Lâmpada (slide 9)
    bulb: () => `
      <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 38 C 17 32, 10 28, 10 20 A 15 15 0 0 1 40 20 C 40 28, 33 32, 33 38 Z"/>
        <path d="M18 43 H32 M19 48 H31"/>
        <path d="M25 0 V4 M8 6 L11 9 M42 6 L39 9 M0 21 H4 M46 21 H50"/>
      </g>`,
    // Moldura dos cards (slide 10)
    card: (w, h) => {
      const c = 22;
      const d = `M${c} 0 H${w - 44} L${w - 30} 14 H${w} V${h - c} L${w - c} ${h} H${c + 70} L${c + 60} ${h - 10} H0 V${c} Z`;
      return `
        <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <path d="${d}" fill="rgba(6,40,70,.55)" stroke="#29c8ea" stroke-width="3" filter="url(#glow)"/>
        <path d="M${c - 8} 120 V${h - 70}" stroke="#29c8ea" stroke-width="6" opacity=".9"/>
        <path d="M${w / 2 - 30} ${h - 18} h18 l-8 12 h-18 Z M${w / 2 - 4} ${h - 18} h18 l-8 12 h-18 Z" fill="#29c8ea"/>`;
    },
  };

  document.querySelectorAll('[data-deco]').forEach(el => {
    const fn = DECOS[el.dataset.deco];
    if (!fn) return;
    el.classList.add('deco');
    const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
    el.innerHTML = `<svg xmlns="${SVGNS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible">${fn(w, h)}</svg>`;
  });

  /* ---------- Índices sob os vetores ---------- */
  document.querySelectorAll('[data-idx]').forEach(el => {
    const size = +el.dataset.idx;
    const top = parseFloat(el.style.top);
    const parent = el.parentElement;
    el.dataset.pos.split(',').forEach((x, i) => {
      const s = document.createElement('div');
      s.className = 'idx';
      s.style.cssText = `left:${x}px;top:${top}px;font-size:${size}px`;
      s.textContent = i;
      parent.appendChild(s);
    });
    el.remove();
  });

  /* ---------- Árvores heap ---------- */
  // Filhos do nó i: 2i+1 e 2i+2 (mesma regra do slide)
  document.querySelectorAll('[data-tree]').forEach(el => {
    const r = +el.dataset.r;
    const font = +el.dataset.font;
    const values = el.dataset.values.split(',');
    const nodes = el.dataset.nodes.trim().split(/\s+/).map(p => p.split(',').map(Number));
    const labels = el.dataset.labels.trim().split(/\s+/).map(p => p.split(',').map(Number));
    el.className = 'tree';

    let lines = '';
    nodes.forEach(([x, y], i) => {
      [2 * i + 1, 2 * i + 2].forEach(c => {
        if (c < nodes.length) {
          const [cx, cy] = nodes[c];
          lines += `<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" stroke="#4a4f57" stroke-width="1.5"/>`;
        }
      });
    });
    el.innerHTML = `<svg xmlns="${SVGNS}" width="1440" height="810">${lines}</svg>`;

    nodes.forEach(([x, y], i) => {
      const n = document.createElement('div');
      n.className = 'node';
      n.style.cssText = `left:${x}px;top:${y}px;width:${r * 2}px;height:${r * 2}px;font-size:${font}px`;
      n.textContent = values[i];
      el.appendChild(n);

      const [lx, ly] = labels[i];
      const l = document.createElement('div');
      l.className = 'idx';
      l.style.cssText = `left:${lx}px;top:${ly}px;font-size:28px`;
      l.textContent = i;
      el.appendChild(l);
    });
  });

  /* ---------- Navegação ---------- */
  function show(i) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('active', k === current));
    counter.textContent = `${current + 1} / ${slides.length}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    history.replaceState(null, '', `#${current + 1}`);
  }
  const next = () => show(current + 1);
  const prev = () => show(current - 1);

  function toggleFS() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); prev(); break;
      case 'Home': show(0); break;
      case 'End': show(slides.length - 1); break;
      case 'f': case 'F': toggleFS(); break;
    }
  });

  document.getElementById('viewport').addEventListener('click', e => {
    (e.clientX > window.innerWidth / 3) ? next() : prev();
  });
  document.getElementById('next').addEventListener('click', e => { e.stopPropagation(); next(); });
  document.getElementById('prev').addEventListener('click', e => { e.stopPropagation(); prev(); });
  document.getElementById('fs').addEventListener('click', e => { e.stopPropagation(); toggleFS(); });

  // Swipe (touch)
  let tx = null;
  document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    tx = null;
  });

  const start = parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(start) ? start - 1 : 0);
})();

