export type IPAssetType = 'music' | 'literature' | 'image'

export type LicenseType = 'Commercial' | 'Remix' | 'Personal' | 'Exclusive'

export interface IPAsset {
  id: string
  storyProtocolId: string
  title: string
  creator: string
  creatorHandle: string
  type: IPAssetType
  coverImage: string
  description: string
  licenses: LicenseType[]
  price: number
  currency: 'ETH' | 'USDC'
  royaltyRate: number
  registered: string
  tags: string[]
  stats: {
    views: number
    licenses: number
    revenue: number
  }
  // Music specific
  duration?: string
  bpm?: number
  key?: string
  genre?: string
  // Literature specific
  wordCount?: number
  genre_lit?: string
  excerpt?: string
  // Image specific
  resolution?: string
  medium?: string
}

export const MY_PORTFOLIO: IPAsset[] = [
  {
    id: 'my-1',
    storyProtocolId: 'IP-0x4a2f...7c91',
    title: 'Neon Genesis Overture',
    creator: 'You',
    creatorHandle: '@creator',
    type: 'music',
    coverImage: '/images/music-1.jpg',
    description: 'An orchestral piece blending classical motifs with synthetic textures from 2050.',
    licenses: ['Commercial', 'Remix'],
    price: 0.08,
    currency: 'ETH',
    royaltyRate: 12,
    registered: '2026-01-15',
    tags: ['Orchestral', 'Cinematic', 'Electronic'],
    stats: { views: 4821, licenses: 34, revenue: 2.72 },
    duration: '4:32',
    bpm: 120,
    key: 'D Minor',
    genre: 'Cinematic',
  },
  {
    id: 'my-2',
    storyProtocolId: 'IP-0x8b3e...2d44',
    title: 'The Quiet Algorithm',
    creator: 'You',
    creatorHandle: '@creator',
    type: 'literature',
    coverImage: '/images/lit-1.jpg',
    description: 'A novella exploring consciousness in a post-AGI world.',
    licenses: ['Commercial', 'Personal'],
    price: 25,
    currency: 'USDC',
    royaltyRate: 8,
    registered: '2026-02-03',
    tags: ['Sci-Fi', 'Philosophy', 'Novella'],
    stats: { views: 1240, licenses: 12, revenue: 300 },
    wordCount: 42000,
    genre_lit: 'Science Fiction',
    excerpt: 'In the year the last human programmer retired, the machines held a ceremony...',
  },
  {
    id: 'my-3',
    storyProtocolId: 'IP-0x1c7a...9f02',
    title: 'Chrome Horizon #001',
    creator: 'You',
    creatorHandle: '@creator',
    type: 'image',
    coverImage: '/images/art-1.jpg',
    description: 'Generative hyper-realism meets industrial baroque. First piece in the Chrome series.',
    licenses: ['Exclusive', 'Commercial'],
    price: 1.2,
    currency: 'ETH',
    royaltyRate: 15,
    registered: '2026-02-20',
    tags: ['Generative', 'Industrial', 'Baroque'],
    stats: { views: 9300, licenses: 2, revenue: 2.4 },
    resolution: '8192 × 8192',
    medium: 'Generative AI + Hand Edit',
  },
]

