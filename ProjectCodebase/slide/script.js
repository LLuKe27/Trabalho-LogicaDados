/* =========================================================
   HEAP SORT — Apresentação Reestruturada (Apple SF Pro)
   - Escala o palco 1440x810 proporcionalmente ao viewport
   - Renderiza decorações SVG, vetores alinhados e árvores heap
   - Gera os gráficos SVG simulados (MOCK_BENCHMARK)
   - Navegação completa (teclado, clique, HUD, touch)
   ========================================================= */
(() => {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  let current = 0;

  /* =========================================================
     DADOS SIMULADOS (MOCK) — substituir pelos tempos reais em C
     ========================================================= */
  const MOCK_BENCHMARK = {
    sizes: [10000, 25000, 50000, 100000, 200000],
    sizeLabels: ['10k', '25k', '50k', '100k', '200k'],
    maxY: 50,
    series: [
      {
        id: 'random',
        name: 'Aleatório',
        color: '#38bdf8',
        timesMs: [1.7, 4.6, 9.8, 20.8, 44.2],
      },
      {
        id: 'nearly',
        name: 'Quase Ordenado',
        color: '#fb7185',
        timesMs: [1.65, 4.45, 9.5, 20.1, 42.9],
      },
      {
        id: 'sorted',
        name: 'Já Ordenado',
        color: '#a78bfa',
        timesMs: [1.6, 4.3, 9.2, 19.6, 41.8],
      },
      {
        id: 'desc',
        name: 'Ordem Decrescente',
        color: '#fbbf24',
        timesMs: [1.45, 3.9, 8.4, 17.9, 38.4],
      },
      {
        id: 'dups',
        name: 'Muitas Duplicadas',
        color: '#34d399',
        timesMs: [1.1, 2.9, 6.2, 13.1, 27.6],
      },
    ],
  };

  /* ---------- Escala ---------- */
  function fit() {
    const s = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    stage.style.transform = `scale(${s})`;
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Decorações vetoriais (SVG) ---------- */
  const DECOS = {
    chevrons: (w, h) => {
      let s = '';
      for (let i = 0; i < 6; i++) {
        const x = i * 21, op = 0.25 + i * 0.13;
        s += `<path d="M${x} 2 L${x + 9} 2 L${x + 21} ${h / 2} L${x + 9} ${h - 2} L${x} ${h - 2} L${x + 12} ${h / 2} Z" fill="#1fb5b0" opacity="${op}"/>`;
      }
      return s;
    },
    'chevrons-big': (w, h) => {
      let s = '<defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="#0b4f5a"/><stop offset="1" stop-color="#20d5cf"/></linearGradient></defs>';
      const step = w / 4.2, t = step * 0.55;
      for (let i = 0; i < 4; i++) {
        const x = i * step;
        s += `<path d="M${x} 0 L${x + t} 0 L${x + t + h / 2} ${h / 2} L${x + t} ${h} L${x} ${h} L${x + h / 2} ${h / 2} Z" fill="url(#cg)" opacity="${0.45 + i * 0.18}"/>`;
      }
      return s;
    },
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
    logo: () => `
      <g fill="none" stroke="#3aa3a0" stroke-width="3.5" stroke-linejoin="round" opacity=".85">
        <path d="M24 3 L45 13 L24 23 L3 13 Z"/>
        <path d="M3 20 L24 30 L45 20"/>
        <path d="M3 27 L24 35 L45 27" opacity=".7"/>
      </g>`,
    'curve-arrow': () => `
      <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 10 C 45 0, 70 30, 72 70"/>
        <path d="M58 58 L72 72 L84 56"/>
      </g>`,
    'curve-arrow2': () => `
      <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 4 C 10 40, 40 62, 80 64"/>
        <path d="M64 50 L82 64 L64 76"/>
      </g>`,
    arrow: (w, h) => `
      <g stroke="#fff" stroke-width="3" fill="#fff">
        <path d="M0 ${h / 2} H${w - 12}"/>
        <path d="M${w - 14} ${h / 2 - 7} L${w} ${h / 2} L${w - 14} ${h / 2 + 7} Z" stroke="none"/>
      </g>`,
    'tree-icon': () => `
      <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 98 C 8 98, 2 74, 14 62 C 2 50, 10 28, 28 30 C 30 10, 56 2, 68 18 C 86 10, 106 26, 98 44 C 110 56, 104 80, 86 84 C 84 96, 70 100, 62 96"/>
        <path d="M55 160 V 70"/>
        <path d="M55 120 L 36 98"/>
        <path d="M55 104 L 72 84"/>
        <path d="M55 140 L 66 128"/>
        <path d="M20 160 H 92"/>
      </g>`,
    bulb: () => `
      <g fill="none" stroke="#7ae8fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 38 C 17 32, 10 28, 10 20 A 15 15 0 0 1 40 20 C 40 28, 33 32, 33 38 Z"/>
        <path d="M18 43 H32 M19 48 H31"/>
        <path d="M25 0 V4 M8 6 L11 9 M42 6 L39 9 M0 21 H4 M46 21 H50"/>
      </g>`,
    card: (w, h) => {
      const c = 22;
      const d = `M${c} 0 H${w - 44} L${w - 30} 14 H${w} V${h - c} L${w - c} ${h} H${c + 70} L${c + 60} ${h - 10} H0 V${c} Z`;
      return `
        <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <path d="${d}" fill="rgba(16,18,22,.92)" stroke="#29c8ea" stroke-width="2.5" filter="url(#glow)"/>
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

  /* ---------- Vetores com índices centralizados ---------- */
  document.querySelectorAll('[data-vec]').forEach(el => {
    const vals = el.dataset.vec.split(',').map(s => s.trim());
    const sorted = new Set((el.dataset.sorted || '').split(',').filter(Boolean).map(Number));
    const swapped = new Set((el.dataset.swapped || '').split(',').filter(Boolean).map(Number));
    const compact = el.dataset.compact === '1';

    el.classList.add('vec-wrap');
    const row = document.createElement('div');
    row.className = 'vec-cells';
    if (compact) row.style.gap = '7px';

    const openB = document.createElement('span');
    openB.className = 'vec-bracket';
    openB.style.fontSize = compact ? '42px' : '50px';
    openB.style.alignSelf = 'flex-start';
    openB.style.marginTop = compact ? '4px' : '2px';
    openB.textContent = '[';
    row.appendChild(openB);

    vals.forEach((v, i) => {
      const cell = document.createElement('div');
      cell.className = 'vec-cell';
      if (compact) cell.style.minWidth = '52px';

      const box = document.createElement('div');
      box.className = 'vec-val' + (sorted.has(i) ? ' sorted' : swapped.has(i) ? ' swapped' : '');
      if (compact) {
        box.style.minWidth = '50px';
        box.style.height = '48px';
        box.style.fontSize = '26px';
      }
      box.textContent = v;

      const idx = document.createElement('div');
      idx.className = 'vec-idx';
      if (compact) idx.style.fontSize = '19px';
      idx.textContent = i;

      cell.appendChild(box);
      cell.appendChild(idx);
      row.appendChild(cell);
    });

    const closeB = document.createElement('span');
    closeB.className = 'vec-bracket';
    closeB.style.fontSize = compact ? '42px' : '50px';
    closeB.style.alignSelf = 'flex-start';
    closeB.style.marginTop = compact ? '4px' : '2px';
    closeB.textContent = ']';
    row.appendChild(closeB);

    el.appendChild(row);
  });

  /* ---------- Árvores heap ---------- */
  document.querySelectorAll('[data-tree]').forEach(el => {
    const r = +el.dataset.r;
    const font = +el.dataset.font;
    const values = el.dataset.values.split(',');
    const nodes = el.dataset.nodes.trim().split(/\s+/).map(p => p.split(',').map(Number));
    const labels = el.dataset.labels.trim().split(/\s+/).map(p => p.split(',').map(Number));
    const hl = new Set((el.dataset.hl || '').split(',').filter(Boolean).map(Number));
    el.className = 'tree';

    let lines = '';
    nodes.forEach(([x, y], i) => {
      [2 * i + 1, 2 * i + 2].forEach(c => {
        if (c < nodes.length) {
          const [cx, cy] = nodes[c];
          lines += `<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" stroke="#5b6676" stroke-width="2"/>`;
        }
      });
    });
    el.innerHTML = `<svg xmlns="${SVGNS}" width="1440" height="810">${lines}</svg>`;

    nodes.forEach(([x, y], i) => {
      const n = document.createElement('div');
      n.className = 'node';
      n.style.cssText = `left:${x}px;top:${y}px;width:${r * 2}px;height:${r * 2}px;font-size:${font}px`;
      if (hl.has(i)) {
        n.style.background = '#c8f5ff';
        n.style.borderColor = '#34d399';
      }
      n.textContent = values[i];
      el.appendChild(n);

      const [lx, ly] = labels[i];
      const l = document.createElement('div');
      l.className = 'idx';
      l.style.cssText = `left:${lx}px;top:${ly}px;font-size:24px`;
      l.textContent = i;
      el.appendChild(l);
    });
  });

  /* ---------- Gráficos Mock SVG (Slides 12 e 13) ---------- */
  function renderCharts() {
    const legendEl = document.getElementById('line-legend');
    if (legendEl) {
      legendEl.innerHTML = MOCK_BENCHMARK.series.map(s => `
        <div class="leg-item">
          <span class="leg-dot" style="background:${s.color}"></span>
          <span>${s.name}</span>
        </div>
      `).join('');
    }

    const lineHost = document.getElementById('chart-lines');
    if (lineHost) {
      const W = 1216, H = 435;
      const ml = 88, mr = 165, mt = 24, mb = 64;
      const pw = W - ml - mr, ph = H - mt - mb;
      const xs = MOCK_BENCHMARK.sizeLabels.map((_, idx) =>
        ml + (idx / (MOCK_BENCHMARK.sizeLabels.length - 1)) * pw
      );
      const yPos = v => mt + ph - (v / MOCK_BENCHMARK.maxY) * ph;

      let svg = `<svg xmlns="${SVGNS}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;overflow:visible">`;

      // Grade horizontal (Y)
      for (let v = 0; v <= MOCK_BENCHMARK.maxY; v += 10) {
        const y = yPos(v).toFixed(1);
        svg += `<line x1="${ml}" y1="${y}" x2="${W - mr}" y2="${y}" stroke="${v === 0 ? '#7ae8fa' : 'rgba(148,210,232,.18)'}" stroke-width="${v === 0 ? 1.8 : 1}" ${v > 0 ? 'stroke-dasharray="5 5"' : ''}/>`;
        svg += `<text x="${ml - 14}" y="${(+y + 5).toFixed(1)}" text-anchor="end" fill="#bfe8f7" font-family="SF Pro Rounded, sans-serif" font-weight="600" font-size="16">${v} ms</text>`;
      }

      // Eixo X e grades verticais
      svg += `<line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="#7ae8fa" stroke-width="1.8"/>`;
      xs.forEach((x, i) => {
        svg += `<line x1="${x.toFixed(1)}" y1="${mt}" x2="${x.toFixed(1)}" y2="${mt + ph}" stroke="rgba(148,210,232,.12)" stroke-width="1"/>`;
        svg += `<text x="${x.toFixed(1)}" y="${mt + ph + 26}" text-anchor="middle" fill="#e6f6fc" font-family="SF Pro Rounded, sans-serif" font-weight="700" font-size="17">${MOCK_BENCHMARK.sizeLabels[i]}</text>`;
      });

      // Rótulos dos eixos
      svg += `<text x="${ml + pw / 2}" y="${H - 8}" text-anchor="middle" fill="#7ae8fa" font-family="SF Pro Display, sans-serif" font-weight="700" font-size="18">Tamanho do Vetor (n)</text>`;
      svg += `<text transform="translate(22 ${mt + ph / 2}) rotate(-90)" text-anchor="middle" fill="#7ae8fa" font-family="SF Pro Display, sans-serif" font-weight="700" font-size="18">Tempo de Execução (ms)</text>`;

      // Séries (desenha de cima para baixo, deixando Duplicadas e Decrescente nítidas)
      MOCK_BENCHMARK.series.forEach(s => {
        const pts = s.timesMs.map((val, i) => `${xs[i].toFixed(1)},${yPos(val).toFixed(1)}`).join(' ');
        svg += `<polyline fill="none" stroke="${s.color}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/>`;
        s.timesMs.forEach((val, i) => {
          svg += `<circle cx="${xs[i].toFixed(1)}" cy="${yPos(val).toFixed(1)}" r="5.5" fill="${s.color}" stroke="#0b0d10" stroke-width="2"/>`;
        });
      });

      // Callouts no ponto final (200k) com espaçamento vertical controlado para zero colisão
      const endX = xs[xs.length - 1];
      const endAnnotations = [
        { label: 'Aleatório · 44,2 ms', y: yPos(44.2) - 18, dotY: yPos(44.2), color: '#38bdf8' },
        { label: 'Quase Ord. · 42,9 ms', y: yPos(42.9) + 3, dotY: yPos(42.9), color: '#fb7185' },
        { label: 'Ordenado · 41,8 ms', y: yPos(41.8) + 24, dotY: yPos(41.8), color: '#a78bfa' },
        { label: 'Decresc. · 38,4 ms', y: yPos(38.4) + 52, dotY: yPos(38.4), color: '#fbbf24' },
        { label: 'Duplicadas · 27,6 ms', y: yPos(27.6) + 5, dotY: yPos(27.6), color: '#34d399' },
      ];
      endAnnotations.forEach(a => {
        svg += `<line x1="${endX + 7}" y1="${a.dotY.toFixed(1)}" x2="${endX + 18}" y2="${a.y.toFixed(1)}" stroke="${a.color}" stroke-width="1.3" opacity=".75"/>`;
        svg += `<text x="${endX + 22}" y="${(a.y + 5).toFixed(1)}" fill="${a.color}" font-family="SF Pro Rounded, sans-serif" font-weight="700" font-size="14.5">${a.label}</text>`;
      });

      svg += `</svg>`;
      lineHost.innerHTML = svg;
    }

    const barHost = document.getElementById('chart-bars');
    if (barHost) {
      const W = 636, H = 416;
      const ml = 164, mr = 86, mt = 16, mb = 64;
      const pw = W - ml - mr, ph = H - mt - mb;
      const maxX = 50;
      const rowH = ph / MOCK_BENCHMARK.series.length;

      let svg = `<svg xmlns="${SVGNS}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;overflow:visible">`;

      // Grid vertical (tempo em ms)
      for (let v = 0; v <= maxX; v += 10) {
        const x = ml + (v / maxX) * pw;
        svg += `<line x1="${x.toFixed(1)}" y1="${mt}" x2="${x.toFixed(1)}" y2="${mt + ph}" stroke="${v === 0 ? '#7ae8fa' : 'rgba(148,210,232,.18)'}" stroke-width="${v === 0 ? 1.8 : 1}" ${v > 0 ? 'stroke-dasharray="4 4"' : ''}/>`;
        svg += `<text x="${x.toFixed(1)}" y="${mt + ph + 24}" text-anchor="middle" fill="#bfe8f7" font-family="SF Pro Rounded, sans-serif" font-weight="600" font-size="15">${v} ms</text>`;
      }

      MOCK_BENCHMARK.series.forEach((s, i) => {
        const val = s.timesMs[s.timesMs.length - 1];
        const bw = (val / maxX) * pw;
        const barH = 36;
        const y = mt + i * rowH + (rowH - barH) / 2;

        svg += `<text x="${ml - 14}" y="${(y + barH / 2 + 5).toFixed(1)}" text-anchor="end" fill="#eef6fa" font-family="SF Pro Text, sans-serif" font-weight="600" font-size="16.5">${s.name}</text>`;
        svg += `<rect x="${ml}" y="${y.toFixed(1)}" width="${pw}" height="${barH}" rx="7" fill="rgba(255,255,255,.04)"/>`;
        svg += `<rect x="${ml}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${barH}" rx="7" fill="${s.color}"/>`;
        svg += `<text x="${(ml + bw + 10).toFixed(1)}" y="${(y + barH / 2 + 6).toFixed(1)}" fill="#ffffff" font-family="SF Pro Rounded, sans-serif" font-weight="700" font-size="17">${val.toFixed(1).replace('.', ',')} ms</text>`;
      });

      svg += `<text x="${ml + pw / 2}" y="${H - 4}" text-anchor="middle" fill="#7ae8fa" font-family="SF Pro Display, sans-serif" font-weight="700" font-size="16">Tempo de Execução (ms) — Cenário vs. Tempo</text>`;
      svg += `</svg>`;
      barHost.innerHTML = svg;
    }
  }
  renderCharts();

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
