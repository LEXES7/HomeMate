import Review from '../models/review.js';

// Get all reviews (public)
export const getAllReviews = async (req, res, next) => {
  try {
    // By default, only return approved reviews for public display
    const query = req.query.showAll === 'true' ? {} : { isApproved: true };
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// Get review by ID
export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

// Create new review
export const createReview = async (req, res, next) => {
  try {
    const { reviewerName, reviewerDescription, reviewerRate } = req.body;

    // Validate required fields
    if (!reviewerName || !reviewerDescription || !reviewerRate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate rating is between 1 and 5
    if (reviewerRate < 1 || reviewerRate > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const newReview = new Review({
      reviewerName,
      reviewerDescription,
      reviewerRate
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    next(error);
  }
};

// Update review (admin only)
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewerName, reviewerDescription, reviewerRate, isApproved } = req.body;
    
    // Find and update the review
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        reviewerName,
        reviewerDescription,
        reviewerRate,
        isApproved
      },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// Delete review (admin only)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Approve review (admin only)
export const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review approved successfully', review });
  } catch (error) {
    next(error);
  }
};

// Get average rating
export const getAverageRating = async (req, res, next) => {
  try {
    const result = await Review.aggregate([
      { $match: { isApproved: true } },
      { 
        $group: {
          _id: null,
          averageRating: { $avg: '$reviewerRate' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        averageRating: parseFloat(result[0].averageRating.toFixed(1)),
        totalReviews: result[0].totalReviews
      });
    }
    
    res.status(200).json({ averageRating: 0, totalReviews: 0 });
  } catch (error) {
    next(error);
  }
};