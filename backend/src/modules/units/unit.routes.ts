import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { db } from '../../config/database';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const data = await db.query<any[]>('SELECT * FROM don_vi_tinh ORDER BY id');
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, allowFraction } = req.body;
    const result = await db.execute(
      'INSERT INTO don_vi_tinh (ma_don_vi, ten_don_vi, cho_phep_le) VALUES (?, ?, ?)',
      [code, name, allowFraction || false]
    );
    const created = await db.queryOne('SELECT * FROM don_vi_tinh WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

export default router;
