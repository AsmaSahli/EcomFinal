import React, { useState, useEffect, useRef } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories || data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (categoryName) => {
    setIsDropdownOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`); // Encode categoryName
  };

  const handleGroupClick = (categoryName, groupName) => {
    setIsDropdownOpen(false);
    navigate(
      `/products?category=${encodeURIComponent(
        categoryName
      )}&group=${encodeURIComponent(groupName)}` // Encode both
    );
  };

  const handleItemClick = (categoryName, groupName, itemName) => {
    setIsDropdownOpen(false);
    navigate(
      `/products?category=${encodeURIComponent(
        categoryName
      )}&group=${encodeURIComponent(groupName)}&item=${encodeURIComponent(
        itemName
      )}` // Encode all
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
        aria-expanded={isDropdownOpen}
        disabled={loading}>
        <FaBars className="text-lg" />
        <span>{loading ? "Loading..." : "Categories"}</span>
      </button>

      {isDropdownOpen && !loading && (
        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-lg w-48 z-50 border border-gray-200 transition-opacity duration-300 ease-in-out">
          <ul className="p-2 text-sm">
            {categories.map((category, index) => (
              <li
                key={index}
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="relative group cursor-pointer">
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 transition-all">
                  {category.name}
                </button>

                {hoveredCategory === index && (
                  <div className="absolute left-full top-0 w-[750px] bg-white shadow-lg p-5 rounded-lg text-sm border border-gray-200 transition-all duration-300 ease-in-out">
                    <div className="grid grid-cols-4 gap-4">
                      {category.subcategories.map((group, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="p-4 bg-gray-100 rounded-lg hover:shadow-lg transition-all border border-gray-200">
                          <h3
                            onClick={() =>
                              handleGroupClick(category.name, group.group)
                            }
                            className="font-semibold text-gray-700 mb-2 border-b pb-1 text-[14px] uppercase tracking-wide cursor-pointer hover:text-blue-900">
                            {group.group}
                          </h3>
                          <ul className="space-y-1">
                            {group.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <button
                                  onClick={() =>
                                    handleItemClick(
                                      category.name,
                                      group.group,
                                      item
                                    )
                                  }
                                  className="block w-full text-left text-gray-600 hover:text-blue-900 transition-all text-xs cursor-pointer px-2 py-1 rounded hover:bg-blue-200">
                                  {item}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AllCategories;
