import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface AdminSidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isOpen: boolean;
  isActive: boolean;
}

const AdminSidebarItem = ({ to, icon: Icon, label, isOpen, isActive }: AdminSidebarItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 !text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
        isActive
          ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600 shadow-sm'
          : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
      }`}
    >
      <span
        className={`mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 ${
          isActive ? '' : 'group-hover:scale-110'
        }`}
      >
        <Icon size={18} />
      </span>
      {isOpen ? label : ''}
    </Link>
  );
};

export default AdminSidebarItem;
