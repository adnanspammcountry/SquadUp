// All the sample content for the site lives here.
// Change a game, a group or a photo and the page updates, no other file needs touching.

// Builds an Unsplash photo link from its id. Set faces to true for square, face-cropped profile photos.
function unsplash(id, width = 900, faces = false) {
  const size = faces ? `&h=${width}&crop=faces` : '';
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70&w=${width}${size}`;
}

// Photos load from Unsplash, so the page needs an internet connection to show them.
// To use your own pictures, swap any link for a file path like 'images/groups/1.jpg'.
// If a photo can't load it is skipped and the drawn thumbnail shows instead.
const IMAGES = {
  hero: unsplash('1569531955323-33c6b2dca44b', 1600),

  // three photos per sport: the three games of that sport use them in order
  sport: {
    soccer: [
      unsplash('1431324155629-1a6deb1dec8d'),
      unsplash('1574629810360-7efbbe195018'),
      unsplash('1624280157150-4d1ed8632989'),
    ],
    basketball: [
      unsplash('1543633550-f431af584afd'),
      unsplash('1594623274890-6b45ce7cf44a'),
      unsplash('1636662978233-bbaf957292c9'),
    ],
    tennis: [
      unsplash('1554068865-24cecd4e34b8'),
      unsplash('1545151414-8a948e1ea54f'),
      unsplash('1595435742656-5272d0b3fa82'),
    ],
    running: [
      unsplash('1590333748338-d629e4564ad9'),
      unsplash('1613936360976-8f35cf0e5461'),
      unsplash('1551927336-09d50efd69cd'),
    ],
  },

  // same order as GROUPS below
  groups: [
    unsplash('1519684093736-61f49e250672'),
    unsplash('1552674605-db6ffd4facb5'),
    unsplash('1508087625439-de3978963553'),
    unsplash('1620742820748-87c09249a72a'),
    unsplash('1713427508493-25e2c572deff'),
    unsplash('1543326727-cf6c39e8f84c'),
    unsplash('1760315972424-1637530daead'),
    unsplash('1545809074-59472b3f5ecc'),
  ],

  // profile photos, used for members and the leaderboard
  avatars: [
    '1568602471122-7832951cc4c5',
    '1494790108377-be9c29b29330',
    '1522529599102-193c0d76b5b6',
    '1489278353717-f64c6ee8a4d2',
    '1592234789031-94bf65f630ed',
    '1548382131-e0ebb1f0cdea',
    '1583264277168-58ceba4b84e7',
    '1611695434369-a8f5d76ceb7b',
    '1549913772-820279f909b7',
    '1573294705900-9623cfc746b7',
    '1600603406200-5b2a104684ac',
    '1564460576398-ef55d99548b2',
  ].map(id => unsplash(id, 160, true)),
};

// Games you can join. Three per sport, the hero card shows the first three of the chosen sport.
const GAMES = [
  { id: 1, sport: 'soccer', title: '5-a-Side Sunset Kickabout', venue: 'Riverside Turf', area: 'Riverside', level: 'Intermediate', time: '6:30 PM', distance: 1.2, joined: 8, capacity: 10 },
  { id: 2, sport: 'soccer', title: 'Beginners Pass and Play', venue: 'Campus Field', area: 'Campus', level: 'Beginner', time: '7:00 AM', distance: 0.8, joined: 11, capacity: 16 },
  { id: 3, sport: 'soccer', title: 'Pro League Pickup', venue: 'Eastside Arena', area: 'Eastside', level: 'Pro', time: '8:00 PM', distance: 4.1, joined: 9, capacity: 10 },

  { id: 4, sport: 'basketball', title: 'Full-Court 5v5', venue: 'Downtown Rec', area: 'Downtown', level: 'Intermediate', time: '7:00 PM', distance: 2.3, joined: 7, capacity: 10 },
  { id: 5, sport: 'basketball', title: '3v3 Half-Court Hustle', venue: 'Campus Courts', area: 'Campus', level: 'Beginner', time: '4:00 PM', distance: 0.9, joined: 4, capacity: 6 },
  { id: 6, sport: 'basketball', title: 'Elite Run', venue: 'Eastside Arena', area: 'Eastside', level: 'Pro', time: '9:00 PM', distance: 4.1, joined: 10, capacity: 10 },

  { id: 7, sport: 'tennis', title: 'Doubles Social', venue: 'Riverside Club', area: 'Riverside', level: 'Beginner', time: '8:30 AM', distance: 1.6, joined: 3, capacity: 4 },
  { id: 8, sport: 'tennis', title: 'Rally Ladder Night', venue: 'Downtown Courts', area: 'Downtown', level: 'Intermediate', time: '6:00 PM', distance: 2.7, joined: 5, capacity: 8 },
  { id: 9, sport: 'tennis', title: 'Match Play Singles', venue: 'Campus Courts', area: 'Campus', level: 'Pro', time: '3:30 PM', distance: 1.0, joined: 1, capacity: 2 },

  { id: 10, sport: 'running', title: 'Dawn 5K Crew', venue: 'Riverside Path', area: 'Riverside', level: 'Beginner', time: '6:00 AM', distance: 1.4, joined: 22, capacity: 40 },
  { id: 11, sport: 'running', title: 'Tempo Tuesday Intervals', venue: 'Campus Track', area: 'Campus', level: 'Intermediate', time: '5:15 PM', distance: 0.7, joined: 14, capacity: 20 },
  { id: 12, sport: 'running', title: 'Sub-20 Pace Group', venue: 'Eastside Loop', area: 'Eastside', level: 'Pro', time: '5:45 AM', distance: 3.8, joined: 9, capacity: 12 },
];

// The filter chips. The first value in each list means "no filter".
const FILTERS = {
  sport: ['All', 'Soccer', 'Basketball', 'Tennis', 'Running'],
  level: ['Any', 'Beginner', 'Intermediate', 'Pro'],
  area: ['Anywhere', 'Riverside', 'Campus', 'Downtown', 'Eastside'],
  time: ['Anytime', 'Morning', 'Afternoon', 'Evening'],
};

// "Today's Matches" tab. Live matches have a score that ticks up on the page.
const MATCHES = [
  { sport: 'running', title: 'Dawn 5K Crew', venue: 'Riverside Path', status: 'done', time: 'Done' },
  { sport: 'basketball', title: '3v3 Half-Court Hustle', venue: 'Campus Courts', status: 'live', key: 'm1', scoreA: 14, scoreB: 12 },
  { sport: 'tennis', title: 'Rally Ladder Night', venue: 'Downtown Courts', status: 'live', key: 'm2', scoreA: 4, scoreB: 3 },
  { sport: 'soccer', title: '5-a-Side Sunset Kickabout', venue: 'Riverside Turf', status: 'next', time: '6:30 PM' },
  { sport: 'basketball', title: 'Full-Court 5v5', venue: 'Downtown Rec', status: 'open', time: '7:00 PM' },
  { sport: 'basketball', title: 'Elite Run', venue: 'Eastside Arena', status: 'full', time: '9:00 PM' },
];

// Leaderboard tab: weekly points, the avatar photo is picked by position
const LEADERBOARD = [
  { name: 'Ayaan R.', squad: 'Riverside Rovers FC', points: 2840 },
  { name: 'Maya K.', squad: 'Midnight Hoopers', points: 2655 },
  { name: 'Tariq H.', squad: 'Dawn Patrol Runners', points: 2410 },
  { name: 'Lena S.', squad: 'Baseline Collective', points: 2230 },
  { name: 'Imran D.', squad: 'Sunday League United', points: 2105 },
  { name: 'Zoya A.', squad: 'Tempo Club', points: 1980 },
];

// Trending tab: sign-up growth this week, in percent
const TRENDING = [
  { sport: 'Padel', growth: 41 },
  { sport: 'Running', growth: 34 },
  { sport: 'Basketball', growth: 21 },
  { sport: 'Cycling', growth: 18 },
  { sport: 'Soccer', growth: 12 },
  { sport: 'Tennis', growth: 9 },
];

// Community carousel. from/to are the two colors behind the drawn thumbnail.
const GROUPS = [
  { name: 'Midnight Hoopers', sport: 'basketball', members: 312, blurb: 'Late-night full court, all levels welcome after 9.', from: '#FF5500', to: '#ffb089' },
  { name: 'Dawn Patrol Runners', sport: 'running', members: 540, blurb: 'Easy 5Ks along the river before the city wakes up.', from: '#00FF66', to: '#c9ffdd' },
  { name: 'Riverside Rovers FC', sport: 'soccer', members: 428, blurb: 'Five-a-side league with weekly table and a proper kit.', from: '#00d455', to: '#00FF66' },
  { name: 'Baseline Collective', sport: 'tennis', members: 187, blurb: 'Ladder matches and coached drills for club beginners.', from: '#ffffff', to: '#c9ffdd' },
  { name: 'Three-Peat 3v3', sport: 'basketball', members: 96, blurb: 'Half-court tournaments with a monthly trophy.', from: '#ff7a33', to: '#FF5500' },
  { name: 'Sunday League United', sport: 'soccer', members: 603, blurb: 'The biggest weekend crew in town. Eleven-a-side.', from: '#00FF66', to: '#00a845' },
  { name: 'Tempo Club', sport: 'running', members: 264, blurb: 'Interval nights on the track, pace groups from 6 to 4 min per km.', from: '#ffffff', to: '#ffb089' },
  { name: 'Net Gains Doubles', sport: 'tennis', members: 142, blurb: 'Mixed doubles socials with rotating partners.', from: '#ff7a33', to: '#ffd1b8' },
];
