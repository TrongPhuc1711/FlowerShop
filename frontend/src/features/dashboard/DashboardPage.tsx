import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number = 0) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Đang tải dữ liệu tổng quan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 text-white p-5 sm:p-8 shadow-xl shadow-rose-950/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] sm:text-xs font-semibold mb-2 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Hệ thống quản lý Hoa Tươi 3NF
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng trở lại! 🌸
          </h1>
          <p className="mt-1 sm:mt-2 text-rose-100 text-xs sm:text-sm leading-relaxed">
            Dữ liệu tổng quan doanh thu, tồn kho theo phương pháp FEFO và dòng tiền được đồng bộ trực tiếp từ Cloud Database.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid: 2 columns on mobile, 4 columns on large */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Doanh thu hôm nay */}
        <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Hôm nay
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-sm sm:text-2xl font-black text-slate-800 truncate">
              {formatCurrency(Number(data?.revenueToday?.totalRevenue || 0))}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">
                {data?.revenueToday?.totalOrders || 0}
              </span>{' '}
              đơn
            </div>
          </div>
        </div>

        {/* Doanh thu tháng này */}
        <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Tháng này
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-sm sm:text-2xl font-black text-slate-800 truncate">
              {formatCurrency(Number(data?.revenueMonth?.totalRevenue || 0))}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 flex items-center gap-1 font-medium">
              <span className="text-rose-600 font-bold">
                {data?.revenueMonth?.totalOrders || 0}
              </span>{' '}
              đơn
            </div>
          </div>
        </div>

        {/* Tổng sản phẩm */}
        <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Sản phẩm
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-sm sm:text-2xl font-black text-slate-800">
              {data?.counts?.products || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium">
              Mặt hàng hoạt động
            </div>
          </div>
        </div>

        {/* Khách hàng & Đối tác */}
        <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Đối tác
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-sm sm:text-2xl font-black text-slate-800">
              {data?.counts?.customers || 0}{' '}
              <span className="text-xs sm:text-base font-normal text-slate-400">/ {data?.counts?.suppliers || 0}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium">
              Khách / Nhà cung cấp
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu 7 ngày gần nhất */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Biểu đồ Doanh thu (7 ngày)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Xu hướng doanh thu bán hàng thời gian thực
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Doanh thu']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Chưa có dữ liệu doanh thu trong 7 ngày qua. Hãy tạo đơn hàng đầu tiên!
              </div>
            )}
          </div>
        </div>

        {/* Top Sản phẩm bán chạy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Sản phẩm bán chạy nhất
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 hoa & phụ kiện theo doanh thu</p>

            <div className="mt-5 space-y-4">
              {data?.topProducts?.length > 0 ? (
                data.topProducts.map((p: any, idx: number) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800">{p.ten_san_pham}</div>
                        <div className="text-[11px] text-slate-400">
                          Đã bán: {p.tong_so_luong}
                        </div>
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-700">
                      {formatCurrency(Number(p.tong_doanh_thu))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có dữ liệu giao dịch
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cảnh báo tồn kho */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Cảnh báo sắp hết hàng
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {data?.lowStockProducts?.length || 0} mặt hàng
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3 px-2 font-semibold">Mã SKU</th>
                  <th className="py-3 px-2 font-semibold">Tên sản phẩm</th>
                  <th className="py-3 px-2 font-semibold text-right">Tồn hiện tại</th>
                  <th className="py-3 px-2 font-semibold text-right">Tối thiểu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.lowStockProducts?.length > 0 ? (
                  data.lowStockProducts.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-2 font-mono font-medium text-slate-600">
                        {item.ma_sku}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-slate-800">
                        {item.ten_san_pham}
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-rose-600">
                        {item.ton_kho} {item.ten_don_vi}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-400">
                        {item.ton_kho_toi_thieu}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Không có mặt hàng nào dưới mức tồn kho tối thiểu ✨
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Đơn hàng gần đây */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Đơn hàng gần đây
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3 px-2 font-semibold">Mã đơn</th>
                  <th className="py-3 px-2 font-semibold">Khách hàng</th>
                  <th className="py-3 px-2 font-semibold text-right">Tổng tiền</th>
                  <th className="py-3 px-2 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.recentOrders?.length > 0 ? (
                  data.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-2 font-mono font-medium text-slate-600">
                        {order.ma_don_hang}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-slate-800">
                        {order.ten_khach_hang || 'Khách vãng lai'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-slate-800">
                        {formatCurrency(Number(order.tong_thanh_toan))}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            order.trang_thai === 'HOAN_THANH'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : order.trang_thai}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Chưa có đơn hàng nào được tạo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
