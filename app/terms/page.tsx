'use client'
import { motion } from 'framer-motion'
import { ShieldCheck, Scale, AlertTriangle, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BackButton from '@/components/ui/BackButton'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative pb-20">
      <div
        className="gradient-orb w-[600px] h-[600px] top-[-300px] left-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)' }}
      />
      
      <Navbar feed="global" onFeedChange={() => {}} onCreatePost={() => {}} />

      <main className="pt-[100px] px-4">
        <div className="max-w-[720px] mx-auto">
          <BackButton className="mb-8" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Scale size={24} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-display font-800 text-white tracking-tight">Terms & Conditions</h1>
            </div>

            <div className="space-y-10 text-white/70 leading-relaxed">
              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-indigo-400">01.</span> User-Generated Content
                </div>
                <p className="pl-8">
                  All content on this platform is submitted by users. We do not verify or guarantee the accuracy of any information. 
                  Unsaid is a platform for sharing experiences, not an official source of truth.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-indigo-400">02.</span> User Responsibility
                </div>
                <p className="pl-8 mb-4">You are solely responsible for any content you post. By using Unsaid, you agree not to:</p>
                <ul className="pl-12 space-y-2 list-disc marker:text-indigo-400">
                  <li>Share false or intentionally misleading information.</li>
                  <li>Post abusive, harmful, or hateful content.</li>
                  <li>Defame any individual, company, or institution.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-indigo-400">03.</span> Content Moderation
                </div>
                <p className="pl-8">
                  We reserve the right to remove any content at any time for any reason. 
                  We may also suspend or restrict access for users who repeatedly violate our community guidelines.
                </p>
              </section>

              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-amber-500 font-700 text-sm uppercase tracking-widest mb-1">Disclaimer</h4>
                  <p className="text-white/60 text-sm">
                    Information related to placements, salaries, or student experiences may not be accurate. 
                    Users must verify all information independently before making life decisions.
                  </p>
                </div>
              </div>

              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-indigo-400">04.</span> Limitation of Liability
                </div>
                <p className="pl-8">
                  Unsaid is not responsible for any decisions made based on platform content, 
                  nor any damages arising from the use or inability to use the platform.
                </p>
              </section>

              <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] uppercase font-700 tracking-widest text-white/20">
                  Last Updated: March 2026
                </div>
                <FileText size={16} className="text-white/10" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
