import { db } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors';

export interface CustomerOrderInput {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  deliveryDate?: string;
  notes?: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'MOMO';
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
}

export class ShopService {
  async getCategories() {
    const categories = await db.query<any[]>(
      `SELECT dm.id, dm.ma_danh_muc, dm.ten_danh_muc, dm.mo_ta,
              COUNT(sp.id) as tong_san_pham
       FROM danh_muc_san_pham dm
       LEFT JOIN san_pham sp ON sp.danh_muc_id = dm.id AND sp.trang_thai_hoat_dong = 1
       WHERE dm.trang_thai_hoat_dong = 1
       GROUP BY dm.id
       ORDER BY dm.ten_danh_muc ASC`
    );
    return categories;
  }

  async getProducts(params: {
    search?: string;
    categoryId?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
    minPrice?: number;
    maxPrice?: number;
  }) {
    const conditions: string[] = ['sp.trang_thai_hoat_dong = 1'];
    const sqlParams: any[] = [];

    if (params.search) {
      conditions.push('(sp.ten_san_pham LIKE ? OR sp.mo_ta LIKE ? OR sp.ma_sku LIKE ?)');
      sqlParams.push(`%${params.search}%`, `%${params.search}%`, `%${params.search}%`);
    }

    if (params.categoryId) {
      conditions.push('sp.danh_muc_id = ?');
      sqlParams.push(params.categoryId);
    }

    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      conditions.push('sp.gia_ban >= ?');
      sqlParams.push(params.minPrice);
    }

    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      conditions.push('sp.gia_ban <= ?');
      sqlParams.push(params.maxPrice);
    }

    let orderBy = 'sp.id DESC';
    if (params.sortBy === 'price_asc') orderBy = 'sp.gia_ban ASC';
    else if (params.sortBy === 'price_desc') orderBy = 'sp.gia_ban DESC';
    else if (params.sortBy === 'name') orderBy = 'sp.ten_san_pham ASC';
    else if (params.sortBy === 'newest') orderBy = 'sp.id DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const products = await db.query<any[]>(
      `SELECT sp.id, sp.ma_sku, sp.ten_san_pham, sp.loai_san_pham,
              sp.gia_ban, sp.duong_dan_anh, sp.mo_ta, sp.ton_kho_toi_thieu,
              dm.id as danh_muc_id, dm.ten_danh_muc,
              dvt.ten_don_vi,
              COALESCE(SUM(tk.so_luong), 15) as ton_kho
       FROM san_pham sp
       LEFT JOIN danh_muc_san_pham dm ON dm.id = sp.danh_muc_id
       LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
       LEFT JOIN ton_kho_san_pham tk ON tk.san_pham_id = sp.id
       ${whereClause}
       GROUP BY sp.id
       ORDER BY ${orderBy}`,
      sqlParams
    );

    return products;
  }

  async getProductById(id: number) {
    const product = await db.queryOne<any>(
      `SELECT sp.*, dm.ten_danh_muc, dvt.ten_don_vi,
              COALESCE(SUM(tk.so_luong), 15) as ton_kho
       FROM san_pham sp
       LEFT JOIN danh_muc_san_pham dm ON dm.id = sp.danh_muc_id
       LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
       LEFT JOIN ton_kho_san_pham tk ON tk.san_pham_id = sp.id
       WHERE sp.id = ? AND sp.trang_thai_hoat_dong = 1
       GROUP BY sp.id`,
      [id]
    );

    if (!product) {
      throw new NotFoundError('Sản phẩm không tồn tại');
    }

    return product;
  }

  async createOrder(input: CustomerOrderInput, userId?: number) {
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('Đơn hàng phải có ít nhất 1 sản phẩm');
    }

    let customerId: number | null = null;

    // 1. Resolve or create customer record
    if (userId) {
      let customer = await db.queryOne<{ id: number; diem_tich_luy: number }>(
        'SELECT id, diem_tich_luy FROM khach_hang WHERE nguoi_dung_id = ?',
        [userId]
      );

      if (!customer) {
        const code = `KH${String(userId).padStart(5, '0')}`;
        const khResult = await db.execute(
          `INSERT INTO khach_hang (nguoi_dung_id, ma_khach_hang, ho_ten, so_dien_thoai, email, dia_chi, diem_tich_luy)
           VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [userId, code, input.fullName, input.phone, input.email || null, input.address]
        );
        customerId = khResult.insertId;
      } else {
        customerId = customer.id;
        // Optionally update address & phone
        await db.execute(
          `UPDATE khach_hang SET ho_ten = ?, so_dien_thoai = ?, dia_chi = COALESCE(?, dia_chi)
           WHERE id = ?`,
          [input.fullName, input.phone, input.address, customerId]
        );
      }
    } else {
      // Guest: check by phone
      let customer = await db.queryOne<{ id: number }>(
        'SELECT id FROM khach_hang WHERE so_dien_thoai = ?',
        [input.phone]
      );
      if (customer) {
        customerId = customer.id;
      } else {
        const randomCode = `KH${Date.now().toString().slice(-6)}`;
        const khResult = await db.execute(
          `INSERT INTO khach_hang (ma_khach_hang, ho_ten, so_dien_thoai, email, dia_chi, diem_tich_luy)
           VALUES (?, ?, ?, ?, ?, 0)`,
          [randomCode, input.fullName, input.phone, input.email || null, input.address]
        );
        customerId = khResult.insertId;
      }
    }

    // Default warehouse
    const warehouse = await db.queryOne<{ id: number }>('SELECT id FROM kho_hang LIMIT 1');
    const warehouseId = warehouse ? warehouse.id : 1;

    // Cashier/Admin assignment (first admin or system user)
    const cashier = await db.queryOne<{ id: number }>('SELECT id FROM nguoi_dung LIMIT 1');
    const cashierId = cashier ? cashier.id : 1;

    // Calculate subtotal
    let totalItemsPrice = 0;
    for (const item of input.items) {
      totalItemsPrice += Number(item.price) * Number(item.quantity);
    }

    const shippingFee = totalItemsPrice >= 500000 ? 0 : 30000;
    const earnedPoints = Math.floor(totalItemsPrice / 10000); // 1 point per 10k VND

    const orderResultId = await db.transaction(async (conn) => {
      // Generate Order Code
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderCode = `DH-ONLINE-${todayStr}-${randSuffix}`;

      const noteText = [
        `Người nhận: ${input.fullName} - SĐT: ${input.phone}`,
        `Địa chỉ: ${input.address}`,
        input.deliveryDate ? `Ngày/giờ giao: ${input.deliveryDate}` : null,
        `Phương thức: ${input.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hoa (COD)' : input.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : 'Ví MoMo'}`,
        input.notes ? `Lời nhắn: ${input.notes}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const [orderRes] = await conn.execute(
        `INSERT INTO don_ban_hang (
          ma_don_hang, khach_hang_id, kho_hang_id, thu_ngan_id,
          kenh_ban, hinh_thuc_nhan, trang_thai,
          tong_tien_hang, tien_chiet_khau, tien_thue, phi_giao_hang,
          da_thanh_toan, trang_thai_thanh_toan, diem_tich_luy_nhan, ghi_chu
        ) VALUES (
          ?, ?, ?, ?,
          'WEBSITE', 'GIAO_HANG', 'DA_XAC_NHAN',
          ?, 0, 0, ?,
          0, 'CHUA_THANH_TOAN', ?, ?
        )`,
        [
          orderCode,
          customerId,
          warehouseId,
          cashierId,
          totalItemsPrice,
          shippingFee,
          earnedPoints,
          noteText,
        ]
      );

      const orderId = (orderRes as any).insertId;

      // Insert details
      for (const item of input.items) {
        await conn.execute(
          `INSERT INTO chi_tiet_ban_hang (
            don_ban_hang_id, san_pham_id, so_luong, don_gia, tien_chiet_khau, gia_von_tai_thoi_diem_ban
          ) VALUES (?, ?, ?, ?, 0, 0)`,
          [orderId, item.productId, item.quantity, item.price]
        );
      }

      // Update customer loyalty points if customer exists
      if (customerId) {
        await conn.execute(
          'UPDATE khach_hang SET diem_tich_luy = diem_tich_luy + ? WHERE id = ?',
          [earnedPoints, customerId]
        );
      }

      return orderId;
    });

    const fullOrder = await db.queryOne<any>(
      `SELECT dbh.*, kh.ho_ten as ten_khach_hang, kh.so_dien_thoai as sdt_khach_hang
       FROM don_ban_hang dbh
       LEFT JOIN khach_hang kh ON kh.id = dbh.khach_hang_id
       WHERE dbh.id = ?`,
      [orderResultId]
    );

    const items = await db.query<any[]>(
      `SELECT ct.*, sp.ten_san_pham, sp.duong_dan_anh
       FROM chi_tiet_ban_hang ct
       LEFT JOIN san_pham sp ON sp.id = ct.san_pham_id
       WHERE ct.don_ban_hang_id = ?`,
      [orderResultId]
    );

    return { ...fullOrder, items, earnedPoints };
  }

  async getMyOrders(userId: number) {
    const customer = await db.queryOne<{ id: number }>(
      'SELECT id FROM khach_hang WHERE nguoi_dung_id = ?',
      [userId]
    );

    if (!customer) {
      return [];
    }

    const orders = await db.query<any[]>(
      `SELECT dbh.*, kh.ho_ten, kh.so_dien_thoai, kh.dia_chi
       FROM don_ban_hang dbh
       JOIN khach_hang kh ON kh.id = dbh.khach_hang_id
       WHERE dbh.khach_hang_id = ?
       ORDER BY dbh.thoi_gian_ban DESC`,
      [customer.id]
    );

    for (const order of orders) {
      const items = await db.query<any[]>(
        `SELECT ct.*, sp.ten_san_pham, sp.duong_dan_anh, dvt.ten_don_vi
         FROM chi_tiet_ban_hang ct
         LEFT JOIN san_pham sp ON sp.id = ct.san_pham_id
         LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
         WHERE ct.don_ban_hang_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  }

  async updateCustomerProfile(
    userId: number,
    data: { fullName: string; phone?: string; address?: string }
  ) {
    await db.execute('UPDATE nguoi_dung SET ho_ten = ?, so_dien_thoai = ? WHERE id = ?', [
      data.fullName,
      data.phone || null,
      userId,
    ]);

    const customer = await db.queryOne<{ id: number }>(
      'SELECT id FROM khach_hang WHERE nguoi_dung_id = ?',
      [userId]
    );

    if (customer) {
      await db.execute(
        'UPDATE khach_hang SET ho_ten = ?, so_dien_thoai = ?, dia_chi = ? WHERE id = ?',
        [data.fullName, data.phone || null, data.address || null, customer.id]
      );
    }

    return { success: true, message: 'Cập nhật thông tin thành công' };
  }
}

export const shopService = new ShopService();
