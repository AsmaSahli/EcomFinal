import React, { useState, useEffect } from 'react';
import { FiCopy, FiX, FiCalendar, FiPercent, FiGift, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/promotions';

const ReusePromotionModal = ({ show, onClose, onSelect, currentUser }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // Fetch user's promotions when modal opens
  useEffect(() => {
    if (show && currentUser?.id) {
      fetchPromotions();
    }
  }, [show, currentUser]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/${currentUser.id}`);
      setPromotions(response.data || []);
    } catch (err) {
      console.error('Fetch Promotions Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPromotion = (promotion) => {
    setSelectedPromotion(promotion);
  };

  const handleConfirmSelection = () => {
    if (selectedPromotion) {
      onSelect(selectedPromotion);
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with subtle animation */}
        <div
          className="fixed inset-0 transition-opacity duration-300 ease-in-out"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
        </div>

        {/* Modal container with slide-in animation */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Reuse Promotion Template
                </h3>
                <p className="mt-1 text-purple-100">
                  Select a previous promotion to reuse its settings
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-purple-200 transition-colors rounded-full hover:bg-white/10"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="bg-white px-6 py-5">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
                <FiX className="flex-shrink-0 h-5 w-5 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium">Error loading promotions</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading state with animated spinner */}
            {loading && (
              <div className="my-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-600">Loading your promotions...</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && promotions.length === 0 && !error && (
              <div className="my-12 text-center">
                <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-purple-50 text-purple-400 mb-4">
                  <FiGift className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No promotions found
                </h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  You haven't created any promotions yet. Start by creating your first promotion.
                </p>
              </div>
            )}

            {/* Promotions list */}
            {!loading && promotions.length > 0 && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {promotions.map((promotion) => (
                  <div
                    key={promotion._id}
                    className={`relative p-5 border-2 rounded-xl transition-all cursor-pointer ${
                      selectedPromotion?._id === promotion._id
                        ? 'border-purple-500 bg-purple-50/50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleSelectPromotion(promotion)}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Promotion image with hover effect */}
                      <div className="flex-shrink-0 w-full md:w-40 h-32 rounded-lg overflow-hidden border border-gray-200 relative group">
                        <img
                          src={promotion.image.url}
                          alt={promotion.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-sm font-medium">
                            {promotion.applicableProducts.length} {promotion.applicableProducts.length === 1 ? 'product' : 'products'}
                          </span>
                        </div>
                      </div>

                      {/* Promotion details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-xl font-semibold ${
                            selectedPromotion?._id === promotion._id
                              ? 'text-purple-700'
                              : 'text-gray-900'
                          }`}>
                            {promotion.name}
                          </h4>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {promotion.discountRate}% OFF
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="mr-2 text-purple-500" />
                            <span className="font-medium">Dates:</span>
                            <span className="ml-1">
                              {new Date(promotion.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })} - {new Date(promotion.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiGift className="mr-2 text-purple-500" />
                            <span className="font-medium">Products:</span>
                            <span className="ml-1">{promotion.applicableProducts.length}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            className={`flex items-center text-sm font-medium ${
                              selectedPromotion?._id === promotion._id
                                ? 'text-purple-600'
                                : 'text-gray-500 hover:text-purple-600'
                            } transition-colors`}
                          >
                            Select this template
                            <FiChevronRight className="ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedPromotion?._id === promotion._id && (
                      <div className="absolute top-3 right-3 bg-purple-500 text-white p-1 rounded-full">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedPromotion}
              className={`px-6 py-3 rounded-xl font-medium text-white transition-colors ${
                selectedPromotion
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Use Selected Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReusePromotionModal;