export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Loading Text */}
        <p className="text-white text-lg font-medium">Loading...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait</p>
      </div>
    </div>
  )
}
