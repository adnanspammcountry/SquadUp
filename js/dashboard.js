// Live activity section: the three counters and the tabbed widget
// (today's matches with ticking scores, leaderboard, trending sports).

// ---------- counters ----------

const playersCounter = $('#nPlayers');
let playersOnline = 48213;

// counts a number up from zero with an ease-out curve
function countUp(element, target, duration = 1700) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = Math.round(target * eased).toLocaleString('en-US');
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// after the count-up, the player number wobbles up and down like real traffic
function startLiveTicker() {
  if (prefersReducedMotion) return;

  setInterval(() => {
    playersOnline += Math.round(randomBetween(-3, 9));
    playersCounter.textContent = playersOnline.toLocaleString('en-US');
  }, 2200);
}

if (prefersReducedMotion) {
  startLiveTicker();
} else {
  // wait until the counters are on screen before counting
  const statsObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    statsObserver.disconnect();

    $$('[data-count-to]').forEach(element => {
      countUp(element, Number(element.dataset.countTo));
    });
    setTimeout(startLiveTicker, 1800);
  }, { threshold: 0.35 });

  statsObserver.observe($('#stats'));
}

// ---------- tab 1: today's matches ----------

const STATUS_LABELS = {
  live: 'Live',
  next: 'Next up',
  open: 'Open',
  full: 'Full',
  done: 'Finished',
};

const STATUS_STYLES = {
  live: 'bg-ember/20 text-ember',
  next: 'bg-neon/15 text-neon',
  open: 'bg-white/10 text-mute',
  full: 'bg-white/10 text-mute',
  done: 'bg-white/10 text-mute',
};

function matchRowHTML(match) {
  const right = match.status === 'live'
    ? `<span class="score font-display text-2xl font-black leading-none tracking-wide tabular-nums">
         <span data-score="${match.key}-a">${match.scoreA}</span> &ndash; <span data-score="${match.key}-b">${match.scoreB}</span>
       </span>`
    : `<span class="font-display text-base font-extrabold leading-none tracking-wide">${match.time}</span>`;

  return `
    <li class="row grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 transition duration-300 hover:translate-x-1 hover:border-neon max-[520px]:grid-cols-[auto_1fr]">
      <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-2xl">${sportIcon(match.sport)}</span>
      <div class="min-w-0">
        <strong class="block font-semibold [overflow-wrap:anywhere]">${match.title}</strong>
        <span class="text-sm text-mute">${match.venue}</span>
      </div>
      <div class="flex flex-col items-end gap-1 text-right max-[520px]:col-span-2 max-[520px]:flex-row max-[520px]:items-center max-[520px]:justify-between">
        <span class="rounded-full px-3 py-1 text-[.7rem] font-bold uppercase tracking-[.12em] ${STATUS_STYLES[match.status]}">${STATUS_LABELS[match.status]}</span>
        ${right}
      </div>
    </li>`;
}

$('#p-matches').innerHTML = `<ul class="grid gap-2.5">${MATCHES.map(matchRowHTML).join('')}</ul>`;

// every few seconds one of the live games scores
function bumpRandomScore() {
  const liveMatches = MATCHES.filter(match => match.status === 'live');
  const match = pickOne(liveMatches);
  const team = Math.random() < 0.5 ? 'A' : 'B';

  // basketball is worth 2 or 3, tennis counts games one at a time
  const points = match.sport === 'basketball' ? pickOne([2, 2, 3]) : 1;
  match['score' + team] += points;

  const scoreElement = $(`[data-score="${match.key}-${team.toLowerCase()}"]`);
  scoreElement.textContent = match['score' + team];

  // restart the flash animation on the score
  const scoreBox = scoreElement.parentElement;
  scoreBox.classList.remove('animate-flash');
  void scoreBox.offsetWidth; // forces the browser to notice the class was removed
  scoreBox.classList.add('animate-flash');
}

if (!prefersReducedMotion) {
  setInterval(bumpRandomScore, 4800);
}

// ---------- tab 2: leaderboard ----------

function initials(name) {
  return name.split(' ').map(part => part[0]).join('');
}

