// ProductPromotionSection.js (new component)
import React, { useState } from 'react';
import { FaTag, FaPercentage, FaCalendarAlt } from 'react-icons/fa';

const ProductPromotionSection = ({ product, promotions, onActivatePromotion }) => {
  const [activeTab, setActiveTab] = useState('current');
  const [newPromotion, setNewPromotion] = useState({
    description: '',
    discountRate: 0,
    startDate: '',
    endDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromotion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would call an API to create the promotion
    console.log('New promotion:', newPromotion);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center mb-5">
        <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 mr-3">
          <FaTag className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Promotions</h3>
      </div>
      
      <div className="pl-14">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'current' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('current')}
          >
            Current Promotion
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'available' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('available')}
          >
            Available Promotions
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'new' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('new')}
          >
            Create New
          </button>
        </div>

        {activeTab === 'current' && (
          <div>
            {product.activePromotion ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800">{product.activePromotion.description}</h4>
                <div className="flex items-center mt-2 text-sm text-yellow-700">
                  <FaPercentage className="mr-2" />
                  <span>{product.activePromotion.discountRate}% discount</span>
                </div>
                <div className="flex items-center mt-1 text-sm text-yellow-700">
                  <FaCalendarAlt className="mr-2" />
                  <span>
                    {new Date(product.activePromotion.startDate).toLocaleDateString()} - 
                    {new Date(product.activePromotion.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active promotion</p>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-3">
            {promotions.length > 0 ? (
              promotions.map(promotion => (
                <div key={promotion._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <h4 className="font-medium">{promotion.description}</h4>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <FaPercentage className="mr-2" />
                    <span>{promotion.discountRate}% discount</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2" />
                    <span>
                      {new Date(promotion.startDate).toLocaleDateString()} - 
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onActivatePromotion(promotion._id)}
                    className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                  >
                    Activate Promotion
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No available promotions</p>
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={newPromotion.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
              <input
                type="number"
                name="discountRate"
                value={newPromotion.discountRate}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={newPromotion.startDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={newPromotion.endDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Promotion
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductPromotionSection;