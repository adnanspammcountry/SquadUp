// Everything in the hero: the typed word, the avatar row, the games card
// (sport tabs + 3D tilt) and the bouncing balls behind the headline.

// ---------- typed word ----------

const TYPED_WORDS = ['Game.', 'Sport.', 'Hoops.', 'Match.', 'Pace.'];
const typedElement = $('#typed');

function startTypingLoop() {
  let wordIndex = 0;
  let letters = TYPED_WORDS[0].length;
  let deleting = true; // the page loads with "Game." already showing, so start by erasing it

  function tick() {
    const word = TYPED_WORDS[wordIndex];

    if (!deleting) {
      letters++;
      typedElement.textContent = word.slice(0, letters);
      if (letters === word.length) {
        deleting = true;
        setTimeout(tick, 1900); // pause on the finished word
      } else {
        setTimeout(tick, 95);
      }
      return;
    }

    letters--;
    typedElement.textContent = word.slice(0, letters);
    if (letters === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % TYPED_WORDS.length;
      setTimeout(tick, 220);
    } else {
      setTimeout(tick, 55);
    }
  }

  setTimeout(tick, 2600);
}

if (!prefersReducedMotion) {
  startTypingLoop();
}

// ---------- "players lacing up" avatars ----------

const PROOF_INITIALS = ['AR', 'MK', 'TH', 'LS', 'ID'];

$('#proofAvatars').innerHTML = PROOF_INITIALS.map((initials, i) =>
  avatarHTML({
    photo: IMAGES.avatars[i],
    initials,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    overlap: true,
  })
).join('');

// ---------- hero background photo ----------

if (IMAGES.hero) {
  $('.hero-photo').style.backgroundImage = `url("${IMAGES.hero}")`;
}

// ---------- games card ----------

const heroTabs = $('#heroTabs');
const heroList = $('#heroList');
let heroSport = 'soccer';

const HERO_TAB_CLASSES =
  'group flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[.03] px-1 py-3 text-xs font-semibold text-mute transition duration-300 hover:text-white aria-selected:border-neon aria-selected:bg-neon aria-selected:text-ink aria-selected:shadow-[0_8px_28px_rgba(0,255,102,.35)]';

function renderHeroTabs() {
  heroTabs.innerHTML = Object.keys(SPORT_LABELS).map(sport => `
    <button type="button" role="tab" data-sport="${sport}" aria-selected="${sport === heroSport}" class="${HERO_TAB_CLASSES}">
      <span class="text-2xl transition duration-[400ms] group-hover:-translate-y-0.5 group-hover:-rotate-6">${sportIcon(sport)}</span>
      <span>${SPORT_LABELS[sport]}</span>
    </button>
  `).join('');
}

function spotsText(game) {
  const left = game.capacity - game.joined;
  return left > 0 ? `${left} spots` : 'Full';
}

function renderHeroList() {
  // mark the active tab
  $$('button', heroTabs).forEach(button => {
    button.setAttribute('aria-selected', button.dataset.sport === heroSport);
  });

  const games = GAMES.filter(game => game.sport === heroSport).slice(0, 3);

  heroList.innerHTML = games.map((game, i) => {
    const isFull = game.capacity - game.joined === 0;
    const pillStyle = isFull
      ? 'border border-white/15 text-mute'
      : 'bg-white text-ink hover:bg-ember hover:text-white';

    return `
      <li class="animate-swap grid grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-2xl border border-white/10 bg-black/30 p-3.5" style="animation-delay:${i * 70}ms">
        <span class="min-w-[62px] font-display text-xl font-extrabold leading-none tracking-wide text-neon">${game.time}</span>
        <div class="min-w-0">
          <strong class="block font-semibold leading-tight [overflow-wrap:anywhere]">${game.title}</strong>
          <span class="text-[.82rem] text-mute">${game.venue} &middot; ${game.distance} km</span>
        </div>
        <button type="button" data-join="game" data-name="${game.title}" data-sport="${game.sport}"
          class="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition hover:scale-105 ${pillStyle}">
          ${spotsText(game)}
        </button>
      </li>`;
  }).join('');
}

