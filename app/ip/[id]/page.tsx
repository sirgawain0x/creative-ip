import { Navbar } from '@/components/navbar'
import { IPDetail } from '@/components/ip-detail'
import { ALL_ASSETS } from '@/lib/data'
import { notFound } from 'next/navigation'

interface IPDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return ALL_ASSETS.map((asset) => ({ id: asset.id }))
}

export async function generateMetadata({ params }: IPDetailPageProps) {
  const { id } = await params
  const asset = ALL_ASSETS.find((a) => a.id === id)
  if (!asset) return {}
  return {
    title: `${asset.title} — Nexus Protocol`,
    description: asset.description,
  }
}

export default async function IPDetailPage({ params }: IPDetailPageProps) {
  const { id } = await params
  const asset = ALL_ASSETS.find((a) => a.id === id)
  if (!asset) notFound()

  return (
    <main>
      <Navbar />
      <IPDetail asset={asset} />
    </main>
  )
}
