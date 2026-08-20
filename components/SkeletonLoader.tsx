import React from "react";

interface CardSkeletonProps {
  height?: string;
}

export function CardSkeleton({ height = "200px" }: CardSkeletonProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6" style={{ height }}>
      <div className="skeleton mb-4 h-5 w-1/3 rounded animate-pulse" />
      <div className="skeleton mb-2 h-8 w-1/2 rounded animate-pulse" />
      <div className="skeleton h-3 w-full rounded animate-pulse" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="skeleton h-[280px] w-full rounded-2xl" />

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-7 w-2/3 rounded" />
            <div className="skeleton h-2 w-full rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skeleton rounded-xl h-[300px] relative overflow-hidden">
          <div className="skeleton absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full" />
        </div>
        <div className="skeleton rounded-xl h-[300px] p-6 space-y-4">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="space-y-3 pt-4">
            <div className="skeleton h-6 w-full rounded" />
            <div className="skeleton h-6 w-4/5 rounded" />
            <div className="skeleton h-6 w-3/5 rounded" />
            <div className="skeleton h-6 w-2/3 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-7 w-48 rounded" />
        <div className="skeleton ml-auto h-10 w-64 rounded-xl" />
      </div>

      {/* Transaction rows skeleton */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
          <div className="skeleton h-5 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
