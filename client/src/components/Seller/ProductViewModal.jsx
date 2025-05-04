import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaTag } from 'react-icons/fa';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import axios from 'axios';
import ProductEditForm from './ProductEditForm';
import ProductPromotionSection from './ProductPromotionSection';

const API_BASE_URL = 'http://localhost:8000/api';

const ProductViewModal = ({ product, onClose, onUpdate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [promotions, setPromotions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    price: 0,
    stock: 0,
    warranty: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      const sellerInfo = product.sellers?.[0] || {};
      setEditedProduct({
        price: sellerInfo.price || 0,
        stock: sellerInfo.stock || 0,
        warranty: sellerInfo.warranty || '',
        tags: sellerInfo.tags?.map(tag => tag.name || tag) || []
      });

      // Fetch promotions when product is available
      if (product._id) {
        fetchPromotions(product._id);
      }
    }
  }, [product]);

  const fetchPromotions = async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/promotions/product/${productId}`);
      setPromotions(response.data);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError('Failed to load promotions');
    }
  };

  if (!product) return null;

  const sellerInfo = product.sellers?.length > 0 ? product.sellers[0] : null;
  const price = isEditing ? editedProduct.price : sellerInfo?.price?.toFixed(2) || '0.00';
  const stock = isEditing ? editedProduct.stock : sellerInfo?.stock || 0;
  const warranty = isEditing ? editedProduct.warranty : sellerInfo?.warranty || 'N/A';
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const statusClass = stock > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200';

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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivatePromotion = async (promotionId) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/promotions/activate`, {
        productId: product._id,
        promotionId
      });
      // Refresh product data
      const response = await axios.get(`${API_BASE_URL}/products/${product._id}`);
      onUpdate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate promotion');
    } finally {
      setLoading(false);
    }
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-5 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name || 'Product Details'}</h2>
              <p className="text-sm text-gray-500 mt-1">SKU: {product.reference || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaEdit className="h-4 w-4" />
                <span>Edit Product</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Image Gallery Section */}
          <div className="lg:w-1/2 bg-gray-50 p-6 flex flex-col border-r border-gray-200">
            {/* Main Image View */}
            <div className="relative flex-1 flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-sm">
              {product.images?.length > 0 ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={`Product ${currentImageIndex + 1}`}
                    className="max-h-[450px] w-auto object-contain transition-transform duration-300 ease-in-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        <FaChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        <FaChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-5 right-5 flex flex-col space-y-2 bg-white/90 rounded-xl p-1.5 shadow-lg">
                    <button
                      onClick={handleZoomIn}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:text-indigo-600"
                      disabled={zoomLevel >= 3}
                    >
                      <FiZoomIn className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:text-indigo-600"
                      disabled={zoomLevel <= 1}
                    >
                      <FiZoomOut className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-5 left-5 bg-white/90 px-3 py-1.5 rounded-full text-sm shadow-lg font-medium">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-xl text-center p-8">
                  <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">No product images</p>
                  <p className="text-gray-400 text-sm mt-1">Add images to showcase this product</p>
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="mt-6 flex space-x-3 overflow-x-auto py-2 px-1">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setZoomLevel(1);
                    }}
                    className={`flex-shrink-0 h-24 w-24 rounded-xl overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${currentImageIndex === index ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'}`}
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
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Basic Info - Non-editable */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-5">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Product Information</h3>
                </div>
                <div className="space-y-4 pl-14">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Reference</p>
                      <p className="font-mono bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-200">{product.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</p>
                      <p className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm border border-blue-200">
                        {product.category?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</p>
                      <p className={`px-3 py-2 rounded-lg text-sm font-medium border ${statusClass}`}>
                        {status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {product.description || 'No description available'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Conditionally render either edit form or view mode */}
              {isEditing ? (
                <ProductEditForm
                  product={product}
                  sellerInfo={sellerInfo}
                  editedProduct={editedProduct}
                  onSave={handleSave}
                  onCancel={handleEditToggle}
                  onChange={handleChange}
                  loading={loading}
                />
              ) : (
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
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Price</p>
                          <p className="font-bold text-2xl text-indigo-600">${price}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock</p>
                          <div className="flex items-center space-x-4">
                            <p className="font-medium text-2xl">{stock}</p>
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${statusClass}`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Warranty</p>
                        <p className={`px-3 py-2 rounded-lg text-sm font-medium border inline-block ${warranty ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                          {warranty || 'No warranty'}
                        </p>
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
                      <div className="flex flex-wrap gap-2">
                        {displayTags.length > 0 ? (
                          displayTags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100 flex items-center"
                            >
                              <FaTag className="mr-2 h-3 w-3 text-indigo-500" />
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">No tags added to this product</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Promotion Section */}
                  <ProductPromotionSection 
                    product={product} 
                    promotions={promotions} 
                    onActivatePromotion={handleActivatePromotion}
                    loading={loading}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;