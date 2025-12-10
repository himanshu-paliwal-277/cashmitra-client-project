import { memo, ComponentType, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  loading?: boolean;
  trend?: ReactNode;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  label,
  value,
  icon: Icon,
  bgColor,
  textColor,
  loading = false,
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 min-h-[140px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${textColor}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-green-600 flex-shrink-0">
            {trend}
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 break-words">
              {value}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">{label}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(AdminStatsCard);
