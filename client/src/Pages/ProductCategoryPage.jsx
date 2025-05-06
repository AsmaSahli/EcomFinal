import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
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
            
            // Transform the data to flatten seller offers
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
      { name: 'Home', value: 'home', link: '/' },
      {
        name: query.get('category'),
        value: query.get('category'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}` // Encode category
      },
      {
        name: query.get('group'),
        value: query.get('group'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}&group=${encodeURIComponent(query.get('group') || '')}` // Encode both
      },
      {
        name: query.get('item'),
        value: query.get('item'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}&group=${encodeURIComponent(query.get('group') || '')}&item=${encodeURIComponent(query.get('item') || '')}` // Encode all
      }
    ].filter(segment => segment.value);

    return (
      <div className="flex items-center text-sm text-gray-600 mb-6">
        {pathSegments.map((segment, index) => (
          <React.Fragment key={segment.value}>
            {index > 0 && <span className="mx-2">/</span>}
            {index === pathSegments.length - 1 ? (
              <span className="font-medium">{segment.name}</span>
            ) : (
              <Link to={segment.link} className="hover:text-blue-500">
                {segment.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {generateBreadcrumbPath()}

      {loading ? (
        <div className="flex justify-center">
          <FaSpinner className="animate-spin text-2xl" />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      ) : (
        <p className="text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
};

export default ProductCategoryPage;