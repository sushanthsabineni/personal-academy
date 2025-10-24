export default function CreateLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-96 bg-slate-700 animate-pulse rounded mx-auto mb-4"></div>
          <div className="h-5 w-64 bg-slate-700 animate-pulse rounded mx-auto"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 animate-pulse">
          {/* Form Fields */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6">
              <div className="h-5 w-32 bg-slate-700 rounded mb-2"></div>
              <div className="h-12 w-full bg-slate-700 rounded"></div>
            </div>
          ))}

          {/* Button Skeleton */}
          <div className="flex justify-end mt-8">
            <div className="h-12 w-40 bg-purple-600/30 rounded"></div>
          </div>
        </div>

        {/* Progress Steps Skeleton */}
        <div className="flex justify-center items-center gap-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>
              {i < 4 && (
                <div className="w-16 h-1 bg-slate-700 animate-pulse mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
