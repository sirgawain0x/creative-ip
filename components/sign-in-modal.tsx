'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Chrome,
  Twitter,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Wallet,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const [step, setStep] = useState<'method' | 'email' | 'loading' | 'done'>('method')
  const [email, setEmail] = useState('')

  const handleEmailContinue = () => {
    if (!email) return
    setStep('loading')
    setTimeout(() => setStep('done'), 2000)
  }

  const handleSocialLogin = (provider: string) => {
    setStep('loading')
    setTimeout(() => setStep('done'), 1500)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setStep('method'), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border/60 p-0 max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-primary/5 to-transparent p-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.svg" 
                alt="Creative IP" 
                fill 
                className="object-contain"
              />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-bold text-foreground">
                Welcome to Creative IP
              </DialogTitle>
              <DialogDescription className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
                Create on Your Terms
              </DialogDescription>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 font-semibold text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" /> Secure
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Simple
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-primary" /> Fast
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {step === 'method' && (
            <>
              {/* Social logins */}
              <div className="space-y-2">
                <SocialButton
                  icon={<Chrome className="w-4 h-4" />}
                  label="Continue with Google"
                  onClick={() => handleSocialLogin('google')}
                />
                <SocialButton
                  icon={<Twitter className="w-4 h-4" />}
                  label="Continue with X / Twitter"
                  onClick={() => handleSocialLogin('twitter')}
                />
                <SocialButton
                  icon={<Mail className="w-4 h-4" />}
                  label="Continue with Email"
                  onClick={() => setStep('email')}
                />
              </div>

              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-border/60" />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">or</span>
                <Separator className="flex-1 bg-border/60" />
              </div>

              {/* Wallet connect */}
              <Button
                variant="outline"
                className="w-full border-border/60 hover:border-primary/50 font-mono text-xs gap-2 neo-btn"
                onClick={() => handleSocialLogin('wallet')}
              >
                <Wallet className="w-4 h-4 text-primary" />
                Connect Wallet
                <span className="ml-auto text-muted-foreground text-[10px]">MetaMask, WalletConnect…</span>
              </Button>

              <p className="font-semibold text-[10px] text-muted-foreground text-center leading-relaxed">
                By continuing you agree to Creative IP's{' '}
                <span className="text-primary underline-offset-2 underline cursor-pointer">Terms</span> and{' '}
                <span className="text-primary underline-offset-2 underline cursor-pointer">Privacy Policy</span>
              </p>
            </>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="creator@studio.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border/60 font-mono text-sm focus:border-primary/60"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                  autoFocus
                />
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-semibold text-xs glow-primary gap-2"
                onClick={handleEmailContinue}
                disabled={!email}
              >
                Send Magic Link <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                className="w-full font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setStep('method')}
              >
                ← Back to options
              </button>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10" />
                <Loader2 className="w-6 h-6 text-primary absolute inset-0 m-auto animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-serif font-semibold text-foreground">Creating Your Profile…</p>
                <p className="font-semibold text-[10px] text-muted-foreground mt-1">Setting up your creative space</p>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative w-12 h-12">
                <Image 
                  src="/logo.svg" 
                  alt="Creative IP" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-lg text-foreground">Welcome, Creator.</p>
                <p className="font-semibold text-[10px] text-muted-foreground mt-1">
                  Your Creative IP wallet is ready. Let's create.
                </p>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-semibold text-xs glow-primary"
                onClick={handleClose}
              >
                Start Creating →
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
        'bg-secondary/50 hover:bg-secondary border border-border/60 hover:border-primary/30',
        'font-mono text-xs text-foreground transition-all group neo-btn'
      )}
    >
      <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
      {label}
      <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  )
}
