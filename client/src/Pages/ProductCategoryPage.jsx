import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { FaSpinner, FaShoppingBag } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import BreadcrumbNav from '../components/BreadcrumbNav';
import { toast } from 'react-toastify';

const ProductCategoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const dispatch = useDispatch();

  const API_URL = 'http://localhost:8000/api/wishlist';

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
        
        const response = await axios.get(url);
        const productsWithOffers = Array.isArray(response.data.products) ? response.data.products : response.data;
        setProducts(productsWithOffers);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.response?.data?.message || 'Unable to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
          dispatch({ 
            type: 'wishlist/setWishlist', 
            payload: response.data.items.map(item => ({
              ...item,
              price: item.price || item.productId?.price || 0,
              stock: item.stock || item.productId?.stock || 0,
              productId: {
                ...item.productId,
                reviews: item.productId.reviews || [],
                promotions: item.productId.promotions || []
              }
            }))
          });
        } catch (err) {
          toast.error('Failed to load wishlist');
        }
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [location.search, currentUser, dispatch]);

  const handleWishlistToggle = async (productId, isAdded, sellerId) => {
    if (!currentUser) {
      toast.error('You must log in to manage your wishlist.');
      return;
    }

    try {
      if (isAdded) {
        const product = products.find(p => p._id === productId);
        const sellerOffer = product?.sellers.find(s => s.sellerId._id === sellerId);
        const response = await axios.post(`${API_URL}/add`, {
          userId: currentUser.id,
          productId,
          sellerId,
          price: sellerOffer?.price || product?.price || 0,
          stock: sellerOffer?.stock || product?.stock || 0
        });
        dispatch({
          type: 'wishlist/addItem',
          payload: {
            ...response.data.wishlist.items[response.data.wishlist.items.length - 1],
            price: sellerOffer?.price || product?.price || 0,
            stock: sellerOffer?.stock || product?.stock || 0
          }
        });
        toast.success('Added to wishlist');
      } else {
        const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
        const wishlist = response.data;
        const item = wishlist.items.find(
          item =>
            item.productId._id === productId &&
            (item.sellerId?._id === sellerId || (!item.sellerId && !sellerId))
        );
        if (item) {
          await axios.delete(`${API_URL}/item`, {
            data: { userId: currentUser.id, itemId: item._id }
          });
          dispatch({ type: 'wishlist/removeItem', payload: item._id });
          toast.success('Removed from wishlist');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav />

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
                <path fillRule="evenodd" d="10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              product.sellers.map(sellerOffer => {
                const isWishlisted = wishlistItems.some(
                  item =>
                    item.productId._id === product._id &&
                    (item.sellerId?._id === sellerOffer.sellerId._id || (!item.sellerId && !sellerOffer.sellerId))
                );
                return (
                  <ProductCard 
                    key={`${product._id}-${sellerOffer.sellerId._id}`} 
                    product={product} 
                    sellerOffer={sellerOffer} 
                    isWishlisted={isWishlisted}
                    onWishlistToggle={handleWishlistToggle}
                  />
                );
              })
            )}
          </div>
        </>
      ) : (
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