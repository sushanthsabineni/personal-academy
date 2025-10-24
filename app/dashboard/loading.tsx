export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Skeleton Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="h-8 w-48 bg-slate-700 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-700 rounded mb-3"></div>
              <div className="h-8 w-32 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Courses Grid Skeleton */}
        <div className="mb-6">
          <div className="h-6 w-40 bg-slate-700 animate-pulse rounded mb-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-slate-700 rounded mb-3"></div>
              <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-5/6 bg-slate-700 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-slate-700 rounded"></div>
                <div className="h-8 w-24 bg-purple-600/30 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
