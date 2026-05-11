export default function LoadingSpinner({ fullPage = false, message = 'Loading...' }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-green-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-lg animate-pulse">🌿</span>
            </div>
          </div>
          <p className="text-green-700 font-semibold text-sm">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 animate-spin" />
      </div>
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  )
}
