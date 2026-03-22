export type IPAssetType = 'music' | 'literature' | 'image' | 'video'

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
  currency: 'USDC'
  royaltyRate: number
  registered: string
  tags: string[]
  stats: {
    views: number
    licenses: number
    revenue: number
  }
  metadataURI?: string
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
