export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar skeleton */}
      <div className="w-full md:w-56 shrink-0 flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-white/10 mb-1" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-7 w-40 rounded bg-white/10 mb-2" />
            <div className="h-4 w-24 rounded bg-white/5" />
          </div>
          <div className="h-9 w-56 rounded-xl bg-white/5" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="aspect-square bg-white/5" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-5 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
