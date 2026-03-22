import { Navbar } from '@/components/navbar'
import { IPDetail } from '@/components/ip-detail'
import { notFound } from 'next/navigation'
import { graphQLClient, GET_IP_ASSET_BY_ID, mapSubgraphAssetToIPAsset } from '@/lib/graphql'

interface IPDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return [] // Rely on dynamic rendering for all mainnet assets
}

export async function generateMetadata({ params }: IPDetailPageProps) {
  const { id } = await params
  
  try {
    const data: any = await graphQLClient.request(GET_IP_ASSET_BY_ID, { ipId: id })
    if (!data.ipregistereds || data.ipregistereds.length === 0) return {}
    
    const asset = await mapSubgraphAssetToIPAsset(data.ipregistereds[0])
    return {
      title: `${asset.title} — Nexus Protocol`,
      description: asset.description,
    }
  } catch (err) {
    return {}
  }
}

export default async function IPDetailPage({ params }: IPDetailPageProps) {
  const { id } = await params
  
  try {
    const data: any = await graphQLClient.request(GET_IP_ASSET_BY_ID, { ipId: id })
    if (!data.ipregistereds || data.ipregistereds.length === 0) {
      notFound()
    }
    
    const asset = await mapSubgraphAssetToIPAsset(data.ipregistereds[0])
    
    return (
      <main>
        <Navbar />
        <IPDetail asset={asset} />
      </main>
    )
  } catch (err) {
    console.error(err)
    notFound()
  }
}
