import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getCategories,
  getBrands
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { addProductDefaults, ensureProductImages } from '../middleware/productDefaults.js';

const router = express.Router();

// Apply image defaults to all GET routes
router.use(ensureProductImages);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), addProductDefaults, createProduct);

router.get('/categories/list', getCategories);
router.get('/brands/list', getBrands);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), addProductDefaults, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.post('/:id/reviews', protect, createProductReview);

export default router;

// Made with Bob
