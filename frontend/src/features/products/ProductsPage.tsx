import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  Package,
  Plus,
  Search,
  Sparkles,
  X,
  CheckCircle,
} from 'lucide-react';

interface Product {
  id: number;
  ma_sku: string;
  ten_san_pham: string;
  loai_san_pham: string;
  gia_ban: number;
  gia_von_tham_khao: number;
  ton_kho_toi_thieu: number;
  ton_kho?: number;
  ten_don_vi?: string;
  ten_danh_muc?: string;
  trang_thai_hoat_dong: boolean;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [type, setType] = useState('HOA_SAP');
  const [price, setPrice] = useState<number>(50000);
  const [refCostPrice, setRefCostPrice] = useState<number>(30000);
  const [minStock, setMinStock] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.data?.items || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/units'),
        api.get('/categories'),
      ]);
      if (uRes.data.success) setUnits(uRes.data.data || []);
      if (cRes.data.success) setCategories(cRes.data.data || []);
      if (uRes.data.data?.length > 0) {
        setUnitId(uRes.data.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/products', {
        sku,
        name,
        unitId: Number(unitId),
        categoryId: categoryId ? Number(categoryId) : null,
        type,
        price: Number(price),
        refCostPrice: Number(refCostPrice),
        minStock: Number(minStock),
        trackLot: true,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchProducts();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSku('');
    setName('');
    setPrice(50000);
    setRefCostPrice(30000);
    setMinStock(10);
  };

  // Quick Seed Demo Flowers button
  const handleSeedDemoFlowers = async () => {
    const demoFlowers = [
      { sku: 'SAP-HONG-DO-99', name: 'Bó Hoa Hồng Sáp Đỏ 99 Bông', type: 'HOA_SAP', price: 650000, refCostPrice: 280000, unitId: 2, minStock: 10 },
      { sku: 'SAP-PASTEL-HAN', name: 'Bó Hoa Sáp Thơm Pastel Hàn Quốc', type: 'HOA_SAP', price: 380000, refCostPrice: 160000, unitId: 2, minStock: 15 },
      { sku: 'HOP-TRAI-TIM-SAP', name: 'Hộp Hoa Sáp Trái Tim Kèm Đèn LED', type: 'HOA_SAP', price: 490000, refCostPrice: 210000, unitId: 5, minStock: 12 },
      { sku: 'BINH-LUA-PHONG-KHACH', name: 'Bình Hoa Lụa Để Bàn Phòng Khách', type: 'HOA_LUA', price: 850000, refCostPrice: 420000, unitId: 4, minStock: 8 },
      { sku: 'SAP-TOT-NGHIEP', name: 'Bó Hoa Hướng Dương Sáp Tốt Nghiệp', type: 'HOA_SAP', price: 320000, refCostPrice: 130000, unitId: 2, minStock: 20 },
      { sku: 'BABY-KHO-BAT-TU', name: 'Bó Hoa Baby Khô Bất Tử Vintage', type: 'HOA_GIA', price: 350000, refCostPrice: 150000, unitId: 2, minStock: 15 },
    ];

    try {
      setIsLoading(true);
      for (const item of demoFlowers) {
        await api.post('/products', {
          ...item,
          trackLot: true,
        }).catch(() => {});
      }
      await fetchProducts();
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.ten_san_pham.toLowerCase().includes(search.toLowerCase()) ||
      p.ma_sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-500" />
            Danh Mục Hoa & Sản Phẩm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mã SKU, đơn vị tính, giá bán niêm yết và định mức tồn kho tối thiểu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length === 0 && (
            <button
              onClick={handleSeedDemoFlowers}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Thêm mẫu hoa demo
            </button>
          )}

          <button
            onClick={() => {
              setSku(`SKU-${Date.now().toString().slice(-4)}`);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng số: <span className="font-bold text-slate-800">{filteredProducts.length}</span> sản phẩm
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã SKU</th>
                <th className="py-3.5 px-4">Tên sản phẩm</th>
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">ĐVT</th>
                <th className="py-3.5 px-4 text-right">Giá bán</th>
                <th className="py-3.5 px-4 text-right">Giá vốn tham khảo</th>
                <th className="py-3.5 px-4 text-right">Tồn tối thiểu</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách hoa...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {p.ma_sku}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {p.ten_san_pham}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {p.loai_san_pham}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {p.ten_don_vi || 'Cành'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {formatCurrency(Number(p.gia_ban))}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {formatCurrency(Number(p.gia_von_tham_khao))}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-600">
                      {p.ton_kho_toi_thieu}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Đang kinh doanh
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Chưa có sản phẩm nào. Hãy bấm "Thêm mẫu hoa demo" hoặc "Thêm sản phẩm mới"!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Thêm Sản Phẩm Mới
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
                    Mã SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loại sản phẩm *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="HOA_SAP">Hoa sáp thơm</option>
                    <option value="HOA_LUA">Hoa lụa nghệ thuật</option>
                    <option value="HOA_GIA">Hoa giả / Hoa khô</option>
                    <option value="BO_HOA">Bó hoa thiết kế</option>
                    <option value="GIO_HOA">Giỏ / Bình hoa decor</option>
                    <option value="PHU_KIEN">Phụ kiện cắm hoa</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoa Hồng Đỏ Đà Lạt loại 1..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="">-- Không phân danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ten_danh_muc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn vị tính *
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.ten_don_vi} ({u.ma_don_vi})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tồn tối thiểu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giá bán (VND) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giá vốn tham khảo (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={refCostPrice}
                    onChange={(e) => setRefCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
