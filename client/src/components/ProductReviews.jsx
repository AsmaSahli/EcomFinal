import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaUserCircle, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const ProductReviews = ({ productId, sellerId }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/reviews/${productId}/${sellerId}`);
        setReviews(response.data);
        
        if (response.data.length > 0) {
          const avg = response.data.reduce((sum, review) => sum + review.rating, 0) / response.data.length;
          setAverageRating(avg.toFixed(1));
          
          const distribution = [0, 0, 0, 0, 0];
          response.data.forEach(review => {
            distribution[5 - review.rating]++;
          });
          setRatingDistribution(distribution);
          
          if (currentUser) {
            const hasReviewed = response.data.some(review => review.user?._id === currentUser.id);
            setUserHasReviewed(hasReviewed);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(t('productReviews.error.load'));
      } finally {
        setLoading(false);
      }
    };

    if (productId && sellerId) {
      fetchReviews();
    }
  }, [productId, sellerId, currentUser, t]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error(t('productReviews.form.loginRequired', { action: t('productReviews.form.actions.submit') }));
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/reviews`, {
        productId,
        sellerId,
        userId: currentUser.id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      const updatedReviews = [...reviews, response.data.review];
      setReviews(updatedReviews);
      setUserHasReviewed(true);
      setNewReview({ rating: 5, comment: '' });
      
      const newAvg = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / 
                     updatedReviews.length).toFixed(1);
      setAverageRating(newAvg);
      
      toast.success(t('productReviews.success.submit'), {
        position: 'bottom-right',
        className: '!bg-green-50 !text-green-700 !border !border-green-200',
        icon: <FaCheckCircle className="text-green-500" />
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t('productReviews.error.submit'), {
        className: '!bg-red-50 !text-red-700 !border !border-red-200'
      });
    }
  };

  const handleEditReview = async (review) => {
    setEditingReviewId(review._id);
    setEditForm({ rating: review.rating, comment: review.comment || '' });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error(t('productReviews.form.loginRequired', { action: t('productReviews.form.actions.update') }));
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/reviews/${editingReviewId}`, {
        userId: currentUser.id,
        rating: editForm.rating,
        comment: editForm.comment
      });
      const updatedReviews = reviews.map(r => (r._id === editingReviewId ? response.data.review : r));
      setReviews(updatedReviews);
      
      const newAvg = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / 
                     updatedReviews.length).toFixed(1);
      setAverageRating(newAvg);
      
      setEditingReviewId(null);
      setEditForm({ rating: 5, comment: '' });
      toast.success(t('productReviews.success.update'), {
        position: 'bottom-right',
        className: '!bg-green-50 !text-green-700 !border !border-green-200',
        icon: <FaCheckCircle className="text-green-500" />
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t('productReviews.error.update'), {
        className: '!bg-red-50 !text-red-700 !border !border-red-200'
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) {
      toast.error(t('productReviews.form.loginRequired', { action: t('productReviews.form.actions.delete') }));
      return;
    }

    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}/${currentUser.id}`);
      const updatedReviews = reviews.filter(r => r._id !== reviewId);
      setReviews(updatedReviews);
      setUserHasReviewed(false);
      
      const newAvg = updatedReviews.length > 0 ? 
        (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1) : 0;
      setAverageRating(newAvg);
      
      toast.success(t('productReviews.success.delete'), {
        position: 'bottom-right',
        className: '!bg-green-50 !text-green-700 !border !border-green-200',
        icon: <FaCheckCircle className="text-green-500" />
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t('productReviews.error.delete'), {
        className: '!bg-red-50 !text-red-700 !border !border-red-200'
      });
    }
  };

  const renderStars = (rating, size = 'md') => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };
    
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.floor(rating) ? (
          <FaStar key={i} className={`text-yellow-400 ${sizes[size]}`} />
        ) : (
          <FaRegStar key={i} className={`text-gray-300 ${sizes[size]}`} />
        )
      );
  };

  const renderRatingInput = (rating, setRating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`${t('productReviews.form.ratingLabel')} ${star}`}
          >
            {star <= rating ? (
              <FaStar className="text-yellow-400 w-8 h-8" />
            ) : (
              <FaRegStar className="text-gray-300 hover:text-yellow-400 w-8 h-8" />
            )}
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">{rating}.0</span>
      </div>
    );
  };

  const renderRatingBar = (starCount, index) => {
    const percentage = reviews.length > 0 ? (starCount / reviews.length) * 100 : 0;
    return (
      <div key={index} className="flex items-center mb-2">
        <span className="w-10 text-sm font-medium text-gray-600">{5 - index} star</span>
        <div className="flex-1 mx-2 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-10 text-right text-sm text-gray-500">
          {Math.round(percentage)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{t('productReviews.error.load')}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-purple-600 hover:text-purple-800 font-medium"
              >
                {t('productReviews.error.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Reviews Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('productReviews.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
            <div className="text-4xl font-bold text-gray-900 mb-1">{averageRating}</div>
            <div className="flex mb-2">
              {renderStars(averageRating, 'lg')}
            </div>
            <div className="text-sm text-gray-500">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          
          {/* Rating Distribution */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('productReviews.summary.breakdown')}</h3>
            <div className="space-y-2">
              {ratingDistribution.map((count, index) => renderRatingBar(count, index))}
            </div>
          </div>
        </div>
        
        {currentUser && !userHasReviewed && (
          <div className="mt-6 flex justify-end">
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })}
            >
              {t('productReviews.writeReview')}
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t('productReviews.noReviews.title')}</h3>
            <p className="mt-1 text-gray-500">
              {currentUser ? t('productReviews.noReviews.message.loggedIn') : t('productReviews.noReviews.message.loggedOut')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {review.user?.avatar ? (
                      <img 
                        src={review.user.avatar} 
                        alt={review.user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-purple-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.user?.name || t('productReviews.review.anonymous')}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex mr-2">
                          {renderStars(review.rating, 'md')}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(i18n.language, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {currentUser && review.user?._id === currentUser.id && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                          title={t('productReviews.review.edit')}
                          aria-label={t('productReviews.review.edit')}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t('productReviews.review.deleteConfirm'))) {
                              handleDeleteReview(review._id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title={t('productReviews.review.delete')}
                          aria-label={t('productReviews.review.delete')}
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingReviewId === review._id ? (
                    <form onSubmit={handleUpdateReview} className="mt-4">
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">{t('productReviews.form.ratingLabel')}</label>
                        {renderRatingInput(editForm.rating, (rating) => setEditForm({ ...editForm, rating }))}
                      </div>
                      <div className="mb-4">
                        <label htmlFor="edit-comment" className="block text-gray-700 font-medium mb-2">
                          {t('productReviews.form.commentLabel')}
                        </label>
                        <textarea
                          id="edit-comment"
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          value={editForm.comment}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
                        >
                          {t('productReviews.form.update')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          {t('productReviews.form.cancel')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-3 text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Form - Only show if user hasn't reviewed yet */}
      {currentUser && !userHasReviewed && (
        <div id="review-form" className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('productReviews.form.title')}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-3">{t('productReviews.form.ratingLabel')}</label>
                {renderRatingInput(newReview.rating, (rating) => setNewReview({ ...newReview, rating }))}
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-3">
                  {t('productReviews.form.commentLabel')}
                </label>
                <textarea
                  id="comment"
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={t('productReviews.form.commentPlaceholder')}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <FiSend className="mr-2" />
                {t('productReviews.form.submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message if user has already reviewed */}
      {currentUser && userHasReviewed && (
        <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex items-start">
            <FaCheckCircle className="flex-shrink-0 h-5 w-5 text-indigo-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">{t('productReviews.review.alreadyReviewed')}</h3>
              <p className="mt-1 text-sm text-indigo-700">
                {t('productReviews.review.editInstructions')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;