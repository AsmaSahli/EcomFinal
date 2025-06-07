import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaSignInAlt, FaUserPlus, FaShoppingBag, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import { setWishlist, removeItem, clearWishlist } from '../redux/user/wishlistSlice';
import { useTranslation } from 'react-i18next';

const WishlistPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const API_URL = 'http://localhost:8000/api/wishlist';

  useEffect(() => {
    if (currentUser) {
      const fetchWishlist = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
          
          const transformedItems = response.data.items.map(item => {
            const product = item.productId;
            const sellers = product?.sellers || [];
            const selectedSeller = sellers.length > 0
              ? (item.sellerId
                  ? sellers.find(s => s.sellerId._id.toString() === item.sellerId._id.toString())
                  : sellers[0])
              : null;
              
            return {
              ...item,
              _id: item._id,
              productId: product,
              price: selectedSeller?.price || product?.price || 0,
              stock: selectedSeller?.stock || product?.stock || 0,
              sellerId: selectedSeller?.sellerId || item.sellerId
            };
          });
          
          dispatch(setWishlist(transformedItems));
        } catch (err) {
          setError(err.response?.data?.message || t('wishlist.errors.loadError'));
          toast.error(t('wishlist.errors.loadError'));
        } finally {
          setLoading(false);
        }
      };
      fetchWishlist();
    }
  }, [currentUser, dispatch, t]);

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    try {
      await axios.delete(`${API_URL}/item`, {
        data: { userId: currentUser.id, itemId }
      });
      dispatch(removeItem(itemId));
      toast.success(t('wishlist.success.itemRemoved'));
    } catch (err) {
      setError(err.response?.data?.message || t('wishlist.errors.removeError'));
      toast.error(t('wishlist.errors.removeError'));
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm(t('wishlist.errors.clearConfirm'))) return;
    
    setIsClearing(true);
    try {
      await axios.delete(API_URL, {
        data: { userId: currentUser.id }
      });
      dispatch(clearWishlist());
      toast.success(t('wishlist.success.wishlistCleared'));
    } catch (err) {
      setError(err.response?.data?.message || t('wishlist.errors.clearError'));
      toast.error(t('wishlist.errors.clearError'));
    } finally {
      setIsClearing(false);
    }
  };

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4"
      >
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 mb-6">
            <FaHeart className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('wishlist.authRequired.title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('wishlist.authRequired.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary gap-2"
            >
              <FaSignInAlt /> {t('wishlist.authRequired.signIn')}
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="btn btn-outline btn-primary gap-2"
            >
              <FaUserPlus /> {t('wishlist.authRequired.createAccount')}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="p-3 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 shadow-lg"
            >
              <FaHeart className="text-xl text-pink-600" />
            </motion.div>
            <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                {t('profile.wishlist.title')}
              </h2>
              <p className="text-gray-500">
                {wishlistItems.length} {wishlistItems.length === 1 ? t('wishlist.item') : t('wishlist.items')}
              </p>
            </div>
          </div>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearWishlist}
              disabled={isClearing}
              className={`btn btn-error btn-sm ${isClearing ? 'loading' : ''}`}
            >
              {!isClearing && <FaTrash className="mr-2" />}
              {t('wishlist.clearAll')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-purple-600"></span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-500 text-2xl">!</span>
              </div>
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                {t('cart.errors.tryAgain')}
              </button>
            </div>
          </div>
        ) : wishlistItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md mx-auto"
            >
              <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-4xl text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {t('wishlist.emptyWishlist.title')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('wishlist.emptyWishlist.description')}
              </p>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <FaShoppingBag />
                <span>{t('wishlist.emptyWishlist.button')}</span>
              </button>
            </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {wishlistItems.map((item) => {
                if (!item.productId) {
                  console.warn(`Wishlist item ${item._id} has no valid product`);
                  return null;
                }
                
                const sellerOffer = {
                  sellerId: item.sellerId,
                  price: item.price,
                  stock: item.stock,
                  reviews: item.productId.reviews || [],
                  promotions: item.productId.promotions || []
                };

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="card bg-white shadow-sm hover:shadow-md transition-shadow h-full">
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={removingItem === item._id}
                        className="absolute top-2 right-2 z-10 btn btn-circle btn-sm btn-ghost hover:bg-red-100 text-red-500"
                        aria-label={t('wishlist.clearAll')}
                      >
                        {removingItem === item._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          '✕'
                        )}
                      </button>
                      <ProductCard 
                        product={item.productId}
                        sellerOffer={sellerOffer}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default WishlistPage;