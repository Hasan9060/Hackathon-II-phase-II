/**
 * LoadingSkeleton component
 * Displays a shimmer effect while content is loading
 */
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
