
import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div className="flex space-x-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="mt-4 flex max-w-xs justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
}
