import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Trash2,
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // New Order Form State
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(1);
  const [cartItems, setCartItems] = useState<
    { productId: number; name: string; sku: string; price: number; quantity: number; costPrice: number }[]
  >([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchMetadata();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/sales');
      if (res.data.success) {
        setOrders(res.data.data?.items || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [pRes, cRes, wRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/warehouses'),
      ]);
      if (pRes.data.success) setProducts(pRes.data.data?.items || pRes.data.data || []);
      if (cRes.data.success) setCustomers(cRes.data.data?.items || cRes.data.data || []);
      if (wRes.data.success && wRes.data.data?.length > 0) {
        setWarehouses(wRes.data.data);
        setSelectedWarehouse(wRes.data.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (product: any) => {
    const existing = cartItems.find((i) => i.productId === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.ten_san_pham,
          sku: product.ma_sku,
          price: Number(product.gia_ban),
          costPrice: Number(product.gia_von_tham_khao || 0),
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(cartItems.filter((i) => i.productId !== productId));
  };

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - Number(discount));

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/sales', {
        customerId: selectedCustomer ? Number(selectedCustomer) : null,
        warehouseId: Number(selectedWarehouse),
        channel: 'POS',
        receiveMethod: 'TAI_QUAY',
        items: cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          costPrice: i.costPrice,
        })),
        discount: Number(discount),
        notes,
      });

      if (res.data.success) {
        // Automatically complete the order for POS flow
        const orderId = res.data.data?.id;
        if (orderId) {
          await api.patch(`/sales/${orderId}/status`, { status: 'HOAN_THANH' }).catch(() => {});
        }
        setIsModalOpen(false);
        setCartItems([]);
        setDiscount(0);
        setNotes('');
        fetchOrders();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/sales/${orderId}/status`, { status });
      fetchOrders();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.ma_don_hang?.toLowerCase().includes(search.toLowerCase()) ||
      o.ten_khach_hang?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-500" />
            Bán Hàng & Đơn Hàng (POS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý đơn hàng, xuất bán tại quầy và lịch sử giao dịch khách hàng.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tạo đơn bán hàng mới
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Tổng: <span className="font-bold text-slate-800">{filteredOrders.length}</span> đơn hàng
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã đơn hàng</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Kênh</th>
                <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {order.ma_don_hang}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {order.ten_khach_hang || 'Khách vãng lai'}
                      </div>
                      {order.sdt_khach_hang && (
                        <div className="text-[10px] text-slate-400">{order.sdt_khach_hang}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.thoi_gian_ban).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {order.kenh_ban}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {formatCurrency(Number(order.tong_thanh_toan))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.trang_thai === 'HOAN_THANH'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.trang_thai === 'DA_HUY'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.trang_thai === 'HOAN_THANH' && <CheckCircle className="w-3 h-3" />}
                        {order.trang_thai === 'DA_HUY' && <XCircle className="w-3 h-3" />}
                        {order.trang_thai === 'NHAP_NHAI' && <Clock className="w-3 h-3" />}
                        {order.trang_thai === 'HOAN_THANH'
                          ? 'Hoàn thành'
                          : order.trang_thai === 'NHAP_NHAI'
                          ? 'Nháp'
                          : order.trang_thai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.trang_thai === 'NHAP_NHAI' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'HOAN_THANH')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                          Xác nhận & Thu tiền
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có đơn hàng nào. Hãy bấm "Tạo đơn bán hàng mới" để bắt đầu!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Tạo Đơn Bán Hàng Tại Quầy (POS)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Product picker */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chọn Sản Phẩm Bán
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {products.length > 0 ? (
                    products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddToCart(p)}
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-rose-600">
                            {p.ten_san_pham}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.ma_sku} • {p.ten_don_vi || 'Cành'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-slate-800">
                            {formatCurrency(Number(p.gia_ban))}
                          </div>
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            + Thêm
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-6 text-center">
                      Không có sản phẩm nào. Vui lòng vào trang "Sản phẩm" để thêm hoa!
                    </div>
                  )}
                </div>
              </div>

              {/* Cart & Customer */}
              <form onSubmit={handleCreateOrder} className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Khách hàng
                      </label>
                      <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500 font-medium"
                      >
                        <option value="">-- Khách vãng lai --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.ho_ten} ({c.so_dien_thoai || 'Không SĐT'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kho xuất bán
                      </label>
                      <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
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

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Giỏ hàng ({cartItems.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-bold text-slate-800 truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {formatCurrency(item.price)} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {cartItems.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          Chưa có sản phẩm nào trong giỏ
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Tạm tính:</span>
                      <span className="font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Chiết khấu (VND):</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-right text-xs border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="flex justify-between text-sm font-black text-rose-600 pt-2 border-t border-slate-100">
                      <span>Tổng thanh toán:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận tạo đơn'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
