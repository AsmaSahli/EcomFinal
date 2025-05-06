import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import CategorySelector from './CategorySelector';
import TagSelector from './TagSelector';
import ImageUploader from './ImageUploader';
import { useSelector } from "react-redux";

const API_BASE_URL = 'http://localhost:8000/api';

const DashAddInventory = () => {
    const currentUser = useSelector(state => state.user.currentUser);
  
    const [formData, setFormData] = useState({
      reference: '',
      name: '',
      description: '',
      images: [],
      categoryDetails: {
        category: null,
        subcategory: {
          group: '',
          item: ''
        }
      },
      tags: [],
      price: '',
      stock: ''
    });

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState({
      categories: true,
      tags: true,
      form: false,
      images: false,
      searching: false
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isExistingProduct, setIsExistingProduct] = useState(false);
    const [selectedExistingProduct, setSelectedExistingProduct] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [categoriesRes, tagsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/categories`),
            axios.get(`${API_BASE_URL}/product-tags`)
          ]);

          setCategories(categoriesRes?.data || []);
          setTags(tagsRes?.data || []);

          setLoading(prev => ({ 
            ...prev, 
            categories: false, 
            tags: false
          }));
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(prev => ({ 
            ...prev, 
            categories: false, 
            tags: false
          }));
        }
      };
      fetchData();
    }, []);

    const handleReferenceSearch = async (query) => {
      if (!query || query.length < 3) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, searching: true }));
        const response = await axios.get(`${API_BASE_URL}/products/search`, {
          params: { query }
        });
        setSearchResults(response.data || []);
        setShowSearchResults(true);
      } catch (err) {
        setSearchResults([]);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(prev => ({ ...prev, searching: false }));
      }
    };

    const selectProduct = (product) => {
      setIsExistingProduct(true);
      setSelectedExistingProduct(product);
      setShowSearchResults(false);
      
      setFormData(prev => ({
        ...prev,
        reference: product.reference,
        name: product.name,
        description: product.description,
        categoryDetails: product.categoryDetails || {
          category: product.category?._id || product.category,
          subcategory: product.subcategory || { group: '', item: '' }
        },
        images: product.images || [],
        price: '',
        stock: '',
        tags: []
      }));
      
      const existingSeller = product.sellers?.find(s => 
        s.sellerId.toString() === currentUser?.id
      );
      if (existingSeller) {
        setFormData(prev => ({
          ...prev,
          price: existingSeller.price,
          stock: existingSeller.stock,
          tags: existingSeller.tags || []
        }));
      }
    };

    const handleTagSelect = (tagId) => {
      if (!formData.tags.includes(tagId)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagId] }));
      }
    };

    const removeTag = (tagId) => {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(id => id !== tagId)
      }));
    };

    const addNewTag = async (tagName) => {
      if (!tagName) return;
      try {
        setLoading(prev => ({ ...prev, form: true }));
        const response = await axios.post(`${API_BASE_URL}/product-tags`, { name: tagName });
        setTags(prev => [...prev, response.data]);
        handleTagSelect(response.data._id);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      try {
        setLoading(prev => ({ ...prev, images: true }));

        const imagePreviews = files.map(file => ({
          file,
          url: URL.createObjectURL(file)
        }));

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...imagePreviews]
        }));
      } catch (err) {
        setError("Failed to process images");
      } finally {
        setLoading(prev => ({ ...prev, images: false }));
      }
    };

    const removeImage = async (index) => {
      try {
        setLoading(prev => ({ ...prev, images: true }));
        setFormData(prev => {
          const updatedImages = [...prev.images];
          if (updatedImages[index]?.url) {
            URL.revokeObjectURL(updatedImages[index].url);
          }
          updatedImages.splice(index, 1);
          return { ...prev, images: updatedImages };
        });
      } catch (err) {
        setError("Failed to remove image");
      } finally {
        setLoading(prev => ({ ...prev, images: false }));
      }
    };

    const resetForm = () => {
      setIsExistingProduct(false);
      setSelectedExistingProduct(null);
      setFormData({
        reference: formData.reference,
        name: '',
        description: '',
        images: [],
        categoryDetails: {
          category: null,
          subcategory: {
            group: '',
            item: ''
          }
        },
        tags: [],
        price: '',
        stock: ''
      });
      setError(null);
      setSuccess(null);
    };

    const handleAddNewCategory = async (newCategoryData) => {
      try {
        setLoading(prev => ({ ...prev, form: true }));
        const response = await axios.post(`${API_BASE_URL}/categories`, {
          name: newCategoryData.name,
          subcategories: [{
            group: newCategoryData.group,
            items: [newCategoryData.item]
          }]
        });
        
        setCategories(prev => [...prev, response.data]);
        setFormData(prev => ({
          ...prev,
          categoryDetails: {
            category: response.data._id,
            subcategory: {
              group: newCategoryData.group,
              item: newCategoryData.item
            }
          }
        }));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    const handleAddSubcategoryToExisting = async (categoryId, subcategoryData) => {
      try {
        setLoading(prev => ({ ...prev, form: true }));
        await axios.patch(`${API_BASE_URL}/categories/${categoryId}/subcategories`, {
          group: subcategoryData.group,
          items: [subcategoryData.item]
        });
        
        // Refresh categories
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!formData.reference) {
        return setError("Product reference is required");
      }

      if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
        return setError("Please enter a valid price");
      }

      if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
        return setError("Please enter a valid stock quantity");
      }

      if (!currentUser?.id) {
        return setError("User authentication failed");
      }

      try {
        setLoading(prev => ({ ...prev, form: true }));

        if (isExistingProduct) {
          await axios.post(
            `${API_BASE_URL}/products/${selectedExistingProduct._id}/sellers`,
            {
              sellerId: currentUser.id,
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock),
              tags: formData.tags
            }
          );
          setSuccess('Successfully added your offer to this product!');
        } else {
          if (!formData.name || !formData.description) {
            return setError("Name and description are required for new products");
          }

          if (!formData.categoryDetails.category || 
              !formData.categoryDetails.subcategory.group || 
              !formData.categoryDetails.subcategory.item) {
            return setError("Complete category details are required");
          }

          const formDataToSend = new FormData();
          formDataToSend.append('reference', formData.reference);
          formDataToSend.append('name', formData.name);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('price', formData.price);
          formDataToSend.append('stock', formData.stock);
          formDataToSend.append('sellerId', currentUser.id);
          
          // Append category details
          formDataToSend.append('categoryDetails[category]', formData.categoryDetails.category);
          formDataToSend.append('categoryDetails[subcategory][group]', formData.categoryDetails.subcategory.group);
          formDataToSend.append('categoryDetails[subcategory][item]', formData.categoryDetails.subcategory.item);

          // Append tags and images
          formData.tags.forEach(tag => formDataToSend.append('tags', tag));
          formData.images.forEach(image => {
            if (image.file) formDataToSend.append('images', image.file);
          });

          await axios.post(`${API_BASE_URL}/products`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setSuccess('Product created successfully!');
        }

        // Reset form after success
        setTimeout(() => {
          setFormData({
            reference: '',
            name: '',
            description: '',
            images: [],
            categoryDetails: {
              category: null,
              subcategory: {
                group: '',
                item: ''
              }
            },
            tags: [],
            price: '',
            stock: ''
          });
          setIsExistingProduct(false);
          setSelectedExistingProduct(null);
          setSearchResults([]);
          setSuccess(null);
        }, 2000);
        
      } catch (err) {
        console.error('Submission error:', err);
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           `Failed to ${isExistingProduct ? 'add offer' : 'create product'}`;
        setError(errorMessage);
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    if (loading.categories || loading.tags) {
      return (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-purple-600" />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <FaBoxOpen className="text-2xl text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">
            {isExistingProduct ? 'Add Your Offer to Existing Product' : 'Add New Product'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Reference Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Reference*
              {isExistingProduct && (
                <span className="ml-2 text-xs text-gray-500">(Search for existing products)</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={(e) => {
                  setFormData({...formData, reference: e.target.value});
                  handleReferenceSearch(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"
                required
                placeholder="Enter product reference..."
                disabled={isExistingProduct}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((product) => (
                  <div 
                    key={product._id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    onClick={() => selectProduct(product)}
                  >
                    <div className="font-semibold">{product.reference}</div>
                    <div className="text-sm text-gray-600">{product.name}</div>
                  </div>
                ))}
              </div>
            )}
            
            {loading.searching && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3">
                <div className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Searching...
                </div>
              </div>
            )}
            
            {isExistingProduct && selectedExistingProduct && (
              <div className="mt-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Product Image */}
                  {selectedExistingProduct.images?.length > 0 && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={selectedExistingProduct.images[0].url}
                        alt={selectedExistingProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 mb-2">
                          Existing Product
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {selectedExistingProduct.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Change
                      </button>
                    </div>
                    
                    {/* Metadata Grid */}
                    {selectedExistingProduct.categoryDetails && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs font-medium text-gray-500">Category</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {categories.find(c => c._id === selectedExistingProduct.categoryDetails.category)?.name || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs font-medium text-gray-500">Group</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {selectedExistingProduct.categoryDetails.subcategory.group}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs font-medium text-gray-500">Item</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {selectedExistingProduct.categoryDetails.subcategory.item}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Description with expand/collapse */}
                    {selectedExistingProduct.description && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-500">Description</p>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 hover:line-clamp-none transition-all">
                          {selectedExistingProduct.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Existing Offer Warning */}
                {selectedExistingProduct.sellers?.some(s => s.sellerId.toString() === currentUser?.id) && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center px-3 py-2 bg-yellow-50 rounded-md">
                      <svg className="flex-shrink-0 h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Existing offer detected</h3>
                        <div className="mt-1 text-sm text-yellow-700">
                          <p>You've already listed this product. Submitting will update your existing offer.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic Product Info - Only for new products */}
          {!isExistingProduct && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Category Selection - Only for new products */}
              <CategorySelector 
                categories={categories}
                selectedCategory={formData.categoryDetails.category}
                selectedSubcategory={formData.categoryDetails.subcategory}
                onSelectCategory={(categoryId) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    categoryDetails: {
                      category: categoryId,
                      subcategory: { group: '', item: '' }
                    }
                  }));
                }}
                onSelectSubcategory={(subcategory) => {
                  setFormData(prev => ({ 
                    ...prev,
                    categoryDetails: {
                      ...prev.categoryDetails,
                      subcategory
                    }
                  }));
                }}
                onAddNewCategory={handleAddNewCategory}
                onAddSubcategoryToExisting={handleAddSubcategoryToExisting}
              />
            </>
          )}

          {/* Seller-Specific Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Price*</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => setFormData({
                    ...formData, 
                    price: e.target.value
                  })}
                  min="0.01"
                  step="0.01"
                  className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Stock*</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={(e) => setFormData({
                  ...formData, 
                  stock: e.target.value
                })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Tags Section */}
          <TagSelector
            tags={tags}
            selectedTags={formData.tags}
            onSelectTag={handleTagSelect}
            onRemoveTag={removeTag}
            onAddNewTag={addNewTag}
            loading={loading.form}
          />

          {/* Image Upload - Only for new products */}
          {!isExistingProduct && (
            <ImageUploader
              images={formData.images}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              loading={loading.images}
            />
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading.form}
              className={`w-full flex justify-center items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${loading.form ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading.form ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  {isExistingProduct ? 'Adding Your Offer...' : 'Creating Product...'}
                </>
              ) : (
                isExistingProduct ? 'Add Your Offer' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    );
};

export default DashAddInventory;