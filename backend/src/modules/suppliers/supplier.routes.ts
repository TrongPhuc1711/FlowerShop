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
    let where = '';
    const params: any[] = [];
    if (search) {
      where = 'WHERE ten_nha_cung_cap LIKE ? OR ma_nha_cung_cap LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [countRow] = await db.query<any[]>(`SELECT COUNT(*) as total FROM nha_cung_cap ${where}`, params);
    const total = countRow?.total || 0;
    const data = await db.query<any[]>(
      `SELECT * FROM nha_cung_cap ${where} ORDER BY ngay_tao DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data, total, page, limit));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await db.queryOne('SELECT * FROM nha_cung_cap WHERE id = ?', [req.params.id]);
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, phone, email, taxCode, address, contactPerson, notes } = req.body;
    const result = await db.execute(
      `INSERT INTO nha_cung_cap (ma_nha_cung_cap, ten_nha_cung_cap, so_dien_thoai, email, ma_so_thue, dia_chi, nguoi_lien_he, ghi_chu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, phone || null, email || null, taxCode || null, address || null, contactPerson || null, notes || null]
    );
    const created = await db.queryOne('SELECT * FROM nha_cung_cap WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, phone, email, taxCode, address, contactPerson, notes, isActive } = req.body;
    await db.execute(
      `UPDATE nha_cung_cap SET ma_nha_cung_cap = ?, ten_nha_cung_cap = ?, so_dien_thoai = ?,
       email = ?, ma_so_thue = ?, dia_chi = ?, nguoi_lien_he = ?, ghi_chu = ?, trang_thai_hoat_dong = ? WHERE id = ?`,
      [code, name, phone || null, email || null, taxCode || null, address || null, contactPerson || null, notes || null, isActive !== false, req.params.id]
    );
    const updated = await db.queryOne('SELECT * FROM nha_cung_cap WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.execute('UPDATE nha_cung_cap SET trang_thai_hoat_dong = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã vô hiệu hóa nhà cung cấp' });
  } catch (e) { next(e); }
});

export default router;
