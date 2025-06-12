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
  FaUsers,
  FaPlus,
  FaBoxes,
  FaGift,
  FaBars,
  FaTimes
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
import DashNewProduct from "../components/Seller/DashNewProduct";
import DashPromotion from "../components/Seller/DashPromotion";
import { useTranslation } from 'react-i18next';

const SellerDashboard = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      {/* Sidebar - Fixed */}
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#3F0AAD] to-[#2D077A] text-white flex flex-col p-0 shadow-xl z-20 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-[#4A12C4] flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <FaShoppingBag className="text-2xl text-purple-300" />
              <h1 className="text-xl font-bold">{t('sellerDashboard.title')}</h1>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <FaShoppingBag className="text-2xl text-purple-300" />
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-purple-200 hover:text-white transition-colors"
          >
            {sidebarOpen ? <FaTimes /> : ""}
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/seller-dashboard?tab=dashboard" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaHome className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && t('sellerDashboard.sidebar.dashboard')}
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=products" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'products' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaBox className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && (
                  <>
                    {t('sellerDashboard.sidebar.products')}

                  </>
                )}
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=add-inventory" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'add-inventory' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaBoxes className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && t('sellerDashboard.sidebar.addInventory')}
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=promotions" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'promotions' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaGift className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && t('sellerDashboard.sidebar.promotions')}
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=orders" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'orders' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaClipboardList className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && (
                  <>
                    {t('sellerDashboard.sidebar.orders')}

                  </>
                )}
              </Link>
            </li>

            <li>
              <Link 
                to="/seller-dashboard?tab=analytics" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'analytics' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaChartPie className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && t('sellerDashboard.sidebar.analytics')}
              </Link>
            </li>
            <li>
              <Link 
                to="/seller-dashboard?tab=settings" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaCog className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} text-purple-200`} />
                {sidebarOpen && t('sellerDashboard.sidebar.settings')}
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
            <FaSignOutAlt className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && t('sellerDashboard.sidebar.signOut')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Navbar - Fixed */}
        <header className="fixed top-0 right-0 bg-white shadow-sm z-10" style={{ left: sidebarOpen ? '16rem' : '5rem' }}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button (only shown when sidebar is closed) */}
            {!sidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 mr-4"
              >
                <FaBars className="text-xl" />
              </button>
            )}
            
            {/* Search Bar */}
            <div className="relative w-64">

            </div>
            
            {/* User Info and Notifications */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-sm gap-1 normal-case">
                  {i18n.language === 'en' ? (
                    <>
                      <span className="fi fi-us fis"></span>
                      <span className="hidden sm:inline">EN</span>
                    </>
                  ) : (
                    <>
                      <span className="fi fi-fr fis"></span>
                      <span className="hidden sm:inline">FR</span>
                    </>
                  )}
                  <svg
                    className="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-white rounded-box w-40 border border-gray-100 mt-2"
                >
                  <li>
                    <button
                      className={`flex items-center ${i18n.language === 'en' ? 'active bg-gray-100' : ''}`}
                      onClick={() => changeLanguage('en')}
                    >
                      <span className="fi fi-us fis mr-2"></span>
                      English (US)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center ${i18n.language === 'fr' ? 'active bg-gray-100' : ''}`}
                      onClick={() => changeLanguage('fr')}
                    >
                      <span className="fi fi-fr fis mr-2"></span>
                      Français
                    </button>
                  </li>
                </ul>
              </div>

              <button 
                className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                aria-label={t('sellerDashboard.notifications.new')}
              >
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <div className="font-medium text-gray-800">{username}</div>
                  <div className="text-xs text-gray-500">{t('sellerDashboard.role')}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-[#3F0AAD]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 mt-16 p-6 bg-gray-50 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashOverview 
              stats={stats} 
              recentOrders={recentOrders} 
              topProducts={topProducts} 
              salesData={salesData} 
            />
          )}
          {activeTab === 'products' && <DashProducts />}
          {activeTab === 'add-inventory' && <DashNewProduct />}
          {activeTab === 'promotions' && <DashPromotion />}
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