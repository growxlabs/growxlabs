import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export function AdminKPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-5 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-24 h-7 rounded-lg" />
            <Skeleton className="w-32 h-3 pt-0.5" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdminServicesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4 bg-[#141416] border border-[#27272a] rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="w-32 h-3.5" />
            </div>
            <Skeleton className="w-28 h-2.5" />
          </div>
          <Skeleton className="w-16 h-5 rounded-md" />
        </Card>
      ))}
    </div>
  );
}

export function AdminActivityFeedSkeleton() {
  return (
    <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="space-y-1.5">
          <Skeleton className="w-48 h-4.5" />
          <Skeleton className="w-72 h-3" />
        </div>
        <Skeleton className="w-32 h-8 rounded-xl" />
      </div>

      <div className="divide-y divide-[#27272a]/60">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-3">
              <Skeleton className="w-7 h-7 rounded-lg mt-0.5 shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="w-36 h-3.5" />
                <Skeleton className="w-64 h-3" />
              </div>
            </div>
            <Skeleton className="w-20 h-3" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="w-44 h-5" />
          <Skeleton className="w-64 h-3" />
        </div>
        <Skeleton className="w-full sm:w-72 h-9 rounded-xl" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#27272a]">
        <div className="p-3.5 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between gap-4">
          <Skeleton className="w-28 h-3" />
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-28 h-3" />
          <Skeleton className="w-16 h-3" />
        </div>
        <div className="divide-y divide-[#27272a]">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="w-32 h-3.5" />
                  <Skeleton className="w-40 h-2.5" />
                </div>
              </div>
              <Skeleton className="w-24 h-6 rounded-lg" />
              <Skeleton className="w-28 h-3.5" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function AdminRBACSkeleton() {
  return (
    <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="w-56 h-5" />
        <Skeleton className="w-80 h-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 border border-[#27272a] bg-[#18181b] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-36 h-4" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-4/5 h-3" />
            </div>
            <div className="pt-2 space-y-2">
              <Skeleton className="w-24 h-2.5" />
              <div className="flex flex-wrap gap-1.5">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="w-20 h-5 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdminIntegrationsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-72 h-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-32 h-3" />
              </div>
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-64 h-3" />
          </div>
          <Skeleton className="w-36 h-9 rounded-xl" />
        </div>
        <div className="py-8 px-4 text-center border border-dashed border-[#27272a] rounded-xl bg-[#18181b]/40 space-y-2">
          <Skeleton className="w-8 h-8 rounded-full mx-auto" />
          <Skeleton className="w-48 h-3.5 mx-auto" />
          <Skeleton className="w-72 h-3 mx-auto" />
        </div>
      </Card>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 text-zinc-100 pb-20 max-w-7xl mx-auto">
      {/* HEADER SKELETON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <Skeleton className="w-64 sm:w-80 h-7 rounded-lg" />
          </div>
          <Skeleton className="w-72 sm:w-96 h-3.5" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="w-44 h-9 rounded-xl" />
          <Skeleton className="w-32 h-9 rounded-xl" />
        </div>
      </div>

      {/* TABS SKELETON */}
      <div className="flex items-center gap-2 border-b border-[#27272a] pb-1 overflow-x-auto">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-36 h-10 rounded-xl shrink-0" />
        ))}
      </div>

      {/* DASHBOARD BODY SKELETON */}
      <div className="space-y-6">
        <AdminKPICardsSkeleton />
        <AdminServicesGridSkeleton />
        <AdminActivityFeedSkeleton />

        {/* Telemetry Summary Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-[#141416] border border-[#27272a] rounded-xl space-y-2 text-center">
              <Skeleton className="w-24 h-3 mx-auto" />
              <Skeleton className="w-16 h-6 mx-auto rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
