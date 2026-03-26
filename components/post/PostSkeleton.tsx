// components/post/PostSkeleton.tsx
export default function PostSkeleton() {
  return (
    <div className="card p-5 pointer-events-none">
      <div className="flex items-start gap-3 mb-3">
        <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-3 w-16 rounded-full" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
      </div>

      <div className="ml-12 space-y-2 mb-4">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-5/6 rounded" />
        <div className="skeleton h-3.5 w-4/6 rounded" />
      </div>

      <div className="ml-12 flex gap-2">
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-16 rounded-lg" />
      </div>
    </div>
  )
}
