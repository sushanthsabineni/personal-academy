export default function CreditsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-56 bg-slate-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-80 bg-slate-700/30 rounded animate-pulse"></div>
        </div>

        {/* Current Balance Card Skeleton */}
        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 mb-8">
          <div className="h-6 w-40 bg-slate-700/50 rounded animate-pulse mb-4"></div>
          <div className="h-12 w-32 bg-slate-700/30 rounded animate-pulse mb-4"></div>
          <div className="h-10 w-48 bg-blue-500/20 rounded animate-pulse"></div>
        </div>

        {/* Transactions Table Skeleton */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="h-8 w-56 bg-slate-700/50 rounded animate-pulse mb-6"></div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-slate-700/30">
                <div className="flex-1">
                  <div className="h-5 w-48 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-slate-700/30 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-slate-700/30 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
