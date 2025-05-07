import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaSignInAlt, FaUserPlus, FaArrowRight, FaShoppingBag, FaTimes, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
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
          setWishlist(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch wishlist');
        } finally {
          setLoading(false);
        }
      };
      fetchWishlist();
    }
  }, [currentUser]);

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    try {
      const response = await axios.delete(`${API_URL}/item`, {
        data: { userId: currentUser.id, itemId }
      });
      setWishlist(response.data.wishlist);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Clear all items from your wishlist?')) return;
    
    setIsClearing(true);
    try {
      await axios.delete(API_URL, {
        data: { userId: currentUser.id }
      });
      setWishlist({ items: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear wishlist');
    } finally {
      setIsClearing(false);
    }
  };

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
          <div className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 mb-8">
            <FaHeart className="h-14 w-14 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist Awaits</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Sign in to save items you love and access them anytime
          </p>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-lg transition-all duration-300"
            >
              <FaSignInAlt className="mr-3" />
              Sign In
              <FaArrowRight className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
              className="group relative w-full flex justify-center items-center py-4 px-6 border-2 border-purple-600 text-lg font-medium rounded-xl text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-300"
            >
              <FaUserPlus className="mr-3" />
              Create Account
              <FaArrowRight className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
          <div className="flex items-center">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="mr-4"
            >
              <FaHeart className="text-4xl text-purple-600" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
              <p className="text-gray-500">Saved items you love</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {wishlist?.items?.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClearWishlist}
                disabled={isClearing}
                className={`p-2.5 rounded-full ${isClearing ? 'text-gray-400' : 'text-red-500 hover:bg-red-50'} transition-colors`}
                aria-label="Clear all items"
              >
                {isClearing ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaTrash className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full"
            ></motion.div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex flex-col items-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <FaTimes className="text-red-500 text-3xl" />
              </div>
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md"
              >
                Try Again
              </motion.button>
            </div>
          </div>
        ) : !wishlist || wishlist.items.length === 0 ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto"
          >
            <div className="mx-auto w-72 h-72 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full blur-md opacity-70"></div>
              <div className="absolute inset-4 flex items-center justify-center">
                <FaHeart className="h-full w-full text-purple-200" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-6">Your Wishlist is Empty</h3>
            <p className="text-gray-500 mb-8 text-lg">
              Discover amazing products and save them for later
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-lg transition-all duration-300 group"
            >
              <FaShoppingBag className="mr-3" />
              Start Shopping
              <FaArrowRight className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {wishlist.items.map((item) => {
                  if (!item.productId) {
                    console.warn(`Wishlist item ${item._id} has no valid product`);
                    return null;
                  }
                  const sellers = item.productId?.sellers || [];
                  const selectedSeller = sellers.length > 0
                    ? (item.sellerId
                        ? sellers.find(s => s.sellerId._id.toString() === item.sellerId._id.toString())
                        : sellers[0])
                    : null;

                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-all duration-300"></div>
                      <div className="relative h-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-3 right-3 z-10">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={removingItem === item._id}
                            className={`p-1.5 rounded-full shadow-md transition-all ${
                              removingItem === item._id ? 
                              'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                              'bg-white text-red-500 hover:bg-red-50 hover:text-red-600'
                            }`}
                            aria-label="Remove from wishlist"
                          >
                            {removingItem === item._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaTimes className="w-3.5 h-3.5" />
                            )}
                          </motion.button>
                        </div>
                        
                        <ProductCard
                          product={item.productId}
                          sellerOffer={{
                            sellerId: selectedSeller?.sellerId || null,
                            price: selectedSeller?.price || 0,
                            stock: selectedSeller?.stock || 0,
                            reviews: [],
                            promotions: [],
                          }}
                          isWishlisted={true}
                          onWishlistToggle={(productId, isAdded, sellerId) => handleRemoveItem(item._id)}
                          className="h-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

            {wishlist.items.length > 8 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClearWishlist}
                  disabled={isClearing}
                  className={`p-3 rounded-full ${isClearing ? 'text-gray-400' : 'text-red-500 hover:bg-red-50'} transition-colors`}
                  aria-label="Clear all items"
                >
                  {isClearing ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaTrash className="w-5 h-5" />
                  )}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default WishlistPage;