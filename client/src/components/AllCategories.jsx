import React, { useState, useEffect, useRef } from "react";
import { FaBars } from "react-icons/fa";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
        aria-expanded={isDropdownOpen}
      >
        <FaBars className="text-lg" />
        <span>Categories</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-lg w-48 z-50 border border-gray-200 transition-opacity duration-300 ease-in-out">
          <ul className="p-2 text-sm">
            {categories.map((category, index) => (
              <li
                key={index}
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="relative group cursor-pointer"
              >
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 transition-all">
                  {category.name}
                </button>

                {hoveredCategory === index && (
                  <div className="absolute left-full top-0 w-[750px] bg-white shadow-lg p-5 rounded-lg text-sm border border-gray-200 transition-all duration-300 ease-in-out">
                    <div className="grid grid-cols-4 gap-4">
                      {category.subcategories.map((group, groupIndex) => (
                        <div key={groupIndex} className="p-4 bg-gray-100 rounded-lg hover:shadow-lg transition-all border border-gray-200">
                          <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1 text-[14px] uppercase tracking-wide">
                            {group.group}
                          </h3>
                          <ul className="space-y-1">
                            {group.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <a className="block text-gray-600 hover:text-blue-900 transition-all text-xs cursor-pointer px-2 py-1 rounded hover:bg-blue-200">
                                  {item}
                                </a>
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
