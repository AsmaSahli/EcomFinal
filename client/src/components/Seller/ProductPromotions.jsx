import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { GiPresent } from 'react-icons/gi';

const API_BASE_URL = 'http://localhost:8000/api';

const ProductPromotions = ({ productId }) => {
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = useSelector(state => state.user.currentUser);
  const sellerId = currentUser.id;

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_BASE_URL}/promotions/seller/${sellerId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        // Find the active promotion that includes this product
        const activePromotion = response.data.promotions.find(
          (p) => p.isActive && p.applicableProducts.includes(productId)
        );
        setPromotion(activePromotion || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch promotion');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [productId, sellerId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg text-indigo-600 mr-3">
          <GiPresent className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Product Promotion</h3>
          <p className="text-sm text-gray-500">Current special offer for this product</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : promotion ? (
        <div className="space-y-4">
          {/* Promotion Banner */}
          {promotion.image?.url && (
            <div className="relative">
              <img
                src={promotion.image.url}
                alt={`${promotion.name} Banner`}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
                Promotion
              </span>
            </div>
          )}
          {/* Promotion Details */}
          <div className="p-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-50 text-green-600">
                <GiPresent className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{promotion.name}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span className="font-medium text-green-600">{promotion.discountRate}% off</span>
                  <span>
                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 mb-3">
            <GiPresent className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-1">No Active Promotion</h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            There is currently no active promotion for this product.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductPromotions;