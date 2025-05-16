import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaChevronRight, FaPlus, FaMinus } from 'react-icons/fa';
import { IoMdCart } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setCart, removeItem, updateItemQuantity, clearCart } from '../redux/user/cartSlice';

const CartPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);

  const API_URL = 'http://localhost:8000/api/cart';

  useEffect(() => {
    if (currentUser?.id) {
      const fetchCart = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}?userId=${currentUser.id}&populate=productId,sellerId`);
          const validItems = response.data.items
            .filter(item => item._id && item.productId?._id && item.sellerId?._id)
            .map(item => ({
              ...item,
              productId: {
                ...item.productId,
                images: item.productId.images || [],
              },
              inStock: item.stock > 0,
            }));
          
          dispatch(setCart(validItems));
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load cart');
          toast.error('Failed to load your cart');
        } finally {
          setLoading(false);
        }
      };
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [currentUser, dispatch]);

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    try {
      await axios.delete(`${API_URL}/item`, { data: { userId: currentUser.id, itemId } });
      dispatch(removeItem(itemId));
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity, stock) => {
    if (quantity < 1) {
      toast.error('Quantity cannot be less than 1');
      return;
    }
    if (quantity > stock) {
      toast.error(`Quantity cannot exceed available stock (${stock})`);
      return;
    }

    setUpdatingQuantity(itemId);
    try {
      const response = await axios.put(`${API_URL}/item/quantity`, { userId: currentUser.id, itemId, quantity });
      dispatch(updateItemQuantity({ itemId, quantity }));
      toast.success('Quantity updated');
      return response.data.cart;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
      throw err;
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await axios.delete(API_URL, { data: { userId: currentUser.id } });
      dispatch(clearCart());
      toast.success('Cart cleared successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = (subtotal + shipping + tax).toFixed(2);

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4"
      >
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-50 mb-4">
            <IoMdCart className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your Shopping Cart</h2>
          <p className="text-gray-500 mb-6">
            Sign in to view your saved items and checkout
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm gap-2"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn btn-outline btn-primary btn-sm gap-2"
            >
              Create Account
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
      className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <IoMdCart className="text-3xl text-purple-600" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {cartItems.length}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Your Cart</h1>
              <p className="text-sm text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm"
            >
              <FaTrash className="w-3 h-3" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <span className="text-red-500">!</span>
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-sm"
            >
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-lg shadow-sm border p-6 text-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 relative mb-4 mx-auto">
              <IoMdCart className="h-full w-full text-purple-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-4">
              Start shopping to add items to your cart
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary btn-sm gap-1"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex p-3 gap-3">
                      {/* Product Image */}
                      <Link
                        to={`/products/${item.productId._id}?seller=${item.sellerId._id}`}
                        className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200"
                      >
                        <img
                          src={item.productId.images?.[0]?.url || 'https://via.placeholder.com/150'}
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className={`absolute top-0.5 right-0.5 text-[9px] px-1.5 py-0.5 rounded ${
                          item.inStock 
                            ? 'text-green-800 bg-green-100/90' 
                            : 'text-red-800 bg-red-100/90'
                        }`}>
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </Link>
                      
                      {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              to={`/products/${item.productId._id}?seller=${item.sellerId._id}`}
                              className="text-sm font-medium text-gray-800 hover:text-purple-600 line-clamp-2"
                            >
                              {item.productId.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              Sold by: {item.sellerId.shopName}
                            </p>
                            {item.promotion && (
                              <p className="text-xs text-red-600 mt-0.5">
                                Promotion: {item.promotion.promotionId.name} ({item.promotion.promotionId.discountRate}% OFF)
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={removingItem === item._id}
                            className="text-gray-400 hover:text-red-500 text-sm"
                          >
                            {removingItem === item._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <FaTrash className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        
                        <div className="mt-auto pt-2 flex items-end justify-between">
                          <div className="text-base font-bold text-gray-800">
                            ${item.price.toFixed(2)}
                            {item.promotion && (
                              <span className="text-xs text-gray-500 line-through ml-2">
                                ${item.promotion.oldPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                              <button
                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1, item.stock)}
                                disabled={item.quantity <= 1 || !item.inStock || updatingQuantity === item._id}
                                className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-xs"
                              >
                                {updatingQuantity === item._id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <FaMinus className="w-2.5 h-2.5" />
                                )}
                              </button>
                              <span className="px-2 py-0.5 text-center min-w-[1.5rem] text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1, item.stock)}
                                disabled={!item.inStock || updatingQuantity === item._id || item.quantity >= item.stock}
                                className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-xs"
                              >
                                {updatingQuantity === item._id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <FaPlus className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item Total */}
                    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex justify-between text-sm">
                      <span className="text-gray-500">Item total</span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-purple-600">${total}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary w-full gap-2 hover:shadow-lg transition-all"
                  disabled={cartItems.some(item => !item.inStock)}
                >
                  Proceed to Checkout
                  <FaChevronRight />
                </button>
                
                {cartItems.some(item => !item.inStock) && (
                  <div className="mt-4 text-sm text-red-500 text-center">
                    Please remove out of stock items to checkout
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <Link
                    to="/"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CartPage;