import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaBox, FaTruck, FaEnvelope, FaCreditCard, FaHeart, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user?.currentUser);

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
    { path: "/profile/orders", icon: <FaBox />, label: t('profile.myOrders') },
    { path: "/profile/track-order", icon: <FaTruck />, label: t('profile.trackOrder') },
    { path: "/profile/messages", icon: <FaEnvelope />, label: t('profile.requestsMessages') },
    { path: "/profile/payments", icon: <FaCreditCard />, label: t('profile.payments') },
    { path: "/profile/wishlist", icon: <FaHeart />, label: t('profile.wishlist') },
    { path: "/profile/personal-info", icon: <FaUser />, label: t('profile.personalInfo') },
    { path: "/profile/settings", icon: <FaCog />, label: t('profile.accountSettings') },
  ];

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
                {currentUser?.name?.charAt(0).toUpperCase() + currentUser?.name?.slice(1).toLowerCase() || t('profile.user')}
                </h1>
                <p className="text-gray-500 text-xs">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <span className="text-gray-500">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
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
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;