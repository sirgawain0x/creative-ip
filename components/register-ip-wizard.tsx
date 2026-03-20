'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { IPAsset } from '@/lib/data'
import {
  Music,
  BookOpen,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle2,
  Loader2,
  Zap,
} from 'lucide-react'

const ASSET_TYPES = [
  { id: 'music', label: 'Music', icon: Music, desc: 'Tracks, albums, compositions' },
  { id: 'literature', label: 'Literature', icon: BookOpen, desc: 'Books, scripts, articles' },
  { id: 'image', label: 'Visual Art', icon: ImageIcon, desc: 'Illustrations, photos, designs' },
]

const LICENSE_OPTIONS = ['Commercial', 'Remix', 'Personal', 'Exclusive']

interface RegisterIPWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegisterSuccess?: (asset: IPAsset) => void
}

export function RegisterIPWizard({ open, onOpenChange, onRegisterSuccess }: RegisterIPWizardProps) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [royalty, setRoyalty] = useState('10')
  const [licenses, setLicenses] = useState<string[]>([])
  const [registering, setRegistering] = useState(false)
  const [done, setDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [createdId, setCreatedId] = useState('')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const TOTAL_STEPS = 3

  const toggleLicense = (lic: string) => {
    setLicenses((prev) =>
      prev.includes(lic) ? prev.filter((l) => l !== lic) : [...prev, lic]
    )
  }

  const handleRegister = () => {
    setRegistering(true)
    setTimeout(() => {
      setRegistering(false)
      setDone(true)
      
      const newMockId = `IP-0x${Math.random().toString(16).slice(2, 10).toUpperCase()}…`
      setCreatedId(newMockId)
      
      if (onRegisterSuccess) {
        onRegisterSuccess({
          id: `new-${Date.now()}`,
          storyProtocolId: newMockId,
          title: title || 'Untitled',
          creator: 'You',
          creatorHandle: '@creator',
          type: (type as any) || 'music',
          coverImage: type === 'image' ? '/images/art-1.jpg' : type === 'music' ? '/images/music-1.jpg' : '/images/lit-1.jpg',
          description: description || '',
          licenses: licenses as any,
          price: 0,
          currency: 'USDC',
          royaltyRate: Number(royalty) || 10,
          registered: new Date().toISOString().split('T')[0],
          tags: ['New', 'Registered'],
          stats: { views: 0, licenses: 0, revenue: 0 }
        })
      }
    }, 2500)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep(1); setType(null); setTitle(''); setDescription('')
      setRoyalty('10'); setLicenses([]); setDone(false); setFile(null); setCreatedId('');
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border/60 p-0 max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent p-5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif font-bold text-base text-foreground">
                Register New IP Asset
              </DialogTitle>
              <DialogDescription className="font-mono text-[10px] text-muted-foreground mt-0.5">
                Powered by Story Protocol
              </DialogDescription>
            </div>
            {!done && (
              <div className="flex items-center gap-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i + 1 < step ? 'w-6 bg-primary' :
                      i + 1 === step ? 'w-8 bg-primary' :
                      'w-4 bg-border'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* Step 1: Asset Type */}
          {step === 1 && !done && (
            <div className="space-y-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Step 1 of {TOTAL_STEPS} — Choose Asset Type
              </p>
              <div className="grid grid-cols-3 gap-3">
                {ASSET_TYPES.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setType(id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
                      type === id
                        ? 'border-primary/60 bg-primary/10 text-primary'
                        : 'border-border/60 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground neo-btn'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', type === id ? 'text-primary' : '')} />
                    <span className="font-mono text-xs font-bold">{label}</span>
                    <span className="font-mono text-[9px] opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-mono text-xs gap-2"
                disabled={!type}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && !done && (
            <div className="space-y-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Step 2 of {TOTAL_STEPS} — Asset Details
              </p>

              <div className="space-y-3">
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground block mb-1.5">Title *</label>
                  <Input
                    placeholder="e.g. Neon Genesis Overture"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-input border-border/60 font-mono text-sm focus:border-primary/60"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground block mb-1.5">Description</label>
                  <textarea
                    placeholder="Describe your work…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-input border border-border/60 rounded-md px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 resize-none"
                  />
                </div>

                {/* File upload */}
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-colors group",
                    isDragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="audio/*,image/*,.pdf,.epub"
                  />
                  {!file ? (
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className={cn(
                        "w-6 h-6 mx-auto mb-2 transition-colors",
                         isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )} />
                      <p className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        Drop your file here or <span className="text-primary underline">browse</span>
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground/60 mt-1">
                        MP3, WAV, PDF, EPUB, PNG, JPG — max 500MB
                      </p>
                    </label>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <CheckCircle2 className="w-6 h-6 text-primary" />
                       <p className="font-mono text-xs text-foreground bg-secondary/30 px-3 py-1.5 rounded truncate max-w-[200px]">
                         {file.name}
                       </p>
                       <button 
                         onClick={() => setFile(null)}
                         className="font-mono text-[10px] text-destructive hover:underline"
                       >
                         Remove
                       </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border/60 font-mono text-xs gap-2"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground font-mono text-xs gap-2"
                  disabled={!title}
                  onClick={() => setStep(3)}
                >
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Licensing & Royalties */}
          {step === 3 && !done && !registering && (
            <div className="space-y-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Step 3 of {TOTAL_STEPS} — License & Royalty Terms
              </p>

              <div>
                <label className="font-mono text-[10px] text-muted-foreground block mb-2">License Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {LICENSE_OPTIONS.map((lic) => (
                    <button
                      key={lic}
                      onClick={() => toggleLicense(lic)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg border font-mono text-xs transition-all text-left',
                        licenses.includes(lic)
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/60 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {lic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-muted-foreground block mb-1.5">
                  Royalty Rate — <span className="text-primary">{royalty}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={royalty}
                  onChange={(e) => setRoyalty(e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-1">
                  <span>0%</span><span>25%</span><span>50%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border/60 font-mono text-xs gap-2"
                  onClick={() => setStep(2)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground font-mono text-xs gap-2 glow-primary"
                  disabled={licenses.length === 0}
                  onClick={handleRegister}
                >
                  <Zap className="w-3.5 h-3.5" /> Register on Chain
                </Button>
              </div>
            </div>
          )}

          {/* Registering */}
          {registering && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-serif font-bold text-foreground">Registering on Story Protocol…</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">This takes just a moment</p>
              </div>
            </div>
          )}

          {/* Done */}
          {done && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-lg text-foreground">IP Registered</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  "{title}" is now protected on Story Protocol
                </p>
              </div>
              <div className="w-full bg-secondary/30 rounded-lg p-3 border border-border/40">
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Story Protocol ID</p>
                <p className="font-mono text-[10px] text-primary">{createdId}</p>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-mono text-xs"
                onClick={handleClose}
              >
                Go to Launchpad
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
