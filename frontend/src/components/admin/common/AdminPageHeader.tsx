import { memo, ReactNode } from 'react';

interface AdminPageHeaderProps {
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  rightSection?: ReactNode;
  children?: ReactNode; // allow full custom JSX
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  icon,
  title,
  subtitle,
  rightSection,
  children,
}) => {
  // 👉 If children passed → render it directly (ignore props layout)
  if (children) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {children}
      </div>
    );
  }

  // 👉 If no children → use the old structured props-based UI
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          {icon}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {title}
          </h1>

          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Right */}
      {rightSection && <div>{rightSection}</div>}
    </div>
  );
};

export default memo(AdminPageHeader);
