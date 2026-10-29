import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError } from '../../shared/errors';
import { LoginInput, RegisterInput } from './auth.schema';
import { JwtPayload } from '../../middleware/auth';

export class AuthService {
  async login(input: LoginInput) {
    const user = await db.queryOne<any>(
      `SELECT nd.id, nd.ten_dang_nhap, nd.mat_khau_hash, nd.ho_ten,
              nd.trang_thai_hoat_dong, vt.ma_vai_tro, vt.ten_vai_tro
       FROM nguoi_dung nd
       JOIN vai_tro vt ON vt.id = nd.vai_tro_id
       WHERE nd.ten_dang_nhap = ?`,
      [input.username]
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
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.ten_dang_nhap,
        fullName: user.ho_ten,
        role: user.ma_vai_tro,
        roleName: user.ten_vai_tro,
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

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const result = await db.execute(
      `INSERT INTO nguoi_dung (vai_tro_id, ten_dang_nhap, mat_khau_hash, ho_ten, email, so_dien_thoai)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.roleId, input.username, hashedPassword, input.fullName, input.email || null, input.phone || null]
    );

    return { id: result.insertId, username: input.username };
  }

  async getProfile(userId: number) {
    const user = await db.queryOne<any>(
      `SELECT nd.id, nd.ten_dang_nhap, nd.ho_ten, nd.email, nd.so_dien_thoai,
              nd.trang_thai_hoat_dong, nd.lan_dang_nhap_cuoi, nd.ngay_tao,
              vt.ma_vai_tro, vt.ten_vai_tro
       FROM nguoi_dung nd
       JOIN vai_tro vt ON vt.id = nd.vai_tro_id
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
      isActive: user.trang_thai_hoat_dong,
      lastLogin: user.lan_dang_nhap_cuoi,
      createdAt: user.ngay_tao,
      role: user.ma_vai_tro,
      roleName: user.ten_vai_tro,
    };
  }
}

export const authService = new AuthService();
