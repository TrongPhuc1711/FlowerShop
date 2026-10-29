import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Layers, Search, AlertTriangle, CheckCircle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
  }, [selectedWarehouse]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedWarehouse) params.warehouseId = selectedWarehouse;
      const res = await api.get('/inventory', { params });
      if (res.data.success) {
        setInventory(res.data.data?.items || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      if (res.data.success) setWarehouses(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = inventory.filter(
    (item) =>
      item.ten_san_pham?.toLowerCase().includes(search.toLowerCase()) ||
      item.ma_sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-500" />
            Tồn Kho & Quản Lý Lô (FEFO)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi số lượng tồn thực tế, số lượng giữ chỗ và hạn sử dụng hoa tươi.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã SKU hoặc tên hoa..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            />
          </div>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-rose-500"
          >
            <option value="">Tất cả kho hàng</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.ten_kho}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng số: <span className="font-bold text-slate-800">{filtered.length}</span> mặt hàng
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã SKU</th>
                <th className="py-3.5 px-4">Tên hoa / Sản phẩm</th>
                <th className="py-3.5 px-4">Kho hàng</th>
                <th className="py-3.5 px-4 text-right">Số lượng tồn</th>
                <th className="py-3.5 px-4 text-right">Đang giữ chỗ</th>
                <th className="py-3.5 px-4 text-right">Tồn tối thiểu</th>
                <th className="py-3.5 px-4 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu kho...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {item.ma_sku}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {item.ten_san_pham}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {item.ten_kho || 'Kho Chính'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {item.so_luong} {item.ten_don_vi || 'Cành'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-medium">
                      {item.so_luong_giu_cho}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {item.ton_kho_toi_thieu}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.sap_het_hang ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> An toàn
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có mặt hàng nào trong kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
