import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaPlus } from 'react-icons/fa';

const CategorySelector = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  selectedSubcategory, 
  onSelectSubcategory,
  onAddNewCategory,
  onAddSubcategoryToExisting
}) => {
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    group: '',
    item: ''
  });
  const [newSubcategoryData, setNewSubcategoryData] = useState({
    group: '',
    item: ''
  });
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);

  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (subcategoryRef.current && !subcategoryRef.current.contains(event.target)) {
        setShowSubcategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current category object
  const getCurrentCategory = () => {
    return categories.find(cat => cat._id === selectedCategory) || null;
  };

  // Get all subcategory items from current category
  const getSubcategoryItems = () => {
    const category = getCurrentCategory();
    if (!category || !Array.isArray(category.subcategories)) return [];
    
    return category.subcategories.flatMap(group => 
      Array.isArray(group.items) ? 
        group.items.map(item => ({
          group: group.group,
          item
        })) : 
        []
    );
  };

  // Filter categories based on input
  const filteredCategories = categories.filter(cat => 
    cat?.name?.toLowerCase().includes(categoryInput.toLowerCase())
  );

  // Category selection handler
  const handleCategorySelect = (categoryId) => {
    onSelectCategory(categoryId);
    setShowCategoryDropdown(false);
    setCategoryInput('');
    setShowAddSubcategory(false);
  };

  // Subcategory selection handler
  const handleSubcategorySelect = (subcategory) => {
    onSelectSubcategory(subcategory);
    setShowSubcategoryDropdown(false);
    setShowAddSubcategory(false);
  };

  // Helper function to get category name
  const getCategoryName = (id) => {
    const category = categories.find(c => c._id === id);
    return category?.name || '';
  };

  // Add subcategory to existing category
  const handleAddSubcategory = async () => {
    const { group, item } = newSubcategoryData;
    if (!group || !item) return;

    try {
      await onAddSubcategoryToExisting(selectedCategory, newSubcategoryData);
      setNewSubcategoryData({ group: '', item: '' });
      setShowAddSubcategory(false);
    } catch (error) {
      console.error('Failed to add subcategory:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Dropdown */}
      <div ref={categoryRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
        <div className="relative">
          <div 
            className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-purple-500 transition"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <span className={selectedCategory ? "text-gray-800" : "text-gray-400"}>
              {selectedCategory ? getCategoryName(selectedCategory) : "Select a category"}
            </span>
            <FaChevronDown className={`text-gray-400 transition-transform ${showCategoryDropdown ? 'transform rotate-180' : ''}`} />
          </div>
          
          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="p-2 border-b">
                <div className="relative">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    autoFocus
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category._id}
                      className={`flex items-center px-4 py-2 cursor-pointer hover:bg-purple-50 ${selectedCategory === category._id ? 'bg-purple-100' : ''}`}
                      onClick={() => handleCategorySelect(category._id)}
                    >
                      <span className="flex-1">{category.name}</span>
                      {selectedCategory === category._id && (
                        <FaCheck className="text-purple-600" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No matching categories found</div>
                )}
                
                {categoryInput && !filteredCategories.some(c => 
                  c.name.toLowerCase() === categoryInput.trim().toLowerCase()
                ) && (
                  <div
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-purple-50 text-purple-600"
                    onClick={() => {
                      setNewCategoryData(prev => ({ ...prev, name: categoryInput.trim() }));
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <FaPlus className="mr-2" />
                    <span>Create "{categoryInput.trim()}"</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subcategory Dropdown */}
      <div ref={subcategoryRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory*</label>
        <div className="relative">
          <div 
            className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-purple-500 transition"
            onClick={() => selectedCategory && setShowSubcategoryDropdown(!showSubcategoryDropdown)}
            style={{
              backgroundColor: !selectedCategory ? '#f3f4f6' : 'white',
              cursor: !selectedCategory ? 'not-allowed' : 'pointer'
            }}
          >
            <span className={selectedSubcategory ? "text-gray-800" : "text-gray-400"}>
              {selectedSubcategory ? `${selectedSubcategory.group} > ${selectedSubcategory.item}` : 
               (selectedCategory ? "Select a subcategory" : "Select category first")}
            </span>
            <FaChevronDown className={`text-gray-400 transition-transform ${showSubcategoryDropdown ? 'transform rotate-180' : ''}`} />
          </div>
          
          {showSubcategoryDropdown && selectedCategory && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                {getSubcategoryItems().length > 0 ? (
                  <>
                    {getSubcategoryItems().map((subcat, index) => (
                      <div
                        key={index}
                        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-purple-50 ${JSON.stringify(selectedSubcategory) === JSON.stringify(subcat) ? 'bg-purple-100' : ''}`}
                        onClick={() => handleSubcategorySelect(subcat)}
                      >
                        <span className="flex-1">{subcat.group} &gt; {subcat.item}</span>
                        {JSON.stringify(selectedSubcategory) === JSON.stringify(subcat) && (
                          <FaCheck className="text-purple-600" />
                        )}
                      </div>
                    ))}
                    <div
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-purple-50 text-purple-600 border-t"
                      onClick={() => {
                        setShowSubcategoryDropdown(false);
                        setShowAddSubcategory(true);
                      }}
                    >
                      <FaPlus className="mr-2" />
                      <span>Add new subcategory</span>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No subcategories available
                    <div
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-purple-50 text-purple-600 mt-2"
                      onClick={() => {
                        setShowSubcategoryDropdown(false);
                        setShowAddSubcategory(true);
                      }}
                    >
                      <FaPlus className="mr-2" />
                      <span>Add new subcategory</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Category Section */}
      {newCategoryData.name && (
        <div className="col-span-full border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Create New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
              <input
                type="text"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name*</label>
              <input
                type="text"
                value={newCategoryData.group}
                onChange={(e) => setNewCategoryData({...newCategoryData, group: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Types"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name*</label>
              <input
                type="text"
                value={newCategoryData.item}
                onChange={(e) => setNewCategoryData({...newCategoryData, item: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Smartphones"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onAddNewCategory(newCategoryData)}
              disabled={!newCategoryData.group || !newCategoryData.item}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
            >
              Create Category
            </button>
            <button
              type="button"
              onClick={() => {
                setNewCategoryData({ name: '', group: '', item: '' });
                setCategoryInput('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Subcategory to Existing Category Section */}
      {showAddSubcategory && selectedCategory && (
        <div className="col-span-full border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Add Subcategory to {getCategoryName(selectedCategory)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name*</label>
              <input
                type="text"
                value={newSubcategoryData.group}
                onChange={(e) => setNewSubcategoryData({...newSubcategoryData, group: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Types"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name*</label>
              <input
                type="text"
                value={newSubcategoryData.item}
                onChange={(e) => setNewSubcategoryData({...newSubcategoryData, item: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Smartphones"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleAddSubcategory}
              disabled={!newSubcategoryData.group || !newSubcategoryData.item}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
            >
              Add Subcategory
            </button>
            <button
              type="button"
              onClick={() => {
                setNewSubcategoryData({ group: '', item: '' });
                setShowAddSubcategory(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;