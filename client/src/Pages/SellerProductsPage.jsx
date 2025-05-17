import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { BsShop } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const SellerProductsPage = () => {
  const { t, i18n } = useTranslation();
  const { sellerId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopName, setShopName] = useState('');

  const API_URL = 'http://localhost:8000/api/wishlist';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/products/sellers/${sellerId}/products`);
        const productsData = Array.isArray(response.data) ? response.data : [];
        setProducts(productsData);
        
        if (productsData.length > 0 && productsData[0].sellers?.length > 0) {
          setShopName(productsData[0].sellers[0].sellerId?.shopName || '');
        }
      } catch (error) {
        console.error('Error fetching seller products:', error);
        setError(error.response?.data?.message || t('sellerProductsPage.error'));
        setProducts([]);
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
          toast.error(t('sellerProductsPage.wishlistMessages.updateError'));
        }
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [sellerId, currentUser, dispatch, t]);

  const handleWishlistToggle = async (productId, isAdded, sellerId) => {
    if (!currentUser) {
      toast.error(t('sellerProductsPage.wishlistMessages.loginRequired'));
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
        toast.success(t('sellerProductsPage.wishlistMessages.added'));
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
          toast.success(t('sellerProductsPage.wishlistMessages.removed'));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('sellerProductsPage.wishlistMessages.updateError'));
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">{t('sellerProductsPage.loading')}</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-600">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="container mx-auto p-4">{t('sellerProductsPage.noProducts')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
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
            product.sellers.map((sellerOffer) => {
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('sellerProductsPage.emptyState')}</p>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;