'use client'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Eye, CheckCircle2, ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BackButton from '@/components/ui/BackButton'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative pb-20">
      <div
        className="gradient-orb w-[600px] h-[600px] top-[-300px] right-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }}
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
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <Lock size={24} className="text-purple-400" />
              </div>
              <h1 className="text-3xl font-display font-800 text-white tracking-tight">Privacy Policy</h1>
            </div>

            <div className="space-y-10 text-white/70 leading-relaxed">
              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-purple-400">01.</span> Anonymous by Design
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3 mb-4">
                  <ShieldCheck className="text-emerald-400 mt-1 shrink-0" size={18} />
                  <p className="text-sm">
                    Your real identity (Name, Email, Clerk ID) is <strong className="text-white">never</strong> displayed publicly. 
                    All users are assigned a random anonymous name (e.g., `Anon Panther`) for every session.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-purple-400">02.</span> Data Collection
                </div>
                <p className="pl-8 mb-4">We collect minimal data required to provide a functional and safe experience:</p>
                <ul className="pl-12 space-y-3 list-disc marker:text-purple-400">
                  <li><strong>Authentication:</strong> Secure sign-in data via Clerk (never shared).</li>
                  <li><strong>Activity:</strong> Posts, comments, likes, and reports you submit.</li>
                  <li><strong>Metadata:</strong> Usage patterns to improve platform speed and safety.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-purple-400">03.</span> Data Usage & Protection
                </div>
                <p className="pl-8">
                  Your data is used to improve the platform experience and provide relevant content. 
                  We <strong className="text-white">do not sell</strong> or share your personal data with third parties.
                  We take reasonable security steps to protect your data from unauthorized access.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 text-white font-700 mb-3 text-lg">
                  <span className="text-purple-400">04.</span> Your Rights
                </div>
                <p className="pl-8">
                  By using Unsaid, you agree to this policy. You have the right to request deletion of your account and 
                  associated activity at any time by contacting our support team.
                </p>
              </section>

              <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] uppercase font-700 tracking-widest text-white/20">
                  Last Updated: March 2026
                </div>
                <ShieldCheck size={16} className="text-white/10" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
