import React from "react";
import { FaBars, FaSearch, FaHeart, FaShoppingCart, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { categories } from "./categories";
import logo from "../assets/ecomLogo.png";
import { useSelector, useDispatch } from 'react-redux';  // Import useSelector and useDispatch
import axios from 'axios';  // To make HTTP requests
import { signoutSuccess } from '../redux/user/userSlice';
const Header = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.currentUser); // Access currentUser from Redux state
  const dispatch = useDispatch(); // For dispatching actions, if necessary
  
  // Sign out function
  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');  // Make a POST request to your signout endpoint
      dispatch(signoutSuccess());  // Dispatch the correct action for sign out
      navigate("/");  // Redirect to home page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  

  return (
    <div className="navbar bg-white shadow-lg px-4 sm:px-8 pt-4 sticky top-0 z-50" data-theme="light">
      <div className="flex-1 flex items-center">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors duration-200 pr-4 cursor-pointer"
        >
          <img src={logo} alt="Ecom Logo" className="h-20" />
        </a>

        <div className="dropdown dropdown-hover hidden sm:block ml-4">
          <label
            tabIndex={0}
            className="btn btn-ghost hover:bg-primary hover:text-white transition-colors duration-200 flex items-center gap-2"
          >
            <FaBars className="h-6 w-6" />
            <span>All Categories</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-white rounded-box w-[800px] grid grid-cols-3 gap-4"
          >
            {categories.map((category, index) => (
              <li key={index} className="flex flex-col">
                <a className="font-semibold text-lg hover:bg-primary hover:text-white transition-colors duration-200 flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </a>
                <ul className="pl-2">
                  {category.subcategories.map((subcategory, subIndex) => (
                    <li key={subIndex}>
                      <a className="hover:bg-primary hover:text-white transition-colors duration-200">
                        {subcategory}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="form-control relative w-full max-w-md transition-all duration-500">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full bg-white focus:w-[600px] focus:ring-2 focus:ring-primary focus:border-primary pl-10 transition-all duration-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400 transition-transform duration-500 transform hover:scale-110" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="dropdown dropdown-hover sm:hidden">
          <label
            tabIndex={0}
            className="btn btn-ghost hover:bg-primary hover:text-white transition-colors duration-200 flex items-center gap-2"
          >
            <FaBars className="h-6 w-6" />
            <span>All Categories</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-white rounded-box w-52"
          >
            {categories.map((category, index) => (
              <li key={index}>
                <a className="hover:bg-primary hover:text-white transition-colors duration-200 flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </a>
                <ul className="pl-2">
                  {category.subcategories.map((subcategory, subIndex) => (
                    <li key={subIndex}>
                      <a className="hover:bg-primary hover:text-white transition-colors duration-200">
                        {subcategory}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <button className="btn btn-ghost btn-circle hover:bg-primary hover:text-white transition-colors duration-200">
          <FaHeart className="h-6 w-6 text-secondary" />
        </button>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle"
          >
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span className="badge badge-sm indicator-item">8</span>
            </div>
          </div>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow"
          >
            <div className="card-body">
              <span className="text-lg font-bold">8 Items</span>
              <span className="text-info">Subtotal: $999</span>
              <div className="card-actions">
                <button className="btn btn-primary btn-block">View cart</button>
              </div>
            </div>
          </div>
        </div>

        {/* Conditionally render avatar or sign-in button */}
        {currentUser ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <img
                src={currentUser.profilePicture}
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-white rounded-box w-52"
            >
              <li>
                <a className="hover:bg-primary hover:text-white transition-colors duration-200">
                  Profile
                </a>
              </li>
              <li>
                <a
                  className="hover:bg-primary hover:text-white transition-colors duration-200"
                  onClick={signOut} // Attach the signOut function
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="btn bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In
            </button>
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <FaUserPlus className="inline-block mr-2 group-hover:animate-bounce" />
                Join Us
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
