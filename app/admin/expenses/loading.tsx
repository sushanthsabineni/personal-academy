export default function AdminExpensesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-slate-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-slate-700/30 rounded animate-pulse"></div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse mb-3"></div>
              <div className="h-8 w-24 bg-slate-700/30 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-blue-500/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Expenses Table Skeleton */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="border-t border-slate-700/30">
                    <td className="px-4 py-4">
                      <div className="h-5 w-32 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-40 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-20 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-16 bg-blue-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-slate-700/30 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-slate-700/30 rounded animate-pulse"></div>
                      </div>
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
