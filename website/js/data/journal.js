/* ============================================================
   JOURNAL — public creative writing only. Development material
   stays in the workshop; nothing here exposes internal paths,
   hashes, checkpoints or tooling.
   ============================================================ */
export const POSTS = [
  { date: '2026-08-09', kind: 'Worldbuilding', title: 'The Ash Meridian, and why its suns went out',
    excerpt: 'A cosmology built around collapse rather than conquest, and what it means to garden a dead sky.' },
  { date: '2026-08-02', kind: 'Craft', title: 'Designing a trail that reads as one continuous thing',
    excerpt: 'Why a stroke assembled from separate round-capped sections reads as beads, and what changed to make the reveal flow.' },
  { date: '2026-07-24', kind: 'Character', title: 'A protagonist who repairs instead of wins',
    excerpt: 'Building a lead whose defining power creates a moral cost rather than an advantage.' },
  { date: '2026-07-15', kind: 'Craft', title: 'Living, not looping: restraint as an atmosphere technique',
    excerpt: 'A wallpaper shares the screen with your work. Here is the line we drew between alive and distracting.' },
  { date: '2026-07-02', kind: 'Studio', title: 'What a commission actually involves',
    excerpt: 'From a single reference photo to an aligned dual-state pair — the shape of the process, start to finish.' }
];
export const KINDS = ['All'].concat([...new Set(POSTS.map(p => p.kind))]);
