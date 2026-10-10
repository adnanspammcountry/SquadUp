// Community spotlight carousel: group cards you can drag, swipe or step through with the arrows.

const track = $('#track');
const progressBar = $('#prog');
const GAP_BETWEEN_CARDS = 18;

// ---------- build the cards ----------

// two made-up initials for the member bubbles, so each card gets a different set
function memberInitials(groupIndex, memberIndex) {
  const first = String.fromCharCode(65 + (groupIndex * 3 + memberIndex) % 26);
  const second = String.fromCharCode(75 + (groupIndex + memberIndex * 5) % 14);
  return first + second;
}

function groupCardHTML(group, index) {
  // use the group's own photo, or the first photo of its sport if none was set
  const photo = IMAGES.groups[index] || IMAGES.sport[group.sport][0];

  const members = [0, 1, 2, 3].map(i =>
    avatarHTML({
      photo: IMAGES.avatars[(index * 4 + i) % IMAGES.avatars.length],
      initials: memberInitials(index, i),
      color: AVATAR_COLORS[(index + i) % AVATAR_COLORS.length],
      size: 'h-[30px] w-[30px] text-[.62rem]',
      overlap: true,
    })
  ).join('');

  return `
    <article class="group w-[clamp(264px,78vw,340px)] flex-none snap-start overflow-hidden rounded-3xl border border-white/10 bg-panel transition duration-[400ms] hover:-translate-y-1.5 hover:border-neon hover:shadow-[0_22px_50px_-18px_rgba(0,255,102,.35)]">

      <div class="relative grid h-[190px] place-items-center overflow-hidden" style="background:linear-gradient(135deg, ${group.from}, ${group.to})">
        <span class="relative text-[104px] text-ink/80 transition duration-[600ms] group-hover:-rotate-[8deg] group-hover:scale-110">${sportIcon(group.sport, 'stroke-[1.1]')}</span>
        ${photoTag(photo, group.name)}
        <span class="absolute bottom-3.5 left-3.5 rounded-full bg-ink px-3 py-1.5 text-[.72rem] font-bold uppercase tracking-[.12em]">${SPORT_LABELS[group.sport]}</span>
      </div>

      <div class="grid gap-3 p-5">
        <h3 class="font-display text-[1.75rem] font-extrabold uppercase leading-none tracking-wide">${group.name}</h3>
        <p class="text-[.92rem] text-mute">${group.blurb}</p>
        <div class="flex items-center gap-3 text-sm text-white/80">
          <div class="flex" aria-hidden="true">${members}</div>
          <span><strong>${group.members.toLocaleString('en-US')}</strong> members</span>
        </div>
        <button type="button" data-join="group" data-name="${group.name}" data-sport="${group.sport}" class="${BUTTON_BASE} ${BUTTON_SMALL} ${BUTTON_PRIMARY} w-full">Request to Join</button>
      </div>
    </article>`;
}

track.innerHTML = GROUPS.map(groupCardHTML).join('');

// ---------- drag to scroll (mouse only, touch screens already scroll natively) ----------

let isDragging = false;
let dragStartX = 0;
let dragStartScroll = 0;
let dragDistance = 0;

track.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;

  isDragging = true;
  dragDistance = 0;
  dragStartX = event.clientX;
  dragStartScroll = track.scrollLeft;
  track.classList.add('is-dragging');
});

window.addEventListener('pointermove', event => {
  if (!isDragging) return;

  const moved = event.clientX - dragStartX;
  dragDistance = Math.max(dragDistance, Math.abs(moved));
  track.scrollLeft = dragStartScroll - moved;
});

window.addEventListener('pointerup', () => {
  if (!isDragging) return;

  isDragging = false;
  track.classList.remove('is-dragging'); // snapping kicks back in
});

// if the mouse moved a fair bit it was a drag, not a click, so don't press the button underneath
track.addEventListener('click', event => {
  if (dragDistance > 6) {
    event.preventDefault();
    event.stopPropagation();
    dragDistance = 0;
  }
}, true);

// stops the browser from trying to drag the photos around
track.addEventListener('dragstart', event => event.preventDefault());

// ---------- arrows and progress bar ----------

function cardWidth() {
  return $('article', track).offsetWidth + GAP_BETWEEN_CARDS;
}

function scrollCards(direction) {
  track.scrollBy({
    left: direction * cardWidth(),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
}

$('#next').addEventListener('click', () => scrollCards(1));
$('#prev').addEventListener('click', () => scrollCards(-1));

function updateProgress() {
  const seen = track.scrollLeft + track.clientWidth;
  const percent = Math.min(100, (seen / track.scrollWidth) * 100);
  progressBar.style.width = percent + '%';
}

track.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
