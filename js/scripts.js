/* ==========================================================================
   TradeSchool — Steep Motion & Interaction Choreography (100% Pure Vanilla JS)
   Zero frameworks · Zero external dependencies · Reduced-motion aware
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let syncStickyBar = () => {};

  /* ------------------------------------------------------------------------
     1. Accessible Mobile Navigation Drawer & Desktop Dropdown Menus
     ------------------------------------------------------------------------ */
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const drawer = document.getElementById('mobile-drawer');

  function setDrawer(open) {
    if (!drawer || !menuBtn) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    syncStickyBar();
    if (open && closeBtn) closeBtn.focus();
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => setDrawer(true));
    if (closeBtn) closeBtn.addEventListener('click', () => setDrawer(false));
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setDrawer(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setDrawer(false);
        menuBtn.focus();
      }
    });
  }

  /* Desktop Dropdown click & keyboard toggle */
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach((dd) => {
    const trigger = dd.querySelector('.nav-drop-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      if (trigger.tagName === 'BUTTON') {
        e.preventDefault();
        const willOpen = !dd.classList.contains('is-open');
        dropdowns.forEach((other) => {
          other.classList.remove('is-open');
          const ot = other.querySelector('.nav-drop-trigger');
          if (ot) ot.setAttribute('aria-expanded', 'false');
        });
        dd.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach((dd) => {
        dd.classList.remove('is-open');
        const t = dd.querySelector('.nav-drop-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ------------------------------------------------------------------------
     2. Steep Word-by-Word Hero Entrance Choreography
     ------------------------------------------------------------------------ */
  const heroHeadings = document.querySelectorAll('[data-word-reveal]');
  heroHeadings.forEach((heading) => {
    if (prefersReducedMotion) {
      heading.classList.add('is-revealed');
      return;
    }
    let idx = 0;
    function wrapTextNodes(node) {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const tokens = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          tokens.forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(tok));
            } else {
              const mask = document.createElement('span');
              mask.className = 'word-mask';
              const inner = document.createElement('span');
              inner.className = 'word-inner';
              inner.style.transitionDelay = `${Math.min(idx * 36, 480)}ms`;
              inner.textContent = tok;
              mask.appendChild(inner);
              frag.appendChild(mask);
              idx += 1;
            }
          });
          child.replaceWith(frag);
        } else if (
          child.nodeType === Node.ELEMENT_NODE &&
          child.tagName !== 'BR' &&
          !child.classList.contains('copy-placeholder')
        ) {
          wrapTextNodes(child);
        }
      });
    }
    wrapTextNodes(heading);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => heading.classList.add('is-revealed'));
    });
  });

  /* ------------------------------------------------------------------------
     3. IntersectionObserver Scroll Reveals & Animated Counters
     ------------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach((el) => revObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count-to'));
          const suffix = el.getAttribute('data-count-suffix') || '';
          const duration = 900;
          const start = performance.now();
          function step(now) {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          countObs.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((c) => countObs.observe(c));
  }

  /* ------------------------------------------------------------------------
     4. Steep Hero Scroll Scrub + Subtle Desktop Mouse Parallax
     ------------------------------------------------------------------------ */
  const heroScrubBg = document.querySelector('[data-hero-scrub]');
  if (heroScrubBg && !prefersReducedMotion) {
    let scrubTicking = false;
    function updateHeroScrub() {
      scrubTicking = false;
      const y = Math.min(window.scrollY || 0, 900);
      const offset = -(y * 0.16);
      heroScrubBg.style.transform = `translate3d(0px, ${offset.toFixed(1)}px, 0px)`;
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!scrubTicking) {
          requestAnimationFrame(updateHeroScrub);
          scrubTicking = true;
        }
      },
      { passive: true }
    );
    updateHeroScrub();
  }

  const heroStage = document.querySelector('.hero-steep__stage');
  const floatCards = document.querySelectorAll('[data-parallax]');
  if (heroStage && floatCards.length && !prefersReducedMotion && window.innerWidth > 1080) {
    let targetX = 0;
    let targetY = 0;
    let currX = 0;
    let currY = 0;
    let rafId = null;

    heroStage.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1080) return;
      const rect = heroStage.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
      if (!rafId) tickParallax();
    });

    heroStage.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) tickParallax();
    });

    function tickParallax() {
      currX += (targetX - currX) * 0.08;
      currY += (targetY - currY) * 0.08;
      floatCards.forEach((card) => {
        const depth = parseFloat(card.getAttribute('data-parallax')) || 12;
        card.style.marginLeft = `${(currX * depth).toFixed(1)}px`;
        card.style.marginTop = `${(currY * depth).toFixed(1)}px`;
      });
      if (Math.abs(targetX - currX) > 0.002 || Math.abs(targetY - currY) > 0.002) {
        rafId = requestAnimationFrame(tickParallax);
      } else {
        rafId = null;
      }
    }
  }

  /* ------------------------------------------------------------------------
     5. Interactive Historical Auction Chart Window (Homepage Hero)
        Strictly historical educational data (30+ day lag)
     ------------------------------------------------------------------------ */
  const appWinData = {
    zones: {
      badge: 'Historical Educational Illustration · Auction Zones',
      title: 'Reading buyer-seller auction zones without indicators',
      summary:
        'Instead of reacting to a colored arrow, you map where buyers and sellers previously agreed on fair value, watch whether aggressive pressure gets absorbed, and mark the exact price that proves your view wrong.',
      kv1: ['Market State', 'Balanced Auction'],
      kv2: ['Key Zone', 'Prior Fair Value Band'],
      kv3: ['Order Flow Read', 'Selling Absorbed at VAL'],
      kv4: ['Invalidation', 'Clear Acceptance Below'],
      pathA:
        'M14 96 C 58 94, 96 64, 152 60 C 204 56, 238 28, 276 26 C 314 24, 348 76, 396 86 C 436 94, 464 56, 496 46',
      pathB: 'M14 70 C 110 70, 210 68, 320 68 C 402 68, 456 66, 496 66',
      peakX: 276,
      peakY: 26,
      peakLabel: 'Seller Auction Zone (VAH)'
    },
    balance: {
      badge: 'Historical Educational Illustration · Fish Market Analogy',
      title: 'How buyers and sellers negotiate fair value over a session',
      summary:
        'Just like a busy fish market, price moves upward to invite sellers and downward to invite buyers. When both sides agree, volume clusters inside a calm fair-value zone before the next directional shift.',
      kv1: ['Starting Level', 'Complete Beginner'],
      kv2: ['Everyday Model', 'Live Continuous Auction'],
      kv3: ['Indicators Used', 'Zero (Clean Chart)'],
      kv4: ['Core Question', 'Where Is Fair Value?'],
      pathA:
        'M14 110 C 66 96, 118 68, 178 66 C 238 64, 290 72, 344 66 C 398 60, 444 38, 496 28',
      pathB: 'M14 86 C 102 78, 200 72, 310 70 C 402 68, 454 58, 496 50',
      peakX: 344,
      peakY: 66,
      peakLabel: 'Fair Value Agreement (POC)'
    },
    absorption: {
      badge: 'Historical Educational Illustration · Risk & Invalidation',
      title: 'Spotting absorption and defining risk before committing capital',
      summary:
        'When aggressive selling hits a prior value boundary without pushing price lower, passive buyers may be soaking up supply. You write down the hypothesis, size risk conservatively, and step aside if acceptance forms lower.',
      kv1: ['Data Policy', 'Historical (30+ Day Lag)'],
      kv2: ['Practice Step', 'Paper Trading Journal'],
      kv3: ['Observation', 'Downside Effort Absorbed'],
      kv4: ['Discipline', 'Process Over Outcome'],
      pathA:
        'M14 54 C 72 64, 126 98, 184 102 C 238 106, 276 96, 330 62 C 386 28, 442 24, 496 20',
      pathB: 'M14 78 C 98 84, 192 86, 292 70 C 380 54, 444 46, 496 42',
      peakX: 184,
      peakY: 102,
      peakLabel: 'Passive Absorption Zone'
    }
  };

  const appTabs = document.querySelectorAll('[data-app-tab]');
  if (appTabs.length) {
    const elBadge = document.getElementById('app-win-badge');
    const elTitle = document.getElementById('app-win-title');
    const elSummary = document.getElementById('app-win-summary');
    const elPathA = document.getElementById('app-chart-a');
    const elPathB = document.getElementById('app-chart-b');
    const elDot = document.getElementById('app-chart-dot');
    const elTag = document.getElementById('app-chart-tag');
    const elKvs = [
      document.getElementById('app-kv-1'),
      document.getElementById('app-kv-2'),
      document.getElementById('app-kv-3'),
      document.getElementById('app-kv-4')
    ];

    appTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-app-tab');
        const d = appWinData[key];
        if (!d) return;
        appTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });
        if (elBadge) elBadge.textContent = d.badge;
        if (elTitle) elTitle.textContent = d.title;
        if (elSummary) elSummary.textContent = d.summary;
        if (elPathA) elPathA.setAttribute('d', d.pathA);
        if (elPathB) elPathB.setAttribute('d', d.pathB);
        if (elDot) {
          elDot.setAttribute('cx', d.peakX);
          elDot.setAttribute('cy', d.peakY);
        }
        if (elTag) {
          elTag.setAttribute('x', Math.min(355, Math.max(24, d.peakX - 10)));
          elTag.setAttribute('y', d.peakY > 85 ? d.peakY - 14 : Math.max(18, d.peakY - 10));
          elTag.textContent = d.peakLabel;
        }
        [d.kv1, d.kv2, d.kv3, d.kv4].forEach((pair, i) => {
          if (elKvs[i]) {
            elKvs[i].innerHTML = `<span>${pair[0]}</span><span>${pair[1]}</span>`;
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. Steep Interactive 3-Card Concept / Track Row (scale-106 vs scale-92)
     ------------------------------------------------------------------------ */
  const conceptCards = document.querySelectorAll('.concept-card[data-concept-card]');
  if (conceptCards.length) {
    function activateConcept(card) {
      conceptCards.forEach((c) => {
        const active = c === card;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
    }
    conceptCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) activateConcept(card);
      });
      card.addEventListener('focusin', () => activateConcept(card));
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) activateConcept(card);
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. Scroll-Linked Sequential Word Reveal inside Proof Band
     ------------------------------------------------------------------------ */
  const proofQuote = document.querySelector('[data-scroll-words]');
  if (proofQuote && !prefersReducedMotion) {
    const words = proofQuote.textContent.trim().split(/\s+/);
    proofQuote.innerHTML = words.map((w) => `<span class="scroll-word">${w}</span>`).join(' ');
    const wordSpans = proofQuote.querySelectorAll('.scroll-word');

    function updateProofWords() {
      const rect = proofQuote.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const progress = Math.max(0, Math.min(1, (vh * 0.88 - rect.top) / (vh * 0.48)));
      const litCount = Math.ceil(progress * wordSpans.length);
      wordSpans.forEach((sp, i) => {
        sp.classList.toggle('is-lit', i < litCount);
      });
    }
    window.addEventListener('scroll', updateProofWords, { passive: true });
    updateProofWords();
  }

  /* ------------------------------------------------------------------------
     8. Flagship Page Interactive 11-Level Market Intelligence Workspace
        Matches Page 2 syllabus copy accurately
     ------------------------------------------------------------------------ */
  const wsData = {
    '1': {
      phase: 'Phase I · Beginner Safe (Levels 01-03)',
      title: 'Level 01: Market microstructure',
      question: 'How does the market physically work?',
      analogy:
        'Everyday analogy: An order book resembles a queue at a shop counter, and the bid-ask spread is simply two sides negotiating before agreeing.',
      summary:
        'Why markets exist, price versus value, participant objectives (retail, HNIs, mutual funds, FIIs, market makers), exchange matching engines, and market, limit, and stop orders.',
      outcomes: [
        'Explain how exchanges match orders and how mutual funds, FIIs, and market makers act',
        'Distinguish price versus value clearly in plain Malayalam',
        'Understand market, limit, and stop orders physically inside the queue'
      ],
      metricA: 'Starting point: Zero prior knowledge required',
      metricB: 'Core question: How does the market physically work?',
      chartLabel: 'Historical Educational Diagram · Exchange Matching Queue',
      svg: '<rect x="34" y="16" width="160" height="10" rx="4" fill="#2dd4bf" fill-opacity="0.38"/><rect x="34" y="32" width="120" height="10" rx="4" fill="#2dd4bf" fill-opacity="0.25"/><rect x="34" y="48" width="205" height="10" rx="4" fill="#2dd4bf" fill-opacity="0.52"/><rect x="310" y="16" width="180" height="10" rx="4" fill="#a78bfa" fill-opacity="0.48"/><rect x="310" y="32" width="130" height="10" rx="4" fill="#a78bfa" fill-opacity="0.3"/><rect x="310" y="48" width="95" height="10" rx="4" fill="#a78bfa" fill-opacity="0.22"/><line x1="270" y1="8" x2="270" y2="68" stroke="#e8b87d" stroke-dasharray="3 3" stroke-width="1.2"/>'
    },
    '2': {
      phase: 'Phase I · Beginner Safe (Levels 01-03)',
      title: 'Level 02: Order flow intelligence',
      question: 'What is happening inside the auction right now?',
      analogy:
        'Everyday analogy: Absorption behaves like a sponge soaking water, and a trapped trader like a truck turning onto a road with no exit.',
      summary:
        'Actual buying versus selling inside each move: volume, delta (net aggressive buying minus selling), absorption (large orders soaking pressure), exhaustion, and trapped traders.',
      outcomes: [
        'Read volume and net aggressive delta inside historical price moves',
        'Spot absorption when large orders soak up market pressure',
        'Identify exhaustion and trapped traders without lagging arrows'
      ],
      metricA: 'Focus: Actual buying vs. selling inside each move',
      metricB: 'Core question: What is happening inside the auction right now?',
      chartLabel: 'Historical Educational Diagram · Volume, Delta & Absorption',
      svg: '<rect x="64" y="14" width="68" height="48" rx="8" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.16"/><rect x="156" y="10" width="68" height="52" rx="8" fill="#a78bfa" fill-opacity="0.18" stroke="#a78bfa" stroke-opacity="0.65"/><rect x="248" y="20" width="68" height="42" rx="8" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.16"/><rect x="340" y="12" width="68" height="50" rx="8" fill="#e8b87d" fill-opacity="0.2" stroke="#e8b87d" stroke-opacity="0.75"/><path d="M98 44 L190 22 L282 40 L374 26 L466 16" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1.4" fill="none"/>'
    },
    '3': {
      phase: 'Phase I · Beginner Safe (Levels 01-03)',
      title: 'Level 03: Auction market theory',
      question: 'Why is price behaving this way?',
      analogy:
        'Everyday analogy: An auction works like a busy fish market cycling between calm agreement and rapid price discovery.',
      summary:
        'Cycles of balance and imbalance, acceptance versus rejection of price, and proactive versus reactive moves.',
      outcomes: [
        'Distinguish balanced sessions from directional imbalance cycles',
        'Read acceptance versus rejection at key price boundaries',
        'Separate proactive initiative moves from reactive rotations'
      ],
      metricA: 'Focus: Balance and imbalance cycles',
      metricB: 'Core question: Why is price behaving this way?',
      chartLabel: 'Historical Educational Diagram · Balance to Imbalance Cycle',
      svg: '<rect x="36" y="24" width="160" height="36" rx="8" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.2" stroke-dasharray="4 3"/><path d="M48 48 L84 30 L122 52 L168 32 L212 42 L268 16 L326 24 L374 14 L496 22" stroke="#2dd4bf" stroke-width="1.6" fill="none"/><rect x="316" y="10" width="186" height="24" rx="6" fill="#a78bfa" fill-opacity="0.14" stroke="#a78bfa" stroke-opacity="0.45"/>'
    },
    '4': {
      phase: 'Phase II · Structural Depth (Levels 04-07)',
      title: 'Level 04: Market profile and value',
      question: 'Where did buyers and sellers agree on fair value?',
      analogy:
        'Everyday analogy: Liquidity behaves like water flow pooling naturally where buyers and sellers agree on fair value.',
      summary:
        'Where time and heavy volume built fair value: Point of Control (most active price), Value Area High and Low (fair-value range), initial balance, and unfinished auction highs or lows.',
      outcomes: [
        'Map Point of Control (POC) and Value Area High/Low (VAH/VAL)',
        'Read initial balance and unfinished auction highs or lows',
        'Anchor every read to agreed fair value instead of arbitrary lines'
      ],
      metricA: 'Focus: Fair-value boundaries (VAH / POC / VAL)',
      metricB: 'Core question: Where did buyers and sellers agree on fair value?',
      chartLabel: 'Historical Educational Diagram · Market Profile Distribution',
      svg: '<rect x="44" y="10" width="70" height="7" rx="3" fill="#ffffff" fill-opacity="0.2"/><rect x="44" y="21" width="164" height="7" rx="3" fill="#a78bfa" fill-opacity="0.45"/><rect x="44" y="32" width="286" height="9" rx="4" fill="#e8b87d" fill-opacity="0.82"/><rect x="44" y="45" width="192" height="7" rx="3" fill="#a78bfa" fill-opacity="0.45"/><rect x="44" y="56" width="96" height="7" rx="3" fill="#ffffff" fill-opacity="0.2"/><line x1="340" y1="36" x2="508" y2="36" stroke="#e8b87d" stroke-dasharray="3 3" stroke-width="1.2"/>'
    },
    '5': {
      phase: 'Phase II · Structural Depth (Levels 04-07)',
      title: 'Level 05: Institutional inventory',
      question: 'Who is positioned, and what forces adjustment?',
      analogy:
        'Everyday analogy: Inventory works like a shopkeeper\'s stock, where holding too much forces adjustment when demand shifts.',
      summary:
        'Thinking in positions instead of isolated candles: how large participants accumulate, distribute, hedge, and unwind stock.',
      outcomes: [
        'Think in positions rather than isolated candle patterns',
        'Understand how large participants accumulate, distribute, and hedge',
        'Spot structural pressure that forces institutional unwinds'
      ],
      metricA: 'Focus: Institutional positioning & unwinds',
      metricB: 'Core question: Who is positioned, and what forces adjustment?',
      chartLabel: 'Historical Educational Diagram · Inventory Build & Adjustment',
      svg: '<path d="M24 56 C 110 54, 178 60, 248 48 C 310 38, 366 14, 506 12" stroke="#a78bfa" stroke-width="1.7" fill="none"/><path d="M24 56 C 110 54, 178 60, 248 48 L248 68 L24 68 Z" fill="#e8b87d" fill-opacity="0.16"/><circle cx="248" cy="48" r="4.5" fill="#e8b87d"/><circle cx="378" cy="20" r="4.5" fill="#ffffff"/>'
    },
    '6': {
      phase: 'Phase II · Structural Depth (Levels 04-07)',
      title: 'Level 06: Macro flow intelligence',
      question: 'Why might big capital be moving this way?',
      analogy:
        'Everyday analogy: Reading broader economic currents across bonds, currencies, and commodities before zooming into one chart.',
      summary:
        'Tracking capital across asset classes: bonds, Dollar Index, USDINR, gold, crude, VIX (expected market volatility), FII and DII flows, and derivatives positioning.',
      outcomes: [
        'Track cross-asset shifts across bonds, Dollar Index, USDINR, gold, and crude',
        'Interpret VIX, FII and DII flows, and derivatives positioning calmly',
        'Connect macro capital shifts directly to daily auction structure'
      ],
      metricA: 'Focus: Cross-asset macro capital flows',
      metricB: 'Core question: Why might big capital be moving this way?',
      chartLabel: 'Historical Educational Diagram · Macro Capital Flow Connections',
      svg: '<circle cx="84" cy="38" r="22" stroke="#2dd4bf" stroke-opacity="0.65" stroke-width="1.2"/><circle cx="268" cy="38" r="26" stroke="#a78bfa" stroke-opacity="0.8" stroke-width="1.4"/><circle cx="452" cy="38" r="22" stroke="#e8b87d" stroke-opacity="0.7" stroke-width="1.2"/><path d="M108 38 H240 M296 38 H428" stroke="#ffffff" stroke-opacity="0.35" stroke-dasharray="4 4" stroke-width="1.2"/>'
    },
    '7': {
      phase: 'Phase II · Structural Depth (Levels 04-07)',
      title: 'Level 07: Multi-timeframe auctions',
      question: 'Where does today sit inside the bigger picture?',
      analogy:
        'Everyday analogy: Reading the full regional map first so a five-minute move never blinds you to the larger structure.',
      summary:
        'Nesting monthly, weekly, daily, and intraday auctions so a five-minute move never blinds you to the larger structure.',
      outcomes: [
        'Nest monthly, weekly, daily, and intraday auctions clearly',
        'Keep higher-timeframe context anchored above short-term noise',
        'Apply one consistent structural lens across instruments'
      ],
      metricA: 'Focus: Nested multi-timeframe context',
      metricB: 'Core question: Where does today sit inside the bigger picture?',
      chartLabel: 'Historical Educational Diagram · Nested Timeframe Hierarchy',
      svg: '<rect x="36" y="8" width="464" height="60" rx="10" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1"/><rect x="92" y="16" width="352" height="44" rx="8" stroke="#a78bfa" stroke-opacity="0.45" stroke-width="1.2"/><rect x="168" y="24" width="200" height="28" rx="6" fill="#e8b87d" fill-opacity="0.16" stroke="#e8b87d" stroke-opacity="0.75" stroke-width="1.2"/>'
    },
    '8': {
      phase: 'Phase III · Independent Mastery (Levels 08-11)',
      title: 'Level 08: Auction narrative analysis',
      question: 'Can I explain the story straight without guessing?',
      analogy:
        'Everyday analogy: Speaking a language naturally out loud instead of waiting for indicators to flash cues.',
      summary:
        'Reading a candle, session, week, or month without indicator dependency to explain clearly what happened and what remains unresolved.',
      outcomes: [
        'Read any clean chart with RSI, MACD, moving averages, and arrows removed',
        'Explain clearly what happened and what remains unresolved',
        'Separate observed raw facts from unverified assumptions'
      ],
      metricA: 'Focus: Indicator-free narration',
      metricB: 'Core question: Can I explain the story straight without guessing?',
      chartLabel: 'Historical Educational Diagram · Clean Indicator-Free Chart Read',
      svg: '<path d="M22 54 L94 42 L152 50 L230 24 L298 34 L388 18 L508 26" stroke="#ffffff" stroke-opacity="0.88" stroke-width="1.5" fill="none"/><circle cx="230" cy="24" r="4" fill="#a78bfa"/><circle cx="388" cy="18" r="4" fill="#e8b87d"/>'
    },
    '9': {
      phase: 'Phase III · Independent Mastery (Levels 08-11)',
      title: 'Level 09: Institutional decision framework',
      question: 'How do all pieces connect before I act?',
      analogy:
        'Everyday analogy: Putting analysis in exact top-down order so nothing contradicts before execution.',
      summary:
        'Putting analysis in exact order: macro first, then fair value, inventory, auction structure, order flow, and finally execution.',
      outcomes: [
        'Sequence macro, fair value, inventory, auction structure, and order flow',
        'Write one clear pre-trade checklist before any risk is considered',
        'Eliminate contradictory setups and impulsive entries'
      ],
      metricA: 'Focus: Ordered institutional sequence',
      metricB: 'Core question: How do all pieces connect before I act?',
      chartLabel: 'Historical Educational Diagram · Ordered Institutional Sequence',
      svg: '<rect x="20" y="24" width="76" height="28" rx="14" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/><rect x="122" y="24" width="76" height="28" rx="14" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/><rect x="224" y="24" width="84" height="28" rx="14" fill="#a78bfa" fill-opacity="0.2" stroke="#a78bfa" stroke-opacity="0.65"/><rect x="334" y="24" width="76" height="28" rx="14" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/><rect x="436" y="24" width="78" height="28" rx="14" fill="#e8b87d" fill-opacity="0.22" stroke="#e8b87d" stroke-opacity="0.8"/><path d="M96 38 H122 M198 38 H224 M308 38 H334 M410 38 H436" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2"/>'
    },
    '10': {
      phase: 'Phase III · Independent Mastery (Levels 08-11)',
      title: 'Level 10: Professional execution',
      question: 'How do I express a thesis responsibly?',
      analogy:
        'Everyday analogy: Risk is handled like carrying glass, deliberate, steady, and capped in advance.',
      summary:
        'Entries, scaling, strict risk limits, trade management, written journaling, and judging decisions by quality per unit of risk.',
      outcomes: [
        'Size positions and set disciplined risk limits calmly',
        'Log written journals and judge decisions by quality per unit of risk',
        'Practice thoroughly on paper before live capital enters'
      ],
      metricA: 'Focus: Risk-capped execution & journaling',
      metricB: 'Core question: How do I express a thesis responsibly?',
      chartLabel: 'Historical Educational Diagram · Defined Risk & Review Discipline',
      svg: '<line x1="24" y1="54" x2="508" y2="54" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1"/><rect x="64" y="42" width="44" height="12" rx="4" fill="#eb8080" fill-opacity="0.55"/><rect x="150" y="34" width="44" height="20" rx="4" fill="#2dd4bf" fill-opacity="0.45"/><rect x="236" y="22" width="44" height="32" rx="4" fill="#2dd4bf" fill-opacity="0.62"/><rect x="322" y="44" width="44" height="10" rx="4" fill="#eb8080" fill-opacity="0.5"/><rect x="408" y="10" width="44" height="44" rx="4" fill="#e8b87d" fill-opacity="0.8"/>'
    },
    '11': {
      phase: 'Phase III · Independent Mastery (Levels 08-11)',
      title: 'Level 11: Independent market research',
      question: 'Can I test and challenge my own ideas?',
      analogy:
        'Everyday analogy: Standing on your own feet so you never rely on tips or a mentor forever.',
      summary:
        'Forming testable hypotheses, hunting actively for contradictory evidence, documenting results, and revising frameworks as markets evolve.',
      outcomes: [
        'Form testable hypotheses and hunt for contradictory evidence',
        'Document results and revise frameworks as market regimes evolve',
        'Operate with genuine independent judgment for life'
      ],
      metricA: 'Focus: Lifetime independent research',
      metricB: 'Core question: Can I test and challenge my own ideas?',
      chartLabel: 'Historical Educational Diagram · Scientific Research Cycle',
      svg: '<circle cx="268" cy="38" r="24" stroke="#a78bfa" stroke-opacity="0.7" stroke-width="1.3" stroke-dasharray="5 4"/><circle cx="152" cy="38" r="14" stroke="#2dd4bf" stroke-opacity="0.65" stroke-width="1.2"/><circle cx="384" cy="38" r="14" stroke="#e8b87d" stroke-opacity="0.75" stroke-width="1.2"/><path d="M168 38 H242 M294 38 H368" stroke="#ffffff" stroke-opacity="0.45" stroke-width="1.2"/>'
    }
  };

  const wsButtons = document.querySelectorAll('[data-ws-level]');
  if (wsButtons.length) {
    const elPhase = document.getElementById('ws-phase');
    const elTitle = document.getElementById('ws-title');
    const elQuestion = document.getElementById('ws-question');
    const elAnalogy = document.getElementById('ws-analogy');
    const elSummary = document.getElementById('ws-summary');
    const elOutcomes = document.getElementById('ws-outcomes');
    const elMetricA = document.getElementById('ws-metric-a');
    const elMetricB = document.getElementById('ws-metric-b');
    const elChartLabel = document.getElementById('ws-chart-label');
    const elChartSvg = document.getElementById('ws-chart-svg');

    wsButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-ws-level');
        const item = wsData[key];
        if (!item) return;

        wsButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
        if (elPhase) elPhase.textContent = item.phase;
        if (elTitle) elTitle.textContent = item.title;
        if (elQuestion) elQuestion.textContent = item.question;
        if (elAnalogy) elAnalogy.textContent = item.analogy;
        if (elSummary) elSummary.textContent = item.summary;
        if (elMetricA) elMetricA.textContent = item.metricA;
        if (elMetricB) elMetricB.textContent = item.metricB;
        if (elChartLabel) elChartLabel.textContent = item.chartLabel;
        if (elChartSvg) elChartSvg.innerHTML = item.svg;
        if (elOutcomes) {
          elOutcomes.innerHTML = item.outcomes.map((o) => `<li>${o}</li>`).join('');
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. Filter Pills (Curriculum Phases, Learner Stories, FAQ Categories)
     ------------------------------------------------------------------------ */
  function initFilterGroup(tabAttr, itemAttr) {
    const tabs = document.querySelectorAll(`[${tabAttr}]`);
    const items = document.querySelectorAll(`[${itemAttr}]`);
    if (!tabs.length || !items.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute(tabAttr);
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });
        items.forEach((item) => {
          const val = item.getAttribute(itemAttr) || '';
          const match = filter === 'all' || val.split(',').includes(filter);
          item.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  initFilterGroup('data-phase-filter', 'data-level-phase');
  initFilterGroup('data-story-filter', 'data-story-cat');
  initFilterGroup('data-faq-filter', 'data-faq-cat');

  /* ------------------------------------------------------------------------
     10. Silky Grid-Rows FAQ Accordion
     ------------------------------------------------------------------------ */
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      if (!item) return;
      const willOpen = !item.classList.contains('is-open');
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
          openItem.classList.remove('is-open');
          const btn = openItem.querySelector('.faq-trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });

  /* ------------------------------------------------------------------------
     11. Form B: Corporate / Campus Workshop Brief Submission
     ------------------------------------------------------------------------ */
  const workshopForm = document.getElementById('workshop-brief-form');
  if (workshopForm) {
    workshopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const fields = [
        { key: 'b_name', msg: 'Please enter your name.' },
        { key: 'b_email', msg: 'Please enter a valid work or institution email address.', email: true },
        { key: 'b_org', msg: 'Please enter your organization or campus name.' }
      ];

      fields.forEach((f) => {
        const inp = workshopForm.querySelector(`[data-field="${f.key}"]`);
        const err = workshopForm.querySelector(`[data-error="${f.key}"]`);
        if (err) err.classList.remove('is-visible');
        if (inp) inp.classList.remove('is-invalid');
        const val = inp ? inp.value.trim() : '';
        const bad = !val || (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
        if (bad) {
          if (err) {
            err.textContent = f.msg;
            err.classList.add('is-visible');
          }
          if (inp) inp.classList.add('is-invalid');
          valid = false;
        }
      });

      if (!valid) return;
      const banner = document.getElementById('workshop-form-success');
      if (banner) {
        banner.classList.add('is-visible');
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      workshopForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     13. Thank-You Page Dynamic Hydration + Google Calendar & .ics Generator
     ------------------------------------------------------------------------ */
  const tyEmailEl = document.getElementById('ty-email');
  const tySlotEl = document.getElementById('ty-slot');
  const tyGcalBtn = document.getElementById('ty-gcal-btn');
  const tyIcsBtn = document.getElementById('ty-ics-btn');

  if (tyEmailEl || tySlotEl) {
    let data = {};
    const params = new URLSearchParams(window.location.search);
    if (params.get('email') || params.get('slot')) {
      data = {
        name: params.get('name') || '',
        email: params.get('email') || '',
        slot: params.get('slot') || '',
        iso: params.get('iso') || ''
      };
    } else {
      try {
        const stored = sessionStorage.getItem('ts_booking_confirmation');
        if (stored) data = JSON.parse(stored);
      } catch (err) {
        /* ignore */
      }
    }

    if (tyEmailEl && data.email) tyEmailEl.textContent = ` (${data.email})`;
    if (tySlotEl && data.slot) tySlotEl.textContent = data.slot;

    function buildStartEndIso(isoStr) {
      let y, mo, da, h, mi;
      if (isoStr && /^\d{8}T\d{6}$/.test(isoStr)) {
        y = parseInt(isoStr.slice(0, 4), 10);
        mo = parseInt(isoStr.slice(4, 6), 10) - 1;
        da = parseInt(isoStr.slice(6, 8), 10);
        h = parseInt(isoStr.slice(9, 11), 10);
        mi = parseInt(isoStr.slice(11, 13), 10);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        y = tomorrow.getFullYear();
        mo = tomorrow.getMonth();
        da = tomorrow.getDate();
        h = 19;
        mi = 30;
      }
      const startIst = new Date(Date.UTC(y, mo, da, h - 5, mi - 30));
      const endIst = new Date(startIst.getTime() + 30 * 60000);
      const fmt = (dt) =>
        `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}T${String(dt.getUTCHours()).padStart(2, '0')}${String(dt.getUTCMinutes()).padStart(2, '0')}00Z`;
      return { start: fmt(startIst), end: fmt(endIst) };
    }

    const calTimes = buildStartEndIso(data.iso);
    const evTitle = 'TRADE SCHOOL Free 30-Minute Intro Call';
    const evDetails =
      'Free 30-minute live Malayalam introductory call with a senior TRADE SCHOOL advisor (10+ years of market experience): starting level map, mechanics-first curriculum overview, current dynamic pricing and written terms, and how our formal assessment sessions operate (100% refund if you quit right after assessment sessions; no refund thereafter). Strictly financial education, not investment advice. TRADE SCHOOL is a financial education and human empowerment division of THC Institute, by The Happiness Company Business Solutions Pvt. Ltd.';

    if (tyGcalBtn) {
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evTitle)}&dates=${calTimes.start}/${calTimes.end}&details=${encodeURIComponent(evDetails)}&location=${encodeURIComponent('Private Online Video Link (emailed)')}`;
      tyGcalBtn.setAttribute('href', gcalUrl);
    }

    if (tyIcsBtn) {
      tyIcsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//TRADE SCHOOL//Intro Call//EN',
          'BEGIN:VEVENT',
          `DTSTART:${calTimes.start}`,
          `DTEND:${calTimes.end}`,
          `SUMMARY:${evTitle}`,
          `DESCRIPTION:${evDetails}`,
          'LOCATION:Private Video Link (emailed upon confirmation)',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tradeschool-intro-call.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
  }

  /* ------------------------------------------------------------------------
     14. Printable 11-Level Syllabus Summary Modal (Page 2 PDF Link)
     ------------------------------------------------------------------------ */
  const syllabusModal = document.getElementById('syllabus-modal');
  const openSyllabusBtns = document.querySelectorAll('[data-open-syllabus-modal]');
  const closeSyllabusBtns = document.querySelectorAll('[data-close-syllabus-modal]');
  const printSyllabusBtn = document.getElementById('print-syllabus-btn');

  if (syllabusModal) {
    openSyllabusBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        syllabusModal.classList.add('is-open');
        syllabusModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });
    closeSyllabusBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        syllabusModal.classList.remove('is-open');
        syllabusModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
    syllabusModal.addEventListener('click', (e) => {
      if (e.target === syllabusModal) {
        syllabusModal.classList.remove('is-open');
        syllabusModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && syllabusModal.classList.contains('is-open')) {
        syllabusModal.classList.remove('is-open');
        syllabusModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
    if (printSyllabusBtn) {
      printSyllabusBtn.addEventListener('click', () => window.print());
    }
  }

  /* ------------------------------------------------------------------------
     15. Native Mobile Stacked Tables (Auto-stamp data-label from thead th)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.editorial-table').forEach((table) => {
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      th.textContent.trim()
    );
    if (!headers.length) return;
    table.querySelectorAll('tbody tr').forEach((row) => {
      Array.from(row.children).forEach((cell, idx) => {
        if (headers[idx] && !cell.hasAttribute('data-label')) {
          cell.setAttribute('data-label', headers[idx]);
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     16. Native Mobile Sticky Bottom Bar & Horizontal Pill Centering
     ------------------------------------------------------------------------ */
  const stickyBar = document.getElementById('mobile-sticky-cta');
  const footer = document.querySelector('.site-footer');

  if (stickyBar) {
    let ticking = false;
    function updateStickyBar() {
      ticking = false;
      const scrolledPastHero = window.scrollY > 440;
      let nearFooter = false;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        nearFooter = rect.top < window.innerHeight + 60;
      }
      const drawerOpen = drawer && drawer.classList.contains('is-open');
      stickyBar.classList.toggle('is-visible', scrolledPastHero && !nearFooter && !drawerOpen);
    }

    syncStickyBar = updateStickyBar;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateStickyBar);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', updateStickyBar, { passive: true });
    updateStickyBar();
  }

  document
    .querySelectorAll('.ws-level-btn, .phase-tab, .filter-pill, .app-win-tab')
    .forEach((el) => {
      el.addEventListener('click', () => {
        if (window.innerWidth <= 768 && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
})();