function leaderboardRowHTML(player, index) {
  const topThree = ['text-neon', 'text-white', 'text-ember'];
  const rankColor = topThree[index] || 'text-mute';
  const barWidth = Math.round((player.points / LEADERBOARD[0].points) * 100);

  return `
    <li class="lb grid grid-cols-[28px_40px_1fr_auto] items-center gap-2.5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 sm:grid-cols-[34px_44px_1fr_auto] sm:gap-3.5">
      <span class="text-center font-display text-2xl font-black leading-none ${rankColor}">${index + 1}</span>
      ${avatarHTML({
        photo: IMAGES.avatars[index],
        initials: initials(player.name),
        color: AVATAR_COLORS[index % AVATAR_COLORS.length],
        size: 'h-10 w-10 sm:h-11 sm:w-11 text-sm',
      })}
      <div class="min-w-0">
        <strong class="block font-semibold">${player.name}</strong>
        <span class="text-[.82rem] text-mute">${player.squad}</span>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div class="bar h-full w-0 rounded-full bg-gradient-to-r from-neon to-ember transition-[width] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]" data-width="${barWidth}"></div>
        </div>
      </div>
      <span class="font-display text-xl font-extrabold leading-none tracking-wide tabular-nums">${player.points.toLocaleString('en-US')}</span>
    </li>`;
}

$('#p-board').innerHTML = `
  <ul class="grid gap-2.5">${LEADERBOARD.map(leaderboardRowHTML).join('')}</ul>
  <p class="mt-3.5 text-sm text-mute">Weekly points from games played, wins and attendance streaks.</p>`;

// ---------- tab 3: trending sports ----------

function trendingRowHTML(item, index) {
  const barWidth = Math.round((item.growth / TRENDING[0].growth) * 100);
  const barColor = index === 0 ? 'bg-ember' : 'bg-gradient-to-r from-neon to-ember';

  return `
    <div class="tr grid grid-cols-[minmax(78px,120px)_1fr_auto] items-center gap-3.5 px-1 py-2">
      <strong class="font-display text-xl font-extrabold uppercase leading-none tracking-wider">${item.sport}</strong>
      <div class="h-3.5 overflow-hidden rounded-full bg-white/10">
        <div class="bar h-full w-0 rounded-full ${barColor} transition-[width] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]" data-width="${barWidth}"></div>
      </div>
      <span class="min-w-14 text-right font-display text-lg font-extrabold leading-none tracking-wide text-neon">+${item.growth}%</span>
    </div>`;
}

$('#p-trend').innerHTML = `
  <div>${TRENDING.map(trendingRowHTML).join('')}</div>
  <p class="mt-3.5 text-sm text-mute">New sign-ups compared with last week.</p>`;

// ---------- tabs ----------

const tabButtons = $$('.tab');
const tabPill = $('#tabPill');
const tabPanels = {
  'tab-matches': $('#p-matches'),
  'tab-board': $('#p-board'),
  'tab-trend': $('#p-trend'),
};

// the green pill slides behind whichever tab is selected
function movePill() {
  const selected = tabButtons.find(tab => tab.getAttribute('aria-selected') === 'true');
  tabPill.style.width = selected.offsetWidth + 'px';
  tabPill.style.transform = `translateX(${selected.offsetLeft}px)`;
}

// bars start at zero and grow to their width once their panel is visible
function growBars(panel) {
  const bars = $$('[data-width]', panel);
  bars.forEach(bar => { bar.style.width = '0'; });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bars.forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
    });
  });
}

function selectTab(selectedTab) {
  tabButtons.forEach(tab => {
    tab.setAttribute('aria-selected', tab === selectedTab);
  });

  Object.entries(tabPanels).forEach(([tabId, panel]) => {
    const isSelected = tabId === selectedTab.id;
    panel.hidden = !isSelected;

    if (isSelected) {
      // replay the slide-in animation
      panel.classList.remove('animate-swap');
      void panel.offsetWidth;
      panel.classList.add('animate-swap');
      growBars(panel);
    }
  });

  movePill();
  selectedTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

tabButtons.forEach(tab => tab.addEventListener('click', () => selectTab(tab)));

// arrow keys move between tabs
$('#tabs').addEventListener('keydown', event => {
  const current = tabButtons.indexOf(document.activeElement);
  if (current === -1) return;

  let next = null;
  if (event.key === 'ArrowRight') next = tabButtons[(current + 1) % tabButtons.length];
  if (event.key === 'ArrowLeft') next = tabButtons[(current + tabButtons.length - 1) % tabButtons.length];

  if (next) {
    event.preventDefault();
    next.focus();
    selectTab(next);
  }
});

movePill();
window.addEventListener('resize', movePill);

// the pill is measured from the tab widths, so measure again once the fonts have loaded
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(movePill);
}
