import React, { useState } from 'react';
import { FaSearch, FaRegHeart, FaHeart, FaUserPlus, FaStore, FaTruck, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/ecomLogo.png';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';
import { toast } from 'react-toastify';
import AllCategories from './AllCategories';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user?.currentUser);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const dispatch = useDispatch();
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);

  const wishlistCount = wishlistItems.length;
  const cartCount = cartItems.length;
  const cartTotal = cartItems
    .filter((item) => item.price && item.quantity)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      dispatch({ type: 'wishlist/clearWishlist' });
      dispatch({ type: 'cart/clearCart' });
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (
    currentUser &&
    (currentUser.role === 'seller' ||
      currentUser.role === 'delivery' ||
      currentUser.role === 'admin')
  ) {
    return null;
  }

  return (
    <div className="navbar bg-white shadow-md px-4 sm:px-8 py-3 sticky top-0 z-50" data-theme="light">
      <div className="flex-1 flex items-center">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors duration-200 pr-4 cursor-pointer"
        >
          <img src={logo} alt="Ecom Logo" className="h-14 sm:h-16" />
        </button>
        <AllCategories />
      </div>

      <div className="flex-1 flex justify-center">
        <div className="form-control relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered w-full bg-white focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-4 py-2"
          />
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6">
        {/* Wishlist Button */}
        <button
          className="relative p-2 rounded-full hover:bg-pink-50 transition-colors duration-200"
          onClick={() => navigate('/wishlist')}
          aria-label="Wishlist"
          onMouseEnter={() => setIsWishlistHovered(true)}
          onMouseLeave={() => setIsWishlistHovered(false)}
        >
          {isWishlistHovered || wishlistCount > 0 ? (
            <FaHeart className="h-5 w-5 text-pink-500" />
          ) : (
            <FaRegHeart className="h-5 w-5 text-gray-600" />
          )}
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-pink-500 text-white text-xs font-medium">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Cart Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="p-2 rounded-full hover:bg-purple-50 transition-colors duration-200 relative"
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
            <FaShoppingCart 
              className={`h-5 w-5 ${isCartHovered || cartCount > 0 ? 'text-purple-600' : 'text-gray-600'}`} 
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-purple-600 text-white text-xs font-medium">
                {cartCount}
              </span>
            )}
          </div>
          <div
            tabIndex={0}
            className="dropdown-content z-[1] mt-3 w-80 bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-gray-800">Your Cart</h3>
                <span className="text-sm text-gray-500">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              {cartCount > 0 ? (
                <>
                  <div className="max-h-60 overflow-y-auto pr-2 -mr-2">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                        <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                            alt={item.productId?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.productId?.name || 'Product'}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-bold text-purple-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add remove item functionality here
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        +{cartItems.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-bold text-purple-600">${cartTotal}</span>
                    </div>
                    <button
                      className="btn btn-block bg-purple-600 hover:bg-purple-700 text-white border-0"
                      onClick={() => navigate('/cart')}
                    >
                      View Cart & Checkout
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-gray-500 mb-3">Your cart is empty</p>
                  <button
                    className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white border-0"
                    onClick={() => navigate('/')}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile or Auth Buttons */}
        {currentUser ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full ring-1 ring-gray-200 ring-offset-2">
                <img
                  src={
                    currentUser.profilePicture ||
                    'https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'
                  }
                  alt="User"
                  className="object-cover"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 border border-gray-100 mt-2"
            >
              <li>
                <button 
                  className="hover:bg-gray-50 rounded-md"
                  onClick={() => navigate('/profile')}
                >
                  My Profile
                </button>
              </li>
              <li>
                <button 
                  className="hover:bg-gray-50 rounded-md text-red-500"
                  onClick={signOut}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-outline btn-primary btn-sm sm:btn-md"
            >
              Sign In
            </button>
            <div className="dropdown dropdown-end hidden sm:block">
              <label tabIndex={0} className="btn btn-primary btn-sm sm:btn-md">
                <FaUserPlus className="mr-2" />
                Join Us
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 border border-gray-100 mt-2"
              >
                <li>
                  <button 
                    className="hover:bg-gray-50 rounded-md"
                    onClick={() => navigate('/become-seller')}
                  >
                    <FaStore className="mr-2 text-purple-600" /> Become Seller
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:bg-gray-50 rounded-md"
                    onClick={() => navigate('/join-delivery-team')}
                  >
                    <FaTruck className="mr-2 text-blue-600" /> Delivery Team
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;