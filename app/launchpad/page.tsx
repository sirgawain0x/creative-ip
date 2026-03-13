import { Navbar } from '@/components/navbar'
import { Launchpad } from '@/components/launchpad'

export const metadata = {
  title: 'Launchpad — Creative IP',
  description: 'Manage your creative IP portfolio.',
}

export default function LaunchpadPage() {
  return (
    <main>
      <Navbar />
      <Launchpad />
    </main>
  )
}
