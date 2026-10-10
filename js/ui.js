// Small helpers and shared Tailwind class strings used by the other scripts.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ---------- sports ----------

const SPORT_LABELS = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  tennis: 'Tennis',
  running: 'Running',
};

// Line icons (24x24) for the drawn thumbnails and chips
const SPORT_ICON_PATHS = {
  soccer:
    '<circle cx="12" cy="12" r="10"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/><path d="M12 7V2M16 10l5-1.5M14.5 14.5L17 19M9.5 14.5L7 19M8 10L3 8.5"/>',
  basketball:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="M5 4.5c3 3 3 12 0 15M19 4.5c-3 3-3 12 0 15"/>',
  tennis:
    '<circle cx="12" cy="12" r="10"/><path d="M4 5c5 3 5 11 0 14M20 5c-5 3-5 11 0 14"/>',
  running:
    '<circle cx="14.5" cy="4.5" r="2"/><path d="M4.5 21l4.2-5.2 3.3 1.2 2-5.2-3.2-2-3.3 2.2M12 8.5l3.8 2.6 3.2-.1M14 12l1.2 4.2 4 3"/>',
};

function sportIcon(sport, extraClasses = '') {
  return `<svg class="h-[1em] w-[1em] ${extraClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SPORT_ICON_PATHS[sport]}</svg>`;
}

// ---------- images ----------

// An <img> that covers its parent. If the file can't load it removes itself,
// so the drawn thumbnail underneath shows through instead of a broken image icon.
function photoTag(url, altText = '') {
  if (!url) return '';
  return `<img class="photo absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" src="${url}" alt="${altText}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`;
}

// Round profile picture. The initials sit behind the photo as a fallback.
function avatarHTML({ photo, initials, color = 'bg-neon', size = 'h-[34px] w-[34px] text-[.72rem]', overlap = false }) {
  const spacing = overlap ? '-ml-2 first:ml-0 border-2 border-charcoal' : '';
  const image = photo
    ? `<img class="absolute inset-0 h-full w-full object-cover" src="${photo}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`
    : '';
  return `<span class="avatar relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-ink ${size} ${color} ${spacing}">${initials}${image}</span>`;
}

const AVATAR_COLORS = ['bg-neon', 'bg-ember !text-white', 'bg-white'];

// ---------- buttons ----------
// The same few button looks are needed in JavaScript-built markup, so the classes are kept here.

const BUTTON_BASE =
  'btn-shine fx relative inline-flex items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full font-display font-extrabold uppercase tracking-wider transition duration-300 hover:-translate-y-0.5 active:scale-95';

const BUTTON_PRIMARY =
  'bg-neon text-ink shadow-[0_8px_28px_rgba(0,255,102,.25)] hover:shadow-[0_0_0_5px_rgba(0,255,102,.18),0_12px_44px_rgba(0,255,102,.55)]';

const BUTTON_GHOST =
  'border border-white/30 bg-white/5 hover:border-ember hover:shadow-[0_0_0_5px_rgba(255,85,0,.16),0_12px_40px_rgba(255,85,0,.4)]';

const BUTTON_SMALL = 'px-5 py-3 text-base';
