'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, Sparkles, Wallet } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth, useWallet } from '@crossmint/client-sdk-react-ui'

const NAV_LINKS = [
  { href: '/', label: 'Exchange' },
  { href: '/launchpad', label: 'Launchpad' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { wallet, status } = useWallet()
  const { login } = useAuth()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.svg"
                alt="Creative IP"
                fill
                className="object-contain group-hover:opacity-80 transition-opacity"
              />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-foreground">
              CREATIVE<span className="text-primary"> IP</span>
            </span>
            <Sparkles className="w-4 h-4 text-accent hidden sm:block" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'font-mono text-xs uppercase tracking-widest px-4 py-2 rounded transition-all',
                  pathname === href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 font-semibold text-[10px] text-muted-foreground mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </div>

            {status === 'loaded' && wallet ? (
              <div className="hidden md:flex items-center gap-2 bg-secondary/50 border border-border/60 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[10px] text-foreground">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs glow-primary hidden md:flex"
                onClick={() => { if (login) login() }}
              >
                Get Started
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-muted-foreground hover:text-foreground p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-border px-4 py-4 space-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'block font-mono text-xs uppercase tracking-widest px-4 py-3 rounded transition-all',
                  pathname === href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {status === 'loaded' && wallet ? (
                <div className="flex items-center justify-center gap-2 bg-secondary/50 border border-border/60 px-4 py-3 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs text-foreground">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                </div>
              ) : (
                <Button
                  className="w-full bg-primary text-primary-foreground font-semibold text-xs"
                  onClick={() => { if (login) login(); setMobileOpen(false) }}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
