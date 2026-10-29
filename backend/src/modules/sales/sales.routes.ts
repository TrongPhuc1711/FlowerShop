import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { db } from '../../config/database';
import { buildPagination, paginatedResponse } from '../../shared/utils';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, page } = buildPagination(req.query);
    const search = req.query.search as string;
    const status = req.query.status as string;

    let where = '';
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(dbh.ma_don_hang LIKE ? OR kh.ho_ten LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      conditions.push('dbh.trang_thai = ?');
      params.push(status);
    }
    if (conditions.length > 0) where = 'WHERE ' + conditions.join(' AND ');

    const [countRow] = await db.query<any[]>(
      `SELECT COUNT(*) as total FROM don_ban_hang dbh LEFT JOIN khach_hang kh ON kh.id = dbh.khach_hang_id ${where}`, params
    );
    const total = countRow?.total || 0;

    const data = await db.query<any[]>(
      `SELECT dbh.*, kh.ho_ten as ten_khach_hang, kh.so_dien_thoai as sdt_khach_hang,
              nd.ho_ten as ten_thu_ngan, kho.ten_kho
       FROM don_ban_hang dbh
       LEFT JOIN khach_hang kh ON kh.id = dbh.khach_hang_id
       LEFT JOIN nguoi_dung nd ON nd.id = dbh.thu_ngan_id
       LEFT JOIN kho_hang kho ON kho.id = dbh.kho_hang_id
       ${where}
       ORDER BY dbh.thoi_gian_ban DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json(paginatedResponse(data, total, page, limit));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await db.queryOne<any>(
      `SELECT dbh.*, kh.ho_ten as ten_khach_hang, kh.so_dien_thoai as sdt_khach_hang,
              nd.ho_ten as ten_thu_ngan, kho.ten_kho
       FROM don_ban_hang dbh
       LEFT JOIN khach_hang kh ON kh.id = dbh.khach_hang_id
       LEFT JOIN nguoi_dung nd ON nd.id = dbh.thu_ngan_id
       LEFT JOIN kho_hang kho ON kho.id = dbh.kho_hang_id
       WHERE dbh.id = ?`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const items = await db.query<any[]>(
      `SELECT ct.*, sp.ten_san_pham, sp.ma_sku, lh.ma_lo
       FROM chi_tiet_ban_hang ct
       LEFT JOIN san_pham sp ON sp.id = ct.san_pham_id
       LEFT JOIN lo_hang lh ON lh.id = ct.lo_hang_id
       WHERE ct.don_ban_hang_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...order, items } });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { customerId, warehouseId, channel, receiveMethod, items, notes, discount, tax, deliveryFee } = req.body;
    const userId = req.user!.userId;

    const result = await db.transaction(async (conn) => {
      // Generate order number
      const [countRow] = await conn.execute(
        "SELECT COUNT(*) as cnt FROM don_ban_hang WHERE DATE(thoi_gian_ban) = CURDATE()"
      );
      const count = ((countRow as any[])[0]?.cnt || 0) + 1;
      const orderCode = `DH${new Date().toISOString().slice(0,10).replace(/-/g,'')}${String(count).padStart(4, '0')}`;

      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * item.price - (item.discount || 0);
      }

      const [orderResult] = await conn.execute(
        `INSERT INTO don_ban_hang (ma_don_hang, khach_hang_id, kho_hang_id, thu_ngan_id,
          kenh_ban, hinh_thuc_nhan, trang_thai, tong_tien_hang, tien_chiet_khau,
          tien_thue, phi_giao_hang, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?, 'NHAP_NHAI', ?, ?, ?, ?, ?)`,
        [orderCode, customerId || null, warehouseId, userId,
         channel || 'POS', receiveMethod || 'TAI_QUAY',
         totalAmount, discount || 0, tax || 0, deliveryFee || 0, notes || null]
      );
      const orderId = (orderResult as any).insertId;

      for (const item of items) {
        await conn.execute(
          `INSERT INTO chi_tiet_ban_hang (don_ban_hang_id, san_pham_id, lo_hang_id,
            so_luong, don_gia, tien_chiet_khau, gia_von_tai_thoi_diem_ban)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.lotId || null,
           item.quantity, item.price, item.discount || 0, item.costPrice || 0]
        );
      }

      return orderId;
    });

    const order = await db.queryOne('SELECT * FROM don_ban_hang WHERE id = ?', [result]);
    res.status(201).json({ success: true, data: order });
  } catch (e) { next(e); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE don_ban_hang SET trang_thai = ? WHERE id = ?', [status, req.params.id]);
    const updated = await db.queryOne('SELECT * FROM don_ban_hang WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

export default router;
