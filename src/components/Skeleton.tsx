export const ProjectSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 border rounded-lg">
    <div className="h-4 bg-gray-300 rounded w-3/4" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
    <div className="h-4 bg-gray-300 rounded w-5/6" />
  </div>
);

export const TableSkeleton = () => (
  <div className="animate-pulse space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-300 rounded" />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg shadow p-4">
    <div className="h-6 bg-gray-300 rounded w-1/3 mb-3" />
    <div className="h-4 bg-gray-300 rounded w-full mb-2" />
    <div className="h-4 bg-gray-300 rounded w-2/3" />
  </div>
);

export const PageSkeleton = () => (
  <div className="animate-pulse h-screen bg-gray-200 flex items-center justify-center">
    <div className="text-gray-400">Loading...</div>
  </div>
);
