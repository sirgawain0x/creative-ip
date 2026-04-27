'use client'

import { useState, useEffect, useMemo } from 'react'
import { IPCard } from './ip-card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search, SlidersHorizontal, Music, BookOpen, ImageIcon, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IPAsset, IPAssetType, LicenseType } from '@/lib/data'
import { graphQLClient, GET_RECENT_IP_ASSETS, mapSubgraphAssetToIPAsset } from '@/lib/graphql'

const TYPE_FILTERS: { id: IPAssetType | 'all'; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'literature', label: 'Literature', icon: BookOpen },
  { id: 'image', label: 'Visual Art', icon: ImageIcon },
]

const LICENSE_FILTERS: LicenseType[] = ['Commercial', 'Remix', 'Personal', 'Exclusive']

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
  { id: 'popular', label: 'Most Popular' },
]

export function Exchange() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<IPAssetType | 'all'>('all')
  const [licenseFilter, setLicenseFilter] = useState<LicenseType | null>(null)
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  const [assetsList, setAssetsList] = useState<IPAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAssets() {
      try {
        const data: any = await graphQLClient.request(GET_RECENT_IP_ASSETS, {
          first: 100,
          skip: 0
        })
        if (data.ipregistereds) {
          const assets = await Promise.all(
            data.ipregistereds.map((item: any) => mapSubgraphAssetToIPAsset(item))
          )
          setAssetsList(assets)
        }
      } catch (err) {
        console.error('Failed to fetch from Goldsky:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [])

  const filtered = useMemo(() => {
    let assets = [...assetsList]

    if (search) {
      const q = search.toLowerCase()
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.creator.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (typeFilter !== 'all') {
      assets = assets.filter((a) => a.type === typeFilter)
    }

    if (licenseFilter) {
      assets = assets.filter((a) => a.licenses.includes(licenseFilter))
    }

    if (sort === 'price-asc') assets.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') assets.sort((a, b) => b.price - a.price)
    if (sort === 'popular') assets.sort((a, b) => b.stats.views - a.stats.views)

    return assets
  }, [search, typeFilter, licenseFilter, sort])

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setLicenseFilter(null)
    setSort('newest')
  }

  const hasFilters = search || typeFilter !== 'all' || licenseFilter

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-glow" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            IP Exchange
          </span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground text-balance">
          The Creative Exchange
        </h1>
        <p className="font-mono text-xs text-muted-foreground max-w-lg">
          License world-class creative IP instantly. Backed by Story Protocol. Wallets powered by Alchemy.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, creator, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border/60 font-mono text-sm focus:border-primary/60"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'border-border/60 transition-all',
              showFilters && 'border-primary/50 bg-primary/10 text-primary'
            )}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="glass rounded-xl border border-border/60 p-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Type */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_FILTERS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTypeFilter(id as IPAssetType | 'all')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-all',
                        typeFilter === id
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* License */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">License</p>
                <div className="flex flex-wrap gap-1.5">
                  {LICENSE_FILTERS.map((lic) => (
                    <button
                      key={lic}
                      onClick={() => setLicenseFilter(licenseFilter === lic ? null : lic)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-all',
                        licenseFilter === lic
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {lic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Sort By</p>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setSort(id)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-all',
                        sort === id
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips + count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {typeFilter !== 'all' && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                {typeFilter} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setTypeFilter('all')} />
              </span>
            )}
            {licenseFilter && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                {licenseFilter} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setLicenseFilter(null)} />
              </span>
            )}
            {hasFilters && (
              <button className="font-mono text-[10px] text-muted-foreground hover:text-foreground" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {filtered.length} asset{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <IPCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-serif font-bold text-lg text-foreground">
              {assetsList.length === 0 ? 'No on-chain assets found' : 'No assets found matching filters'}
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
          <Button variant="outline" className="font-mono text-xs border-border/60" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
