import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaBox, FaTruck, FaEnvelope, FaCreditCard, FaHeart, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfileOrders from '../components/Profile/ProfileOrders';
import ProfileMessages from '../components/Profile/ProfileMessages';
import ProfilePayments from '../components/Profile/ProfilePayments';
import ProfileWishlist from '../components/Profile/ProfileWishlist';
import ProfilePersonalInfo from '../components/Profile/ProfilePersonalInfo';
import ProfileSettings from '../components/Profile/ProfileSettings';
import { useNavigate } from 'react-router-dom';



const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [activeComponent, setActiveComponent] = useState('orders'); 

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      dispatch({ type: 'wishlist/clearWishlist' });
      dispatch({ type: 'cart/clearCart' });
      navigate('/');
      toast.success(t('header.signoutSuccess'));
    } catch (error) {
      toast.error(t('header.signoutError'));
    }
  };

  const navItems = [
    { id: 'orders', icon: <FaBox />, label: t('profile.myOrders'), component: <ProfileOrders /> },
    { id: 'messages', icon: <FaEnvelope />, label: t('profile.requestsMessages'), component: <ProfileMessages /> },
    { id: 'payments', icon: <FaCreditCard />, label: t('profile.payments'), component: <ProfilePayments /> },
    { id: 'wishlist', icon: <FaHeart />, label: t('profile.wishlist.wishlist'), component: <ProfileWishlist /> },
    { id: 'personal-info', icon: <FaUser />, label: t('profile.personalInfo'), component: <ProfilePersonalInfo /> },
    { id: 'settings', icon: <FaCog />, label: t('profile.accountSettings'), component: <ProfileSettings /> },
  ];

  // Find the currently active component
  const currentActiveComponent = navItems.find(item => item.id === activeComponent)?.component;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Vertical Navigation with Profile Info */}
        <div className="w-full md:w-64">
          {/* Profile Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={currentUser?.profilePicture || "https://via.placeholder.com/80"} 
                alt="User" 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1).toLowerCase() : t('profile.user')}
                </h1>
                <p className="text-gray-500 text-xs">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveComponent(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 w-full text-left ${
                    activeComponent === item.id ? 'text-purple-600' : 'text-gray-700'
                  } hover:text-purple-600 transition-colors`}
                >
                  <span className="text-gray-500">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <button 
                onClick={signOut}
                className="flex items-center gap-3 p-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt size={18} />
                <span>{t('profile.logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {currentActiveComponent}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;