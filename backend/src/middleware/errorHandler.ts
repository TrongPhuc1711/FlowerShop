import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // MySQL duplicate entry
  if ((err as any).code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Dữ liệu đã tồn tại trong hệ thống',
    });
  }

  // MySQL foreign key constraint
  if ((err as any).code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Tham chiếu dữ liệu không hợp lệ',
    });
  }

  console.error('Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống',
    ...(env.nodeEnv === 'development' && { error: err.message, stack: err.stack }),
  });
}
