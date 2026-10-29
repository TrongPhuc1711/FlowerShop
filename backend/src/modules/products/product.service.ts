import { db } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { CreateProductInput, UpdateProductInput } from './product.schema';

export class ProductService {
  async findAll(query: any) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.search) {
      conditions.push('(sp.ten_san_pham LIKE ? OR sp.ma_sku LIKE ?)');
      params.push(`%${query.search}%`, `%${query.search}%`);
    }
    if (query.categoryId) {
      conditions.push('sp.danh_muc_id = ?');
      params.push(Number(query.categoryId));
    }
    if (query.type) {
      conditions.push('sp.loai_san_pham = ?');
      params.push(query.type);
    }
    if (query.isActive !== undefined) {
      conditions.push('sp.trang_thai_hoat_dong = ?');
      params.push(query.isActive === 'true' ? 1 : 0);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const [countResult] = await db.query<any[]>(
      `SELECT COUNT(*) as total FROM san_pham sp ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await db.query<any[]>(
      `SELECT sp.id, sp.ma_sku, sp.ten_san_pham, sp.loai_san_pham,
              sp.gia_ban, sp.gia_von_tham_khao, sp.ton_kho_toi_thieu,
              sp.theo_doi_lo, sp.so_ngay_su_dung_du_kien, sp.duong_dan_anh,
              sp.mo_ta, sp.trang_thai_hoat_dong, sp.ngay_tao,
              dm.ten_danh_muc, dvt.ten_don_vi,
              COALESCE(tk.so_luong, 0) as ton_kho
       FROM san_pham sp
       LEFT JOIN danh_muc_san_pham dm ON dm.id = sp.danh_muc_id
       LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
       LEFT JOIN (
         SELECT san_pham_id, SUM(so_luong) as so_luong
         FROM ton_kho_san_pham GROUP BY san_pham_id
       ) tk ON tk.san_pham_id = sp.id
       ${where}
       ORDER BY sp.ngay_tao DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data: rows, total, page, limit };
  }

  async findById(id: number) {
    const product = await db.queryOne<any>(
      `SELECT sp.*, dm.ten_danh_muc, dvt.ten_don_vi,
              COALESCE(tk.so_luong, 0) as ton_kho
       FROM san_pham sp
       LEFT JOIN danh_muc_san_pham dm ON dm.id = sp.danh_muc_id
       LEFT JOIN don_vi_tinh dvt ON dvt.id = sp.don_vi_tinh_id
       LEFT JOIN (
         SELECT san_pham_id, SUM(so_luong) as so_luong
         FROM ton_kho_san_pham GROUP BY san_pham_id
       ) tk ON tk.san_pham_id = sp.id
       WHERE sp.id = ?`,
      [id]
    );
    if (!product) throw new NotFoundError('Sản phẩm');
    return product;
  }

  async create(input: CreateProductInput) {
    const result = await db.execute(
      `INSERT INTO san_pham (danh_muc_id, don_vi_tinh_id, ma_sku, ten_san_pham,
        loai_san_pham, gia_ban, gia_von_tham_khao, ton_kho_toi_thieu,
        theo_doi_lo, so_ngay_su_dung_du_kien, duong_dan_anh, mo_ta, trang_thai_hoat_dong)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.categoryId || null, input.unitId, input.sku, input.name,
        input.type, input.price, input.refCostPrice, input.minStock,
        input.trackLot, input.shelfLifeDays || null, input.imageUrl || null,
        input.description || null, input.isActive,
      ]
    );
    return this.findById(result.insertId);
  }

  async update(id: number, input: UpdateProductInput) {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundError('Sản phẩm');

    const fields: string[] = [];
    const params: any[] = [];

    const mapping: Record<string, string> = {
      categoryId: 'danh_muc_id', unitId: 'don_vi_tinh_id', sku: 'ma_sku',
      name: 'ten_san_pham', type: 'loai_san_pham', price: 'gia_ban',
      refCostPrice: 'gia_von_tham_khao', minStock: 'ton_kho_toi_thieu',
      trackLot: 'theo_doi_lo', shelfLifeDays: 'so_ngay_su_dung_du_kien',
      imageUrl: 'duong_dan_anh', description: 'mo_ta', isActive: 'trang_thai_hoat_dong',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if ((input as any)[key] !== undefined) {
        fields.push(`${column} = ?`);
        params.push((input as any)[key]);
      }
    }

    if (fields.length > 0) {
      params.push(id);
      await db.execute(`UPDATE san_pham SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    await db.execute('UPDATE san_pham SET trang_thai_hoat_dong = FALSE WHERE id = ?', [id]);
  }
}

export const productService = new ProductService();
