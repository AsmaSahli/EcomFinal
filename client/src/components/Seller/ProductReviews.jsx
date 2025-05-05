import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = useSelector(state => state.user.currentUser);
  const sellerId = currentUser._id;

  useEffect(() => {
    if (!sellerId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_BASE_URL}/reviews/product/${productId}/seller/${sellerId}`,

        );
        setReviews(response.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId, sellerId]);


  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center mb-5">
        <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 mr-3">
          <FaStar className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-500">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-gray-700 text-sm">{review.comment || 'No comment provided'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No reviews for this product</p>
      )}
    </div>
  );
};

export default ProductReviews;