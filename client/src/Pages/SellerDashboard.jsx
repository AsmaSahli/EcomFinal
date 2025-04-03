import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaBox, 
  FaClipboardList, 
  FaCog, 
  FaSignOutAlt, 
  FaChartPie,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaShoppingBag,
  FaDollarSign,
  FaUsers,
  FaComments
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';

const SellerDashboard = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const username = currentUser?.email.split('@')[0];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Enhanced Sidebar with #3F0AAD gradient */}
      <div className="w-64 bg-gradient-to-b from-[#3F0AAD] to-[#2D077A] text-white flex flex-col p-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-[#4A12C4]">
          <div className="flex items-center space-x-3">
            <FaShoppingBag className="text-2xl text-purple-300" />
            <h1 className="text-xl font-bold">Seller Hub</h1>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            Welcome back, <span className="font-medium text-white">{username || 'Seller'}</span>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/seller-dashboard" className="flex items-center px-4 py-3 rounded-lg bg-[#4A12C4] text-white font-medium">
                <FaHome className="mr-3 text-purple-200" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/products" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaBox className="mr-3 text-purple-200" />
                Products
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">68</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaClipboardList className="mr-3 text-purple-200" />
                Orders
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">15</span>
              </Link>
            </li>
            <li>
              <Link to="/customers" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaUsers className="mr-3 text-purple-200" />
                Customers
              </Link>
            </li>
            <li>
              <Link to="/sales" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaDollarSign className="mr-3 text-purple-200" />
                Sales
              </Link>
            </li>
            <li>
              <Link to="/messages" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaComments className="mr-3 text-purple-200" />
                Messages
                <span className="ml-auto bg-red-500 text-xs font-semibold px-2 py-1 rounded-full">3</span>
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaChartPie className="mr-3 text-purple-200" />
                Analytics
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaCog className="mr-3 text-purple-200" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#4A12C4]">
          <button 
            onClick={signOut}
            className="flex items-center w-full px-4 py-2 text-sm text-purple-200 hover:text-white rounded-lg hover:bg-[#4A12C4] transition"
          >
            <FaSignOutAlt className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Search Bar */}
            <div className="relative w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3F0AAD] focus:border-transparent"
              />
            </div>
            
            {/* User Info and Notifications */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <div className="font-medium text-gray-800">{username || 'Seller'}</div>
                  <div className="text-xs text-gray-500">Premium Seller</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-[#3F0AAD]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Welcome Banner - Updated with purple gradient */}
          <div className="bg-gradient-to-r from-[#3F0AAD] to-[#5E1ED1] text-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {username || 'Seller'}!</h2>
                <p className="text-purple-100">Here's what's happening with your store today.</p>
              </div>
              <button className="bg-white text-[#3F0AAD] px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition">
                View Reports
              </button>
            </div>
          </div>

          {/* Stats Cards - Updated accent colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">$12,345</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaDollarSign className="text-[#3F0AAD]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500">
                <span>↑ 12.5%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold mt-1">150</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaShoppingBag className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500">
                <span>↑ 8.2%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">New Customers</p>
                  <h3 className="text-2xl font-bold mt-1">24</h3>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <FaUsers className="text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500">
                <span>↑ 5.7%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <h3 className="text-2xl font-bold mt-1">3.2%</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FaChartPie className="text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-500">
                <span>↓ 1.1%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>
          </div>

          {/* Additional Dashboard Content */}
          {/* ... (rest of your dashboard content) ... */}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;