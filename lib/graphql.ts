import { GraphQLClient, gql } from 'graphql-request'
import { IPAsset } from './data'
import { resolveGroveURI } from './grove'

const endpoint = process.env.NEXT_PUBLIC_GOLDSKY_GRAPHQL_URL

if (!endpoint) {
  console.warn('NEXT_PUBLIC_GOLDSKY_GRAPHQL_URL is missing in environment variables.')
}

export const graphQLClient = new GraphQLClient(endpoint || '')

// We define generic query fields representing an IPAssetRegistry event based Subgraph.
// Goldsky generates Entities from events. Since we are indexing IPRegistered:
export const GET_RECENT_IP_ASSETS = gql`
  query GetRecentIPAssets($first: Int!, $skip: Int!) {
    ipregistereds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
      id
      ipId
      owner
      chainId
      tokenContract
      tokenId
      metadataURI
      blockTimestamp
      transactionHash
    }
  }
`

export const GET_USER_IP_ASSETS = gql`
  query GetUserIPAssets($owner: String!) {
    ipregistereds(where: { owner: $owner }, orderBy: blockTimestamp, orderDirection: desc) {
      id
      ipId
      owner
      chainId
      tokenContract
      tokenId
      metadataURI
      blockTimestamp
      transactionHash
    }
  }
`

export const GET_IP_ASSET_BY_ID = gql`
  query GetIPAssetById($ipId: String!) {
    ipregistereds(where: { ipId: $ipId }, first: 1) {
      id
      ipId
      owner
      chainId
      tokenContract
      tokenId
      metadataURI
      blockTimestamp
      transactionHash
    }
  }
`

// Helper to map the raw Subgraph data to our application's IPAsset interface
export async function mapSubgraphAssetToIPAsset(subgraphData: any): Promise<IPAsset> {
  // Extract block timestamp safely (converting seconds to ms if needed)
  const dateObj = new Date(Number(subgraphData.blockTimestamp) * 1000)
  
  let metadata: any = null
  if (subgraphData.metadataURI) {
    try {
      const url = resolveGroveURI(subgraphData.metadataURI)
      if (url) {
        const res = await fetch(url)
        metadata = await res.json()
      }
    } catch (e) {
      console.warn('Failed to fetch metadata from Grove:', e)
    }
  }

  const getAttr = (key: string) => metadata?.attributes?.find((a: any) => a.key === key)?.value

  return {
    id: subgraphData.id,
    storyProtocolId: subgraphData.ipId,
    title: metadata?.title || `Asset ${subgraphData.tokenId || ''}`,
    creator: metadata?.creator || 'Decentralized Creator',
    creatorHandle: `${subgraphData.owner.substring(0, 6)}...${subgraphData.owner.substring(subgraphData.owner.length - 4)}`,
    type: getAttr('Type') || metadata?.type || 'music',
    coverImage: metadata?.image ? resolveGroveURI(metadata.image) : '/images/art-1.jpg',
    description: metadata?.description || 'An IP Asset registered on the Story Protocol Mainnet. The metadata is stored off-chain at ' + subgraphData.metadataURI,
    licenses: getAttr('Licenses') ? getAttr('Licenses').split(',').map((s:string) => s.trim()) : ['Commercial'],
    price: 0,
    currency: 'USDC',
    royaltyRate: getAttr('RoyaltyRate') ? Number(getAttr('RoyaltyRate')) : 10,
    registered: dateObj.toISOString().split('T')[0],
    tags: metadata?.tags || ['On-Chain', 'Story Protocol'],
    stats: { views: 0, licenses: 0, revenue: 0 },
    // Retaining raw mapping data mapping
    metadataURI: subgraphData.metadataURI,
    transactionHash: subgraphData.transactionHash,
    tokenContract: subgraphData.tokenContract,
    tokenId: subgraphData.tokenId
  } as any // Cast applied to cover extra fields added above
}
