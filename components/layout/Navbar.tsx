'use client'
// components/layout/Navbar.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserButton, useUser, SignInButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { PenLine, Sparkles, User as UserIcon } from 'lucide-react'
import FeedSelector from './FeedSelector'
import { cn } from '@/lib/utils'

interface NavbarProps {
  feed: string
  onFeedChange: (v: string) => void
  onCreatePost: () => void
}

export default function Navbar({ feed, onFeedChange, onCreatePost }: NavbarProps) {
  const { isSignedIn, user } = useUser()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'glass border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-5xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-all">
            <Sparkles size={13} className="text-accent" />
          </div>
          <span className="font-display font-700 text-base tracking-tight text-white">
            Unsaid
          </span>
        </Link>

        {/* Center: Feed Selector */}
        <div className="flex-1 flex justify-center">
          <FeedSelector value={feed} onChange={onFeedChange} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSignedIn ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onCreatePost}
                className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-sm"
              >
                <PenLine size={13} />
                <span className="hidden sm:inline">Share</span>
              </motion.button>

              <Link href={`/profile/${user?.id}`} className="group relative">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 overflow-hidden group-hover:border-accent/50 transition-all shadow-lg flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white/20"><UserIcon size={14} /></div>
                  )}
                </div>
              </Link>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary px-4 py-2 text-sm">Sign in</button>
            </SignInButton>
          )}
        </div>
      </div>
    </motion.header>
  )
}
