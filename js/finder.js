// Community finder: filter chips, the area map and the grid of game cards.
// When you change a filter the cards slide to their new spots instead of jumping.

const grid = $('#grid');
const emptyMessage = $('#empty');
const countLabel = $('#count');

// what is currently selected (the first value of each list means "no filter")
const DEFAULT_FILTERS = { sport: 'All', level: 'Any', area: 'Anywhere', time: 'Anytime', sort: 'soon' };
const filters = { ...DEFAULT_FILTERS };

// ---------- prepare the data ----------

// "6:30 PM" becomes 1110 (minutes since midnight), which is handy for sorting and for time slots
function minutesSinceMidnight(timeText) {
  const [hourText, minuteText, period] = timeText.split(/[: ]/);
  let hour = Number(hourText) % 12;
  if (period === 'PM') hour += 12;
  return hour * 60 + Number(minuteText);
}

function timeSlot(minutes) {
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 17.5 * 60) return 'afternoon';
  return 'evening';
}

GAMES.forEach(game => {
  game.minutes = minutesSinceMidnight(game.time);
  game.slot = timeSlot(game.minutes);
});

// ---------- build the page ----------

const CHIP_CLASSES =
  'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition duration-300 hover:-translate-y-0.5 hover:border-neon aria-pressed:border-neon aria-pressed:bg-neon aria-pressed:font-bold aria-pressed:text-ink aria-pressed:shadow-[0_6px_22px_rgba(0,255,102,.3)]';

function renderChips() {
  Object.keys(FILTERS).forEach(group => {
    $('#f-' + group).innerHTML = FILTERS[group].map(value => {
      const icon = group === 'sport' && value !== 'All'
        ? `<span class="text-base">${sportIcon(value.toLowerCase())}</span>`
        : '';
      return `<button type="button" class="${CHIP_CLASSES}" data-group="${group}" data-value="${value}" aria-pressed="false">${icon}${value}</button>`;
    }).join('');
  });
}

// the gradient behind each sport's drawn thumbnail
const SPORT_GRADIENTS = {
  soccer: 'from-[#00552a] to-[#00c653]',
  basketball: 'from-[#7a2400] to-ember',
  tennis: 'from-[#16301f] via-[#5ad07a] to-[#d4ff3d]',
  running: 'from-[#1d1d1d] via-[#3b3b3b] to-neon',
};

const LEVEL_COLORS = {
  Beginner: 'text-neon',
  Intermediate: 'text-white',
  Pro: 'text-ember',
};

// each sport has three photos, pick the one that matches this game
function photoForGame(game) {
  const photos = IMAGES.sport[game.sport];
  return photos[(game.id - 1) % photos.length];
}

function cardHTML(game) {
  const spotsLeft = game.capacity - game.joined;
  const percentFull = Math.round((game.joined / game.capacity) * 100);
  const buttonStyle = spotsLeft > 0 ? BUTTON_PRIMARY : BUTTON_GHOST;
  const buttonText = spotsLeft > 0 ? 'Join game' : 'Join waitlist';

  return `
    <article data-id="${game.id}" class="neon-border group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-panel transition duration-[400ms] hover:-translate-y-2 hover:shadow-[0_24px_60px_-18px_rgba(0,255,102,.35),0_0_40px_-10px_rgba(0,255,102,.3)]">

      <div class="relative grid h-[150px] place-items-center overflow-hidden bg-gradient-to-br ${SPORT_GRADIENTS[game.sport]}">
        <div class="stripes absolute inset-0 grid place-items-center text-[84px] text-white/90 transition duration-700 group-hover:scale-[1.14]">
          ${sportIcon(game.sport, 'relative stroke-[1.2] drop-shadow-lg')}
        </div>
        ${photoTag(photoForGame(game), game.title)}
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/25 via-transparent to-ink/55"></div>
        <span class="absolute left-3 top-3 z-[1] rounded-full bg-ink/70 px-2.5 py-1 text-[.7rem] font-bold uppercase tracking-widest backdrop-blur ${LEVEL_COLORS[game.level]}">${game.level}</span>
        <span class="absolute right-3 top-3 z-[1] rounded-full bg-ink px-2.5 py-1.5 font-display text-base font-extrabold leading-none tracking-wider">${game.time}</span>
      </div>

      <div class="flex flex-1 flex-col gap-2.5 px-[18px] pb-5 pt-[18px]">
        <h3 class="font-display text-[1.6rem] font-extrabold uppercase leading-none tracking-wide [overflow-wrap:anywhere]">${game.title}</h3>
        <p class="text-sm text-mute">${game.venue} &middot; ${game.area}</p>
        <div class="flex justify-between gap-2.5 text-[.84rem] text-white/80">
          <span>${game.distance} km away</span>
          <span>${spotsLeft > 0 ? spotsLeft + ' spots left' : 'Full'}</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label="${game.joined} of ${game.capacity} players">
          <div class="h-full animate-grow rounded-full bg-gradient-to-r from-neon to-ember" style="width:${percentFull}%"></div>
        </div>
        <button type="button" data-join="game" data-name="${game.title}" data-sport="${game.sport}" class="${BUTTON_BASE} ${BUTTON_SMALL} ${buttonStyle} mt-2 self-start">${buttonText}</button>
      </div>
    </article>`;
}

renderChips();
grid.innerHTML = GAMES.map(cardHTML).join('');

// keep a reference to every card element, keyed by game id
const cardElements = new Map();
GAMES.forEach(game => {
  cardElements.set(game.id, grid.querySelector(`[data-id="${game.id}"]`));
});

// ---------- filtering and sorting ----------

// ignoreArea is used by the map pins, they count games for every area
function gameMatches(game, ignoreArea = false) {
  if (filters.sport !== 'All' && game.sport !== filters.sport.toLowerCase()) return false;
  if (filters.level !== 'Any' && game.level !== filters.level) return false;
  if (!ignoreArea && filters.area !== 'Anywhere' && game.area !== filters.area) return false;
  if (filters.time !== 'Anytime' && game.slot !== filters.time.toLowerCase()) return false;
  return true;
}

const SORTERS = {
  soon: (a, b) => a.minutes - b.minutes,
  near: (a, b) => a.distance - b.distance,
  full: (a, b) => b.joined - a.joined,
};

// FLIP animation: remember where every card is (First), change the page (Last),
// then play each card from its old position to its new one (Invert + Play).
function updateFinder({ animate = true } = {}) {
  // First: where the visible cards are right now
  const oldPositions = new Map();
  cardElements.forEach((card, id) => {
    if (!card.hidden) oldPositions.set(id, card.getBoundingClientRect());
  });

  // Last: show the matching cards in sorted order, park the rest at the end hidden
  const visible = GAMES.filter(game => gameMatches(game)).sort(SORTERS[filters.sort]);
  const visibleIds = new Set(visible.map(game => game.id));

  visible.forEach(game => {
    const card = cardElements.get(game.id);
    card.hidden = false;
    grid.appendChild(card);
  });
  GAMES.forEach(game => {
    if (visibleIds.has(game.id)) return;
    const card = cardElements.get(game.id);
    card.hidden = true;
    grid.appendChild(card);
  });

  // Invert + Play
  if (animate && !prefersReducedMotion) {
    visible.forEach((game, index) => {
      const card = cardElements.get(game.id);
      const before = oldPositions.get(game.id);
      const after = card.getBoundingClientRect();

      if (before) {
        // the card was already on screen: slide it from where it was
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (dx !== 0 || dy !== 0) {
          card.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
            { duration: 540, easing: 'cubic-bezier(.2,.8,.2,1)' }
          );
        }
      } else {
        // a card that just appeared: fade it up, each one a touch later than the last
        card.animate(
          [{ opacity: 0, transform: 'translateY(22px) scale(.93)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, delay: Math.min(index * 40, 280), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
        );
      }
    });
  }

  updateFilterControls(visible.length);
}

function updateFilterControls(resultCount) {
  // chips
  $$('[data-group]').forEach(chip => {
    chip.setAttribute('aria-pressed', filters[chip.dataset.group] === chip.dataset.value);
  });

  // "7 squads ready"
  const word = resultCount === 1 ? 'squad' : 'squads';
  countLabel.innerHTML = `<span class="not-italic text-neon">${resultCount}</span> ${word} ready`;
  emptyMessage.hidden = resultCount > 0;

  // map pins show how many games each area has under the other filters
  $$('.pin').forEach(pin => {
    const area = pin.dataset.area;
    const total = GAMES.filter(game => game.area === area && gameMatches(game, true)).length;

    $('.pin-dot', pin).textContent = total;
    pin.dataset.zero = total === 0 ? '1' : '';
    pin.setAttribute('aria-pressed', filters.area === area);
    pin.setAttribute('aria-label', `${area}: ${total} matching ${total === 1 ? 'game' : 'games'}`);
  });
}

// ---------- events ----------

$('#filters').addEventListener('click', event => {
  const chip = event.target.closest('[data-group]');
  if (!chip) return;
  filters[chip.dataset.group] = chip.dataset.value;
  updateFinder();
});

// clicking a pin picks that area, clicking it again clears it
$('#map').addEventListener('click', event => {
  const pin = event.target.closest('.pin');
  if (!pin) return;
  filters.area = filters.area === pin.dataset.area ? 'Anywhere' : pin.dataset.area;
  updateFinder();
});

$('#sort').addEventListener('change', event => {
  filters.sort = event.target.value;
  updateFinder();
});

$('#reset').addEventListener('click', () => {
  Object.assign(filters, DEFAULT_FILTERS);
  $('#sort').value = DEFAULT_FILTERS.sort;
  updateFinder();
});

updateFinder({ animate: false });
