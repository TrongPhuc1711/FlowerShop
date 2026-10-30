import { Router } from 'express';
import { shopController } from './shop.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';

const router = Router();

// Public routes for flower shop browsing
router.get('/categories', (req, res, next) => shopController.getCategories(req, res, next));
router.get('/products', (req, res, next) => shopController.getProducts(req, res, next));
router.get('/products/:id', (req, res, next) => shopController.getProductById(req, res, next));

// Checkout order (guests or logged in customers)
router.post('/orders', optionalAuthenticate, (req, res, next) =>
  shopController.createOrder(req, res, next)
);

// Protected routes for logged in customers
router.get('/my-orders', authenticate, (req, res, next) =>
  shopController.getMyOrders(req, res, next)
);
router.put('/profile', authenticate, (req, res, next) =>
  shopController.updateProfile(req, res, next)
);

export default router;
