import { db } from '../config/database';

async function setupCustomerSchema() {
  console.log('🌸 Setting up Customer role and schema updates...');
  try {
    // 1. Ensure CUSTOMER role exists
    const [roles] = await db.query<any[]>('SELECT id FROM vai_tro WHERE ma_vai_tro = ?', ['CUSTOMER']);
    if (!roles || roles.length === 0) {
      await db.execute(
        `INSERT INTO vai_tro (ma_vai_tro, ten_vai_tro, mo_ta)
         VALUES ('CUSTOMER', 'Khách hàng', 'Khách hàng mua sắm hoa tươi')`
      );
      console.log('Created CUSTOMER role in vai_tro');
    } else {
      console.log('ℹCUSTOMER role already exists');
    }

    // 2. Add nguoi_dung_id to khach_hang if missing
    const cols = await db.query<any[]>('DESCRIBE khach_hang');
    const hasNguoiDungId = cols.some((c: any) => c.Field === 'nguoi_dung_id');
    if (!hasNguoiDungId) {
      await db.execute(`
        ALTER TABLE khach_hang
        ADD COLUMN nguoi_dung_id BIGINT UNSIGNED NULL AFTER id,
        ADD CONSTRAINT fk_kh_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
      `);
      console.log('Added nguoi_dung_id column to khach_hang table');
    } else {
      console.log('ℹnguoi_dung_id already exists in khach_hang');
    }

    console.log('Setup completed successfully!');
  } catch (err: any) {
    console.error('Error during setup:', err.message);
  } finally {
    process.exit();
  }
}

setupCustomerSchema();
