import React, { useState } from 'react';
import { FaSave, FaTag } from 'react-icons/fa';
import { FiPlus, FiX } from 'react-icons/fi';

const ProductEditForm = ({ 
  product, 
  sellerInfo, 
  editedProduct, 
  onSave, 
  onCancel, 
  onChange, 
  loading 
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      onChange({
        target: {
          name: 'tags',
          value: [...editedProduct.tags, newTagInput.trim()]
        }
      });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (index) => {
    onChange({
      target: {
        name: 'tags',
        value: editedProduct.tags.filter((_, i) => i !== index)
      }
    });
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
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={editedProduct.stock}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
                min="0"
              />
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

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-5">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 mr-3">
            <FaTag className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Product Tags</h3>
        </div>
        <div className="pl-14">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {editedProduct.tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100 transition-all duration-200 hover:bg-indigo-100"
                >
                  <FaTag className="mr-2 h-3 w-3 text-indigo-500" />
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(index)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors duration-200"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {isAddingTag ? (
              <div className="flex space-x-2 mt-3">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Enter new tag"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  autoFocus
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-all duration-200 shadow-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingTag(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mt-3 transition-colors duration-200"
              >
                <FiPlus className="mr-1.5" />
                Add New Tag
              </button>
            )}
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
          onClick={onSave}
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