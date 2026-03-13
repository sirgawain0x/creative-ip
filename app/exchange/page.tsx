import { Navbar } from '@/components/navbar'
import { Exchange } from '@/components/exchange'

export const metadata = {
  title: 'Exchange — Nexus Protocol',
  description: 'Browse and license world-class creative IP on the Nexus Protocol Exchange.',
}

export default function ExchangePage() {
  return (
    <main>
      <Navbar />
      <Exchange />
    </main>
  )
}
