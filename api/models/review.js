import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewerName: {
    type: String,
    required: true,
    trim: true
  },
  reviewerDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000 // Limiting description length
  },
  reviewerRate: {
    type: Number,
    required: true,
    min: 1,
    max: 5 // 1-5 star rating system
  },
  isApproved: {
    type: Boolean,
    default: false // Optionally require admin approval before displaying
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;