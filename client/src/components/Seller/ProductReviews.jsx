import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaStar, FaRegStar } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  const currentUser = useSelector(state => state.user.currentUser);
  const sellerId = currentUser?.id;

  useEffect(() => {
    if (!productId || !sellerId) {
      setError('Missing product ID or seller ID');
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_BASE_URL}/reviews/${productId}/${sellerId}`
        );
        const fetchedReviews = response.data;
        setReviews(fetchedReviews);

        // Calculate average rating
        const avgRating = fetchedReviews.length > 0
          ? (fetchedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / fetchedReviews.length).toFixed(1)
          : 0;
        setAverageRating(parseFloat(avgRating));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, sellerId]);

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FaStar
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center mb-2">
        <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 mr-3">
          <FaStar className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
      </div>
      <div className="flex items-center mb-5">
        <div className="flex mr-2">{renderStars(averageRating)}</div>
        <span className="text-sm text-gray-600">
          {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2">Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <p className="text-gray-700 text-sm">{review.comment || 'No comment provided'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic text-center">No reviews for this product yet</p>
      )}
    </div>
  );
};

export default ProductReviews;