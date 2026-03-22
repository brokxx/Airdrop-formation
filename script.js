/* ═══════════════════════════════════════════
   LOADER
   ═══════════════════════════════════════════ */
const loader = document.getElementById('loader');
if (loader) {
  // Last word: 0.95s delay + 0.8s anim = 1.75s, then pause before fade
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 600);
  }, 2200);
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════ */
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════ */
const scrollProgress = document.getElementById('scrollProgress');
const heroGridBg = document.getElementById('heroGridBg');
const heroFloatCards = document.querySelectorAll('.hero-float-card');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = progress + '%';

  // 3D parallax — only run if elements exist (main page)
  if (!heroGridBg && heroFloatCards.length === 0) return;

  const heroHeight = window.innerHeight;
  const scrollRatio = Math.min(scrollTop / heroHeight, 1);

  // Grid recedes into distance
  if (heroGridBg) {
    const gridAngle = 55 + scrollRatio * 20;
    const gridScale = 1 - scrollRatio * 0.3;
    const gridOpacity = 1 - scrollRatio * 1.2;
    heroGridBg.style.transform = 'translateX(-50%) perspective(400px) rotateX(' + gridAngle + 'deg) scale(' + gridScale + ')';
    heroGridBg.style.opacity = Math.max(gridOpacity, 0);
  }

  // Float cards fly away in 3D
  heroFloatCards.forEach((card, i) => {
    if (scrollRatio > 0.01) {
      card.style.animation = 'none';
    }
    const depth = (i + 1) * 120;
    const rotateX = scrollRatio * (8 + i * 4);
    const rotateY = scrollRatio * (-6 + i * 6);
    const translateZ = -scrollRatio * depth;
    const translateY = -scrollRatio * (30 + i * 20);
    const opacity = 1 - scrollRatio * 1.5;
    card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(' + translateZ + 'px) translateY(' + translateY + 'px)';
    card.style.opacity = Math.max(opacity, 0);
  });
});

/* ═══════════════════════════════════════════
   ACTIVE NAV LINK
   ═══════════════════════════════════════════ */
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navObserver.observe(s));

/* ═══════════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════════ */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

/* ═══════════════════════════════════════════
   MOBILE NAV
   ═══════════════════════════════════════════ */
const navHamburger = document.getElementById('navHamburger');
const nav = document.getElementById('nav');
navHamburger.addEventListener('click', () => nav.classList.toggle('open'));
navLinks.forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

/* ═══════════════════════════════════════════
   EXPANDABLE EXPLAIN CARDS — Clone zoom
   ═══════════════════════════════════════════ */
const explainOverlay = document.getElementById('explainOverlay');
const explainGlowCards = document.querySelectorAll('.explain-grid .border-glow-card');
let zoomedClone = null;

function openExplainCard(glowCard) {
  if (zoomedClone) return;

  // Capture original position
  const rect = glowCard.getBoundingClientRect();

  // Clone the card
  zoomedClone = glowCard.cloneNode(true);
  zoomedClone.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'visible');
  zoomedClone.style.position = 'fixed';
  zoomedClone.style.top = rect.top + 'px';
  zoomedClone.style.left = rect.left + 'px';
  zoomedClone.style.width = rect.width + 'px';
  zoomedClone.style.height = rect.height + 'px';
  zoomedClone.style.zIndex = '95';
  zoomedClone.style.margin = '0';
  zoomedClone.style.transition = 'top 500ms cubic-bezier(0.16, 1, 0.3, 1), left 500ms cubic-bezier(0.16, 1, 0.3, 1), width 500ms cubic-bezier(0.16, 1, 0.3, 1), height 500ms cubic-bezier(0.16, 1, 0.3, 1)';
  document.body.appendChild(zoomedClone);

  // Show overlay
  explainOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Store original rect on clone for closing
  zoomedClone._originRect = rect;
  zoomedClone._sourceCard = glowCard;

  // Animate to center on next frame
  requestAnimationFrame(() => {
    const targetW = Math.min(700, window.innerWidth * 0.9);
    const targetTop = window.innerHeight * 0.1;
    const targetLeft = (window.innerWidth - targetW) / 2;

    zoomedClone.style.top = targetTop + 'px';
    zoomedClone.style.left = targetLeft + 'px';
    zoomedClone.style.width = targetW + 'px';
    zoomedClone.style.height = 'auto';
    zoomedClone.style.maxHeight = '80vh';
    zoomedClone.style.overflowY = 'auto';
    zoomedClone.classList.add('zoomed');
  });

  // Close button on clone
  const closeBtn = zoomedClone.querySelector('.explain-close');
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeExplainCard(); });

  // Suite button on clone
  const nextBtn = zoomedClone.querySelector('.explain-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIndex = parseInt(nextBtn.getAttribute('data-next'));
      goToNextCard(nextIndex);
    });
  }
}

function closeExplainCard() {
  if (!zoomedClone) return;
  const clone = zoomedClone;
  const origin = clone._originRect;

  // Animate back
  clone.classList.remove('zoomed');
  clone.style.transition = 'top 400ms ease-in-out, left 400ms ease-in-out, width 400ms ease-in-out, height 400ms ease-in-out';
  clone.style.top = origin.top + 'px';
  clone.style.left = origin.left + 'px';
  clone.style.width = origin.width + 'px';
  clone.style.height = origin.height + 'px';
  clone.style.overflowY = 'hidden';

  explainOverlay.classList.remove('active');

  setTimeout(() => {
    if (clone.parentNode) clone.parentNode.removeChild(clone);
    document.body.style.overflow = '';
  }, 420);

  zoomedClone = null;
}

function goToNextCard(nextIndex) {
  if (!zoomedClone || nextIndex >= explainGlowCards.length) return;
  const clone = zoomedClone;

  // Remove clone immediately
  if (clone.parentNode) clone.parentNode.removeChild(clone);
  zoomedClone = null;
  explainOverlay.classList.remove('active');

  // Open the next card
  openExplainCard(explainGlowCards[nextIndex]);
}

explainGlowCards.forEach(glowCard => {
  const card = glowCard.querySelector('[data-expandable]');
  card.addEventListener('click', (e) => {
    if (zoomedClone) return;
    e.stopPropagation();
    openExplainCard(glowCard);
  });
});

explainOverlay.addEventListener('click', closeExplainCard);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeExplainCard();
});

/* ═══════════════════════════════════════════
   PLAY CARD FILTERS
   ═══════════════════════════════════════════ */
const filterBtns = document.querySelectorAll('.filter-btn');
const playCardWrappers = document.querySelectorAll('#playsGrid > .border-glow-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');

    playCardWrappers.forEach(wrapper => {
      const cat = wrapper.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        wrapper.style.display = '';
        wrapper.style.opacity = '0';
        requestAnimationFrame(() => {
          wrapper.style.transition = 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)';
          wrapper.style.opacity = '1';
        });
      } else {
        wrapper.style.display = 'none';
      }
    });
  });
});

/* ═══════════════════════════════════════════
   ACCORDION STEPS
   ═══════════════════════════════════════════ */
const accordions = document.querySelectorAll('.step-accordion');
const progressNodes = document.querySelectorAll('.progress-node');
const progressFill = document.getElementById('progressFill');

function setActiveStep(index) {
  accordions.forEach((acc, i) => {
    const isTarget = i === index;
    acc.classList.toggle('open', isTarget);
    acc.classList.remove('active', 'completed');
    if (i < index) acc.classList.add('completed');
    if (i === index) acc.classList.add('active');
  });

  progressNodes.forEach((node, i) => {
    node.classList.remove('active', 'completed');
    if (i < index) node.classList.add('completed');
    if (i === index) node.classList.add('active');
  });

  // Fill progress line
  const pct = (index / (accordions.length - 1)) * 100;
  progressFill.style.height = pct + '%';
}

accordions.forEach((acc, i) => {
  acc.querySelector('.step-header').addEventListener('click', () => setActiveStep(i));
});

progressNodes.forEach((node, i) => {
  node.addEventListener('click', () => setActiveStep(i));
});

/* ═══════════════════════════════════════════
   BORDER GLOW — Mouse tracking
   ═══════════════════════════════════════════ */
function getCenterOfElement(el) {
  const { width, height } = el.getBoundingClientRect();
  return [width / 2, height / 2];
}

function getEdgeProximity(el, x, y) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  let kx = Infinity, ky = Infinity;
  if (dx !== 0) kx = cx / Math.abs(dx);
  if (dy !== 0) ky = cy / Math.abs(dy);
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(el, x, y) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  if (dx === 0 && dy === 0) return 0;
  let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (degrees < 0) degrees += 360;
  return degrees;
}

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 42, s: 97, l: 48 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = h + 'deg ' + s + '% ' + l + '%';
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars = {};
  for (let i = 0; i < opacities.length; i++) {
    vars['--glow-color' + keys[i]] = 'hsl(' + base + ' / ' + Math.min(opacities[i] * intensity, 100) + '%)';
  }
  return vars;
}

// Initialize all glow cards
const glowCards = document.querySelectorAll('[data-glow]');
const glowColor = '42 97 48'; // gold glow matching design system
const glowIntensity = 1.0;
const glowVars = buildGlowVars(glowColor, glowIntensity);

glowCards.forEach(card => {
  // Apply glow color vars
  Object.entries(glowVars).forEach(([key, val]) => {
    card.style.setProperty(key, val);
  });

  // Apply gradient vars matching our color palette
  const colors = ['#efa905', '#92723a', '#43bfff']; // primary, secondary, tertiary
  const positions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const gradKeys = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const colorMap = [0, 1, 2, 0, 1, 2, 1];

  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(colorMap[i], colors.length - 1)];
    card.style.setProperty(gradKeys[i], 'radial-gradient(at ' + positions[i] + ', ' + c + ' 0px, transparent 50%)');
  }
  card.style.setProperty('--gradient-base', 'linear-gradient(' + colors[0] + ' 0 100%)');

  // Mouse tracking
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);
    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
  });
});