heroTabs.addEventListener('click', event => {
  const tab = event.target.closest('button[data-sport]');
  if (!tab) return;
  heroSport = tab.dataset.sport;
  renderHeroList();
});

renderHeroTabs();
renderHeroList();

// ---------- 3D tilt ----------
// The card rotates towards the mouse. When the mouse leaves we clear the inline style,
// and the card eases back to the resting angle set in the Tailwind classes.

const tilt = $('#tilt');
const tiltCard = $('#tiltInner');
const glare = $('#glare');

tilt.addEventListener('pointermove', event => {
  if (prefersReducedMotion || event.pointerType === 'touch') return;

  const box = tilt.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;  // 0 to 1
  const y = (event.clientY - box.top) / box.height;  // 0 to 1

  tiltCard.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${-(y - 0.5) * 16}deg)`;
  glare.style.setProperty('--gx', `${x * 100}%`);
  glare.style.setProperty('--gy', `${y * 100}%`);
});

tilt.addEventListener('pointerleave', () => {
  tiltCard.style.transform = '';
});

// ---------- bouncing balls ----------
// A small physics toy: gravity, bouncing off the walls and floor, balls knocking into
// each other, and the mouse pushing them away. It only runs while the hero is on screen.

const hero = $('#hero');
const pitCanvas = $('#physics');
const pitCtx = pitCanvas.getContext('2d');

const BALL_TYPES = [
  { color: '#FF5500', seams: 'basketball' },
  { color: '#00FF66', seams: 'soccer' },
  { color: '#FFFFFF', seams: 'tennis' },
];
const GRAVITY = 900;

let pitWidth = 0;
let pitHeight = 0;
let balls = [];
let pitRunning = false;
let pitLastTime = 0;
const pointer = { x: -999, y: -999, vx: 0, vy: 0 };

function resizePit() {
  const box = hero.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  pitWidth = box.width;
  pitHeight = box.height;
  pitCanvas.width = pitWidth * ratio;
  pitCanvas.height = pitHeight * ratio;
  pitCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  if (balls.length === 0) {
    createBalls();
  }
}

function createBalls() {
  const count = pitWidth < 600 ? 6 : 10;

  for (let i = 0; i < count; i++) {
    const type = BALL_TYPES[i % BALL_TYPES.length];
    balls.push({
      x: randomBetween(40, pitWidth - 40),
      y: randomBetween(20, pitHeight * 0.5),
      vx: randomBetween(-120, 120),
      vy: randomBetween(-100, 100),
      radius: randomBetween(14, 30),
      angle: randomBetween(0, 6),
      spin: randomBetween(-2, 2),
      color: type.color,
      seams: type.seams,
    });
  }
}

// draws the curved seam of a tennis ball
function tennisSeam(centerX, startAngle, endAngle, radius) {
  pitCtx.moveTo(centerX + Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
  pitCtx.arc(centerX, 0, radius, startAngle, endAngle);
}

function drawBall(ball) {
  const r = ball.radius;

  pitCtx.save();
  pitCtx.translate(ball.x, ball.y);
  pitCtx.rotate(ball.angle);

  // body
  pitCtx.fillStyle = ball.color + '1c';
  pitCtx.strokeStyle = ball.color + 'cc';
  pitCtx.lineWidth = 2;
  pitCtx.beginPath();
  pitCtx.arc(0, 0, r, 0, Math.PI * 2);
  pitCtx.fill();
  pitCtx.stroke();

  // seams
  pitCtx.lineWidth = 1.5;
  pitCtx.beginPath();

  if (ball.seams === 'basketball') {
    pitCtx.moveTo(-r, 0);
    pitCtx.lineTo(r, 0);
    pitCtx.moveTo(0, -r);
    pitCtx.lineTo(0, r);
    pitCtx.moveTo(-r * 0.7, -r * 0.7);
    pitCtx.quadraticCurveTo(-r * 0.2, 0, -r * 0.7, r * 0.7);
    pitCtx.moveTo(r * 0.7, -r * 0.7);
    pitCtx.quadraticCurveTo(r * 0.2, 0, r * 0.7, r * 0.7);
  } else if (ball.seams === 'soccer') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const px = Math.cos(a) * r * 0.42;
      const py = Math.sin(a) * r * 0.42;
      if (i === 0) pitCtx.moveTo(px, py);
      else pitCtx.lineTo(px, py);
    }
    pitCtx.closePath();
  } else {
    tennisSeam(-r * 1.15, -0.9, 0.9, r * 0.85);
    tennisSeam(r * 1.15, Math.PI - 0.9, Math.PI + 0.9, r * 0.85);
  }

  pitCtx.stroke();
  pitCtx.restore();
}

function moveBall(ball, dt) {
  ball.vy += GRAVITY * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.angle += ball.spin * dt;

  // the mouse shoves nearby balls away
  const dx = ball.x - pointer.x;
  const dy = ball.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  const reach = ball.radius + 70;

  if (distance < reach && distance > 0.1) {
    const push = (1 - distance / reach) * 1500 * dt;
    ball.vx += (dx / distance) * push + pointer.vx * 0.02;
    ball.vy += (dy / distance) * push + pointer.vy * 0.02;
    ball.spin += (dx / distance) * 0.3;
  }

  // side walls and ceiling
  if (ball.x < ball.radius) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx) * 0.85;
  }
  if (ball.x > pitWidth - ball.radius) {
    ball.x = pitWidth - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 0.85;
  }
  if (ball.y < ball.radius) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy) * 0.8;
  }

  // floor
  if (ball.y > pitHeight - ball.radius) {
    ball.y = pitHeight - ball.radius;
    ball.vy = -Math.abs(ball.vy) * 0.8;
    ball.vx *= 0.985;
    ball.spin = ball.vx / ball.radius;

    // when a ball is about to settle, give it a kick so the pit stays lively
    if (Math.abs(ball.vy) < 90) {
      ball.vy = -randomBetween(520, 980);
    }
  }

  // don't let balls get silly fast
  ball.vx = Math.max(-700, Math.min(700, ball.vx));
  ball.vy = Math.max(-1400, Math.min(1400, ball.vy));
}

function collideBalls() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      const minDistance = a.radius + b.radius;

      if (distance >= minDistance || distance === 0) continue;

      // direction between the two centers
      const nx = dx / distance;
      const ny = dy / distance;

      // swap the velocity along that direction (equal masses)
      const approach = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (approach > 0) {
        a.vx -= approach * nx;
        a.vy -= approach * ny;
        b.vx += approach * nx;
        b.vy += approach * ny;
      }

      // push them apart so they don't overlap
      const overlap = (minDistance - distance) / 2;
      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;
    }
  }
}

function pitLoop(now) {
  if (!pitRunning) return;

  const dt = Math.min(0.033, (now - pitLastTime) / 1000 || 0.016);
  pitLastTime = now;

  pitCtx.clearRect(0, 0, pitWidth, pitHeight);
  balls.forEach(ball => moveBall(ball, dt));
  collideBalls();
  balls.forEach(drawBall);

  // the pointer speed fades out when the mouse stops moving
  pointer.vx *= 0.8;
  pointer.vy *= 0.8;

  requestAnimationFrame(pitLoop);
}

resizePit();

window.addEventListener('resize', () => {
  resizePit();
  // keep every ball inside the new size
  balls.forEach(ball => {
    ball.x = Math.min(ball.x, pitWidth - ball.radius);
    ball.y = Math.min(ball.y, pitHeight - ball.radius);
  });
  if (!pitRunning) balls.forEach(drawBall);
});

hero.addEventListener('pointermove', event => {
  const box = hero.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  pointer.vx = x - pointer.x;
  pointer.vy = y - pointer.y;
  pointer.x = x;
  pointer.y = y;
});

hero.addEventListener('pointerleave', () => {
  pointer.x = -999;
  pointer.y = -999;
});

if (prefersReducedMotion) {
  // no animation: just rest the balls on the floor
  balls.forEach(ball => {
    ball.y = pitHeight - ball.radius - randomBetween(0, 40);
    drawBall(ball);
  });
} else {
  // only animate while the hero is visible
  new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible && !pitRunning) {
      pitRunning = true;
      pitLastTime = performance.now();
      requestAnimationFrame(pitLoop);
    } else if (!visible) {
      pitRunning = false;
    }
  }).observe(hero);
}
