import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { RiTruckLine } from 'react-icons/ri';

const SimilarProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;

    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/products/related/${categoryId}`);
        // Filter out the current product
        const filteredProducts = response.data.products.filter(
          product => product._id !== currentProductId
        ).slice(0, 4);
        setProducts(filteredProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching similar products:', err);
        setError('Failed to load similar products');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [categoryId, currentProductId]);

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.floor(rating) ? (
          <FaStar key={i} className="text-yellow-400 w-4 h-4" />
        ) : (
          <FaRegStar key={i} className="text-gray-300 w-4 h-4" />
        )
      );
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">You may also like</h2>
        <div className="text-gray-500 text-center py-8">{error}</div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
        <Link 
          to={`/categories/${categoryId}`} 
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          View all in category →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product._id} 
            to={`/products/${product._id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
            <div className="relative pb-[100%] overflow-hidden">
              <img
                src={product.images?.[0]?.url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.promotions?.some(p => p.isActive) && (
                <div className="absolute top-2 left-2">
                  <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full font-medium">
                    {product.promotions.find(p => p.isActive).discountPercentage}% OFF
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1 group-hover:text-purple-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center mb-1">
                <div className="flex mr-1">
                  {renderStars(product.averageRating || 0)}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {product.averageRating?.toFixed(1) || 0} ({product.reviews?.length || 0})
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-base font-bold text-gray-900">
                    ${product.sellers?.[0]?.price?.toFixed(2) || product.price?.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <RiTruckLine className="mr-1" />
                  <span>Free</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;