// The "Join the Squad" dialog. It is opened from lots of places (nav button, floating button,
// game cards, group cards), so openModal() takes a small description of where the click came from.

const joinDialog = $('#join');
const joinForm = $('#joinForm');
const formView = $('#mForm');
const doneView = $('#mDone');

const nameInput = $('#fName');
const emailInput = $('#fEmail');
const targetInput = $('#fTarget');
const sportSelect = $('#fSport');
const formError = $('#formError');

let friends = 0;
let joinMode = 'squad'; // 'squad', 'game' or 'group'
let closeTimer = 0;

// ---------- "bring friends" stepper ----------

function showFriends() {
  $('#friendsCount').textContent = friends === 0 ? 'Just me' : `Me + ${friends}`;
}

$('#friendsPlus').addEventListener('click', () => {
  friends = Math.min(5, friends + 1);
  showFriends();
});

$('#friendsMinus').addEventListener('click', () => {
  friends = Math.max(0, friends - 1);
  showFriends();
});

// ---------- open and close ----------

const MODAL_TEXT = {
  squad: { title: 'Join the Squad', subtitle: 'Tell us what you play. We will line you up with games and groups that fit.' },
  game: { title: 'Save your spot', subtitle: '' },
  group: { title: 'Request to join', subtitle: '' },
};

function openModal({ mode = 'squad', name = '', sport = '' } = {}) {
  clearTimeout(closeTimer);
  joinDialog.classList.remove('closing');

  joinMode = mode;
  formView.hidden = false;
  doneView.hidden = true;
  formError.hidden = true;

  const text = MODAL_TEXT[mode] || MODAL_TEXT.squad;
  $('#mTitle').textContent = text.title;
  $('#mSub').textContent = name || text.subtitle;

  // when the click came from a game or group card, fill in (and lock) that name
  targetInput.value = name;
  targetInput.readOnly = Boolean(name);

  const targetLabel = $('#fTargetWrap label');
  if (mode === 'group') targetLabel.textContent = 'Group';
  else if (mode === 'game') targetLabel.textContent = 'Game';
  else targetLabel.textContent = 'Game or group (optional)';

  // preselect the sport of the card they clicked
  if (sport) {
    const option = Array.from(sportSelect.options).find(o => o.value.toLowerCase() === sport);
    if (option) sportSelect.value = option.value;
  }

  if (!joinDialog.open) joinDialog.showModal();
  setTimeout(() => nameInput.focus(), 60);
}

function closeModal() {
  if (!joinDialog.open || joinDialog.classList.contains('closing')) return;

  if (prefersReducedMotion) {
    joinDialog.close();
    return;
  }

  // play the closing animation (0.22s in custom.css), then really close
  joinDialog.classList.add('closing');
  closeTimer = setTimeout(() => {
    joinDialog.classList.remove('closing');
    joinDialog.close();
  }, 230);
}

// Escape key: use our animated close instead of the instant one
joinDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeModal();
});

// a click on the dark area around the dialog lands on the <dialog> element itself
joinDialog.addEventListener('click', event => {
  if (event.target === joinDialog) closeModal();
});

$('#mClose').addEventListener('click', closeModal);
$('#doneClose').addEventListener('click', closeModal);

// ---------- submitting ----------

function looksLikeEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

joinForm.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !looksLikeEmail(email)) {
    formError.hidden = false;
    (name ? emailInput : nameInput).focus();
    return;
  }
  formError.hidden = true;

  const firstName = name.split(/\s+/)[0];
  const target = targetInput.value.trim();
  const withFriends = friends > 0 ? ` with ${friends} ${friends === 1 ? 'friend' : 'friends'}` : '';

  $('#doneTitle').textContent = joinMode === 'group' ? 'Request ready' : "You're in";
  $('#doneText').textContent = target
    ? `Thanks, ${firstName}. ${target} is on your list${withFriends}.`
    : `Thanks, ${firstName}. Your squad matches will show up here.`;

  formView.hidden = true;
  doneView.hidden = false;

  joinForm.reset();
  friends = 0;
  showFriends();
});
