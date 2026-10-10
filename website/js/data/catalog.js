/* ============================================================
   CATALOG
   Two entries by design: the original flagship, and the study
   that taught us the engine. Status mirrors the engine config —
   nothing here claims availability the project has not granted.
   ============================================================ */

const D = 'assets/derived';
const W = [640, 1280, 1920, 2560];

/* srcset over the generated derivatives; the 3840px masters in
   assets/images are never served to a browser. */
export const srcset = (id, state) => W.map(w => `${D}/${id}-${state}-${w}.webp ${w}w`).join(', ');
export const src = (id, state, w = 1920) => `${D}/${id}-${state}-${w}.webp`;

export const CATALOG = [
  {
    id: 'aeren-sol',
    title: 'Aeren Sol',
    kicker: 'The Rift Gardener',
    world: 'Rift Garden',
    universe: 'The Ash Meridian',
    character: 'Aeren Sol',
    origin: 'Original world',
    status: 'dev',
    statusLabel: 'In development',
    flagship: true,
    blurb: 'A wanderer carries a living starseed through a plaza that has been dark for an age. Move across the scene and the Riftborne Ascendant surfaces beneath the resting form.',
    lore: 'If restoring one history quietly erases another, who is owed the choice?',
    states: ['Resting', 'Riftborne Ascendant'],
    trail: 'Starbloom Comet',
    trailId: 'starbloom',
    trails: ['Starbloom Comet', 'Minimal Reveal'],
    living: {
      supported: true,
      atmosphere: [['Crystal petal drift', 'Particles'], ['Aurora mist', 'Volume'],
                   ['Constellation memory links', 'Geometry'], ['Steady starseed halo', 'Light'],
                   ['Rigid whole-scene parallax', 'Motion']]
    },
    resolutions: ['3840 × 2160', '2560 × 1440', '1920 × 1080'],
    targets: ['Browser engine', 'Lively — staging', 'Wallpaper Engine — planned'],
    gates: [
      ['Identity and eye correction', true],
      ['Transformation readability', true],
      ['Crop, alignment and lighting continuity', true],
      ['Trail architecture production integration', false],
      ['Target-host performance acceptance', false],
      ['Rights, naming and public-use approval', false]
    ]
  },
  {
    id: 'luffy',
    title: 'Gear 5 Awakening',
    kicker: 'Sun God Nika',
    world: 'Onigashima',
    universe: 'One Piece',
    character: 'Monkey D. Luffy',
    origin: 'Fan study',
    status: 'ready',
    statusLabel: 'Engine ready',
    flagship: false,
    blurb: 'The captain of the Straw Hats gives way to the unfettered laughter of the Sun God. Cursor movement summons buoyant awakening cloudwork across the roof of Onigashima.',
    lore: 'Laughter becomes power, and reality bends to the drums of liberation.',
    states: ['Straw Hat', 'Gear 5'],
    trail: 'Gear Pi Cloud',
    trailId: 'gearPi',
    trails: ['Gear Pi Cloud', 'Minimal Reveal'],
    living: { supported: false, atmosphere: [] },
    resolutions: ['3840 × 2160', '2560 × 1440', '1920 × 1080'],
    targets: ['Browser engine', 'Lively'],
    gates: [
      ['Asset alignment and upscaling', true],
      ['Cloud mask tuning', true],
      ['Packaging matrix validation', true]
    ]
  }
];

export const byId = id => CATALOG.find(w => w.id === id);
export const FLAGSHIP = byId('aeren-sol');

/* Marquee copy — capability language, not marketing claims. */
export const MARQUEE = [
  'Two states, one geometry',
  'Starbloom Comet',
  'Time-based decay',
  'Living atmosphere',
  'Rigid whole-scene parallax',
  'Minimal Reveal',
  'Gear Pi Cloud',
  'Built to your display'
];
