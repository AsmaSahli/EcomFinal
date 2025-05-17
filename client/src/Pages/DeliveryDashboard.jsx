import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaTruck, 
  FaClipboardList, 
  FaCog, 
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaMapMarkerAlt,
  FaCheckCircle
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';
import { useTranslation } from 'react-i18next';
import DashOverview from "../components/Delivery/DashOverview";
import DashMyDeliveries from "../components/Delivery/DashMyDeliveries";
import DashDelivreyMap from "../components/Delivery/DashDelivreyMap";
import DashDelivreyHistory from "../components/Delivery/DashDelivreyHistory";
import DashSettings from "../components/Delivery/DashSettings";

const DeliveryDashboard = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
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

  // Mock delivery data
  const deliveryData = {
    stats: {
      completed: 24,
      pending: 3,
      earnings: "$1,245",
      rating: "4.8"
    },
    currentDeliveries: [
      { id: 1, customer: "Sarah Johnson", address: "123 Main St, Apt 4B", status: "in_progress", time: "15 min" },
      { id: 2, customer: "Mike Peterson", address: "456 Oak Ave", status: "pending", time: "25 min" }
    ],
    recentDeliveries: [
      { id: 3, customer: "Emily Chen", address: "789 Pine Rd", status: "completed", time: "Yesterday" },
      { id: 4, customer: "David Wilson", address: "321 Elm Blvd", status: "completed", time: "Yesterday" }
    ]
  };

  const username = currentUser?.email.split('@')[0] || t('deliveryDashboard.role');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#3F0AAD] to-[#2D077A] text-white flex flex-col p-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-[#4A12C4]">
          <div className="flex items-center space-x-3">
            <FaTruck className="text-2xl text-purple-300" />
            <h1 className="text-xl font-bold">{t('deliveryDashboard.title')}</h1>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            {t('deliveryDashboard.welcome' )} { username }
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/delivery-dashboard?tab=dashboard" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaHome className="mr-3 text-purple-200" />
                {t('deliveryDashboard.sidebar.dashboard')}
              </Link>
            </li>
            <li>
              <Link 
                to="/delivery-dashboard?tab=deliveries" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'deliveries' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaClipboardList className="mr-3 text-purple-200" />
                {t('deliveryDashboard.sidebar.deliveries')}
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">
                  {deliveryData.currentDeliveries.length}
                </span>
              </Link>
            </li>
            <li>
              <Link 
                to="/delivery-dashboard?tab=map" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'map' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaMapMarkerAlt className="mr-3 text-purple-200" />
                {t('deliveryDashboard.sidebar.map')}
              </Link>
            </li>
            <li>
              <Link 
                to="/delivery-dashboard?tab=history" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'history' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaCheckCircle className="mr-3 text-purple-200" />
                {t('deliveryDashboard.sidebar.history')}
              </Link>
            </li>
            <li>
              <Link 
                to="/delivery-dashboard?tab=settings" 
                className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-[#4A12C4] text-white font-medium' : 'hover:bg-[#4A12C4] hover:text-white'} transition`}
              >
                <FaCog className="mr-3 text-purple-200" />
                {t('deliveryDashboard.sidebar.settings')}
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
            {t('deliveryDashboard.sidebar.signOut')}
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
                placeholder={t('deliveryDashboard.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3F0AAD] focus:border-transparent"
              />
            </div>
            
            {/* User Info and Notifications */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="btn btn-ghost btn-sm normal-case">
                  {i18n.language === 'en' ? (
                    <>
                      <span className="fi fi-us fis"></span>
                      <span className="hidden sm:inline ml-1">EN</span>
                    </>
                  ) : (
                    <>
                      <span className="fi fi-fr fis"></span>
                      <span className="hidden sm:inline ml-1">FR</span>
                    </>
                  )}
                  <svg
                    className="fill-current ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-white rounded-box w-40 border border-gray-100 mt-2"
                >
                  <li>
                    <button
                      className={`flex items-center ${i18n.language === 'en' ? 'bg-gray-100' : ''}`}
                      onClick={() => changeLanguage('en')}
                    >
                      <span className="fi fi-us fis mr-2"></span>
                      English (US)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center ${i18n.language === 'fr' ? 'bg-gray-100' : ''}`}
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
                aria-label={t('deliveryDashboard.notifications.new')}
              >
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <div className="font-medium text-gray-800">{username}</div>
                  <div className="text-xs text-gray-500">{t('deliveryDashboard.role')}</div>
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
          {activeTab === 'dashboard' && <DashOverview deliveryData={deliveryData} />}
          {activeTab === 'deliveries' && <DashMyDeliveries deliveries={deliveryData.currentDeliveries} />}
          {activeTab === 'map' && <DashDelivreyMap />}
          {activeTab === 'history' && <DashDelivreyHistory deliveries={deliveryData.recentDeliveries} />}
          {activeTab === 'settings' && <DashSettings />}
        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboard;