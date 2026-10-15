export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading RapidRounds</h2>
        <p className="text-slate-600">Preparing your learning experience...</p>
      </div>
    </div>
  )
}



