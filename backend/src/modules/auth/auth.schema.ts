import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(80),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  fullName: z.string().min(1, 'Họ và tên không được để trống').max(150),
  email: z
    .string()
    .email('Email không đúng định dạng')
    .optional()
    .or(z.literal(''))
    .nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  address: z.string().optional().or(z.literal('')).nullable(),
  roleId: z.number().int().positive().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
