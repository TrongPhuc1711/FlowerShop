import { Request, Response, NextFunction } from 'express';
import { shopService } from './shop.service';

export class ShopController {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopService.getCategories();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, sortBy, minPrice, maxPrice } = req.query;
      const data = await shopService.getProducts({
        search: search as string,
        categoryId: categoryId ? Number(categoryId) : undefined,
        sortBy: sortBy as any,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopService.getProductById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const data = await shopService.createOrder(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await shopService.getMyOrders(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await shopService.updateCustomerProfile(userId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const shopController = new ShopController();
