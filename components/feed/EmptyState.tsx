// components/feed/EmptyState.tsx
import { motion } from 'framer-motion'
import { MessageSquareDashed } from 'lucide-react'

interface EmptyStateProps {
  onCreatePost?: () => void
}

export default function EmptyState({ onCreatePost }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          <MessageSquareDashed size={32} className="text-white/20" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <span className="text-[10px] text-accent font-bold">?</span>
        </div>
      </div>

      <h3 className="font-display font-700 text-lg text-white/60 mb-2">
        Nothing here yet
      </h3>
      <p className="text-sm text-white/30 max-w-xs leading-relaxed mb-6">
        Be the first to share your placement experience. Your anonymous story might help hundreds of students.
      </p>

      {onCreatePost && (
        <button
          onClick={onCreatePost}
          className="btn-primary px-5 py-2.5 text-sm"
        >
          Share your experience
        </button>
      )}
    </motion.div>
  )
}
