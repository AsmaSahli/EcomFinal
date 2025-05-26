import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxOpen, FaCheckCircle, FaTruck, FaTimesCircle, FaHistory, FaSearch, FaChevronDown, FaChevronUp, FaFileInvoice, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfileOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/orders/user/${currentUser.id}`);
        const ordersData = response.data.orders || [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(t('profile.orders.fetchError'));
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, t]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'shipped': return <FaTruck className="text-blue-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      case 'processing': return <FaHistory className="text-yellow-500" />;
      default: return <FaBoxOpen className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/trackOrder/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <FaBoxOpen className="text-gray-400 text-4xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('profile.orders.noOrders')}</h3>
        <p className="text-gray-500 max-w-md mb-6">{t('profile.orders.noOrdersDesc')}</p>
        <button 
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          {t('profile.orders.shopNow')}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <motion.div 
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
          >
            {/* Order Summary */}
            <div 
              className="p-5 cursor-pointer flex justify-between items-center"
              onClick={() => toggleOrderExpansion(order._id)}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t('profile.orders.order')} #{order._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden md:block">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {t(`profile.orders.${order.status}`)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-800">
                    ${order.total ? order.total.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="text-gray-400">
                  {expandedOrder === order._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            <AnimatePresence>
              {expandedOrder === order._id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{t('profile.orders.items')}</h4>
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex space-x-4 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={item.productId.images[0]?.url} 
                              alt={item.productId.name}
                              className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
                                {item.productId.name}
                              </h5>
                              <p className="text-sm text-gray-500 mt-1">{item.quantity} × ${item.price.toFixed(2)}</p>
                              {item.promotion && (
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-2">
                                  {t('profile.orders.promoApplied')}: {item.promotion.name} (-{item.promotion.discount}%)
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                              {order.status === 'delivered' && (
                                <button className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                                  <FaStar className="text-yellow-400" />
                                  <span>{t('profile.orders.leaveReview')}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary and Shipping */}
                    <div className="space-y-6">
                      {/* Order Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{t('profile.orders.summary')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('profile.orders.subtotal')}</span>
                            <span className="font-medium">${order.subtotal?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('profile.orders.shipping')}</span>
                            <span className="font-medium">${order.shipping?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('profile.orders.tax')}</span>
                            <span className="font-medium">${order.tax?.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between font-semibold text-gray-900">
                            <span>{t('profile.orders.total')}</span>
                            <span>${order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{t('profile.orders.shippingInfo')}</h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-gray-900">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                          <p className="text-gray-600">{order.shippingInfo.address.street}</p>
                          {order.shippingInfo.address.apartment && (
                            <p className="text-gray-600">{order.shippingInfo.address.apartment}</p>
                          )}
                          <p className="text-gray-600">
                            {order.shippingInfo.address.city}, {order.shippingInfo.address.governorate} {order.shippingInfo.address.postalCode}
                          </p>
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Phone:</span> {order.shippingInfo.phone}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Email:</span> {order.shippingInfo.email}
                          </p>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="pt-4">
                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => handleTrackOrder(order._id)}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                              order.status === 'delivered' 
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                            }`}
                            disabled={order.status === 'delivered'}
                          >
                            <FaTruck />
                            <span>{t('profile.orders.trackOrder')}</span>
                          </button>
                          {order.status === 'processing' || order.status === 'pending' ? (
                            <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                              {t('profile.orders.cancelOrder')}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileOrders;