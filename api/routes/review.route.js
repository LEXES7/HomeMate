import express from 'express';
import { 
  getAllReviews, 
  getReviewById, 
  createReview, 
  updateReview, 
  deleteReview, 
  approveReview, 
  getAverageRating 
} from '../controllers/review.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/', getAllReviews); // Get all approved reviews
router.get('/average', getAverageRating); // Get average rating
router.post('/', createReview); // Submit a review

// Protected routes (authentication needed)
router.get('/:id', verifyToken, getReviewById); // Get specific review
router.put('/:id', verifyToken, verifyAdmin, updateReview); // Update review (admin only)
router.delete('/:id', verifyToken, verifyAdmin, deleteReview); // Delete review (admin only)
router.patch('/:id/approve', verifyToken, verifyAdmin, approveReview); // Approve review (admin only)

export default router;