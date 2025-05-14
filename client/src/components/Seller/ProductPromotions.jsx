import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaGift, FaCheckCircle, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { GiPresent } from 'react-icons/gi';

const API_BASE_URL = 'http://localhost:8000/api';

const ProductPromotions = ({ productId, onUpdate }) => {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    discountRate: '',
    startDate: '',
    endDate: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingPromotionId, setEditingPromotionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setPromotions(response.data.promotions);
        setFilteredPromotions(response.data.promotions);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch promotions');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [productId, sellerId]);

  useEffect(() => {
    let filtered = promotions;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter((p) => p.isActive && p.applicableProducts.includes(productId));
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((p) => !p.isActive || !p.applicableProducts.includes(productId));
    }

    setFilteredPromotions(filtered);
  }, [searchTerm, filterStatus, promotions, productId]);

  const validateForm = () => {
    const errors = {};
    if (!promotionForm.name.trim()) {
      errors.name = 'Promotion name is required';
    }
    const discountRate = parseFloat(promotionForm.discountRate);
    if (isNaN(discountRate)) {
      errors.discountRate = 'Please enter a valid discount rate';
    } else if (discountRate <= 0 || discountRate > 100) {
      errors.discountRate = 'Discount must be between 0.01% and 100%';
    }
    if (!promotionForm.startDate) {
      errors.startDate = 'Start date is required';
    }
    if (!promotionForm.endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(promotionForm.endDate) <= new Date(promotionForm.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    return errors;
  };

  const handleCreateOrUpdatePromotion = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please fix the form errors');
      setIsSubmitting(false);
      return;
    }

    try {
      setError(null);
      setFormErrors({});

      const requestData = {
        name: promotionForm.name.trim(),
        discountRate: parseFloat(promotionForm.discountRate),
        startDate: promotionForm.startDate,
        endDate: promotionForm.endDate,
        createdBy: sellerId,
      };

      if (formMode === 'create') {
        await axios.post(`${API_BASE_URL}/promotions`, requestData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.put(`${API_BASE_URL}/promotions/${editingPromotionId}`, requestData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
      }

      setPromotionForm({ name: '', discountRate: '', startDate: '', endDate: '' });
      setShowForm(false);
      setFormMode('create');
      setEditingPromotionId(null);

      const response = await axios.get(
        `${API_BASE_URL}/promotions/seller/${sellerId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setPromotions(response.data.promotions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promotion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/promotions/${promotionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPromotions(prev => prev.filter(p => p._id !== promotionId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePromotion = async (promotionId) => {
    if (!window.confirm('Are you sure you want to activate this promotion for this product?')) return;

    try {
      setLoading(true);
      setError(null);

      await axios.put(
        `${API_BASE_URL}/promotions/activate/${promotionId}/${productId}/${sellerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await axios.get(
        `${API_BASE_URL}/promotions/seller/${sellerId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setPromotions(response.data.promotions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPromotion = (promotion) => {
    setFormMode('edit');
    setEditingPromotionId(promotion._id);
    setPromotionForm({
      name: promotion.name,
      discountRate: promotion.discountRate.toString(),
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
    });
    setShowForm(true);
    setError(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPromotionForm(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setError(null);
    setFormMode('create');
    setEditingPromotionId(null);
    setPromotionForm({ name: '', discountRate: '', startDate: '', endDate: '' });
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg text-indigo-600 mr-3">
            <GiPresent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Product Promotions</h3>
            <p className="text-sm text-gray-500">Manage special offers for this product</p>
          </div>
        </div>
        <button
          onClick={toggleForm}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${
            showForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
          }`}
        >
          {showForm ? (
            <>
              <FaTimes className="h-4 w-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <FaPlus className="h-4 w-4" />
              <span>New Promotion</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search promotions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="all">All Promotions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <GiPresent className="text-indigo-600" />
            {formMode === 'create' ? 'Create New Promotion' : 'Edit Promotion'}
          </h4>
          <form onSubmit={handleCreateOrUpdatePromotion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name</label>
              <input
                type="text"
                name="name"
                value={promotionForm.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="e.g. Summer Sale, Holiday Special"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountRate"
                    value={promotionForm.discountRate}
                    onChange={handleInputChange}
                    min="0.01"
                    max="100"
                    step="0.01"
                    className={`w-full pl-3 pr-8 py-2 border ${formErrors.discountRate ? 'border-red-300' : 'border-gray-300'} rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="20"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                {formErrors.discountRate && <p className="mt-1 text-xs text-red-600">{formErrors.discountRate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={promotionForm.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.startDate ? 'border-red-300' : 'border-gray-300'} rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {formErrors.startDate && <p className="mt-1 text-xs text-red-600">{formErrors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={promotionForm.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.endDate ? 'border-red-300' : 'border-gray-300'} rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {formErrors.endDate && <p className="mt-1 text-xs text-red-600">{formErrors.endDate}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-md shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting && <FaSpinner className="animate-spin h-4 w-4" />}
                {formMode === 'create' ? 'Create Promotion' : 'Update Promotion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex justify-between items-center border border-red-100">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-500" />
        </div>
      ) : filteredPromotions.length > 0 ? (
        <div className="space-y-3">
          {filteredPromotions.map((promotion) => (
            <div
              key={promotion._id}
              className={`group p-4 rounded-xl border transition-all duration-200 ${
                promotion.isActive && promotion.applicableProducts.includes(productId)
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-white shadow-xs'
                  : 'border-gray-200 hover:border-indigo-200 bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        promotion.isActive && promotion.applicableProducts.includes(productId)
                          ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <FaGift className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{promotion.name}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span
                          className={`font-medium ${
                            promotion.isActive && promotion.applicableProducts.includes(productId)
                              ? 'text-green-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {promotion.discountRate}% off
                        </span>
                        <span>
                          {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {promotion.isActive && promotion.applicableProducts.includes(productId) ? (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                      <FaCheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivatePromotion(promotion._id)}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs disabled:bg-indigo-400 flex items-center gap-1"
                    >
                      {loading && <FaSpinner className="animate-spin h-3 w-3" />}
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleEditPromotion(promotion)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promotion._id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 mb-3">
            <GiPresent className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-1">
            {searchTerm || filterStatus !== 'all' ? 'No matching promotions' : 'No promotions yet'}
          </h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first promotion to offer special discounts'}
          </p>
          {!showForm && (
            <button
              onClick={toggleForm}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-md shadow-sm inline-flex items-center gap-2"
            >
              <FaPlus className="h-3 w-3" />
              Create Promotion
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPromotions;