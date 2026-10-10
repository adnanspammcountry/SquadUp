// Last script to load. Anything with a data-join attribute opens the join dialog:
//   data-join="squad"  generic sign-up (nav button, floating button)
//   data-join="game"   a game card, data-name holds the game title
//   data-join="group"  a community card, data-name holds the group name
// One listener on the document covers buttons that are added later by the other scripts.

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-join]');
  if (!trigger) return;

  openModal({
    mode: trigger.dataset.join,
    name: trigger.dataset.name || '',
    sport: trigger.dataset.sport || '',
  });
});
