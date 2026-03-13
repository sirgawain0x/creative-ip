'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { type IPAsset } from '@/lib/data'
import { BuyLicenseModal } from './buy-license-modal'
import { Button } from './ui/button'
import { useWallet, useAuth } from '@crossmint/client-sdk-react-ui'
import { cn } from '@/lib/utils'
import {
  Music,
  BookOpen,
  ImageIcon,
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ShoppingCart,
  ExternalLink,
  Eye,
  Tag,
  Percent,
  Clock,
  FileText,
  Maximize2,
  Hash,
  Video,
} from 'lucide-react'

const LICENSE_COLORS: Record<string, string> = {
  Commercial: 'bg-primary/10 text-primary border-primary/20',
  Remix: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Personal: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Exclusive: 'bg-red-400/10 text-red-400 border-red-400/20',
}

interface IPDetailProps {
  asset: IPAsset
}

export function IPDetail({ asset }: IPDetailProps) {
  const [buyOpen, setBuyOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageZoom, setImageZoom] = useState(false)
  const { status, wallet } = useWallet()
  const { login } = useAuth()

  const progressRef = useRef<HTMLDivElement>(null)

  const simulateProgress = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    setPlaying(true)
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setPlaying(false); return 0 }
        return p + 0.5
      })
    }, 100)
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Exchange
        </Link>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Media + metadata */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cover / Media */}
            <div className="relative rounded-2xl overflow-hidden bg-muted border border-border/60 aspect-square">
              <Image
                src={asset.coverImage}
                alt={asset.title}
                fill
                className={cn(
                  'object-cover transition-transform duration-700',
                  imageZoom ? 'scale-110' : 'scale-100'
                )}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Image expand */}
              {asset.type === 'image' && (
                <button
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg glass border border-border/60 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  onClick={() => setImageZoom(!imageZoom)}
                  aria-label="Zoom image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Type badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 glass rounded-full px-3 py-1 border border-border/60 font-mono text-[10px] text-foreground uppercase tracking-widest">
                {asset.type === 'music' && <Music className="w-3 h-3 text-primary" />}
                {asset.type === 'literature' && <BookOpen className="w-3 h-3 text-amber-400" />}
                {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                {asset.type === 'video' && <Video className="w-3 h-3 text-purple-400" />}
                {asset.type}
              </div>

              {/* Music player overlay */}
              {asset.type === 'music' && (
                <div className="absolute bottom-0 left-0 right-0 glass border-t border-border/60 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <button className="text-muted-foreground hover:text-foreground" aria-label="Skip back">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors glow-primary flex-shrink-0"
                      onClick={simulateProgress}
                      aria-label={playing ? 'Pause' : 'Play'}
                    >
                      {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button className="text-muted-foreground hover:text-foreground" aria-label="Skip forward">
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <div className="flex-1 mx-2">
                      <div
                        ref={progressRef}
                        className="h-1 bg-muted rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setProgress(((e.clientX - rect.left) / rect.width) * 100)
                        }}
                      >
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-muted-foreground flex-shrink-0">
                      {asset.duration}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                    {asset.bpm && <span><span className="text-primary">{asset.bpm}</span> BPM</span>}
                    {asset.key && <span>Key: <span className="text-primary">{asset.key}</span></span>}
                    {asset.genre && <span>{asset.genre}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Literature excerpt */}
            {asset.type === 'literature' && asset.excerpt && (
              <div className="glass rounded-xl border border-border/60 p-6">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" /> Excerpt
                </p>
                <blockquote className="font-serif text-base text-foreground/90 leading-relaxed italic border-l-2 border-primary/40 pl-4">
                  &ldquo;{asset.excerpt}&rdquo;
                </blockquote>
                {asset.wordCount && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-4">
                    {asset.wordCount.toLocaleString()} words · {asset.genre_lit}
                  </p>
                )}
              </div>
            )}

            {/* Image metadata */}
            {asset.type === 'image' && (
              <div className="glass rounded-xl border border-border/60 p-4 grid grid-cols-2 gap-3">
                {asset.resolution && (
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">Resolution</p>
                    <p className="font-mono text-xs text-foreground">{asset.resolution}</p>
                  </div>
                )}
                {asset.medium && (
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">Medium</p>
                    <p className="font-mono text-xs text-foreground">{asset.medium}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-muted-foreground bg-muted border border-border/60 rounded-full px-3 py-1 flex items-center gap-1"
                >
                  <Hash className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Info + Purchase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & creator */}
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground text-balance leading-tight">
                {asset.title}
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-1">{asset.creatorHandle}</p>

              {/* Story Protocol ID */}
              <div className="flex items-center gap-2 mt-3 font-mono text-[10px] text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2 border border-border/40">
                <Hash className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="truncate">{asset.storyProtocolId}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Eye, label: 'Views', value: asset.stats.views.toLocaleString() },
                { icon: Tag, label: 'Licenses', value: asset.stats.licenses.toString() },
                { icon: Percent, label: 'Royalty', value: `${asset.royaltyRate}%` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass rounded-lg border border-border/60 p-3 text-center">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                  <p className="font-mono text-xs font-bold text-foreground">{value}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="glass rounded-xl border border-border/60 p-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">About</p>
              <p className="font-sans text-sm text-foreground/80 leading-relaxed">{asset.description}</p>
            </div>

            {/* License options */}
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                Available Licenses
              </p>
              <div className="space-y-2">
                {asset.licenses.map((lic) => (
                  <div
                    key={lic}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-lg border',
                      LICENSE_COLORS[lic]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs font-bold uppercase tracking-widest">{lic}</span>
                    </div>
                    <span className="font-mono text-xs font-bold">
                      {asset.price} {asset.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registered date */}
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              Registered {new Date(asset.registered).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            {/* Buy CTA */}
            <div className="space-y-2 pt-2">
              <Button
                className={cn(
                  "w-full font-mono text-sm gap-2 h-12",
                  status === 'loaded' && wallet
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-secondary text-foreground border border-border/60 hover:bg-secondary/80"
                )}
                onClick={() => {
                  if (status === 'loaded' && wallet) {
                    setBuyOpen(true)
                  } else {
                    if (login) login()
                  }
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                {status === 'loaded' && wallet ? `Buy License — ${asset.price} ${asset.currency}` : 'Connect Wallet to Buy'}
              </Button>
              <p className="font-mono text-[10px] text-muted-foreground text-center">
                Secured by Crossmint StoryKit · No gas fees · Card or Crypto
              </p>
            </div>
          </div>
        </div>
      </div>

      <BuyLicenseModal asset={asset} open={buyOpen} onOpenChange={setBuyOpen} />
    </>
  )
}
