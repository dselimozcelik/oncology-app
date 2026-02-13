export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-[250px] bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
