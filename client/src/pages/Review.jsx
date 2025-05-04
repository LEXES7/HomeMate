import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, Textarea, Rating, Alert, Card, Badge } from 'flowbite-react';
import { HiStar, HiOutlineStar } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Review() {
  const [formData, setFormData] = useState({
    reviewerName: '',
    reviewerDescription: '',
    reviewerRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await axios.get('/api/reviews/average');
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, reviewerRate: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Form validation
    if (!formData.reviewerName.trim()) {
      toast.error('Name is required');
      setLoading(false);
      return;
    }
    
    if (!formData.reviewerDescription.trim()) {
      toast.error('Review description is required');
      setLoading(false);
      return;
    }
    
    if (formData.reviewerRate < 1) {
      toast.error('Please provide a rating');
      setLoading(false);
      return;
    }
    
    try {
      await axios.post('/api/reviews', formData);
      setSuccess(true);
      toast.success('Thank you for your review! It will be visible after approval.');
      
      // Reset form
      setFormData({
        reviewerName: '',
        reviewerDescription: '',
        reviewerRate: 0
      });
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <ToastContainer theme="dark" />
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#A41FCD] to-[#FC9497] bg-clip-text text-transparent">
          Customer Reviews
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          We value your feedback! Share your experience with HomeMate and help us improve.
        </p>
        
        {/* Average Rating */}
        <div className="inline-flex items-center bg-gray-800 rounded-full px-6 py-3 shadow-xl mb-8">
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</span>
            <Rating>
              {[...Array(5)].map((_, index) => {
                const activeValue = Math.round(averageRating * 2) / 2;
                
                if (index + 0.5 === activeValue) {
                  return <Rating.Star key={index} filled={true} className="text-yellow-300" />;
                }
                
                return (
                  <Rating.Star key={index} filled={index < activeValue} className="text-yellow-300" />
                );
              })}
            </Rating>
          </div>
          <span className="ml-3 text-gray-300">({totalReviews} reviews)</span>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Review Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h2>
          
          {success && (
            <Alert color="success" className="mb-4">
              Thank you for your review! It will be visible after approval.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reviewerName" value="Your Name" />
              <TextInput
                id="reviewerName"
                placeholder="Enter your name"
                value={formData.reviewerName}
                onChange={handleChange}
                required
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="reviewerRate" value="Your Rating" />
              <div className="flex items-center mt-2">
                <Rating>
                  {[...Array(5)].map((_, index) => (
                    <Rating.Star
                      key={index}
                      filled={index < formData.reviewerRate}
                      onClick={() => handleRatingChange(index + 1)}
                      className="cursor-pointer text-yellow-300"
                    />
                  ))}
                </Rating>
                <span className="ml-2 text-gray-300">
                  {formData.reviewerRate > 0 ? `${formData.reviewerRate} out of 5` : 'Click to rate'}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="reviewerDescription" value="Your Review" />
              <Textarea
                id="reviewerDescription"
                placeholder="Tell us about your experience with HomeMate..."
                value={formData.reviewerDescription}
                onChange={handleChange}
                required
                rows={5}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Button
              type="submit"
              gradientDuoTone="purpleToPink"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            
          </form>
        </div>
        
        {/* Reviews List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">What Our Customers Say</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              {reviews.map((review) => (
                <motion.div key={review._id} variants={itemVariants}>
                  <Card className="bg-gray-800 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xl font-bold text-white">
                          {review.reviewerName}
                        </h5>
                        <div className="flex items-center mt-1 mb-2">
                          <Rating>
                            {[...Array(5)].map((_, index) => (
                              <Rating.Star
                                key={index}
                                filled={index < review.reviewerRate}
                                className="text-yellow-300 w-5 h-5"
                              />
                            ))}
                          </Rating>
                        </div>
                      </div>
                      <Badge color="gray" className="text-xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-gray-300">{review.reviewerDescription}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}