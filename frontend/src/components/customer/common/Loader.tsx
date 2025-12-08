import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ size = 'lg', text, fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary-600`}
        strokeWidth={2}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        {content}
      </div>
    );
  }

  return content;
}

export function FullScreenLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="text-center">
        {/* Animated loader */}
        <div className="relative mb-6">
          <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
          <div className="absolute inset-0 mx-auto h-20 w-20 animate-pulse rounded-full border-4 border-primary-200 opacity-50"></div>
        </div>

        {/* Loading text */}
        <h2 className="mb-2 text-xl font-semibold text-gray-900">{text}</h2>
        <p className="text-sm text-gray-600">Please wait a moment...</p>

        {/* Animated dots */}
        <div className="mt-4 flex justify-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-600"></div>
        </div>
      </div>
    </div>
  );
}
