import React from "react";
import { FaSearch, FaHeart, FaUserPlus, FaStore, FaTruck, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/ecomLogo.png";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';
import { toast } from 'react-toastify';
import AllCategories from "./AllCategories";

const Header = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user?.currentUser);
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  const cartItems = useSelector(state => state.cart?.items || []);
  const dispatch = useDispatch();
  
  const wishlistCount = wishlistItems.length;
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      dispatch({ type: 'wishlist/clearWishlist' });
      dispatch({ type: 'cart/clearCart' });
      navigate("/");
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (currentUser && (currentUser.role === "seller" || currentUser.role === "delivery" || currentUser.role === "admin")) {
    return null;
  }

  return (
    <div className="navbar bg-white shadow-lg px-4 sm:px-8 pt-4 sticky top-0 z-50" data-theme="light">
      <div className="flex-1 flex items-center">
        <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors duration-200 pr-4 cursor-pointer">
          <img src={logo} alt="Ecom Logo" className="h-16 sm:h-20" />
        </button>
        <AllCategories />
      </div>

      <div className="flex-1 flex justify-center">
        <div className="form-control relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered w-full bg-white focus:ring-2 focus:ring-primary focus:border-primary pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        <button 
          className="btn btn-ghost btn-circle hover:bg-primary/10 relative"
          onClick={() => navigate("/wishlist")}
          aria-label="Wishlist"
        >
          <FaHeart className="h-6 w-6 text-secondary hover:text-primary" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 badge badge-sm bg-purple-100 text-purple-800 border-purple-200">
              {wishlistCount}
            </span>
          )}
        </button>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-purple-50">
            <div className="indicator">
              <FaShoppingCart className="h-6 w-6 text-purple-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 badge badge-sm bg-purple-100 text-purple-800 border-purple-200">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
          <div tabIndex={0} className="dropdown-content z-[1] mt-3 card card-compact w-72 bg-white shadow-xl border">
            <div className="card-body">
              <span className="font-bold text-lg">Your Cart</span>
              <span className="text-gray-500">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              
              <div className="divider my-2"></div>
              
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="card-actions mt-4">
                <button 
                  className="btn btn-block bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => navigate("/cart")}
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {currentUser ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={currentUser.profilePicture || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="User" />
              </div>
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
              <li><button onClick={() => navigate("/profile")}>Profile</button></li>
              <li><button onClick={signOut}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <>
            <button 
              onClick={() => navigate("/login")} 
              className="btn btn-outline btn-primary"
            >
              Sign In
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-primary">
                <FaUserPlus className="mr-2" />
                Join Us
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
                <li><button onClick={() => navigate("/become-seller")}><FaStore className="mr-2" /> Become Seller</button></li>
                <li><button onClick={() => navigate("/join-delivery-team")}><FaTruck className="mr-2" /> Delivery Team</button></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;