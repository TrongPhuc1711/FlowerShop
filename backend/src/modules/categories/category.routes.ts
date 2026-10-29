import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { db } from '../../config/database';
import { buildPagination, paginatedResponse } from '../../shared/utils';

const router = Router();
router.use(authenticate);

// GET all categories
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, page } = buildPagination(req.query);
    const [countRow] = await db.query<any[]>('SELECT COUNT(*) as total FROM danh_muc_san_pham');
    const total = countRow?.total || 0;
    const data = await db.query<any[]>(
      `SELECT dm.*, dmc.ten_danh_muc as ten_danh_muc_cha
       FROM danh_muc_san_pham dm
       LEFT JOIN danh_muc_san_pham dmc ON dmc.id = dm.danh_muc_cha_id
       ORDER BY dm.ngay_tao DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(paginatedResponse(data, total, page, limit));
  } catch (e) { next(e); }
});

// GET tree structure
router.get('/tree', async (_req, res, next) => {
  try {
    const data = await db.query<any[]>(
      `SELECT id, danh_muc_cha_id, ma_danh_muc, ten_danh_muc, trang_thai_hoat_dong
       FROM danh_muc_san_pham WHERE trang_thai_hoat_dong = 1 ORDER BY ten_danh_muc`
    );
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// GET by id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await db.queryOne('SELECT * FROM danh_muc_san_pham WHERE id = ?', [req.params.id]);
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    const { code, name, parentId, description, isActive } = req.body;
    const result = await db.execute(
      `INSERT INTO danh_muc_san_pham (ma_danh_muc, ten_danh_muc, danh_muc_cha_id, mo_ta, trang_thai_hoat_dong)
       VALUES (?, ?, ?, ?, ?)`,
      [code, name, parentId || null, description || null, isActive !== false]
    );
    const created = await db.queryOne('SELECT * FROM danh_muc_san_pham WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

// PUT update
router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, parentId, description, isActive } = req.body;
    await db.execute(
      `UPDATE danh_muc_san_pham SET ma_danh_muc = ?, ten_danh_muc = ?,
       danh_muc_cha_id = ?, mo_ta = ?, trang_thai_hoat_dong = ? WHERE id = ?`,
      [code, name, parentId || null, description || null, isActive !== false, req.params.id]
    );
    const updated = await db.queryOne('SELECT * FROM danh_muc_san_pham WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

// DELETE (soft)
router.delete('/:id', async (req, res, next) => {
  try {
    await db.execute('UPDATE danh_muc_san_pham SET trang_thai_hoat_dong = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã vô hiệu hóa danh mục' });
  } catch (e) { next(e); }
});

export default router;
