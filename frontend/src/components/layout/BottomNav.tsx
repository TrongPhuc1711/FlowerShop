import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu }) => {
  const tabs = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { name: 'Bán hàng', href: '/sales', icon: ShoppingCart },
    { name: 'Sản phẩm', href: '/products', icon: Package },
    { name: 'Tồn kho', href: '/inventory', icon: Layers },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-3 py-1.5 shadow-lg shadow-slate-950/10">
      <div className="grid grid-cols-5 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.href}
              end={tab.href === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive ? 'bg-rose-50 text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                    {tab.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Menu Drawer button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all font-medium"
        >
          <div className="w-9 h-7 rounded-lg flex items-center justify-center text-slate-500">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Thêm</span>
        </button>
      </div>
    </nav>
  );
};
