export default function PurchasesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-slate-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-slate-700/30 rounded animate-pulse"></div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse mb-3"></div>
              <div className="h-8 w-24 bg-slate-700/30 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Purchases List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 w-48 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-slate-700/30 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-24 bg-green-500/20 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
