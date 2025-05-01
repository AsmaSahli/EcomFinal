import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import CategorySelector from './CategorySelector';
import TagSelector from './TagSelector';
import ImageUploader from './ImageUploader';
import { useSelector } from "react-redux";

const API_BASE_URL =  'http://localhost:8000/api';

const DashAddInventory = () => {
    const currentUser = useSelector(state => state.user.currentUser);
  
    const [formData, setFormData] = useState({
      reference: '',
      name: '',
      description: '',
      images: [],
      category: null,
      subcategory: null,
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
        category: product.category?._id || product.category,
        subcategory: product.subcategory || null,
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
        category: null,
        subcategory: null,
        tags: [],
        price: '',
        stock: ''
      });
      setError(null);
      setSuccess(null);
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

          const formDataToSend = new FormData();
          formDataToSend.append('reference', formData.reference);
          formDataToSend.append('name', formData.name);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('price', formData.price);
          formDataToSend.append('stock', formData.stock);
          formDataToSend.append('sellerId', currentUser.id);

          if (formData.category) {
            formDataToSend.append('category', formData.category);
          }

          if (formData.subcategory) {
            formDataToSend.append('subcategory', JSON.stringify(formData.subcategory));
          }

          formData.tags.forEach(tag => {
            formDataToSend.append('tags', tag);
          });

          formData.images.forEach((image) => {
            if (image.file) {
              formDataToSend.append('images', image.file);
            }
          });

          await axios.post(`${API_BASE_URL}/products`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setSuccess('Product created successfully!');
        }

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            reference: '',
            name: '',
            description: '',
            price: '',
            stock: '',
            images: [],
            category: null,
            subcategory: null,
            tags: []
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
              <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Existing product selected:</p>
                    <p><span className="font-medium">Name:</span> {selectedExistingProduct.name}</p>
                    {selectedExistingProduct.description && (
                      <p className="truncate"><span className="font-medium">Description:</span> {selectedExistingProduct.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change Product
                  </button>
                </div>
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
                selectedCategory={formData.category}
                selectedSubcategory={formData.subcategory}
                onSelectCategory={(categoryId) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: categoryId,
                    subcategory: null
                  }));
                }}
                onSelectSubcategory={(subcategory) => {
                  setFormData(prev => ({ ...prev, subcategory }));
                }}
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