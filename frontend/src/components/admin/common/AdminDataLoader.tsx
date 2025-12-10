import { Loader2 } from 'lucide-react';
import React, { memo } from 'react';
import clsx from 'clsx';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

const AdminDataLoader: React.FC<LoaderProps> = ({ text = 'Loading...', fullScreen = true }) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 bg-slate-50',
        fullScreen ? 'min-h-screen w-full' : 'min-h-[200px]'
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
      <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
};

export default memo(AdminDataLoader);
