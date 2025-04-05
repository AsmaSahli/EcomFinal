import React from "react";
import { FaSearch, FaHeart, FaUserPlus, FaStore, FaTruck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/ecomLogo.png";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';
import AllCategories from "./AllCategories";

const Header = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // If the role is "seller" or "delivery", return null to not render the header
  if (currentUser && (currentUser.role === "seller" || currentUser.role === "delivery"|| currentUser.role=== "admin")) {
    return null; // Don't render the header for these roles
  }

  // Header for Normal Users
  const normalHeader = (
    <div className="navbar bg-white shadow-lg px-4 sm:px-8 pt-4 sticky top-0 z-50" data-theme="light">
      <div className="flex-1 flex items-center">
        <a href="/" onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }} className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors duration-200 pr-4 cursor-pointer">
          <img src={logo} alt="Ecom Logo" className="h-16 sm:h-20" />
        </a>
        <AllCategories />
      </div>

      <div className="flex-1 flex justify-center">
        <div className="form-control relative w-full max-w-md transition-all duration-500">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full bg-white focus:ring-2 focus:ring-primary focus:border-primary pl-10 transition-all duration-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400 transition-transform duration-500 transform hover:scale-110" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-end gap-4">
      {/* Liked Items Button */}
      <div className="group relative flex flex-col items-center">
        <button 
          className="btn btn-ghost btn-circle hover:bg-primary/10 transition-colors duration-200 relative"
          aria-label="Wishlist"
        >
          <FaHeart className="h-6 w-6 text-secondary group-hover:text-primary transition-colors" />
          {/* Small transparent badge */}
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs rounded-full bg-white/90 backdrop-blur-sm border border-secondary/20 text-secondary group-hover:text-primary group-hover:border-primary/20">
            12
          </span>
        </button>
      </div>




            <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-purple-50">
        <div className="indicator">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-8 text-purple-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="absolute -top-1 -right-1">
          <span className="flex items-center justify-center px-1.5 py-0.5 text-[0.65rem] font-medium rounded-full bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-800 shadow-sm">
            $0
          </span>
        </span>

        </div>
      </div>
      
      <div 
        tabIndex={0} 
        className="dropdown-content z-[1] mt-3 card card-compact w-72 bg-white shadow-xl border border-gray-100"
      >
        <div className="card-body">
          <span className="font-bold text-lg">Your Cart</span>
          <span className="text-gray-500">3 items</span>
          
          <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
            {/* Cart Items */}
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-12 rounded">
                  <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="Product" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Wireless Headphones</h3>
                <p className="text-sm text-gray-500">1 × $129.99</p>
              </div>
              <button className="btn btn-sm btn-ghost text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-12 rounded">
                  <img src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" alt="Product" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Smart Watch</h3>
                <p className="text-sm text-gray-500">1 × $89.99</p>
              </div>
              <button className="btn btn-sm btn-ghost text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-12 rounded">
                  <img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Product" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Bluetooth Speaker</h3>
                <p className="text-sm text-gray-500">1 × $59.99</p>
              </div>
              <button className="btn btn-sm btn-ghost text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-medium">$279.97</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Shipping</span>
              <span className="font-medium">$5.99</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#3F0AAD]">$285.96</span>
            </div>
          </div>
          
          <div className="card-actions mt-4">
            <button className="btn btn-block bg-[#3F0AAD] hover:bg-[#2D077A] text-white">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>



        {currentUser ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <img src={currentUser.profilePicture} alt="User Avatar" className="w-10 h-10 rounded-full" />
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
              <li><a className="hover:bg-primary hover:text-white transition-colors duration-200">Profile</a></li>
              <li><a onClick={signOut} className="hover:bg-primary hover:text-white transition-colors duration-200">Logout</a></li>
            </ul>
          </div>
        ) : (
          <>
            <button onClick={() => navigate("/login")} className="btn border-2 border-transparent bg-transparent bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-3xl transition-all duration-300">
              Sign In
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} style={{ background: "linear-gradient(to right,#560DF2, #4508C8)" }} className="btn text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group">
                <FaUserPlus className="inline-block mr-2 group-hover:animate-bounce" />
                Join Us
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
                <li><a onClick={() => navigate("/become-seller")} className="hover:bg-primary hover:text-white transition-colors duration-200 flex items-center gap-2"><FaStore className="h-5 w-5" /> Become a Seller</a></li>
                <li><a onClick={() => navigate("/join-delivery-team")} className="hover:bg-primary hover:text-white transition-colors duration-200 flex items-center gap-2"><FaTruck className="h-5 w-5" /> Join Delivery Team</a></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return normalHeader;
};

export default Header;
