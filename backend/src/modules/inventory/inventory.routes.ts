import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { db } from '../../config/database';
import { buildPagination, paginatedResponse } from '../../shared/utils';

const router = Router();
router.use(authenticate);

// GET inventory overview
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, page } = buildPagination(req.query);
    const search = req.query.search as string;
    const warehouseId = req.query.warehouseId as string;
    const lowStock = req.query.lowStock as string;

    let where = 'WHERE sp.trang_thai_hoat_dong = 1';
    const params: any[] = [];

    if (search) {
      where += ' AND (sp.ten_san_pham LIKE ? OR sp.ma_sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (warehouseId) {
      where += ' AND tk.kho_hang_id = ?';
      params.push(Number(warehouseId));
    }

    const baseQuery = `
      FROM san_pham sp
      LEFT JOIN ton_kho_san_pham tk ON tk.san_pham_id = sp.id
      LEFT JOIN kho_hang kh ON kh.id = tk.kho_hang_id
      LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
      ${where}
      ${lowStock === 'true' ? 'AND COALESCE(tk.so_luong, 0) < sp.ton_kho_toi_thieu' : ''}
    `;

    const [countRow] = await db.query<any[]>(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = countRow?.total || 0;

    const data = await db.query<any[]>(
      `SELECT sp.id, sp.ma_sku, sp.ten_san_pham, sp.loai_san_pham,
              dvt.ten_don_vi, sp.ton_kho_toi_thieu,
              COALESCE(tk.so_luong, 0) as so_luong,
              COALESCE(tk.so_luong_giu_cho, 0) as so_luong_giu_cho,
              kh.ten_kho, kh.id as kho_hang_id,
              (COALESCE(tk.so_luong, 0) < sp.ton_kho_toi_thieu) as sap_het_hang
       ${baseQuery}
       ORDER BY sap_het_hang DESC, sp.ten_san_pham ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json(paginatedResponse(data, total, page, limit));
  } catch (e) { next(e); }
});

// GET lot/batch list for a product
router.get('/lots/:productId', async (req, res, next) => {
  try {
    const data = await db.query<any[]>(
      `SELECT lh.*, kh.ten_kho
       FROM lo_hang lh
       LEFT JOIN kho_hang kh ON kh.id = lh.kho_hang_id
       WHERE lh.san_pham_id = ? AND lh.trang_thai = 'DANG_BAN'
       ORDER BY lh.han_su_dung ASC, lh.ngay_nhap ASC`,
      [req.params.productId]
    );
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

export default router;
