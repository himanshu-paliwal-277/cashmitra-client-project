import { Menu, Bell, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  adminUser: any;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const AdminHeader = ({ adminUser, onToggleSidebar, onLogout }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm shrink-0">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/main-logo.png" alt="logo" className="w-8 h-8" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">CASHMITRA</h1>
            <span className="hidden xs:inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-100 rounded border border-blue-200 shrink-0">
              ADMIN
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          {/* Notification Bell
          <button
            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />
          </button> */}

          {/* Admin Profile */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs md:text-sm shrink-0">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {adminUser?.name || 'Admin'}
              </div>
              <div className="text-xs text-slate-600">Administrator</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden md:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
