import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProductSchema, updateProductSchema } from './product.schema';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => productController.findAll(req, res, next));
router.get('/:id', (req, res, next) => productController.findById(req, res, next));
router.post('/', validate(createProductSchema), (req, res, next) => productController.create(req, res, next));
router.put('/:id', validate(updateProductSchema), (req, res, next) => productController.update(req, res, next));
router.delete('/:id', (req, res, next) => productController.delete(req, res, next));

export default router;
