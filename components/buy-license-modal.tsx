'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { type IPAsset } from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Wallet,
  Shield,
  CheckCircle2,
  Loader2,
  Zap,
  ExternalLink,
} from 'lucide-react'

const LICENSE_COLORS: Record<string, string> = {
  Commercial: 'bg-primary/10 text-primary border-primary/20',
  Remix: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Personal: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Exclusive: 'bg-red-400/10 text-red-400 border-red-400/20',
}

interface BuyLicenseModalProps {
  asset: IPAsset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BuyLicenseModal({ asset, open, onOpenChange }: BuyLicenseModalProps) {
  const [selectedLicense, setSelectedLicense] = useState(asset.licenses[0])
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card')
  const [step, setStep] = useState<'configure' | 'processing' | 'success'>('configure')

  const handlePurchase = () => {
    setStep('processing')
    setTimeout(() => setStep('success'), 2200)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setStep('configure'), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border/60 p-0 max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent p-5 border-b border-border/60">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img src={asset.coverImage} alt={asset.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-serif font-bold text-sm text-foreground leading-snug">
                {asset.title}
              </DialogTitle>
              <DialogDescription className="font-mono text-[10px] text-muted-foreground mt-0.5">{asset.creatorHandle}</DialogDescription>
              <p className="font-mono text-[9px] text-muted-foreground/60 mt-1 truncate">{asset.storyProtocolId}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {step === 'configure' && (
            <>
              {/* License selection */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                  Select License Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {asset.licenses.map((lic) => (
                    <button
                      key={lic}
                      onClick={() => setSelectedLicense(lic)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg border font-mono text-xs transition-all text-left',
                        selectedLicense === lic
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/60 bg-secondary/30 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      <span className={cn(
                        'block text-[10px] font-bold uppercase tracking-widest mb-0.5',
                        LICENSE_COLORS[lic]?.split(' ')[1]
                      )}>
                        {lic}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {lic === 'Commercial' ? 'Full commercial use' :
                          lic === 'Remix' ? 'Derivative works' :
                          lic === 'Personal' ? 'Non-commercial' : 'Sole rights'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      'flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border font-mono text-xs transition-all',
                      paymentMethod === 'card'
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/60 bg-secondary/30 text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Credit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={cn(
                      'flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border font-mono text-xs transition-all',
                      paymentMethod === 'crypto'
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/60 bg-secondary/30 text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Crypto
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2 border border-border/40">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">{selectedLicense} License</span>
                  <span className="text-foreground">{asset.price} {asset.currency}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Protocol fee</span>
                  <span className="text-foreground">0.00 {asset.currency}</span>
                </div>
                <Separator className="bg-border/60" />
                <div className="flex justify-between font-mono text-sm font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{asset.price} {asset.currency}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-3 h-3 text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  Secured by <span className="text-primary">Story Protocol</span> — on-chain licensing
                </span>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground font-mono text-xs glow-primary gap-2"
                onClick={handlePurchase}
              >
                <Zap className="w-3.5 h-3.5" />
                Complete Purchase
              </Button>
            </>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-foreground">Processing on Story Protocol…</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  Registering your license on-chain
                </p>
              </div>
              <div className="w-full space-y-2">
                {['Verifying identity', 'Processing payment', 'Minting license token'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <Loader2 className="w-3 h-3 text-primary animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-lg text-foreground">License Acquired</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  {selectedLicense} license for "{asset.title}" is now in your portfolio.
                </p>
              </div>
              <div className="w-full bg-secondary/30 rounded-lg p-3 border border-border/40">
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">License Token</p>
                <p className="font-mono text-[10px] text-primary">LIC-0x{Math.random().toString(16).slice(2, 10).toUpperCase()}…</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 font-mono text-[10px] border-border/60 gap-1"
                  onClick={handleClose}
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Explorer
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground font-mono text-[10px]"
                  onClick={handleClose}
                >
                  Back to Exchange
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
