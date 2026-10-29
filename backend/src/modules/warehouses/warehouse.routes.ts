import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { db } from '../../config/database';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const data = await db.query<any[]>('SELECT * FROM kho_hang ORDER BY ngay_tao DESC');
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await db.queryOne('SELECT * FROM kho_hang WHERE id = ?', [req.params.id]);
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, address } = req.body;
    const result = await db.execute(
      'INSERT INTO kho_hang (ma_kho, ten_kho, dia_chi) VALUES (?, ?, ?)',
      [code, name, address || null]
    );
    const created = await db.queryOne('SELECT * FROM kho_hang WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, address, isActive } = req.body;
    await db.execute(
      'UPDATE kho_hang SET ma_kho = ?, ten_kho = ?, dia_chi = ?, trang_thai_hoat_dong = ? WHERE id = ?',
      [code, name, address || null, isActive !== false, req.params.id]
    );
    const updated = await db.queryOne('SELECT * FROM kho_hang WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

export default router;
