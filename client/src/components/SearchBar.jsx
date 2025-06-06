import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHistory, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/products/suggestions', {
          params: { q: query },
        });
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts();
  };

  // Main search function
  const searchProducts = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      // Update recent searches
      const updatedSearches = [
        trimmedQuery,
        ...recentSearches.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    const updatedSearches = [
      suggestion,
      ...recentSearches.filter(item => item.toLowerCase() !== suggestion.toLowerCase())
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    searchProducts();
  };

  // Clear search input
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  // Remove recent search item
  const removeRecentSearch = (searchTerm, e) => {
    e.stopPropagation();
    const updatedSearches = recentSearches.filter(item => item !== searchTerm);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full pl-12 pr-10 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        <button 
          type="submit" 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
          aria-label="Search"
        >
          <FaSearch className="text-lg" />
        </button>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </form>

      {/* Enhanced Dropdown */}
      {isFocused && (suggestions.length > 0 || recentSearches.length > 0 || query) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Loading state */}
          {isLoading && (
            <div className="px-4 py-3 text-gray-500 flex items-center animate-pulse">
              <div className="mr-3 h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Searching...
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                Popular Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    <FaSearch className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="font-medium">{suggestion}</span>
                  </div>
                  <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {!isLoading && query.length === 0 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 flex items-center justify-between">
                <span>Recent Searches</span>
                <button 
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((searchTerm, index) => (
                <div
                  key={index}
                  className="px-4 py-3 text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                  onClick={() => handleSuggestionClick(searchTerm)}
                >
                  <div className="flex items-center">
                    <FaHistory className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="font-medium">{searchTerm}</span>
                  </div>
                  <button
                    onClick={(e) => removeRecentSearch(searchTerm, e)}
                    className="text-gray-300 hover:text-red-500 p-1 rounded-full transition-colors"
                    aria-label="Remove recent search"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Direct search option */}
          {!isLoading && query.length > 0 && (
            <div 
              className="px-4 py-3 bg-blue-50 text-blue-600 font-medium cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors"
              onClick={searchProducts}
            >
              <div className="flex items-center">
                <FaSearch className="mr-3" />
                <span>Search for "{query}"</span>
              </div>
              <FaArrowRight />
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="px-4 py-3 text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;