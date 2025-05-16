import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard'; // Adjust the import path as needed

const SimilarProducts = ({ productId, sellerId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/products/similar-products`, {
          params: { productId, limit: 4, ...(sellerId && { sellerId }) }
        });
        setSimilarProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load similar products');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId, sellerId]);

  return (
    <div className="border-t border-gray-200 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-6 md:px-8">Similar Products</h2>
      {loading && (
        <div className="px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="px-6 md:px-8 text-center text-gray-500">
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && similarProducts.length === 0 && (
        <div className="px-6 md:px-8 text-center text-gray-500">
          <p>No similar products found.</p>
        </div>
      )}
      {!loading && !error && similarProducts.length > 0 && (
        <div className="px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => {
              const similarSeller = similarProduct.sellers[0]; // Assuming first seller for simplicity
              return (
                <ProductCard
                  key={`${similarProduct._id}-${similarSeller.sellerId._id}`}
                  product={similarProduct}
                  sellerOffer={similarSeller}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarProducts;