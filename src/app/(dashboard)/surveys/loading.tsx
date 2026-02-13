export default function SurveysLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-gray-100 flex items-center gap-4">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
