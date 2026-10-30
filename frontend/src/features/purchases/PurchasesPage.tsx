import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Truck, Plus, Search, CheckCircle, X, Trash2 } from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState<number | string>('');
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [items, setItems] = useState<{ itemId: number; name: string; quantity: number; price: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchMetadata();
  }, []);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/purchases');
      if (res.data.success) {
        setPurchases(res.data.data?.items || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [sRes, pRes, wRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/products'),
        api.get('/warehouses'),
      ]);
      if (sRes.data.success && sRes.data.data?.items?.length > 0) {
        setSuppliers(sRes.data.data.items);
        setSupplierId(sRes.data.data.items[0].id);
      }
      if (pRes.data.success) setProducts(pRes.data.data?.items || pRes.data.data || []);
      if (wRes.data.success && wRes.data.data?.length > 0) {
        setWarehouses(wRes.data.data);
        setWarehouseId(wRes.data.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = (prod: any) => {
    const existing = items.find((i) => i.itemId === prod.id);
    if (existing) {
      setItems(items.map((i) => (i.itemId === prod.id ? { ...i, quantity: i.quantity + 10 } : i)));
    } else {
      setItems([
        ...items,
        {
          itemId: prod.id,
          name: prod.ten_san_pham,
          quantity: 20,
          price: Number(prod.gia_von_tham_khao || 10000),
        },
      ]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm nhập');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/purchases', {
        supplierId: Number(supplierId),
        warehouseId: Number(warehouseId),
        items: items.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
          price: i.price,
          type: 'SAN_PHAM',
        })),
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setItems([]);
        fetchPurchases();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Có lỗi khi tạo phiếu nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const filtered = purchases.filter(
    (p) =>
      p.ma_phieu_nhap?.toLowerCase().includes(search.toLowerCase()) ||
      p.ten_nha_cung_cap?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-rose-500" />
            Nhập Hàng Từ Nhà Cung Cấp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý phiếu nhập hoa sáp, hoa lụa, đầu bông sáp và vật tư đóng gói phụ kiện.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tạo phiếu nhập hàng
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã phiếu nhập hoặc nhà cung cấp..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Tổng số: <span className="font-bold text-slate-800">{filtered.length}</span> phiếu nhập
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã phiếu</th>
                <th className="py-3.5 px-4">Nhà cung cấp</th>
                <th className="py-3.5 px-4">Ngày nhập</th>
                <th className="py-3.5 px-4">Kho nhập</th>
                <th className="py-3.5 px-4 text-right">Tổng thanh toán</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải phiếu nhập...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {p.ma_phieu_nhap}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {p.ten_nha_cung_cap}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.ngay_nhap).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {p.ten_kho || 'Kho Chính'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {formatCurrency(Number(p.tong_thanh_toan))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        {p.trang_thai === 'DA_NHAP_KHO'
                          ? 'Đã nhập kho'
                          : p.trang_thai === 'NHAP_NHAI'
                          ? 'Nháp'
                          : p.trang_thai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chưa có phiếu nhập hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal New Purchase */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Tạo Phiếu Nhập Hàng Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhà cung cấp *
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ten_nha_cung_cap}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kho nhập *
                  </label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.ten_kho}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Chọn hoa nhập từ danh mục:
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {products.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleAddItem(p)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-600 rounded-lg shadow-sm"
                    >
                      + {p.ten_san_pham}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item table */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Danh sách hàng nhập ({items.length})
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <div className="flex-1 font-bold text-slate-800">{i.name}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">SL:</span>
                        <input
                          type="number"
                          min="1"
                          value={i.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems(items.map((item, id) => (id === idx ? { ...item, quantity: val } : item)));
                          }}
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-right font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Giá:</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={i.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems(items.map((item, id) => (id === idx ? { ...item, price: val } : item)));
                          }}
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg text-right font-bold text-rose-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, id) => id !== idx))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-4">
                      Chưa chọn sản phẩm nào để nhập
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Lưu phiếu nhập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
