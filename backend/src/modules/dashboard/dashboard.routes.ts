import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { db } from '../../config/database';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    // Revenue summary
    const revenueToday = await db.queryOne<any>(
      `SELECT COUNT(*) as totalOrders,
              COALESCE(SUM(tong_thanh_toan), 0) as totalRevenue,
              COALESCE(SUM(da_thanh_toan), 0) as totalPaid
       FROM don_ban_hang
       WHERE trang_thai = 'HOAN_THANH' AND DATE(thoi_gian_ban) = CURDATE()`
    );

    // Revenue this month
    const revenueMonth = await db.queryOne<any>(
      `SELECT COUNT(*) as totalOrders,
              COALESCE(SUM(tong_thanh_toan), 0) as totalRevenue
       FROM don_ban_hang
       WHERE trang_thai = 'HOAN_THANH'
         AND YEAR(thoi_gian_ban) = YEAR(CURDATE())
         AND MONTH(thoi_gian_ban) = MONTH(CURDATE())`
    );

    // Total products, customers, suppliers
    const productCount = await db.queryOne<any>(
      'SELECT COUNT(*) as total FROM san_pham WHERE trang_thai_hoat_dong = 1'
    );
    const customerCount = await db.queryOne<any>(
      'SELECT COUNT(*) as total FROM khach_hang WHERE trang_thai_hoat_dong = 1'
    );
    const supplierCount = await db.queryOne<any>(
      'SELECT COUNT(*) as total FROM nha_cung_cap WHERE trang_thai_hoat_dong = 1'
    );

    // Low stock products
    const lowStockProducts = await db.query<any[]>(
      `SELECT sp.id, sp.ma_sku, sp.ten_san_pham, sp.ton_kho_toi_thieu,
              COALESCE(tk.so_luong, 0) as ton_kho, dvt.ten_don_vi
       FROM san_pham sp
       LEFT JOIN (
         SELECT san_pham_id, SUM(so_luong) as so_luong FROM ton_kho_san_pham GROUP BY san_pham_id
       ) tk ON tk.san_pham_id = sp.id
       LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
       WHERE sp.trang_thai_hoat_dong = 1
         AND COALESCE(tk.so_luong, 0) < sp.ton_kho_toi_thieu
       ORDER BY (COALESCE(tk.so_luong, 0) / GREATEST(sp.ton_kho_toi_thieu, 1)) ASC
       LIMIT 10`
    );

    // Recent orders
    const recentOrders = await db.query<any[]>(
      `SELECT dbh.id, dbh.ma_don_hang, dbh.thoi_gian_ban, dbh.trang_thai,
              dbh.tong_thanh_toan, dbh.trang_thai_thanh_toan,
              kh.ho_ten as ten_khach_hang
       FROM don_ban_hang dbh
       LEFT JOIN khach_hang kh ON kh.id = dbh.khach_hang_id
       ORDER BY dbh.thoi_gian_ban DESC
       LIMIT 10`
    );

    // Revenue last 7 days chart data
    const revenueChart = await db.query<any[]>(
      `SELECT DATE(thoi_gian_ban) as date,
              COUNT(*) as orders,
              COALESCE(SUM(tong_thanh_toan), 0) as revenue
       FROM don_ban_hang
       WHERE trang_thai = 'HOAN_THANH'
         AND thoi_gian_ban >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(thoi_gian_ban)
       ORDER BY date ASC`
    );

    // Top products by sales
    const topProducts = await db.query<any[]>(
      `SELECT sp.id, sp.ma_sku, sp.ten_san_pham,
              SUM(ct.so_luong) as tong_so_luong,
              SUM(ct.thanh_tien) as tong_doanh_thu
       FROM chi_tiet_ban_hang ct
       JOIN don_ban_hang dbh ON dbh.id = ct.don_ban_hang_id
       JOIN san_pham sp ON sp.id = ct.san_pham_id
       WHERE dbh.trang_thai = 'HOAN_THANH'
         AND dbh.thoi_gian_ban >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY sp.id, sp.ma_sku, sp.ten_san_pham
       ORDER BY tong_doanh_thu DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        revenueToday: {
          totalOrders: revenueToday?.totalOrders || 0,
          totalRevenue: revenueToday?.totalRevenue || 0,
          totalPaid: revenueToday?.totalPaid || 0,
        },
        revenueMonth: {
          totalOrders: revenueMonth?.totalOrders || 0,
          totalRevenue: revenueMonth?.totalRevenue || 0,
        },
        counts: {
          products: productCount?.total || 0,
          customers: customerCount?.total || 0,
          suppliers: supplierCount?.total || 0,
        },
        lowStockProducts,
        recentOrders,
        revenueChart,
        topProducts,
      },
    });
  } catch (e) { next(e); }
});

export default router;
