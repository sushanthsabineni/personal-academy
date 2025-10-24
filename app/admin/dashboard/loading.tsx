export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Skeleton */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-700 animate-pulse rounded"></div>
            <div className="h-4 w-32 bg-slate-700 animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-700 animate-pulse rounded"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-5 w-24 bg-slate-700 rounded"></div>
                <div className="w-10 h-10 bg-slate-700 rounded"></div>
              </div>
              <div className="h-8 w-32 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-20 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
            <div className="h-6 w-40 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
            <div className="h-6 w-40 bg-slate-700 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
