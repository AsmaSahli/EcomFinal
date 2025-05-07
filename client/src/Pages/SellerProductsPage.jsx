import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { BsShop } from 'react-icons/bs';

const SellerProductsPage = () => {
  const { sellerId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/products/sellers/${sellerId}/products`);
        // Ensure response.data is an array; fallback to empty array if not
        const productsData = Array.isArray(response.data) ? response.data : [];
        setProducts(productsData);
        
        // Get shop name from the first product's seller info if available
        if (productsData.length > 0 && productsData[0].sellers?.length > 0) {
          setShopName(productsData[0].sellers[0].sellerId?.shopName || '');
        }
      } catch (error) {
        console.error('Error fetching seller products:', error);
        setError(error.response?.data?.message || 'Failed to load products');
        setProducts([]); // Ensure products is an array even on error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sellerId]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-600">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="container mx-auto p-4">No products found for this seller.</div>;
  }



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Premium Seller Header */}
      <div className="mb-8">
  <div className="flex items-center justify-center gap-4">
    {/* Shop Avatar */}
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
      <BsShop className="text-xl text-blue-500" />
    </div>

    {/* Shop Info */}
    <div className="text-center sm:text-left">
      <h1 className="text-2xl font-semibold text-gray-800 leading-tight">
        {shopName || "Seller Shop"}
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        {products.length} {products.length === 1 ? 'product' : 'products'} available
      </p>
    </div>
  </div>
</div>
  
      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {products.map((product) =>
            product.sellers.map((sellerOffer) => (
              <ProductCard
                key={`${product.id}-${sellerOffer.sellerId}`}
                product={product}
                sellerOffer={sellerOffer}
              />
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available from this seller</p>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;