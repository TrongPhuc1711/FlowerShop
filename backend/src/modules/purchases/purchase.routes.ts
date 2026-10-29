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
      conditions.push('(pnh.ma_phieu_nhap LIKE ? OR ncc.ten_nha_cung_cap LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      conditions.push('pnh.trang_thai = ?');
      params.push(status);
    }
    if (conditions.length > 0) where = 'WHERE ' + conditions.join(' AND ');

    const [countRow] = await db.query<any[]>(
      `SELECT COUNT(*) as total FROM phieu_nhap_hang pnh LEFT JOIN nha_cung_cap ncc ON ncc.id = pnh.nha_cung_cap_id ${where}`, params
    );
    const total = countRow?.total || 0;

    const data = await db.query<any[]>(
      `SELECT pnh.*, ncc.ten_nha_cung_cap, nd.ho_ten as ten_nguoi_tao, kho.ten_kho
       FROM phieu_nhap_hang pnh
       LEFT JOIN nha_cung_cap ncc ON ncc.id = pnh.nha_cung_cap_id
       LEFT JOIN nguoi_dung nd ON nd.id = pnh.nguoi_tao_id
       LEFT JOIN kho_hang kho ON kho.id = pnh.kho_hang_id
       ${where}
       ORDER BY pnh.ngay_nhap DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json(paginatedResponse(data, total, page, limit));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const purchase = await db.queryOne<any>(
      `SELECT pnh.*, ncc.ten_nha_cung_cap, nd.ho_ten as ten_nguoi_tao, kho.ten_kho
       FROM phieu_nhap_hang pnh
       LEFT JOIN nha_cung_cap ncc ON ncc.id = pnh.nha_cung_cap_id
       LEFT JOIN nguoi_dung nd ON nd.id = pnh.nguoi_tao_id
       LEFT JOIN kho_hang kho ON kho.id = pnh.kho_hang_id
       WHERE pnh.id = ?`,
      [req.params.id]
    );
    if (!purchase) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const items = await db.query<any[]>(
      `SELECT ct.*, sp.ten_san_pham, sp.ma_sku, vt.ten_vat_tu, vt.ma_vat_tu
       FROM chi_tiet_nhap_hang ct
       LEFT JOIN san_pham sp ON sp.id = ct.san_pham_id
       LEFT JOIN vat_tu vt ON vt.id = ct.vat_tu_id
       WHERE ct.phieu_nhap_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...purchase, items } });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { supplierId, warehouseId, importDate, items, discount, tax, shippingFee, shippingMethod, notes } = req.body;
    const userId = req.user!.userId;

    const result = await db.transaction(async (conn) => {
      const [countRow] = await conn.execute(
        "SELECT COUNT(*) as cnt FROM phieu_nhap_hang WHERE DATE(ngay_nhap) = CURDATE()"
      );
      const count = ((countRow as any[])[0]?.cnt || 0) + 1;
      const code = `PN${new Date().toISOString().slice(0,10).replace(/-/g,'')}${String(count).padStart(4, '0')}`;

      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * item.price - (item.discount || 0);
      }

      const [purchaseResult] = await conn.execute(
        `INSERT INTO phieu_nhap_hang (ma_phieu_nhap, nha_cung_cap_id, kho_hang_id, nguoi_tao_id,
          ngay_nhap, tong_tien_hang, tien_chiet_khau, tien_thue, phi_van_chuyen,
          phuong_thuc_phan_bo_vc, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, supplierId, warehouseId, userId,
         importDate || new Date().toISOString().slice(0,10),
         totalAmount, discount || 0, tax || 0, shippingFee || 0,
         shippingMethod || 'THEO_GIA_TRI', notes || null]
      );
      const purchaseId = (purchaseResult as any).insertId;

      for (const item of items) {
        await conn.execute(
          `INSERT INTO chi_tiet_nhap_hang (phieu_nhap_id, loai_hang_hoa, san_pham_id, vat_tu_id,
            so_luong, gia_nhap, tien_chiet_khau, han_su_dung_du_kien)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [purchaseId, item.type || 'SAN_PHAM',
           item.type === 'VAT_TU' ? null : item.itemId,
           item.type === 'VAT_TU' ? item.itemId : null,
           item.quantity, item.price, item.discount || 0, item.expiryDate || null]
        );
      }

      return purchaseId;
    });

    const purchase = await db.queryOne('SELECT * FROM phieu_nhap_hang WHERE id = ?', [result]);
    res.status(201).json({ success: true, data: purchase });
  } catch (e) { next(e); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE phieu_nhap_hang SET trang_thai = ? WHERE id = ?', [status, req.params.id]);
    const updated = await db.queryOne('SELECT * FROM phieu_nhap_hang WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

export default router;
