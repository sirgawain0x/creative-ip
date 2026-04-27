'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuthModal } from '@account-kit/react'
import { IPAsset } from '@/lib/data'
import { IPCard } from './ip-card'
import { RegisterIPWizard } from './register-ip-wizard'
import { Button } from './ui/button'
import {
  Plus,
  TrendingUp,
  Layers,
  DollarSign,
  Eye,
  Zap,
  ChevronRight,
  Activity,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { graphQLClient, GET_USER_IP_ASSETS, mapSubgraphAssetToIPAsset } from '@/lib/graphql'

const RECENT_ACTIVITY: { action: string, asset: string, by: string, time: string, amount: string | null }[] = [] // Empty activity stream for production MVP

export function Launchpad() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [myPortfolio, setMyPortfolio] = useState<IPAsset[]>([])
  const [loading, setLoading] = useState(true)
  const user = useUser()
  const address = user?.address
  const isConnected = !!user
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    async function fetchUserAssets() {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const data: any = await graphQLClient.request(GET_USER_IP_ASSETS, {
          first: 10,
          skip: 0
        })
        if (data.ipregistereds) {
          const assets = await Promise.all(
            data.ipregistereds.map((item: any) => mapSubgraphAssetToIPAsset(item))
          )
          setMyPortfolio(assets)
        }
      } catch (err) {
        console.error('Failed to fetch from Goldsky:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserAssets()
  }, [isConnected, address])

  const handleRegisterClick = () => {
    if (!isConnected) {
      openAuthModal()
    } else {
      setWizardOpen(true)
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-10">
        {/* Hero header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-glow" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Creator Launchpad
              </span>
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground text-balance">
              Your IP Portfolio
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-2 max-w-md">
              Register, manage, and monetize your creative works on Story Protocol. Zero gas. Full control.
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground font-mono text-xs gap-2 glow-primary self-start sm:self-auto shrink-0"
            onClick={handleRegisterClick}
          >
            <Plus className="w-3.5 h-3.5" /> Register New IP
          </Button>
        </div>

        {isConnected && address ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total IP Assets', value: myPortfolio.length.toString(), delta: '+0 this month', icon: Layers, glow: false },
            { label: 'Active Licenses', value: myPortfolio.reduce((acc, curr) => acc + curr.stats.licenses, 0).toString(), delta: '+0 this week', icon: Activity, glow: false },
            { label: 'Total Revenue', value: `${myPortfolio.reduce((acc, curr) => acc + curr.stats.revenue, 0).toLocaleString()} USDC`, delta: '+0 USDC', icon: DollarSign, glow: true },
            { label: 'Total Views', value: myPortfolio.reduce((acc, curr) => acc + curr.stats.views, 0).toLocaleString(), delta: '+0 this week', icon: Eye, glow: false },
          ].map(({ label, value, delta, icon: Icon, glow }) => (
            <div
              key={label}
              className={cn(
                'glass rounded-xl p-4 border border-border/60 space-y-2',
                glow && 'border-primary/20 glow-primary'
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
                <Icon className={cn('w-3.5 h-3.5', glow ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <p className={cn('font-serif font-bold text-xl sm:text-2xl', glow ? 'text-primary text-glow' : 'text-foreground')}>
                {value}
              </p>
              <p className="font-mono text-[10px] text-primary flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> {delta}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* IP Portfolio */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-foreground">Registered Assets</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{myPortfolio.length} assets</span>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-20 text-muted-foreground glass rounded-xl border border-border/60">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {myPortfolio.map((asset) => (
                  <IPCard key={asset.id} asset={asset} />
                ))}

                {/* Add new card */}
                <button
                  onClick={handleRegisterClick}
                  className="glass rounded-xl border-2 border-dashed border-border/40 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-3 aspect-square text-muted-foreground hover:text-primary p-6 group"
                >
                  <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:glow-primary transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest">Register IP</span>
                </button>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-foreground">Recent Activity</h2>
              <button className="font-mono text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="glass rounded-xl border border-border/60 divide-y divide-border/40">
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="p-3.5 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-muted-foreground">{item.action}</p>
                      <p className="font-serif font-semibold text-xs text-foreground truncate mt-0.5">{item.asset}</p>
                      <p className="font-mono text-[9px] text-muted-foreground/70">{item.by}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.amount && (
                        <p className="font-mono text-[10px] text-primary font-bold">{item.amount}</p>
                      )}
                      <p className="font-mono text-[9px] text-muted-foreground/60 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Royalty breakdown mini-chart */}
            <div className="glass rounded-xl border border-border/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-semibold text-sm text-foreground">Royalty Sources</h3>
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              {myPortfolio.map((asset) => (
                <div key={asset.id} className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground truncate max-w-[140px]">{asset.title}</span>
                    <span className="text-primary">{asset.stats.revenue} {asset.currency}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((asset.stats.revenue / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center glass rounded-xl border border-border/60">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Layers className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-serif font-bold text-lg text-foreground">Connect your wallet</p>
              <p className="font-mono text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Please connect your wallet to view your IP portfolio, manage your assets, and track your revenue.
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground font-semibold text-xs mt-2"
              onClick={() => openAuthModal()}
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </div>

      <RegisterIPWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen} 
        onRegisterSuccess={(newAsset) => setMyPortfolio([newAsset, ...myPortfolio])} 
      />
    </>
  )
}
