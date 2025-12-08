import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
}

export function PageLoader({ size = 'lg', text }: PageLoaderProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-20 w-20',
  };

  return (
    <div className="flex items-center justify-center py-12 h-[600px] w-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} strokeWidth={2} />
        {text && <p className="text-xs text-gray-600">{text}</p>}
      </div>
    </div>
  );
}
