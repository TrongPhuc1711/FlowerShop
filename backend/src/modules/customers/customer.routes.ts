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
      where = 'WHERE ho_ten LIKE ? OR so_dien_thoai LIKE ? OR ma_khach_hang LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [countRow] = await db.query<any[]>(`SELECT COUNT(*) as total FROM khach_hang ${where}`, params);
    const total = countRow?.total || 0;
    const data = await db.query<any[]>(
      `SELECT * FROM khach_hang ${where} ORDER BY ngay_tao DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data, total, page, limit));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await db.queryOne('SELECT * FROM khach_hang WHERE id = ?', [req.params.id]);
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, phone, email, address, birthday, notes } = req.body;
    const result = await db.execute(
      `INSERT INTO khach_hang (ma_khach_hang, ho_ten, so_dien_thoai, email, dia_chi, ngay_sinh, ghi_chu)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, phone || null, email || null, address || null, birthday || null, notes || null]
    );
    const created = await db.queryOne('SELECT * FROM khach_hang WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, phone, email, address, birthday, notes, isActive } = req.body;
    await db.execute(
      `UPDATE khach_hang SET ma_khach_hang = ?, ho_ten = ?, so_dien_thoai = ?,
       email = ?, dia_chi = ?, ngay_sinh = ?, ghi_chu = ?, trang_thai_hoat_dong = ? WHERE id = ?`,
      [code, name, phone || null, email || null, address || null, birthday || null, notes || null, isActive !== false, req.params.id]
    );
    const updated = await db.queryOne('SELECT * FROM khach_hang WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.execute('UPDATE khach_hang SET trang_thai_hoat_dong = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã vô hiệu hóa khách hàng' });
  } catch (e) { next(e); }
});

export default router;
