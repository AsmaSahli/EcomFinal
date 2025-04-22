import React, { useState, useRef, useEffect } from 'react';
import { FaTag, FaChevronDown, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';

const TagSelector = ({ 
  tags, 
  selectedTags, 
  onSelectTag, 
  onRemoveTag,
  onAddNewTag,
  loading 
}) => {
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagRef.current && !tagRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tags
  const filteredTags = tags.filter(tag => 
    tag?.name?.toLowerCase().includes(tagInput.toLowerCase()) && 
    !selectedTags.includes(tag._id)
  );

  // Tag selection handler
  const handleTagSelect = (tagId) => {
    onSelectTag(tagId);
    setTagInput('');
  };

  // Helper function to get tag name
  const getTagName = (id) => {
    const tag = tags.find(t => t._id === id);
    return tag?.name || '';
  };

  return (
    <div ref={tagRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
      <div className="relative">
        <div 
          className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition"
          onClick={() => setShowTagDropdown(!showTagDropdown)}
          disabled={loading}
        >
          <span className={selectedTags.length > 0 ? "text-gray-800" : "text-gray-400"}>
            {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Select tags"}
          </span>
          <FaChevronDown className={`text-gray-400 transition-transform ${showTagDropdown ? 'transform rotate-180' : ''}`} />
        </div>
        
        {showTagDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 border-b">
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <div
                    key={tag._id}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleTagSelect(tag._id)}
                  >
                    <span className="flex-1">{tag.name}</span>
                    {selectedTags.includes(tag._id) && (
                      <FaCheck className="text-blue-600" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No matching tags found</div>
              )}
              
              {tagInput && !filteredTags.some(t => 
                t.name.toLowerCase() === tagInput.trim().toLowerCase()
              ) && (
                <div
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50 text-blue-600"
                  onClick={() => {
                    onAddNewTag(tagInput.trim());
                    setTagInput('');
                  }}
                >
                  <FaPlus className="mr-2" />
                  <span>Create "{tagInput.trim()}"</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tagId) => (
            <span 
              key={tagId} 
              className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
            >
              <FaTag className="mr-1 text-xs" />
              {getTagName(tagId)}
              <button
                type="button"
                onClick={() => onRemoveTag(tagId)}
                className="ml-2 text-blue-600 hover:text-blue-900"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;