import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaCheckCircle, 
  FaTruck, 
  FaBoxOpen, 
  FaHome, 
  FaClock, 
  FaSyncAlt,
  FaStore,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShoppingBag
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const OrderTrackingPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSuborder, setExpandedSuborder] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/orders/${id}`);
      setOrder(response.data.order);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t('orderTracking.errors.fetchError'));
      toast.error(t('orderTracking.errors.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, t]);

  // Order status steps
  const statusSteps = [
    {
      id: 'pending',
      title: t('orderTracking.status.pending'),
      icon: <FaClock className="text-yellow-500" />,
      description: t('orderTracking.status.pendingDescription'),
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'processing',
      title: t('orderTracking.status.processing'),
      icon: <FaBoxOpen className="text-blue-500" />,
      description: t('orderTracking.status.processingDescription'),
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'shipped',
      title: t('orderTracking.status.shipped'),
      icon: <FaTruck className="text-purple-500" />,
      description: t('orderTracking.status.shippedDescription'),
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'delivered',
      title: t('orderTracking.status.delivered'),
      icon: <FaHome className="text-green-500" />,
      description: t('orderTracking.status.deliveredDescription'),
      color: 'bg-green-100 text-green-800'
    },
  ];

  const toggleSuborder = (suborderId) => {
    setExpandedSuborder(expandedSuborder === suborderId ? null : suborderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Link to="/" className="btn btn-primary">
            {t('orderTracking.buttons.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <div className="text-gray-500 mb-4">{t('orderTracking.errors.orderNotFound')}</div>
          <Link to="/" className="btn btn-primary">
            {t('orderTracking.buttons.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Find current status index for main order
  const currentStatusIndex = statusSteps.findIndex((step) => step.id === order.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Order Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {t('orderTracking.title')} #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500">
            {t('orderTracking.placedOn')} {new Date(order.createdAt).toLocaleDateString()}
          </p>
          
          {/* Main order status badge */}
          <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusSteps[currentStatusIndex].color}`}>
            {statusSteps[currentStatusIndex].icon}
            <span className="ml-2">{statusSteps[currentStatusIndex].title}</span>
          </div>
        </div>

        {/* Suborders Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaStore className="mr-2 text-purple-500" />
            {t('orderTracking.yourPurchases')} ({order.suborders.length})
          </h2>
          
          <div className="space-y-4">
            {order.suborders.map((suborder) => {
              const suborderStatusIndex = statusSteps.findIndex((step) => step.id === suborder.status);
              const suborderStatus = statusSteps[suborderStatusIndex];
              
              return (
                <div key={suborder._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Suborder header */}
                  <div 
                    className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSuborder(suborder._id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${suborderStatus.color}`}>
                        {suborderStatus.icon}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-800">
                          {t('orderTracking.seller')}: {suborder.sellerId?.shopName || t('orderTracking.seller')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {suborder.items.length} {t('orderTracking.items')} • ${suborder.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${suborderStatus.color}`}>
                        {suborderStatus.title}
                      </span>
                      {expandedSuborder === suborder._id ? (
                        <FaChevronUp className="ml-4 text-gray-400" />
                      ) : (
                        <FaChevronDown className="ml-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Suborder details (collapsible) */}
                  <AnimatePresence>
                    {expandedSuborder === suborder._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-4">
                          {/* Suborder status timeline */}
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              {t('orderTracking.suborderStatus')}
                            </h4>
                            <div className="relative">
                              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                              {statusSteps.map((step, index) => (
                                <div key={step.id} className="relative pl-12 pb-6 last:pb-0">
                                  <div
                                    className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                      index <= suborderStatusIndex ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {index < suborderStatusIndex ? (
                                      <FaCheckCircle className="text-lg" />
                                    ) : (
                                      step.icon
                                    )}
                                  </div>
                                  <div className={`${index <= suborderStatusIndex ? 'text-gray-800' : 'text-gray-400'}`}>
                                    <h3 className="font-medium">{step.title}</h3>
                                    <p className="text-sm mt-1">{step.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Suborder items */}
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              {t('orderTracking.items')} ({suborder.items.length})
                            </h4>
                            <div className="space-y-4">
                              {suborder.items.map((item) => (
                                <div key={item._id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                                    <img
                                      src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                                      alt={item.productId?.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-800">
                                      {item.productId?.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {t('orderTracking.quantity')}: {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                      ${item.price.toFixed(2)}
                                      {item.promotion && (
                                        <span className="text-xs text-gray-500 line-through ml-2">
                                          ${item.promotion.oldPrice.toFixed(2)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <Link 
                                      to={`/products/${item.productId?._id}`}
                                      className="text-xs text-purple-600 hover:underline"
                                    >
                                      {t('orderTracking.viewProduct')}
                                    </Link>
                                    {suborder.status === 'delivered' && (
                                      <button className="text-xs text-purple-600 hover:underline mt-2">
                                        {t('orderTracking.leaveReview')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Suborder summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              {t('orderTracking.suborderSummary')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">{t('orderTracking.subtotal')}</span>
                                <span className="font-medium">${suborder.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">{t('orderTracking.shipping')}</span>
                                <span className="font-medium">
                                  {order.shipping === 0 ? (
                                    <span className="text-green-600">{t('orderTracking.free')}</span>
                                  ) : (
                                    `$${order.shipping.toFixed(2)}`
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                                <span>{t('orderTracking.subtotal')}</span>
                                <span className="text-purple-600">${suborder.subtotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Status and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping & Payment Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-purple-500 mr-2" />
                  <h3 className="font-bold text-gray-800">
                    {t('orderTracking.shippingInfo')}
                  </h3>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </p>
                  <p>{order.shippingInfo.address.street}</p>
                  {order.shippingInfo.address.apartment && (
                    <p>{order.shippingInfo.address.apartment}</p>
                  )}
                  <p>
                    {order.shippingInfo.address.city}, {order.shippingInfo.address.governorate}
                  </p>
                  {order.shippingInfo.address.postalCode && (
                    <p>Postal Code: {order.shippingInfo.address.postalCode}</p>
                  )}
                  <p>Phone: {order.shippingInfo.phone}</p>
                  <p>Email: {order.shippingInfo.email}</p>
                  {order.shippingInfo.address.deliveryInstructions && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="font-medium text-gray-700">
                        {t('orderTracking.deliveryInstructions')}:
                      </p>
                      <p className="text-gray-600">{order.shippingInfo.address.deliveryInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <FaCreditCard className="text-purple-500 mr-2" />
                  <h3 className="font-bold text-gray-800">
                    {t('orderTracking.paymentInfo')}
                  </h3>
                </div>
                <div className="text-sm text-gray-600 space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">
                      {t('orderTracking.paymentMethod')}
                    </p>
                    <p>
                      {t(`orderTracking.paymentMethods.${order.paymentMethod}`)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      {t('orderTracking.deliveryMethod')}
                    </p>
                    <p>
                      {t(`orderTracking.deliveryMethods.${order.deliveryMethod}`)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      {t('orderTracking.paymentStatus')}
                    </p>
                    <p>
                      {t(`orderTracking.paymentStatuses.${order.paymentStatus || 'pending'}`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaShoppingBag className="mr-2 text-purple-500" />
                  {t('orderTracking.orderProgress')}
                </h2>
                <button
                  onClick={fetchOrder}
                  className="btn btn-outline btn-primary btn-sm flex items-center gap-2"
                >
                  <FaSyncAlt />
                  {t('orderTracking.buttons.refreshStatus')}
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {statusSteps.map((step, index) => (
                  <div key={step.id} className="relative pl-12 pb-6 last:pb-0">
                    <div
                      className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= currentStatusIndex ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {index < currentStatusIndex ? (
                        <FaCheckCircle className="text-lg" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className={`${index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'}`}>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm mt-1">{step.description}</p>
                      {index === currentStatusIndex && order.statusUpdatedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.statusUpdatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {t('orderTracking.orderSummary')}
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderTracking.subtotal')}</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderTracking.shipping')}</span>
                  <span className="font-medium">
                    {order.shipping === 0 ? (
                      <span className="text-green-600">{t('orderTracking.free')}</span>
                    ) : (
                      `$${order.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderTracking.tax')}</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3 mt-2">
                  <span>{t('orderTracking.total')}</span>
                  <span className="text-purple-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Link to="/" className="btn btn-outline btn-primary w-full">
                  {t('orderTracking.buttons.continueShopping')}
                </Link>
                <button 
                  onClick={fetchOrder}
                  className="btn btn-outline w-full flex items-center justify-center gap-2"
                >
                  <FaSyncAlt />
                  {t('orderTracking.buttons.refreshStatus')}
                </button>
                {order.status === 'delivered' && (
                  <button className="btn btn-primary w-full">
                    {t('orderTracking.buttons.leaveReview')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderTrackingPage;