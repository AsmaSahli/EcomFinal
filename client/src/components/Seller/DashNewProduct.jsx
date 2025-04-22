import React, { useState, useEffect } from 'react';
import { FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import CategorySelector from './CategorySelector';
import TagSelector from './TagSelector';
import ImageUploader from './ImageUploader';
import { useSelector } from "react-redux";

const DashAddInventory = () => {
  // Get current user from Redux
  const currentUser =useSelector(state => state.user.currentUser);  console.log("Current User from Redux:", currentUser);// Add this line
  console.log("Current User ID:", currentUser?.id); // Add this line

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [],
    category: null,
    subcategory: null,
    tags: [],
    sellerId: currentUser?.id 
  });

  // Dynamic data state
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState({
    categories: true,
    tags: true,
    form: false,
    images: false
  });
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/categories'),
          axios.get('http://localhost:8000/api/product-tags')
        ]);
        
        setCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
        setTags(Array.isArray(tagsRes?.data) ? tagsRes.data : []);
        
        setLoading(prev => ({ ...prev, categories: false, tags: false }));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(prev => ({ ...prev, categories: false, tags: false }));
      }
    };
    fetchData();
  }, []);

  // Add new category handler
  const addNewCategory = async (categoryData) => {
    const { name, group, item } = categoryData;
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const response = await axios.post('http://localhost:8000/api/categories', {
        name,
        subcategories: [{
          group,
          items: [item]
        }]
      });
      
      setCategories(prev => [...prev, response.data]);
      setFormData(prev => ({ 
        ...prev, 
        category: response.data._id,
        subcategory: null
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Add subcategory to existing category handler
  const handleAddSubcategory = async (categoryId, subcategoryData) => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      
      // Find the category to update
      const categoryToUpdate = categories.find(c => c._id === categoryId);
      if (!categoryToUpdate) throw new Error('Category not found');
      
      // Prepare updated subcategories
      const updatedSubcategories = [
        ...(categoryToUpdate.subcategories || []),
        {
          group: subcategoryData.group,
          items: [subcategoryData.item]
        }
      ];
      
      // Make API call to update category
      const response = await axios.put(`http://localhost:8000/api/categories/${categoryId}`, {
        subcategories: updatedSubcategories
      });
      
      // Update local state
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId ? response.data : cat
      ));
      
      // Select the newly added subcategory
      setFormData(prev => ({
        ...prev,
        subcategory: {
          group: subcategoryData.group,
          item: subcategoryData.item
        }
      }));
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Tag functions
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
      const response = await axios.post('http://localhost:8000/api/product-tags', { name: tagName });
      
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
  
      // Create preview URLs for the images
      const imagePreviews = files.map(file => ({
        file, // Store the actual File object
        url: URL.createObjectURL(file) // Use 'url' instead of 'preview'
      }));
  
      // Update form data with the new image previews
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
      
      // Remove from local state
      setFormData(prev => {
        const updatedImages = [...prev.images];
        // Revoke the object URL to prevent memory leaks
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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, form: true }));
  
      const formDataToSend = new FormData();
      
      // Append all basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('sellerId',  currentUser.id.toString());
  
      // Handle subcategory as stringified JSON
      if (formData.subcategory) {
        formDataToSend.append('subcategory', JSON.stringify(formData.subcategory));
      }
  
      // Append each tag individually
      formData.tags.forEach(tag => {
        formDataToSend.append('tags', tag);
      });
  
      // Append image files
      formData.images.forEach((image) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
        }
      });
  
      const response = await axios.post(
        'http://localhost:8000/api/products',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
  
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        images: [],
        category: null,
        subcategory: null,
        tags: [],
        sellerId:''
      });
  
      setError(null);
      alert('Product created successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  if (loading.categories || loading.tags) {
    return <div className="text-center py-10">Loading data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <FaBoxOpen className="text-2xl text-purple-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Product Info */}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  price: parseFloat(e.target.value) || 0
                })}
                min="0"
                step="0.01"
                className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
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

        {/* Category Selection */}
        <CategorySelector 
          categories={categories}
          selectedCategory={formData.category}
          onSelectCategory={(categoryId) => setFormData(prev => ({ 
            ...prev, 
            category: categoryId,
            subcategory: null
          }))}
          selectedSubcategory={formData.subcategory}
          onSelectSubcategory={(subcategory) => setFormData(prev => ({ ...prev, subcategory }))}
          onAddNewCategory={addNewCategory}
          onAddSubcategoryToExisting={handleAddSubcategory}
        />

        {/* Tags Section */}
        <TagSelector
          tags={tags}
          selectedTags={formData.tags}
          onSelectTag={handleTagSelect}
          onRemoveTag={removeTag}
          onAddNewTag={addNewTag}
          loading={loading.form}
        />

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock*</label>
          <input
            type="number"
            name="stock"
            value={formData.stock || ''}
            onChange={(e) => setFormData({
              ...formData, 
              stock: parseInt(e.target.value) || 0
            })}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        {/* Image Upload */}
        <ImageUploader
          images={formData.images}
          onUpload={handleImageUpload}
          onRemove={removeImage}
          loading={loading.images}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading.form}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${loading.form ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.form ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashAddInventory;