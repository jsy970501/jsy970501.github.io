document.addEventListener('DOMContentLoaded', () => {
  const menuEl = document.getElementById('menu');
  const backToTop = document.getElementById('backToTop');
  const FADE_DISTANCE = 100;

  function updateMenuOpacity() {
    const opacity = Math.max(0, 1 - window.scrollY / FADE_DISTANCE);
    menuEl.style.opacity = opacity;
    menuEl.style.pointerEvents = opacity === 0 ? 'none' : 'auto';

    const inverseOpacity = 1 - opacity;
    backToTop.style.opacity = inverseOpacity;
    backToTop.style.pointerEvents = inverseOpacity === 0 ? 'none' : 'auto';
  }

  window.addEventListener('scroll', updateMenuOpacity, { passive: true });
  updateMenuOpacity();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const inkCanvas = document.getElementById('inkCanvas');
const ctx = inkCanvas.getContext('2d');
const prefersReducedMotionInk = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');

let dpr = window.devicePixelRatio || 1;
let isOverClickable = false;

function resizeCanvas(){
  dpr = window.devicePixelRatio || 1;
  [inkCanvas, bufferCanvas].forEach(c => {
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
  });
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let points = [];
let lastMoveTime = Date.now();
let groupOpacity = 1;
let groupSpread = 1;
let inkEnabled = false;

const IDLE_DELAY = 300;
const FADE_SPEED = 0.02;
const SPREAD_RATE = 0.02;
const MAX_SPREAD = 2.6;

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'i') {
    inkEnabled = !inkEnabled;
    document.body.classList.toggle('ink-active', inkEnabled);
    if (!inkEnabled) {
      points = [];
    }
  }
});

if (!prefersReducedMotionInk) {
  window.addEventListener('mousemove', (e) => {
    if (!inkEnabled) return;

    points.push({ x: e.clientX * dpr, y: e.clientY * dpr });
    if (points.length > 25) points.shift();
    lastMoveTime = Date.now();
    groupOpacity = 1;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    isOverClickable = !!target && !!target.closest('a, button, .menu-btn, #backToTop, .card');
  });
}

function draw(){
  const idleTime = Date.now() - lastMoveTime;

  if (idleTime > IDLE_DELAY) {
    groupOpacity -= FADE_SPEED;
    groupSpread = Math.min(MAX_SPREAD, groupSpread + SPREAD_RATE);
    if (groupOpacity < 0) {
      groupOpacity = 0;
      groupSpread = 1;
      points = [];
    }
  } else {
    groupSpread = 1;
  }

  bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

  if (points.length > 2) {
    const widths = points.map((p, i) => {
      const recency = i / points.length;
      let speed = 0;
      if (i > 0) {
        const prev = points[i - 1];
        speed = Math.min(Math.hypot(p.x - prev.x, p.y - prev.y) / dpr, 40);
      }
      return Math.max(4, (14 + recency * 36) - speed * 0.1) * dpr * groupSpread;
    });

    const left = [];
    const right = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const prev = points[i - 1] || points[i];
      const next = points[i + 1] || points[i];

      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;

      const nx = -dy / len;
      const ny = dx / len;

      const halfW = widths[i] / 2;
      left.push({ x: p.x + nx * halfW, y: p.y + ny * halfW });
      right.push({ x: p.x - nx * halfW, y: p.y - ny * halfW });
    }

    bufferCtx.beginPath();
    bufferCtx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i++) {
      bufferCtx.lineTo(left[i].x, left[i].y);
    }
    for (let i = right.length - 1; i >= 0; i--) {
      bufferCtx.lineTo(right[i].x, right[i].y);
    }
    bufferCtx.closePath();
    bufferCtx.fillStyle = 'rgb(153, 149, 149)';
    bufferCtx.fill();

    const tip = points[points.length - 1];
    bufferCtx.beginPath();
    bufferCtx.arc(tip.x, tip.y, widths[widths.length - 1] / 2, 0, Math.PI * 2);
    bufferCtx.fill();
  }

  ctx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
  const hoverMultiplier = isOverClickable ? 0.25 : 1;
  ctx.globalAlpha = groupOpacity * 0.6 * hoverMultiplier;
  ctx.drawImage(bufferCanvas, 0, 0);
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}

if (!prefersReducedMotionInk) {
  draw();
}

const workData = {
  1: { 
    title: 'Homo Mobilis', 
    meta: '2026 · Performance work', 
    image: 'homo mobilis/1-1 homo mobilis performance.jpg', 
    desc: 'Performers: Seung-Yeon Jung, Jiyeon Choe<br>Sound: David Maresch<br>Photo: Korea Cultural Center Austria<br><br>Starting from the concept of Homo Mobilis, "the moving human", this project looks at a life of constant movement without settling down. It follows the feelings of loneliness, isolation, and self-alienation that come with it. As a defining characteristic of modern society, this constant movement has become a universal reality for many.<br><br>Moving is both a way to survive and a sign of deep emotional wounds. The feelings left behind from this journey quietly build up in the body. The desire to freely express emotions, struggle with identity, and move forward in hope of finding peace is shown silently through the body and its movements.<br><br>The performance Homo Mobilis starts from a deep, personal place and connects with the spirit of our times, slowly bringing out the audience’s own memories and senses. Ultimately, it asks how we can reach out to one another again and find a way to live in harmony.',
    details: [
      'homo mobilis/1-2 homo mobilis performance.JPG', 
      'homo mobilis/1-3 homo mobilis performance.JPG', 
      'homo mobilis/1-4 homo mobilis performance.jpg', 
      'homo mobilis/1-5 homo mobilis performance.jpg',
      'homo mobilis/1-6 homo mobilis performance.jpg', 
      'homo mobilis/1-7 homo mobilis performance.jpg', 
      'homo mobilis/1-8 homo mobilis performance.jpg', 
      'homo mobilis/1-9 homo mobilis performance.jpg', 
      'homo mobilis/1-10 homo mobilis performance.jpg'
    ] 
  },
  2: {
    title: 'The Entwined Cycle', 
    meta: '2026 · Mixed Media Painting', 
    image: 'homo mobilis/2-1 the entwined cycle.jpg', 
    desc: '',
    details: [
      'homo mobilis/2-2 the entwined cycle.jpg',
      'homo mobilis/2-2(2) the entwined cycle.jpg',
      [
        'homo mobilis/2-3 the entwined cycle.jpg',
        'homo mobilis/2-4 the entwined cycle.jpg'
      ],
      [
        'homo mobilis/2-5 the entwined cycle.jpg',
        'homo mobilis/2-6 the entwined cycle.jpg'
      ]
    ] 
  },
  3: {
    title: 'Alien Torso', 
    meta: '2026 · Costume & Installation', 
    image: 'homo mobilis/3-1 alien torso.jpg', 
    desc: '',
    details: [
      [
        'homo mobilis/3-2 alien torso.jpg',
        'homo mobilis/3-3 alien torso.jpg'
      ],
      'homo mobilis/3-4 alien torso.jpg',
      'homo mobilis/3-5 alien torso.jpg',
      'homo mobilis/3-6 alien torso.jpg'
    ] 
  },
  4: {
    title: 'flame of harmony', 
    meta: '2025 · Installation', 
    image: 'harmony/1 harmony in a book left unread.jpg',
    desc: '',
    details: [
      'harmony/2-1 flame of harmony.jpg',
      'harmony/2-2 flame of harmony.jpg',
      'harmony/2-3 flame of harmony.jpg',
      'harmony/2-4 flame of harmony.jpg',
      'harmony/2-5 flame of harmony.jpg'
    ] 
  },
  5: {
    title: 'harmony in motion', 
    meta: '2025 · Painting', 
    image: 'harmony/3-1 harmony in motion.jpg',
    desc: '',
    details: [
      'harmony/3-2 harmony in motion.jpg',
      'harmony/3-3 harmony in motion.jpg',
      'harmony/3-4 harmony in motion.jpg',
      'harmony/3-5.jpg'
    ] 
  },
  6: {
    title: 'the root of freedom', 
    meta: '2025 · Painting', 
    image: 'harmony/4-1 the root of freedom.jpg',
    desc: '',
    details: [
      'harmony/4-2.jpg',
      'harmony/4-3.jpg',
      'harmony/4-4.jpg',
      'harmony/4-5.jpg'
    ] 
  },
  7: {
    title: 'when it finally becomes still', 
    meta: '2025 · Painting', 
    image: 'harmony/5-1 when it finally becomes still.jpg',
    desc: '',
    details: [
      'harmony/5-2.jpg',
      'harmony/5-3.jpg',
      'harmony/5-4.jpg',
      'harmony/5-5.jpg'
    ] 
  }
};

const workModal = document.getElementById('workModal');
const workModalPanel = document.getElementById('workModalPanel');
const workModalScroll = document.getElementById('workModalScroll');
const workModalBackdrop = document.getElementById('workModalBackdrop');
const workModalClose = document.getElementById('workModalClose');
const workModalImg = document.getElementById('workModalImg');
const workModalTitle = document.getElementById('workModalTitle');
const workModalMeta = document.getElementById('workModalMeta');
const workModalDesc = document.getElementById('workModalDesc');
const workModalDetails = document.getElementById('workModalGallery');

const workModalPrev = document.getElementById('workModalPrev');
const workModalNext = document.getElementById('workModalNext');
let currentWorkId = null;
const totalWorks = Object.keys(workData).length;

function openWork(id){
  currentWorkId = parseInt(id, 10);
  const data = workData[currentWorkId];
  if (!data) return;

  workModalScroll.scrollTop = 0;
  workModal.style.setProperty('--scroll-progress', 0);

  workModalImg.src = data.image;
  workModalImg.alt = data.title;
  workModalTitle.textContent = data.title;
  workModalMeta.textContent = data.meta;
  workModalDesc.innerHTML = data.desc;

  workModalDetails.innerHTML = '';
  if (data.details && data.details.length > 0) {
    data.details.forEach(item => {
      if (Array.isArray(item)) {
        // Paired images container (side-by-side)
        const row = document.createElement('div');
        row.className = 'gallery-row';
        item.forEach(src => {
          const img = document.createElement('img');
          img.src = src;
          img.alt = 'Detail view of ' + data.title;
          row.appendChild(img);
        });
        workModalDetails.appendChild(row);
      } else {
        // Single image
        const img = document.createElement('img');
        img.src = item;
        img.alt = 'Detail view of ' + data.title;

        // Auto-detect portrait/vertical aspect ratio
        const checkVertical = () => {
          if (img.naturalHeight > img.naturalWidth) {
            img.classList.add('vertical');
          }
        };

        if (img.complete) {
          checkVertical();
        } else {
          img.onload = checkVertical;
        }

        workModalDetails.appendChild(img);
      }
    });
  }

  workModal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeWork(){
  workModal.classList.remove('active');
  document.body.classList.remove('modal-open');
  workModalScroll.scrollTop = 0;
  workModal.style.setProperty('--scroll-progress', 0);
  currentWorkId = null;
}

function navigateWork(direction) {
  if (currentWorkId === null) return;

  if (direction === 'next') {
    currentWorkId = currentWorkId >= totalWorks ? 1 : currentWorkId + 1;
  } else if (direction === 'prev') {
    currentWorkId = currentWorkId <= 1 ? totalWorks : currentWorkId - 1;
  }

  openWork(currentWorkId);
}

workModalPrev.addEventListener('click', () => navigateWork('prev'));
workModalNext.addEventListener('click', () => navigateWork('next'));
workModalClose.addEventListener('click', closeWork);
workModalBackdrop.addEventListener('click', closeWork);

workModalScroll.addEventListener('scroll', () => {
  const maxScroll = 250;
  const progress = Math.min(workModalScroll.scrollTop / maxScroll, 1);
  workModal.style.setProperty('--scroll-progress', progress);
});

document.querySelectorAll('.card[data-work-id]').forEach(card => {
  card.addEventListener('click', () => {
    openWork(card.getAttribute('data-work-id'));
  });
  card.style.cursor = 'pointer';
});

document.addEventListener('keydown', (e) => {
  if (!workModal.classList.contains('active')) return;

  if (e.key === 'ArrowRight') navigateWork('next');
  if (e.key === 'ArrowLeft') navigateWork('prev');
  if (e.key === 'Escape') closeWork();
});

let isScrolling;

window.addEventListener('scroll', () => {
  document.body.classList.add('scrolling');
  window.clearTimeout(isScrolling);
  isScrolling = setTimeout(() => {
    document.body.classList.remove('scrolling');
  }, 200);
}, { passive: true });


function toggleAboutList() {
  const content = document.getElementById('aboutExpandable');
  const btn = document.getElementById('aboutToggleBtn');
  const btnText = btn.querySelector('.btn-text');

  if (content.classList.contains('collapsed')) {
    content.classList.remove('collapsed');
    content.classList.add('expanded');
    btn.classList.add('active');
    btnText.textContent = 'Show Less';
  } else {
    content.classList.remove('expanded');
    content.classList.add('collapsed');
    btn.classList.remove('active');
    btnText.textContent = 'Read More';
  }
}