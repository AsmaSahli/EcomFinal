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
        <div className="flex flex-col items-center gap-1">
          <button className="btn btn-ghost btn-circle hover:bg-primary hover:text-white transition-colors duration-200">
            <FaHeart className="h-6 w-6 text-secondary" />
          </button>
          <span className="text-xs text-gray-600">Liked Items</span>
        </div>

        <div className="dropdown dropdown-end flex flex-col items-center gap-1">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="badge badge-sm indicator-item">8</span>
            </div>
          </div>
          <span className="text-xs text-gray-600">8 Items</span>
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
