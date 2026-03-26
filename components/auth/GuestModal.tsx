'use client'
// components/auth/GuestModal.tsx
import { motion } from 'framer-motion'
import { SignInButton } from '@clerk/nextjs'
import { Sparkles, Lock, Eye, MessageSquare, ArrowUp } from 'lucide-react'

interface GuestModalProps {
  onClose: () => void
}

export default function GuestModal({ onClose }: GuestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm glass rounded-3xl p-7 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-5">
            <Lock size={22} className="text-accent" />
          </div>

          <h2 className="font-display font-700 text-xl text-white text-center mb-1.5">
            Your 5 minutes are up
          </h2>
          <p className="text-sm text-white/40 text-center mb-7 leading-relaxed">
            Sign in to keep reading, vote on posts, and share your own anonymous placement experience.
          </p>

          {/* Features */}
          <div className="space-y-2.5 mb-7">
            {[
              { icon: Eye, text: 'Unlimited access to all posts' },
              { icon: ArrowUp, text: 'Vote on posts you find helpful' },
              { icon: MessageSquare, text: 'Comment and ask questions' },
              { icon: Sparkles, text: 'Share anonymously — always' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="text-accent/70" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>

          <SignInButton mode="modal">
            <button className="btn-primary w-full py-3 text-sm mb-3">
              Sign in with OTP
            </button>
          </SignInButton>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Continue browsing for 2 more minutes
          </button>
        </div>
      </motion.div>
    </div>
  )
}
