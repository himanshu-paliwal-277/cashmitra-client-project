import { memo, ComponentType, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

// Color configurations for different card indices
const CARD_COLORS = [
  { bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
  { bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { bgColor: 'bg-red-50', textColor: 'text-red-600' },
  { bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
  { bgColor: 'bg-lime-50', textColor: 'text-lime-600' },
  { bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
];

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  index: number;
  loading?: boolean;
  trend?: ReactNode;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  label,
  value,
  icon: Icon,
  index,
  loading = false,
  trend,
}) => {
  // Get colors based on index, loop if index exceeds array length
  const { bgColor, textColor } = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-slate-200 min-h-[140px] flex flex-col justify-between">
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
