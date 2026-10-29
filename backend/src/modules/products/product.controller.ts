import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { paginatedResponse } from '../../shared/utils';

export class ProductController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, total, page, limit } = await productService.findAll(req.query);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findById(Number(req.params.id));
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(Number(req.params.id), req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(Number(req.params.id));
      res.json({ success: true, message: 'Đã vô hiệu hóa sản phẩm' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
