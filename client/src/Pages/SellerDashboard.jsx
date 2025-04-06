import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  FaUsers
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';
import DashOverview from "../components/Seller/DashOverview";
import DashProducts from "../components/Seller/DashProducts";
import DashOrders from "../components/Seller/DashOrders";
import DashCustomers from "../components/Seller/DashCustomers";
import DashSales from "../components/Seller/DashSales";
import DashAnalytics from "../components/Seller/DashAnalytics";
import DashSettings from "../components/Seller/DashSettings";

const SellerDashboard = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Extract tab from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('dashboard');
    }
  }, [location.search]);

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mock data
  const stats = {
    revenue: "$12,345",
    orders: 150,
    newCustomers: 24,
    conversionRate: 3.2,
    products: 68,
    messages: 3
  };

  const recentOrders = [
    { id: 1001, customer: "Alex Johnson", amount: "$120", status: "completed", date: "10 min ago" },
    { id: 1002, customer: "Sarah Williams", amount: "$85", status: "processing", date: "25 min ago" },
    { id: 1003, customer: "Mike Chen", amount: "$230", status: "shipped", date: "1 hour ago" },
    { id: 1004, customer: "Emily Davis", amount: "$65", status: "pending", date: "2 hours ago" }
  ];

  const topProducts = [
    { id: 1, name: "Wireless Headphones", sales: 45, stock: 12, rating: 4.8 },
    { id: 2, name: "Smart Watch", sales: 32, stock: 5, rating: 4.5 },
    { id: 3, name: "Bluetooth Speaker", sales: 28, stock: 18, rating: 4.2 }
  ];

  const salesData = [
    { day: "Mon", sales: 12 },
    { day: "Tue", sales: 19 },
    { day: "Wed", sales: 8 },
    { day: "Thu", sales: 15 },
    { day: "Fri", sales: 22 },
    { day: "Sat", sales: 18 },
    { day: "Sun", sales: 14 }
  ];

  const username = currentUser?.email.split('@')[0] || 'Seller';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#3F0AAD] to-[#2D077A] text-white flex flex-col p-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-[#4A12C4]">
          <div className="flex items-center space-x-3">
            <FaShoppingBag className="text-2xl text-purple-300" />
            <h1 className="text-xl font-bold">Seller Hub</h1>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            Welcome back, <span className="font-medium text-white">{username}</span>
          </div>
        </div>
        
        {/* Sidebar Navigation with tab links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/seller-dashboard?tab=dashboard" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaHome className="mr-3 text-purple-200" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=products" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'products' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaBox className="mr-3 text-purple-200" />
                Products
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.products}
                </span>
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=orders" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'orders' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaClipboardList className="mr-3 text-purple-200" />
                Orders
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.orders}
                </span>
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=customers" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'customers' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaUsers className="mr-3 text-purple-200" />
                Customers
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=sales" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'sales' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaDollarSign className="mr-3 text-purple-200" />
                Sales
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=analytics" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'analytics' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaChartPie className="mr-3 text-purple-200" />
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=settings" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
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
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Search Bar */}
            <div className="relative w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, orders..."
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
                  <div className="font-medium text-gray-800">{username}</div>
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
          {activeTab === 'dashboard' && (
            <DashOverview 
              stats={stats} 
              recentOrders={recentOrders} 
              topProducts={topProducts} 
              salesData={salesData} 
            />
          )}
          {activeTab === 'products' && <DashProducts />}
          {activeTab === 'orders' && <DashOrders />}
          {activeTab === 'customers' && <DashCustomers />}
          {activeTab === 'sales' && <DashSales />}
          {activeTab === 'analytics' && <DashAnalytics />}
          {activeTab === 'settings' && <DashSettings />}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;