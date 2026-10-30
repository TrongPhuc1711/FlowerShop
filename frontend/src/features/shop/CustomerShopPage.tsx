import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Flower2,
  Search,
  ShoppingCart,
  User,
  LogOut,
  MapPin,
  Phone,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Trash2,
  Calendar,
  CreditCard,
  Truck,
  Heart,
  ChevronRight,
  ShieldCheck,
  Package,
  Award,
  ArrowRight,
  AlertCircle,
  Clock,
  QrCode,
  SlidersHorizontal,
} from 'lucide-react';

interface Product {
  id: number;
  ma_sku: string;
  ten_san_pham: string;
  loai_san_pham: string;
  gia_ban: string | number;
  duong_dan_anh: string;
  mo_ta: string;
  danh_muc_id: number;
  ten_danh_muc: string;
  ten_don_vi: string;
  ton_kho: number;
}

interface Category {
  id: number;
  ten_danh_muc: string;
  tong_san_pham: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderDetail {
  id: number;
  ma_don_hang: string;
  thoi_gian_ban: string;
  trang_thai: string;
  trang_thai_thanh_toan: string;
  tong_tien_hang: string | number;
  phi_giao_hang: string | number;
  tong_thanh_toan: string | number;
  ghi_chu: string;
  items?: Array<{
    id: number;
    ten_san_pham: string;
    so_luong: number;
    don_gia: string | number;
    duong_dan_anh: string;
    ten_don_vi: string;
  }>;
}

export const CustomerShopPage: React.FC = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name'>('newest');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('flower_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('flower_cart', JSON.stringify(cart));
  }, [cart]);

  // Checkout form state
  const [recipientName, setRecipientName] = useState(user?.fullName || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [recipientAddress, setRecipientAddress] = useState(user?.address || '');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'MOMO'>('COD');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Customer orders state
  const [myOrders, setMyOrders] = useState<OrderDetail[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Sync user info into form states
  useEffect(() => {
    if (user) {
      setRecipientName(user.fullName || '');
      setRecipientPhone(user.phone || '');
      setRecipientAddress(user.address || '');
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
    }
  }, [user]);

  // Fetch shop catalog
  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/shop/products'),
        api.get('/shop/categories'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data || []);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Fetch customer orders
  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingOrders(true);
      const res = await api.get('/shop/my-orders');
      if (res.data.success) {
        setMyOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching my orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory ? p.danh_muc_id === selectedCategory : true;
        const matchesSearch = searchQuery
          ? p.ten_san_pham.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.mo_ta && p.mo_ta.toLowerCase().includes(searchQuery.toLowerCase()))
          : true;
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return Number(a.gia_ban) - Number(b.gia_ban);
        if (sortBy === 'price_desc') return Number(b.gia_ban) - Number(a.gia_ban);
        if (sortBy === 'name') return a.ten_san_pham.localeCompare(b.ten_san_pham);
        return b.id - a.id;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.product.gia_ban) * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const shippingFee = cartSubtotal >= 500000 || cartSubtotal === 0 ? 0 : 30000;
  const cartTotal = cartSubtotal + shippingFee;
  const freeShipThreshold = 500000;
  const freeShipRemaining = Math.max(0, freeShipThreshold - cartSubtotal);

  const formatVND = (num: number | string) => {
    return Number(num).toLocaleString('vi-VN') + ' ₫';
  };

  // Handle Checkout Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const payload = {
        fullName: recipientName.trim(),
        phone: recipientPhone.trim(),
        address: recipientAddress.trim(),
        deliveryDate: deliveryDate || undefined,
        notes: cardMessage.trim() || undefined,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.gia_ban),
        })),
      };

      const res = await api.post('/shop/orders', payload);
      if (res.data.success) {
        setOrderSuccess(res.data.data);
        setCart([]); // Clear cart
        setIsCheckoutOpen(false);

        // Update local points if customer
        if (user && res.data.data?.earnedPoints) {
          updateUser({ loyaltyPoints: (user.loyaltyPoints || 0) + res.data.data.earnedPoints });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    try {
      const res = await api.put('/shop/profile', {
        fullName: profileName.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
      });
      if (res.data.success) {
        updateUser({
          fullName: profileName.trim(),
          phone: profilePhone.trim(),
          address: profileAddress.trim(),
        });
        setProfileSuccessMsg('Đã cập nhật thông tin thành công!');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    }
  };

  const isStaffOrAdmin =
    user && ['ADMIN', 'MANAGER', 'CASHIER', 'WAREHOUSE'].includes(user.role);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span>Miễn phí giao hàng cho đơn từ 500.000 ₫ | Hoa sáp thơm lưu hương 2-3 năm | Tặng kèm thiệp & túi quà cao cấp!</span>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <Link to="/shop" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:rotate-6 transition-all">
              <Flower2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent block leading-tight">
                TIỆM HOA SÁP & HOA LỤA
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase block">
                Soap & Silk Flower Art
              </span>
            </div>
          </Link>

          {/* Search Bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bó hoa sáp, hộp trái tim, bình hoa lụa decor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100/90 border border-transparent focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* If Staff or Admin: Link to Admin Panel */}
            {isStaffOrAdmin && (
              <Link
                to="/admin"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title="Quay lại trang quản trị"
              >
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Trang Quản trị</span>
              </Link>
            )}

            {/* My Orders Button */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  fetchMyOrders();
                  setIsMyOrdersOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-semibold transition-colors"
              >
                <Package className="w-4 h-4 text-rose-500" />
                <span className="hidden sm:inline">Đơn của tôi</span>
              </button>
            ) : null}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-3.5 sm:py-2 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 font-bold text-xs sm:text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
              title="Xem giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-auto sm:right-auto bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] sm:text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-rose-600/30">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 text-left p-1 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Xem hồ sơ & Điểm tích luỹ"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-sm">
                    {user?.fullName?.charAt(0) || 'K'}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.fullName || user?.username}
                    </div>
                    <div className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500" />
                      {user?.loyaltyPoints || 0} điểm
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <Link
                  to="/login?mode=login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs sm:text-sm font-bold shadow-sm shadow-rose-500/25 hover:from-rose-600 hover:to-pink-700 transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mẫu hoa sáp, hoa lụa yêu thích..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>
      </header>

      {/* 3. HERO FLORAL BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-100/90 via-pink-50 to-emerald-50/50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-rose-100/80">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-200 text-rose-600 text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hoa Sáp Thơm & Hoa Lụa Cao Cấp - Bền Đẹp Vĩnh Cửu</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Trao Gửi Yêu Thương <br />
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                Với Hoa Sáp Thơm & Hoa Lụa Tinh Tế
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
              Bộ sưu tập hoa sáp thơm cao cấp lưu hương 2-3 năm và hoa lụa decor nghệ thuật.
              Cánh hoa mềm mịn tự nhiên như thật, không sợ tàn phai, món quà ý nghĩa bền vững theo năm tháng!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-rose-100 shadow-sm text-slate-700">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>Lưu hương dịu nhẹ 2-3 năm</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-rose-100 shadow-sm text-slate-700">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Cánh sáp mềm mịn, không tàn</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-rose-100 shadow-sm text-slate-700">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Đóng hộp chống va đập 100%</span>
              </div>
            </div>
          </div>

          {/* Banner Visual Image Card */}
          <div className="relative group w-full max-w-sm shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-3xl transform rotate-3 scale-95 opacity-20 group-hover:rotate-6 transition-all duration-300" />
            <div className="relative bg-white p-3 rounded-3xl shadow-xl border border-rose-100/80 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80"
                alt="Hoa sáp thơm cao cấp"
                className="w-full h-64 object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="mt-3 p-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Bộ Sưu Tập Hoa Sáp Mới 2026</div>
                  <div className="text-[11px] text-slate-500">Hồng sáp 4 lớp & Hộp quà trái tim</div>
                </div>
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                  BÁN CHẠY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT: CATEGORIES & PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Category Pills & Filters Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80'
              }`}
            >
              🌸 Tất cả mẫu hoa ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80'
                }`}
              >
                {cat.ten_danh_muc} ({cat.tong_san_pham})
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="name">Tên sản phẩm A-Z</option>
            </select>
          </div>
        </div>

        {/* Product List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-3">
                <div className="h-52 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/70 p-8 my-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Flower2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy mẫu hoa nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Không có sản phẩm nào phù hợp với tìm kiếm của bạn. Hãy thử từ khoá khác hoặc xem danh mục khác.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
            >
              Xem tất cả hoa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inStock = product.ton_kho > 0;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Image & Quick View trigger */}
                  <div
                    onClick={() => {
                      setSelectedProduct(product);
                      setQuickViewQty(1);
                    }}
                    className="relative h-60 overflow-hidden cursor-pointer bg-slate-100"
                  >
                    <img
                      src={
                        product.duong_dan_anh ||
                        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={product.ten_san_pham}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-sm">
                      {product.ten_danh_muc || 'Hoa Sáp & Hoa Lụa'}
                    </div>

                    {/* Stock badge */}
                    <div className="absolute top-3 right-3">
                      {inStock ? (
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Sẵn hoa
                        </span>
                      ) : (
                        <span className="bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Đặt trước
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => {
                          setSelectedProduct(product);
                          setQuickViewQty(1);
                        }}
                        className="font-bold text-slate-800 text-sm hover:text-rose-600 transition-colors cursor-pointer line-clamp-2 mb-1"
                        title={product.ten_san_pham}
                      >
                        {product.ten_san_pham}
                      </h3>
                      {product.mo_ta && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                          {product.mo_ta}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-base sm:text-lg font-black text-rose-600">
                          {formatVND(product.gia_ban)}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          /{product.ten_don_vi || 'Bó'}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setQuickViewQty(1);
                          }}
                          className="col-span-2 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => addToCart(product, 1)}
                          className="col-span-3 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Chọn mua</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. PRODUCT QUICK VIEW MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-1/2 shrink-0">
              <img
                src={selectedProduct.duong_dan_anh}
                alt={selectedProduct.ten_san_pham}
                className="w-full h-72 object-cover rounded-2xl shadow-sm"
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="inline-block text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full mb-2">
                  {selectedProduct.ten_danh_muc || 'Hoa Sáp & Hoa Lụa'}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                  {selectedProduct.ten_san_pham}
                </h2>
                <div className="text-2xl font-black text-rose-600 mb-4">
                  {formatVND(selectedProduct.gia_ban)}
                </div>

                <div className="text-xs text-slate-600 space-y-2 mb-6">
                  <p>{selectedProduct.mo_ta || 'Hoa sáp thơm cao cấp 3-4 lớp mềm mịn hoặc hoa lụa decor nghệ thuật. Lưu hương dịu nhẹ 2-3 năm, bền màu vĩnh cửu theo thời gian.'}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Tặng kèm thiệp thiết kế & đóng gói hộp carton an toàn 100%</span>
                  </div>
                </div>
              </div>

              <div>
                {/* Quantity selector */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-slate-600">Số lượng:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      className="p-2 hover:bg-slate-100 text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">{quickViewQty}</span>
                    <button
                      onClick={() => setQuickViewQty(quickViewQty + 1)}
                      className="p-2 hover:bg-slate-100 text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, quickViewQty);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Thêm vào giỏ</span>
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, quickViewQty);
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-base text-slate-800">
                  Giỏ hàng của bạn ({cartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping progress */}
            <div className="px-5 py-3 bg-rose-50/80 border-b border-rose-100/60">
              {cartSubtotal >= freeShipThreshold ? (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bạn đã đủ điều kiện nhận MIỄN PHÍ VẬN CHUYỂN!</span>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-slate-600 mb-1.5">
                    Mua thêm{' '}
                    <strong className="text-rose-600 font-bold">
                      {formatVND(freeShipRemaining)}
                    </strong>{' '}
                    để được miễn phí giao hoa
                  </div>
                  <div className="w-full bg-rose-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (cartSubtotal / freeShipThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
                  <p className="text-sm font-semibold text-slate-600">Giỏ hàng đang trống</p>
                  <p className="text-xs text-slate-400 mt-1">Hãy khám phá các mẫu hoa sáp, hoa lụa tinh tế nhé!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70"
                  >
                    <img
                      src={item.product.duong_dan_anh}
                      alt={item.product.ten_san_pham}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.product.ten_san_pham}
                      </h4>
                      <div className="text-xs font-black text-rose-600 mt-0.5">
                        {formatVND(item.product.gia_ban)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-slate-50 text-slate-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-slate-50 text-slate-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Tiền hàng:</span>
                  <span className="font-bold text-slate-800">{formatVND(cartSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      formatVND(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-800">Tổng thanh toán:</span>
                  <span className="font-black text-lg text-rose-600">{formatVND(cartTotal)}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                >
                  <span>Tiến hành Đặt hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Thông tin nhận hoa & Đặt hàng</h3>
                <p className="text-xs text-slate-500">Vui lòng cung cấp địa chỉ chính xác để giao hoa đúng hẹn</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ tên người nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại nhận hoa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    required
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ giao hoa chi tiết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                  placeholder="Số nhà, tên toà nhà, đường, phường/xã, quận/huyện..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời gian giao hoa mong muốn
                  </label>
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    placeholder="VD: 9h00 sáng mai hoặc Giao ngay"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lời chúc trên thiệp (miễn phí)
                  </label>
                  <input
                    type="text"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="VD: Chúc mừng sinh nhật em yêu..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Tiền mặt khi nhận (COD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Chuyển khoản VietQR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOMO')}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'MOMO'
                        ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Ví MoMo
                  </button>
                </div>

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">Thông tin chuyển khoản:</div>
                    <div>Ngân hàng: <strong>Vietcombank (VCB)</strong></div>
                    <div>Số tài khoản: <strong>9876543210</strong> - Chủ TK: <strong>FLOWER SHOP</strong></div>
                    <div>Nội dung CK: <strong>[SĐT người nhận] - Mua hoa</strong></div>
                  </div>
                )}
              </div>

              {/* Order review mini summary */}
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Tổng tiền cần thanh toán ({cartCount} món):</span>
                <span className="font-black text-base text-rose-600">{formatVND(cartTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmittingOrder ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Xác nhận & Hoàn tất Đặt hàng</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. ORDER SUCCESS MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">Đặt Hàng Thành Công!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cảm ơn bạn đã lựa chọn Tiệm Hoa Sáp & Hoa Lụa. Chúng tôi đang chuẩn bị hoa để giao đến bạn sớm nhất!
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-extrabold text-rose-600">{orderSuccess.ma_don_hang}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng thanh toán:</span>
                <span className="font-bold text-slate-800">{formatVND(orderSuccess.tong_thanh_toan)}</span>
              </div>
              {orderSuccess.earnedPoints > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  <span>Điểm thưởng tích luỹ:</span>
                  <span>+{orderSuccess.earnedPoints} điểm ⭐</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  fetchMyOrders();
                  setIsMyOrdersOpen(true);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MY ORDERS MODAL */}
      {isMyOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-extrabold text-slate-800">Lịch sử & Theo dõi Đơn hàng</h3>
              </div>
              <button
                onClick={() => setIsMyOrdersOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isLoadingOrders ? (
                <div className="text-center py-10">
                  <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : myOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30 text-rose-500" />
                  <p className="text-sm font-semibold text-slate-600">Bạn chưa có đơn hàng nào</p>
                  <p className="text-xs text-slate-400 mt-1">Các đơn hàng mua sắm của bạn sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-rose-600">{order.ma_don_hang}</span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.thoi_gian_ban).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {order.trang_thai === 'DA_XAC_NHAN' ? 'Đã xác nhận' : order.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </div>

                    {/* Order items */}
                    {order.items && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/60">
                        {order.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-medium">
                              {it.so_luong}x {it.ten_san_pham}
                            </span>
                            <span className="font-bold text-slate-800">
                              {formatVND(Number(it.don_gia) * it.so_luong)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500">Tổng thanh toán:</span>
                      <span className="font-black text-rose-600 text-sm">
                        {formatVND(order.tong_thanh_toan)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. CUSTOMER PROFILE & LOYALTY MODAL */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/25">
                {user.fullName?.charAt(0) || 'K'}
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">{user.fullName || user.username}</h3>
              <p className="text-xs text-slate-500">@{user.username} - Khách hàng thân thiết</p>

              {/* Loyalty badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Điểm tích luỹ: {user.loyaltyPoints || 0} điểm</span>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Địa chỉ nhận hoa</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 11. FOOTER */}
      <footer className="bg-white border-t border-rose-100 py-10 px-4 sm:px-6 lg:px-8 mt-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                <Flower2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm text-slate-800">FLOWER SHOP</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Cửa hàng chuyên cung cấp hoa sáp thơm cao cấp, hoa lụa decor phòng khách, hoa giả nghệ thuật, hộp hoa sáp quà tặng sinh nhật, kỷ niệm, tốt nghiệp. Độ bền vĩnh cửu, không sợ héo tàn.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">
              Chính Sách & Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>• Miễn phí giao hàng đơn từ 500k</li>
              <li>• Hoa sáp thơm lưu hương 2-3 năm</li>
              <li>• Đóng hộp carton chống móp méo 100%</li>
              <li>• Tặng kèm thiệp thiết kế & túi xách cao cấp</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">
              Liên Hệ Đặt Hoa
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>📞 Hotline: 0988 123 456</li>
              <li>📍 Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM</li>
              <li>🕒 Giờ mở cửa: 07:00 - 21:30 hàng ngày</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">
              Tài Khoản & Quyền Lợi
            </h4>
            <p className="text-slate-500 mb-3">
              Đăng ký tài khoản để tích luỹ điểm thưởng đổi quà và nhận ưu đãi độc quyền.
            </p>
            {!isAuthenticated ? (
              <Link
                to="/login?mode=register"
                className="inline-block px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
              >
                Đăng ký thành viên ngay
              </Link>
            ) : (
              <span className="text-emerald-600 font-bold">
                ✓ Bạn đang là thành viên Flower Shop
              </span>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 text-center text-slate-400">
          © 2026 Flower Shop. All rights reserved. Thiết kế dành riêng cho khách hàng yêu hoa.
        </div>
      </footer>
    </div>
  );
};
