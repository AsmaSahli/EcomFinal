import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard'; // Import your ProductCard component

const SimilarProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/products/${currentProductId}/related?limit=4`
        );
        
        const filteredProducts = Array.isArray(response.data)
          ? response.data.filter(product => product._id !== currentProductId).slice(0, 4)
          : [];
          
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
  }, [currentProductId]);

  if (loading) {
    return (
      <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item} 
              className="bg-gray-100 rounded-xl h-80 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
        <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
          {error}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
        <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
          No similar products found.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
        {categoryId && (
          <Link 
            to={`/categories/${categoryId}`} 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors"
          >
            View all in category <span className="ml-1">→</span>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product._id}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ProductCard 
              product={product} 
              sellerOffer={product.sellers?.[0]} // Pass the first seller offer if available
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;