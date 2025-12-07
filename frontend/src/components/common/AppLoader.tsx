export function AppLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="text-center">
        {/* outer spin */}
        <div className="relative mb-6">
          <div className="mx-auto h-24 w-24 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
          <div className="absolute inset-0 mx-auto h-24 w-24 animate-pulse rounded-full border-4 border-primary-200 opacity-40"></div>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-gray-900">{text}</h2>
        <p className="text-sm text-gray-600">Please wait…</p>

        {/* dots */}
        <div className="mt-4 flex justify-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.25s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.1s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-600" />
        </div>
      </div>
    </div>
  );
}
