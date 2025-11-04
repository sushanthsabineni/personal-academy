export default function AdminUsersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-56 bg-slate-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-80 bg-slate-700/30 rounded animate-pulse"></div>
        </div>

        {/* Filters and Search Skeleton */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-slate-700/30 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Users Table Skeleton */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i} className="border-t border-slate-700/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700/50 rounded-full animate-pulse"></div>
                        <div className="h-5 w-32 bg-slate-700/30 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-40 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-20 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 bg-slate-700/30 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 w-20 bg-slate-700/30 rounded animate-pulse"></div>
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
