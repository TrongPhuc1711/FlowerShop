import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Flower2,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // Mode: 'login' | 'register'
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Common & Login State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const userData = response.data.data.user;
        login(response.data.data.token, userData);

        // Direct based on role
        if (userData.role === 'CUSTOMER') {
          navigate('/shop');
        } else {
          navigate('/admin');
        }
      } else {
        setError(response.data.message || 'Đăng nhập không thành công');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!regFullName.trim()) {
      setError('Vui lòng nhập họ và tên của bạn');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: regUsername.trim(),
        password: regPassword,
        fullName: regFullName.trim(),
        phone: regPhone.trim() || undefined,
        email: regEmail.trim() || undefined,
        address: regAddress.trim() || undefined,
      });

      if (response.data.success) {
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...');
        const userData = response.data.data.user;
        const token = response.data.data.token;

        setTimeout(() => {
          login(token, userData);
          navigate('/shop');
        }, 1200);
      } else {
        setError(response.data.message || 'Đăng ký không thành công');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Đăng ký không thành công. Tên đăng nhập hoặc email có thể đã tồn tại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setMode('login');
    setUsername('admin');
    setPassword('password');
    setError(null);
  };

  const fillDemoCustomer = () => {
    setMode('register');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setRegUsername(`khachhang_${randomSuffix}`);
    setRegFullName('Nguyễn Thị Mai Anh');
    setRegPhone('0912345678');
    setRegEmail(`maianh${randomSuffix}@gmail.com`);
    setRegAddress('124 Pasteur, Phường Bến Nghé, Quận 1, TP.HCM');
    setRegPassword('123456');
    setRegConfirmPassword('123456');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50/50 to-emerald-50/40 p-4 py-8">
      {/* Decorative blurred blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Top bar back to shop */}
        <div className="flex items-center justify-between mb-4 px-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white/70 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-100 shadow-sm transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>← Ghé xem Cửa hàng hoa</span>
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Hệ thống Tiệm Hoa Sáp & Hoa Lụa
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 text-white shadow-xl shadow-rose-500/25 mb-3 transform hover:rotate-6 transition-transform">
            <Flower2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            FLOWER SHOP
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Trao hoa gửi gắm yêu thương & Hệ thống quản lý thông minh
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 shadow-2xl shadow-rose-950/10 rounded-3xl p-6 sm:p-8 transition-all">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng ký tài khoản
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Mật khẩu
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Bảo mật 256-bit
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                      placeholder="user123"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ban@email.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Địa chỉ nhận hoa mặc định
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Xác nhận mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Tạo tài khoản Khách hàng</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Tài khoản mẫu thử nghiệm nhanh:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/80 hover:border-rose-200 text-slate-700 hover:text-rose-600 font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Admin: admin</span>
              </button>
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Khách hàng mẫu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Flower Shop. Hệ thống quản lý & bán hoa sáp, hoa lụa nghệ thuật cao cấp.
        </p>
      </div>
    </div>
  );
};
