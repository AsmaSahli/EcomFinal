import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/products/${productId}/reviews`);
        setReviews(response.data.reviews);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8000/api/products/${productId}/reviews`, newReview);
      setReviews([...reviews, response.data.review]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.floor(rating) ? (
          <FaStar key={i} className="text-yellow-400 w-5 h-5" />
        ) : (
          <FaRegStar key={i} className="text-gray-300 w-5 h-5" />
        )
      );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading reviews</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Customer Reviews</h3>
        <button 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })}
        >
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-8 last:border-0">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex-shrink-0 flex items-center justify-center">
                  <FaUserCircle className="w-full h-full text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{review.userName || 'Anonymous'}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <div className="flex mr-2">
                      {renderStars(review.rating)}
                    </div>
                    <span className="ml-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      <div id="review-form" className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
        <form onSubmit={handleSubmitReview} className="max-w-2xl">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Your Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({...newReview, rating: star})}
                  className="mr-1 focus:outline-none"
                >
                  {star <= newReview.rating ? (
                    <FaStar className="text-yellow-400 w-8 h-8" />
                  ) : (
                    <FaRegStar className="text-gray-300 w-8 h-8 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductReviews;