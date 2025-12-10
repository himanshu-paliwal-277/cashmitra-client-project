/**
 * @fileoverview Lead Card Skeleton Component
 * @description Skeleton loader for lead cards
 * @author Cashmitra Development Team
 * @version 1.0.0
 */

import { Skeleton } from '../../ui/skeleton';

const LeadCardSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-white p-5 shadow-xl rounded-xl border border-gray-200">
      {/* Lead Info */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-32 ml-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex lg:flex-col gap-2 lg:justify-center">
        <Skeleton className="flex-1 lg:flex-initial h-10 w-full lg:w-32 rounded-lg" />
        <Skeleton className="flex-1 lg:flex-initial h-10 w-full lg:w-32 rounded-lg" />
      </div>
    </div>
  );
};

export default LeadCardSkeleton;
