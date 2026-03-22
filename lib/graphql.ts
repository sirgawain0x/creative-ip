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
    ipregistereds(first: $first, skip: $skip, orderBy: timestamp_, orderDirection: desc) {
      id
      ipId
      chainId
      tokenContract
      tokenId
      uri
      timestamp_
      transactionHash_
    }
  }
`

export const GET_USER_IP_ASSETS = gql`
  query GetUserIPAssets($first: Int!, $skip: Int!) {
    ipregistereds(first: $first, skip: $skip, orderBy: timestamp_, orderDirection: desc) {
      id
      ipId
      chainId
      tokenContract
      tokenId
      uri
      timestamp_
      transactionHash_
    }
  }
`

export const GET_IP_ASSET_BY_ID = gql`
  query GetIPAssetById($ipId: String!) {
    ipregistereds(where: { ipId: $ipId }, first: 1) {
      id
      ipId
      chainId
      tokenContract
      tokenId
      uri
      timestamp_
      transactionHash_
    }
  }
`

// Helper to map the raw Subgraph data to our application's IPAsset interface
export async function mapSubgraphAssetToIPAsset(subgraphData: any): Promise<IPAsset> {
  // Extract block timestamp safely (converting seconds to ms if needed)
  const dateObj = new Date(Number(subgraphData.timestamp_) * 1000)

  let metadata: any = null
  if (subgraphData.uri) {
    try {
      const url = resolveGroveURI(subgraphData.uri)
      if (url) {
        const res = await fetch(url)
        metadata = await res.json()
      }
    } catch (e) {
      console.warn('Failed to fetch metadata from Grove:', e)
    }
  }

  const getAttr = (key: string) => metadata?.attributes?.find((a: any) => a.key === key)?.value
  const fallbackAddress = subgraphData.transactionHash_ || '0x0000000000000000000000000000000000000000';

  return {
    id: subgraphData.id,
    storyProtocolId: subgraphData.ipId,
    title: metadata?.title || `Asset ${subgraphData.tokenId || ''}`,
    creator: metadata?.creator || 'Decentralized Creator',
    creatorHandle: `${fallbackAddress.substring(0, 6)}...${fallbackAddress.substring(fallbackAddress.length - 4)}`,
    type: getAttr('Type') || metadata?.type || 'music',
    coverImage: metadata?.image ? resolveGroveURI(metadata.image) : '/images/art-1.jpg',
    description: metadata?.description || 'An IP Asset registered on the Story Protocol Mainnet. The metadata is stored off-chain at ' + subgraphData.uri,
    licenses: getAttr('Licenses') ? getAttr('Licenses').split(',').map((s: string) => s.trim()) : ['Commercial'],
    price: 0,
    currency: 'USDC',
    royaltyRate: getAttr('RoyaltyRate') ? Number(getAttr('RoyaltyRate')) : 10,
    registered: dateObj.toISOString().split('T')[0],
    tags: metadata?.tags || ['On-Chain', 'Story Protocol'],
    stats: { views: 0, licenses: 0, revenue: 0 },
    // Retaining raw mapping data mapping
    metadataURI: subgraphData.uri,
    transactionHash: subgraphData.transactionHash_,
    tokenContract: subgraphData.tokenContract,
    tokenId: subgraphData.tokenId
  } as any // Cast applied to cover extra fields added above
}
