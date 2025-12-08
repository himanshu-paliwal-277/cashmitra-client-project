import { ReactNode, memo } from 'react';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  index: number;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ label, value, icon, index }) => {
  const gradients = [
    'from-blue-400 to-indigo-500',
    'from-green-400 to-emerald-500',
    'from-amber-400 to-orange-500',
    'from-purple-400 to-pink-500',
  ];

  const selectedGradient = gradients[index % gradients.length]; // loop safe

  return (
    <div
      className={`relative bg-gradient-to-br ${selectedGradient} rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-lg border border-white/30 text-white`}
    >
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>

        <div className="p-3">{icon}</div>
      </div>
    </div>
  );
};

export default memo(AdminStatsCard);
