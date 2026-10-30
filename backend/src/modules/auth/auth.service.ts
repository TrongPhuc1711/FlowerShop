import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError } from '../../shared/errors';
import { LoginInput, RegisterInput } from './auth.schema';
import { JwtPayload } from '../../middleware/auth';

export class AuthService {
  private async getCustomerRoleId(): Promise<number> {
    const role = await db.queryOne<{ id: number }>(
      'SELECT id FROM vai_tro WHERE ma_vai_tro = ?',
      ['CUSTOMER']
    );
    if (role) return role.id;

    // Auto-create if not exists
    const result = await db.execute(
      `INSERT INTO vai_tro (ma_vai_tro, ten_vai_tro, mo_ta)
       VALUES ('CUSTOMER', 'Khách hàng', 'Khách hàng mua sắm hoa sáp & hoa lụa')`
    );
    return result.insertId;
  }

  async login(input: LoginInput) {
    const user = await db.queryOne<any>(
      `SELECT nd.id, nd.ten_dang_nhap, nd.mat_khau_hash, nd.ho_ten, nd.email, nd.so_dien_thoai,
              nd.trang_thai_hoat_dong, vt.ma_vai_tro, vt.ten_vai_tro,
              kh.id as khach_hang_id, kh.ma_khach_hang, kh.dia_chi, kh.diem_tich_luy
       FROM nguoi_dung nd
       JOIN vai_tro vt ON vt.id = nd.vai_tro_id
       LEFT JOIN khach_hang kh ON kh.nguoi_dung_id = nd.id
       WHERE nd.ten_dang_nhap = ? OR (nd.email = ? AND nd.email IS NOT NULL AND nd.email != '')`,
      [input.username, input.username]
    );

    if (!user) {
      throw new UnauthorizedError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    if (!user.trang_thai_hoat_dong) {
      throw new UnauthorizedError('Tài khoản đã bị khóa');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.mat_khau_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    // Update last login
    await db.execute(
      'UPDATE nguoi_dung SET lan_dang_nhap_cuoi = NOW() WHERE id = ?',
      [user.id]
    );

    const payload: JwtPayload = {
      userId: user.id,
      username: user.ten_dang_nhap,
      roleCode: user.ma_vai_tro,
    };

    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        username: user.ten_dang_nhap,
        fullName: user.ho_ten,
        email: user.email,
        phone: user.so_dien_thoai,
        address: user.dia_chi || '',
        role: user.ma_vai_tro,
        roleName: user.ten_vai_tro,
        customerId: user.khach_hang_id || null,
        customerCode: user.ma_khach_hang || null,
        loyaltyPoints: user.diem_tich_luy || 0,
      },
    };
  }

  async register(input: RegisterInput) {
    const existing = await db.queryOne(
      'SELECT id FROM nguoi_dung WHERE ten_dang_nhap = ?',
      [input.username]
    );

    if (existing) {
      throw new ConflictError('Tên đăng nhập đã tồn tại');
    }

    if (input.email) {
      const existingEmail = await db.queryOne(
        'SELECT id FROM nguoi_dung WHERE email = ?',
        [input.email]
      );
      if (existingEmail) {
        throw new ConflictError('Email này đã được đăng ký');
      }
    }

    const roleId = input.roleId || (await this.getCustomerRoleId());
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const userResult = await db.execute(
      `INSERT INTO nguoi_dung (vai_tro_id, ten_dang_nhap, mat_khau_hash, ho_ten, email, so_dien_thoai)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        roleId,
        input.username,
        hashedPassword,
        input.fullName,
        input.email || null,
        input.phone || null,
      ]
    );

    const userId = userResult.insertId;

    // Check role details
    const role = await db.queryOne<{ ma_vai_tro: string; ten_vai_tro: string }>(
      'SELECT ma_vai_tro, ten_vai_tro FROM vai_tro WHERE id = ?',
      [roleId]
    );

    // If role is CUSTOMER (or customer fields supplied), create or link khach_hang record
    let customerId: number | null = null;
    let customerCode: string | null = null;

    if (!role || role.ma_vai_tro === 'CUSTOMER') {
      const code = `KH${String(userId).padStart(5, '0')}`;
      const khResult = await db.execute(
        `INSERT INTO khach_hang (nguoi_dung_id, ma_khach_hang, ho_ten, so_dien_thoai, email, dia_chi, diem_tich_luy)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          userId,
          code,
          input.fullName,
          input.phone || null,
          input.email || null,
          input.address || null,
        ]
      );
      customerId = khResult.insertId;
      customerCode = code;
    }

    // Auto login payload
    const payload: JwtPayload = {
      userId,
      username: input.username,
      roleCode: role?.ma_vai_tro || 'CUSTOMER',
    };

    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: userId,
        username: input.username,
        fullName: input.fullName,
        email: input.email || '',
        phone: input.phone || '',
        address: input.address || '',
        role: role?.ma_vai_tro || 'CUSTOMER',
        roleName: role?.ten_vai_tro || 'Khách hàng',
        customerId,
        customerCode,
        loyaltyPoints: 0,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await db.queryOne<any>(
      `SELECT nd.id, nd.ten_dang_nhap, nd.ho_ten, nd.email, nd.so_dien_thoai,
              nd.trang_thai_hoat_dong, nd.lan_dang_nhap_cuoi, nd.ngay_tao,
              vt.ma_vai_tro, vt.ten_vai_tro,
              kh.id as khach_hang_id, kh.ma_khach_hang, kh.dia_chi, kh.diem_tich_luy
       FROM nguoi_dung nd
       JOIN vai_tro vt ON vt.id = nd.vai_tro_id
       LEFT JOIN khach_hang kh ON kh.nguoi_dung_id = nd.id
       WHERE nd.id = ?`,
      [userId]
    );

    if (!user) {
      throw new UnauthorizedError('Người dùng không tồn tại');
    }

    return {
      id: user.id,
      username: user.ten_dang_nhap,
      fullName: user.ho_ten,
      email: user.email,
      phone: user.so_dien_thoai,
      address: user.dia_chi || '',
      isActive: user.trang_thai_hoat_dong,
      lastLogin: user.lan_dang_nhap_cuoi,
      createdAt: user.ngay_tao,
      role: user.ma_vai_tro,
      roleName: user.ten_vai_tro,
      customerId: user.khach_hang_id || null,
      customerCode: user.ma_khach_hang || null,
      loyaltyPoints: user.diem_tich_luy || 0,
    };
  }
}

export const authService = new AuthService();
