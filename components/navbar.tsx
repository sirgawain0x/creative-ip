'use client'

import { useState, useLayoutEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, Sparkles, Wallet, LogOut, ExternalLink, Coins } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser, useAuthModal, useLogout } from '@account-kit/react'

const NAV_LINKS = [
  { href: '/', label: 'Exchange' },
  { href: '/launchpad', label: 'Launchpad' },
]

const MD_MIN = 768

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  /** Client-only; avoids relying on Tailwind `md:` media queries in the bundle. */
  const [isDesktop, setIsDesktop] = useState(false)
  const user = useUser()
  const address = user?.address
  const isConnected = !!user
  const { logout } = useLogout()
  const { openAuthModal } = useAuthModal()
  const [isOnrampLoading, setIsOnrampLoading] = useState(false)

  useLayoutEffect(() => {
    const update = () => {
      const desktop =
        window.innerWidth >= MD_MIN ||
        window.matchMedia(`(min-width: ${MD_MIN}px)`).matches
      setIsDesktop(desktop)
      if (desktop) setMobileOpen(false)
    }
    update()
    const mq = window.matchMedia(`(min-width: ${MD_MIN}px)`)
    mq.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const handleBuyUSDC = async () => {
    if (!address) return
    setIsOnrampLoading(true)

    try {
      const res = await fetch('/api/onramp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const data = await res.json()

      if (data.onrampUrl) {
        window.open(data.onrampUrl, '_blank')
      } else {
        console.error('Failed to parse onramp URL', data)
      }
    } catch (err) {
      console.error('Failed to initiate onramp session', err)
    } finally {
      setIsOnrampLoading(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
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

          {/* Desktop Nav — inline display so visibility never depends on Tailwind .flex/.hidden */}
          <div
            className="items-center gap-1"
            style={{ display: isDesktop ? 'flex' : 'none' }}
          >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all',
                    pathname === href
                      ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                      : 'text-muted-foreground hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  {label}
                </Link>
              ))}
          </div>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 font-semibold text-[10px] text-muted-foreground mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </div>

            {isConnected && address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1.5 outline-none transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                      style={{ display: isDesktop ? 'flex' : 'none' }}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-mono text-[10px] text-foreground">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass border-border/60">
                    <DropdownMenuLabel className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      Wallet Connected
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/60" />
                    <DropdownMenuItem className="font-mono text-xs flex items-center justify-between cursor-default">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Balance</span>
                      </div>
                      <span>0.00 USDC</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleBuyUSDC}
                      disabled={isOnrampLoading}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between font-mono text-xs text-primary transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:text-primary',
                        isOnrampLoading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{isOnrampLoading ? 'Loading...' : 'Buy USDC'}</span>
                      </div>
                      {!isOnrampLoading && <ExternalLink className="w-3.5 h-3.5" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/60" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer font-mono text-xs text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="shrink-0 rounded-xl border border-primary/70 !bg-transparent font-semibold text-xs !text-primary transition-all hover:-translate-y-0.5 hover:border-[#EC407A] hover:!bg-primary/10 hover:!text-primary-foreground hover:shadow-lg hover:shadow-primary/40"
                  style={{
                    display: isDesktop ? 'inline-flex' : 'none',
                    boxSizing: 'border-box',
                    minHeight: '2.25rem',
                    padding: '0.5rem 1.25rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => openAuthModal()}
                >
                  Get Started
                </Button>
              )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-secondary/30 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              style={{ display: isDesktop ? 'none' : 'flex' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && !isDesktop && (
          <div className="glass border-t border-border px-4 py-4 space-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'block rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all',
                  pathname === href
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {isConnected && address ? (
                <div className="flex flex-col gap-2 bg-secondary/30 border border-border/60 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-mono text-xs text-foreground">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">0.00 USDC</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-primary/30 font-mono text-xs text-primary transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 gap-2"
                    onClick={handleBuyUSDC}
                    disabled={isOnrampLoading}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {isOnrampLoading ? 'Loading...' : 'Buy USDC'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full rounded-xl font-mono text-xs text-destructive transition-all hover:bg-destructive/10 hover:text-destructive gap-2"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  className="!h-11 w-full rounded-xl border border-primary/70 !bg-transparent px-5 font-semibold text-xs !text-primary transition-all hover:-translate-y-0.5 hover:border-[#EC407A] hover:!bg-primary/10 hover:!text-primary-foreground hover:shadow-lg hover:shadow-primary/40"
                  onClick={() => {
                    openAuthModal()
                    setMobileOpen(false)
                  }}
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
