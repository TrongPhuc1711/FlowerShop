import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flower2,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Truck,
  Users,
  Building2,
  Sparkles,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { name: 'Bán hàng (POS)', href: '/sales', icon: ShoppingCart },
  { name: 'Sản phẩm & Hoa', href: '/products', icon: Package },
  { name: 'Tồn kho & Lô', href: '/inventory', icon: Layers },
  { name: 'Nhập hàng', href: '/purchases', icon: Truck },
  { name: 'Khách hàng', href: '/customers', icon: Users },
  { name: 'Nhà cung cấp', href: '/suppliers', icon: Building2 },
  { name: 'Cửa hàng khách', href: '/shop', icon: Flower2 },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden animate-fade-in transition-opacity"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Mobile Close button */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-sm tracking-tight block">
                Flower Shop
              </span>
              
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Drawer on Mobile */}
        <div className="p-4 mx-3 my-2 md:hidden rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">
                {user?.fullName || user?.username}
              </div>
              <div className="text-[10px] text-slate-400">
                {user?.roleName || user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Quản lý
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-500/5'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        
      </aside>
    </>
  );
};
