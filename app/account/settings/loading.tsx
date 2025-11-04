export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-56 bg-slate-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-80 bg-slate-700/30 rounded animate-pulse"></div>
        </div>

        {/* Profile Section Skeleton */}
        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 mb-6">
          <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse mb-6"></div>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 w-64 bg-slate-700/50 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-slate-700/30 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Additional Settings Sections */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
              <div className="h-8 w-40 bg-slate-700/50 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 w-full bg-slate-700/30 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-slate-700/30 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
