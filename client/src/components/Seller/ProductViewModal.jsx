import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaSave, FaTag } from 'react-icons/fa';
import { FiZoomIn, FiZoomOut, FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const ProductViewModal = ({ product, onClose, onUpdate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    price: 0,
    stock: 0,
    warranty: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  useEffect(() => {
    if (product) {
      const sellerInfo = product.sellers?.[0] || {};
      setEditedProduct({
        price: sellerInfo.price || 0,
        stock: sellerInfo.stock || 0,
        warranty: sellerInfo.warranty || '',
        tags: sellerInfo.tags?.map(tag => tag.name || tag) || []
      });
    }
  }, [product]);

  if (!product) return null;

  const sellerInfo = product.sellers?.length > 0 ? product.sellers[0] : null;
  const price = isEditing ? editedProduct.price : sellerInfo?.price?.toFixed(2) || '0.00';
  const stock = isEditing ? editedProduct.stock : sellerInfo?.stock || 0;
  const warranty = isEditing ? editedProduct.warranty : sellerInfo?.warranty || 'N/A';
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const statusClass = stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % (product.images?.length || 1)
    );
    setZoomLevel(1);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + (product.images?.length || 1)) % (product.images?.length || 1)
    );
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1));

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      setEditedProduct(prev => ({
        ...prev,
        tags: [...prev.tags, newTagInput.trim()]
      }));
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (index) => {
    setEditedProduct(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSend = {
        price: parseFloat(editedProduct.price),
        stock: parseInt(editedProduct.stock),
        warranty: editedProduct.warranty,
        tags: editedProduct.tags
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/products/${product._id}/sellers/${product.sellers[0]._id}`,
        dataToSend
      );
      
      onUpdate(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const currentImage = product.images?.[currentImageIndex];
  const displayTags = isEditing ? editedProduct.tags : sellerInfo?.tags?.map(tag => tag.name || tag) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{product.name || 'Product Details'}</h2>
          <div className="flex items-center space-x-4">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaEdit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image Gallery Section */}
          <div className="md:w-1/2 bg-gray-100 p-4 flex flex-col">
            {/* Main Image View */}
            <div className="relative flex-1 flex items-center justify-center bg-white rounded-lg overflow-hidden">
              {product.images?.length > 0 ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={`Product ${currentImageIndex + 1}`}
                    className="max-h-[400px] object-contain transition-transform duration-300"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <FaChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <FaChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 bg-white/90 rounded-full p-1 shadow-lg">
                    <button
                      onClick={handleZoomIn}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all"
                      disabled={zoomLevel >= 3}
                    >
                      <FiZoomIn className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all"
                      disabled={zoomLevel <= 1}
                    >
                      <FiZoomOut className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm shadow-lg">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200 rounded-lg">
                  <p className="text-gray-500 text-lg">No images available</p>
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto py-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setZoomLevel(1);
                    }}
                    className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details Section */}
          <div className="md:w-1/2 p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Basic Info - Non-editable */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Product Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">Reference:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{product.reference || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">Category:</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {product.category?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">Description:</span>
                    <p className="flex-1 text-gray-700">
                      {product.description || 'No description available'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Seller Info - Editable */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Seller Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">Price:</span>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={editedProduct.price}
                          onChange={handleChange}
                          className="border rounded pl-8 pr-3 py-2 w-32"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-xl text-indigo-600">${price}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">Stock:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        name="stock"
                        value={editedProduct.stock}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-32"
                        min="0"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{stock}</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                          {status}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">Warranty:</span>
                    {isEditing ? (
                      <select
                        name="warranty"
                        value={editedProduct.warranty}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full max-w-xs"
                      >
                        <option value="">None</option>
                        <option value="1 year">1 year</option>
                        <option value="2 years">2 years</option>
                        <option value="3 years">3 years</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${warranty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {warranty || 'No warranty'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tags - Editable */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <FaTag className="mr-2 text-gray-500" />
                  Tags
                </h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editedProduct.tags.map((tag, index) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tag}
                          <button 
                            onClick={() => handleRemoveTag(index)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {isAddingTag ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          placeholder="Enter new tag"
                          className="border rounded px-3 py-1 flex-1 text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                          autoFocus
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setIsAddingTag(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingTag(true)}
                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                      >
                        <FiPlus className="mr-1" />
                        Add Tag
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayTags.length > 0 ? (
                      displayTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center"
                        >
                          <FaTag className="mr-1 h-3 w-3" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No tags added</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(product.updatedAt).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center"
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
                  'Save Changes'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;