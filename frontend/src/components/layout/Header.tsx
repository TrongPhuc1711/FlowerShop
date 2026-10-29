import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, Menu, Flower2 } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 sm:h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand indicator */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center">
            <Flower2 className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 text-sm tracking-tight">
            Flower Shop
          </span>
        </div>

        
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* User profile dropdown info */}
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-4 sm:border-l border-slate-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm shadow-rose-500/20">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-slate-800 leading-none">
              {user?.fullName || user?.username}
            </div>
            <div className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-500" />
              {user?.roleName || user?.role}
            </div>
          </div>

          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
