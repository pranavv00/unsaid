'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  className?: string
  label?: string
}

export default function BackButton({ className, label = 'Back' }: BackButtonProps) {
  const router = useRouter()

  return (
    <motion.button
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => router.back()}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-700 text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/[0.08] group",
        className
      )}
    >
      <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </motion.button>
  )
}
