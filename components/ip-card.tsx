'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Music, BookOpen, ImageIcon, ShoppingCart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type IPAsset } from '@/lib/data'
import { Button } from './ui/button'
import { BuyLicenseModal } from './buy-license-modal'
import { useState } from 'react'
import { useWallet, useAuth } from '@crossmint/client-sdk-react-ui'

const TYPE_ICON = {
  music: Music,
  literature: BookOpen,
  image: ImageIcon,
}

const TYPE_COLOR = {
  music: 'text-cyan-400',
  literature: 'text-amber-400',
  image: 'text-emerald-400',
}

const TYPE_BG = {
  music: 'bg-cyan-400/10 border-cyan-400/20',
  literature: 'bg-amber-400/10 border-amber-400/20',
  image: 'bg-emerald-400/10 border-emerald-400/20',
}

const LICENSE_COLORS: Record<string, string> = {
  Commercial: 'bg-primary/10 text-primary border-primary/20',
  Remix: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Personal: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Exclusive: 'bg-red-400/10 text-red-400 border-red-400/20',
}

interface IPCardProps {
  asset: IPAsset
  className?: string
}

export function IPCard({ asset, className }: IPCardProps) {
  const [buyOpen, setBuyOpen] = useState(false)
  const { status, wallet } = useWallet()
  const { login } = useAuth()
  const Icon = TYPE_ICON[asset.type]

  return (
    <>
      <article
        className={cn(
          'group relative glass rounded-xl overflow-hidden border border-border/60',
          'hover:border-primary/30 hover:glow-primary transition-all duration-300',
          className
        )}
      >
        {/* Cover image */}
        <Link href={`/ip/${asset.id}`} className="block relative aspect-square overflow-hidden bg-muted">
          <Image
            src={asset.coverImage}
            alt={asset.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Type badge */}
          <div className={cn('absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 border font-mono text-[10px] uppercase tracking-widest', TYPE_BG[asset.type])}>
            <Icon className={cn('w-3 h-3', TYPE_COLOR[asset.type])} />
            <span className={TYPE_COLOR[asset.type]}>{asset.type}</span>
          </div>

          {/* Story Protocol ID */}
          <div className="absolute bottom-3 left-3 right-3 font-mono text-[9px] text-white/60 truncate">
            {asset.storyProtocolId}
          </div>

          {/* View detail on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="font-mono text-[10px] text-white/80 uppercase tracking-widest flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
              View Details <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Title & creator */}
          <div>
            <Link href={`/ip/${asset.id}`}>
              <h3 className="font-serif font-bold text-sm text-foreground leading-snug hover:text-primary transition-colors line-clamp-1">
                {asset.title}
              </h3>
            </Link>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{asset.creatorHandle}</p>
          </div>

          {/* License tags */}
          <div className="flex flex-wrap gap-1">
            {asset.licenses.map((lic) => (
              <span
                key={lic}
                className={cn('font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border', LICENSE_COLORS[lic])}
              >
                {lic}
              </span>
            ))}
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div>
              <p className="font-mono text-xs font-bold text-foreground">
                {asset.price} <span className="text-primary">{asset.currency}</span>
              </p>
              <p className="font-mono text-[9px] text-muted-foreground">{asset.royaltyRate}% royalty</p>
            </div>
            <Button
              size="sm"
              className={cn(
                "font-mono text-[10px] transition-all gap-1",
                status === 'loaded' && wallet
                  ? "bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30"
                  : "bg-secondary/50 text-foreground border border-border/60 hover:bg-secondary"
              )}
              onClick={() => {
                if (status === 'loaded' && wallet) {
                  setBuyOpen(true)
                } else {
                  if (login) login()
                }
              }}
            >
              <ShoppingCart className="w-3 h-3" />
              {status === 'loaded' && wallet ? 'License' : 'Connect to License'}
            </Button>
          </div>
        </div>
      </article>

      <BuyLicenseModal asset={asset} open={buyOpen} onOpenChange={setBuyOpen} />
    </>
  )
}
