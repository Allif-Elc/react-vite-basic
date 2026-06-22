interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
);

export const ProjectSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 border rounded-lg">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="animate-pulse space-y-2">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg shadow p-4">
    <Skeleton className="h-6 w-1/3 mb-3" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const PageSkeleton = () => (
  <div className="animate-pulse min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={4} />
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6 bg-white rounded-lg shadow">
    <Skeleton className="h-8 w-40" />
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
);

export const DetailSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6 bg-white rounded-lg shadow">
    <Skeleton className="h-8 w-56" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="border-t pt-4 mt-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex">
          <Skeleton className="h-4 w-24 mr-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  </div>
);
