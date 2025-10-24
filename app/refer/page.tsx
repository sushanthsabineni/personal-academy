'use client'

import { useRouter } from 'next/navigation'
import { Zap, Gift, Users, Trophy, Award, Send, UserPlus, Coins } from '@/lib/icons'

export default function PublicReferPage() {
  const router = useRouter()

  const milestones = [
    { count: 1, reward: '500 credits + Badge', icon: Gift },
    { count: 5, reward: '5,000 credits + Discord', icon: Users },
    { count: 10, reward: '20,000 credits + Hall of Fame', icon: Trophy },
    { count: 25, reward: 'Affiliate program (15% recurring)', icon: Award },
  ]

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Refer & Earn
          </h1>
          <p className="text-xl text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
            Share Personal Academy with friends. You both get rewarded!
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-8 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            Sign Up to Get Your Referral Link
          </button>
        </div>

        {/* Dual Rewards Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-light-card dark:bg-dark-card p-8 rounded-xl border-2 border-brand-teal">
            <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-3">
              <Zap size={28} className="text-brand-teal" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">
              You Earn
            </h3>
            <p className="text-lg font-semibold text-brand-teal mb-1">
              20% Bonus Credits
            </p>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              When your friend makes any purchase, you get 20% bonus credits instantly.
            </p>
            <div className="mt-4 p-3 bg-brand-teal/10 rounded-lg">
              <p className="text-sm text-brand-teal font-medium">
                Example: Friend buys 5,000 credits → You get 1,000 bonus credits
              </p>
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card p-8 rounded-xl border-2 border-green-500">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
              <Gift size={28} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">
              They Earn
            </h3>
            <p className="text-lg font-semibold text-green-500 mb-1">
              20% Instant Bonus
            </p>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Your friend gets 20% bonus credits on their first purchase using your code.
            </p>
            <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Example: Friend buys 5,000 credits → They get 1,000 bonus too!
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border mb-12">
          <h2 className="text-2xl font-bold mb-8 text-light-text dark:text-dark-text text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Share Your Link',
                desc: 'Send your unique referral link to friends via email, social, or chat',
                Icon: Send,
              },
              {
                step: 2,
                title: 'They Sign Up',
                desc: 'Your friend creates an account using your referral link or code',
                Icon: UserPlus,
              },
              {
                step: 3,
                title: 'You Both Earn',
                desc: 'When they purchase credits, you both get 20% bonus instantly',
                Icon: Coins,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.Icon size={32} className="text-brand-teal" />
                </div>
                <div className="w-10 h-10 bg-brand-teal text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2 text-light-text dark:text-dark-text">
                  {item.title}
                </h3>
                <p className="text-sm text-light-muted dark:text-dark-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border mb-12">
          <h2 className="text-2xl font-bold mb-8 text-light-text dark:text-dark-text text-center">
            Achievement Milestones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.map((milestone) => (
              <div
                key={milestone.count}
                className="p-6 rounded-lg border-2 border-light-border dark:border-dark-border hover:border-brand-teal hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <milestone.icon size={32} className="text-brand-teal flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-light-text dark:text-dark-text">
                      {milestone.count}+ Referrals
                    </h3>
                    <p className="text-sm text-light-muted dark:text-dark-muted">
                      {milestone.reward}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all shadow-lg text-lg"
          >
            Start Referring & Earning Now
          </button>
          <p className="mt-4 text-sm text-light-muted dark:text-dark-muted">
            Already have an account? <button onClick={() => router.push('/login')} className="text-brand-teal hover:underline">Login here</button>
          </p>
        </div>
      </div>
    </div>
  )
}
