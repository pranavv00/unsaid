// components/layout/Footer.tsx
import Link from 'next/link'
import { Shield, Lock, Scale } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-xl py-12 px-4 mt-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Shield size={12} className="text-indigo-400" />
              </div>
              <span className="font-display font-800 text-white tracking-tighter text-lg uppercase">Unsaid</span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed max-w-[280px]">
              The strictly anonymous platform for real campus experiences. 
              Share your truth, protect your identity.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-700 uppercase tracking-[0.2em] text-white/20 mb-5">Legal & Safety</h4>
            <div className="space-y-3">
              <Link href="/terms" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs">
                <Scale size={12} /> Terms & Conditions
              </Link>
              <Link href="/privacy" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs">
                <Lock size={12} /> Privacy Policy
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-700 uppercase tracking-[0.2em] text-white/20 mb-5">Disclaimer</h4>
            <p className="text-[10px] text-white/20 leading-relaxed font-medium">
              All content on this platform is user-generated and may not reflect verified or accurate information. 
              Unsaid does not guarantee the authenticity of any content. 
              Users must independently verify all information.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-white/10 font-700 uppercase tracking-widest">
              © 2026 Unsaid Social. All rights reserved.
            </div>
            <div className="text-[10px] font-700 text-white/20">
              developed by <span className="text-indigo-400/50 hover:text-indigo-400 transition-colors cursor-default">Pranavvv😎</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-800 text-emerald-400/60 uppercase tracking-tighter">
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