export const MARKETPLACE_ASSETS: IPAsset[] = [
  {
    id: 'mkt-1',
    storyProtocolId: 'IP-0x2d9c...4e81',
    title: 'Echoes of the Void',
    creator: 'Zara Kline',
    creatorHandle: '@zarakline',
    type: 'music',
    coverImage: '/images/music-2.jpg',
    description: 'Ambient electronic with sub-bass resonance designed for immersive environments.',
    licenses: ['Commercial', 'Remix', 'Personal'],
    price: 0.05,
    currency: 'ETH',
    royaltyRate: 10,
    registered: '2026-01-08',
    tags: ['Ambient', 'Electronic', 'Immersive'],
    stats: { views: 7210, licenses: 88, revenue: 4.4 },
    duration: '6:14',
    bpm: 90,
    key: 'A Minor',
    genre: 'Ambient',
  },
  {
    id: 'mkt-2',
    storyProtocolId: 'IP-0x5f1b...8c30',
    title: 'Synthetic Psalms Vol. II',
    creator: 'Marcus Webb',
    creatorHandle: '@mwebb',
    type: 'music',
    coverImage: '/images/music-3.jpg',
    description: 'Gospel-influenced vocal synthesis over 808 architecture.',
    licenses: ['Commercial', 'Remix'],
    price: 0.12,
    currency: 'ETH',
    royaltyRate: 14,
    registered: '2026-02-11',
    tags: ['Gospel', 'Electronic', 'Vocal'],
    stats: { views: 5500, licenses: 41, revenue: 4.92 },
    duration: '3:58',
    bpm: 95,
    key: 'G Major',
    genre: 'Gospel Electronic',
  },
  {
    id: 'mkt-3',
    storyProtocolId: 'IP-0x3a8d...1f76',
    title: 'The Meridian Archives',
    creator: 'Sasha Orlov',
    creatorHandle: '@sashaorlov',
    type: 'literature',
    coverImage: '/images/lit-2.jpg',
    description: 'Serialized speculative fiction set in a decentralized city-state.',
    licenses: ['Personal', 'Commercial'],
    price: 40,
    currency: 'USDC',
    royaltyRate: 7,
    registered: '2025-12-19',
    tags: ['Speculative', 'Dystopian', 'Serial'],
    stats: { views: 3100, licenses: 29, revenue: 1160 },
    wordCount: 120000,
    genre_lit: 'Speculative Fiction',
    excerpt: 'The Meridian never slept. Its towers hummed with the labor of ten thousand anonymous nodes...',
  },
  {
    id: 'mkt-4',
    storyProtocolId: 'IP-0x7e2c...6b09',
    title: 'Lattice Study No. 7',
    creator: 'Priya Nair',
    creatorHandle: '@priyanair',
    type: 'image',
    coverImage: '/images/art-2.jpg',
    description: 'Structural light paintings drawn from interference patterns.',
    licenses: ['Commercial', 'Remix', 'Exclusive'],
    price: 0.8,
    currency: 'ETH',
    royaltyRate: 12,
    registered: '2026-01-30',
    tags: ['Abstract', 'Geometric', 'Light'],
    stats: { views: 11200, licenses: 6, revenue: 4.8 },
    resolution: '6000 × 6000',
    medium: 'Digital Photography + Processing',
  },
  {
    id: 'mkt-5',
    storyProtocolId: 'IP-0x9c4a...3d57',
    title: 'Horizon Breach',
    creator: 'Dante Cruz',
    creatorHandle: '@dantecruz',
    type: 'image',
    coverImage: '/images/art-3.jpg',
    description: 'Hyper-detailed mech concept art with full commercial licensing.',
    licenses: ['Commercial'],
    price: 2.5,
    currency: 'ETH',
    royaltyRate: 18,
    registered: '2026-03-01',
    tags: ['Concept Art', 'Mecha', 'Industrial'],
    stats: { views: 22400, licenses: 3, revenue: 7.5 },
    resolution: '12000 × 8000',
    medium: 'Digital Painting',
  },
  {
    id: 'mkt-6',
    storyProtocolId: 'IP-0x0d6f...5a23',
    title: 'Neural Drift',
    creator: 'Kenji Moto',
    creatorHandle: '@kenjimoto',
    type: 'music',
    coverImage: '/images/music-4.jpg',
    description: 'Lo-fi phonk with heavy distortion and waveform manipulation.',
    licenses: ['Remix', 'Personal'],
    price: 0.03,
    currency: 'ETH',
    royaltyRate: 5,
    registered: '2026-02-28',
    tags: ['Phonk', 'Lo-fi', 'Experimental'],
    stats: { views: 18700, licenses: 210, revenue: 6.3 },
    duration: '2:47',
    bpm: 140,
    key: 'F# Minor',
    genre: 'Phonk',
  },
]

export const ALL_ASSETS = [...MY_PORTFOLIO, ...MARKETPLACE_ASSETS]
