import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaSpinner, FaChevronRight, FaHome, FaShoppingBag } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const ProductCategoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams(location.search);
        const category = query.get('category');
        const group = query.get('group');
        const item = query.get('item');
        
        let url = 'http://localhost:8000/api/products/by-category?';
        if (category) url += `categoryDetails=${encodeURIComponent(category)}`;
        if (group) url += `&group=${encodeURIComponent(group)}`;
        if (item) url += `&item=${encodeURIComponent(item)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        const productsWithOffers = data.products || data;
        setProducts(productsWithOffers);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Unable to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const generateBreadcrumbPath = () => {
    const query = new URLSearchParams(location.search);
    const pathSegments = [
      { 
        name: 'Home', 
        icon: <FaHome className="mr-1.5 text-[#4C0ADA]" />,
        link: '/' 
      },
      {
        name: query.get('category'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}`
      },
      {
        name: query.get('group'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}&group=${encodeURIComponent(query.get('group') || '')}`
      },
      {
        name: query.get('item'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}&group=${encodeURIComponent(query.get('group') || '')}&item=${encodeURIComponent(query.get('item') || '')}`
      }
    ].filter(segment => segment.name);

    return (
      <nav className="flex items-center mb-6">
        <ol className="flex items-center space-x-1">
          {pathSegments.map((segment, index) => (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {index === 0 ? (
                  <Link 
                    to={segment.link} 
                    className="flex items-center text-[#4C0ADA] hover:text-[#3A0AA5] transition-colors font-medium"
                  >
                    {segment.icon}
                    <span>{segment.name}</span>
                  </Link>
                ) : index === pathSegments.length - 1 ? (
                  <span className="text-gray-600 flex items-center">
                    <FaChevronRight className="mx-2 text-gray-400 text-xs" />
                    <span className="font-semibold text-gray-800">{segment.name}</span>
                  </span>
                ) : (
                  <Link 
                    to={segment.link} 
                    className="flex items-center text-gray-600 hover:text-[#4C0ADA] transition-colors"
                  >
                    <FaChevronRight className="mx-2 text-gray-400 text-xs" />
                    <span>{segment.name}</span>
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb Navigation */}
      {generateBreadcrumbPath()}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0 capitalize">
          {new URLSearchParams(location.search).get('item') || 
           new URLSearchParams(location.search).get('group') || 
           new URLSearchParams(location.search).get('category') || 
           'All Products'}
        </h1>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <FaSpinner className="animate-spin text-3xl text-[#4C0ADA]" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : products.length > 0 ? (
        <>
          {/* Products Summary */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Showing <span className="font-medium text-gray-900">{products.flatMap(p => p.sellers).length}</span> products
            </p>

          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.flatMap(product => 
              product.sellers.map(sellerOffer => (
                <ProductCard 
                  key={`${product._id}-${sellerOffer.sellerId}`} 
                  product={product} 
                  sellerOffer={sellerOffer} 
                />
              ))
            )}
          </div>
        </>
      ): (
        <div className="max-w-md mx-auto text-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-[#4C0ADA]/10 rounded-full flex items-center justify-center">
            <FaShoppingBag className="w-16 h-16 text-[#4C0ADA]" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
          <p className="text-gray-600 mb-8">
            We couldn't find any products in this category. Try browsing other categories or check back later.
          </p>
          

        </div>
      )}
    </div>
  );
};

export default ProductCategoryPage;