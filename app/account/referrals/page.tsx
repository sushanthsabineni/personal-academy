'use client'

import { useState } from 'react'
import { Copy, Check, Share2, Trophy, Users, Zap, Gift, Award, Send, UserPlus, Coins } from '@/lib/icons'
import { trackReferralShare } from '@/lib/analytics'

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)

  // Mock data
  const referralCode = 'JOHN2024'
  const referralLink = `https://personalacademy.app/signup?ref=${referralCode}`

  const stats = {
    totalReferrals: 12,
    creditsEarned: 6000,
    pending: 3,
  }

  const milestones = [
    { count: 1, reward: '500 credits + Badge', icon: Gift },
    { count: 5, reward: '5,000 credits + Discord', icon: Users },
    { count: 10, reward: '20,000 credits + Hall of Fame', icon: Trophy },
    { count: 25, reward: 'Affiliate program (15% recurring)', icon: Award },
  ]

  const referrals = [
    { name: 'Sarah Khan', credits: 1000, date: '2 days ago', status: 'Completed' },
    { name: 'Arjun Patel', credits: 500, date: '1 week ago', status: 'Completed' },
    { name: 'Maya Singh', credits: 1000, date: '1 week ago', status: 'Pending' },
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    trackReferralShare('copy')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const text = `Check out Personal Academy! Generate complete AI-powered course storyboards in minutes. Use my referral code: ${referralCode}`
    trackReferralShare('social')
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Refer & Earn
          </h1>
          <p className="text-xl text-light-muted dark:text-dark-muted">
            Share Personal Academy with friends. You both get rewarded!
          </p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Referrals', value: stats.totalReferrals, icon: Users },
            { label: 'Credits Earned', value: `${stats.creditsEarned.toLocaleString()}`, icon: Zap },
            { label: 'Pending Purchases', value: stats.pending, icon: Gift },
          ].map((stat) => (
            <div key={stat.label} className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
              <stat.icon size={32} className="text-brand-teal mb-3" />
              <div className="text-3xl font-bold text-light-text dark:text-dark-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-light-muted dark:text-dark-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border mb-12">
          <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">
            Your Referral Link
          </h2>
          
          {/* Link Input */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 h-12 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-6 h-12 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-lg hover:border-brand-teal transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Copy size={16} />
              Copy Code
            </button>
            <button
              onClick={shareOnTwitter}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Share2 size={16} />
              Share on Twitter
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border mb-12">
          <h2 className="text-2xl font-bold mb-8 text-light-text dark:text-dark-text">
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
          <h2 className="text-2xl font-bold mb-8 text-light-text dark:text-dark-text">
            Achievement Milestones 🏆
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

        {/* Recent Referrals */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
            Recent Referrals
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border">
                  <th className="text-left py-3 px-4 font-semibold text-light-text dark:text-dark-text">
                    Friend
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-light-text dark:text-dark-text">
                    Your Bonus
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-light-text dark:text-dark-text">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-light-text dark:text-dark-text">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, idx) => (
                  <tr key={idx} className="border-b border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg">
                    <td className="py-4 px-4 text-light-text dark:text-dark-text">
                      {referral.name}
                    </td>
                    <td className="py-4 px-4 font-semibold text-brand-teal">
                      +{referral.credits} credits
                    </td>
                    <td className="py-4 px-4 text-light-muted dark:text-dark-muted">
                      {referral.date}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'Completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
