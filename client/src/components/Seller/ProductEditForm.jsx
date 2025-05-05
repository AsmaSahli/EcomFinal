import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';

const ProductEditForm = ({ 
  product, 
  sellerInfo, 
  editedProduct, 
  onSave, 
  onCancel, 
  onChange, 
  loading 
}) => {
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!editedProduct.price || editedProduct.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!editedProduct.stock || editedProduct.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateFields()) {
      onSave();
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-5">
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h3>
        </div>
        <div className="space-y-4 pl-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={editedProduct.price}
                  onChange={onChange}
                  className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200`}
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={editedProduct.stock}
                onChange={onChange}
                className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200`}
                min="0"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Warranty</label>
            <select
              name="warranty"
              value={editedProduct.warranty}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">None</option>
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="3 years">3 years</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FaSave className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default ProductEditForm;