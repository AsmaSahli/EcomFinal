import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTruck, FaBoxOpen, FaHome, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const OrderTrackingPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/orders/${id}`);
        setOrder(response.data.order);
      } catch (err) {
        setError(err.response?.data?.message || t('orderTracking.errors.fetchError'));
        toast.error(t('orderTracking.errors.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, t]);

  // Order status steps
  const statusSteps = [
    { 
      id: 'pending',
      title: t('orderTracking.status.pending'),
      icon: <FaClock className="text-yellow-500" />,
      description: t('orderTracking.status.pendingDescription')
    },
    { 
      id: 'processing',
      title: t('orderTracking.status.processing'),
      icon: <FaBoxOpen className="text-blue-500" />,
      description: t('orderTracking.status.processingDescription')
    },
    { 
      id: 'shipped',
      title: t('orderTracking.status.shipped'),
      icon: <FaTruck className="text-purple-500" />,
      description: t('orderTracking.status.shippedDescription')
    },
    { 
      id: 'delivered',
      title: t('orderTracking.status.delivered'),
      icon: <FaHome className="text-green-500" />,
      description: t('orderTracking.status.deliveredDescription')
    }
  ];

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

  // Find current status index
  const currentStatusIndex = statusSteps.findIndex(step => step.id === order.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Order Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {t('orderTracking.title')} #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500">
            {t('orderTracking.placedOn')} {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {t('orderTracking.orderStatus')}
              </h2>

              {/* Status Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {statusSteps.map((step, index) => (
                  <div key={step.id} className="relative pl-12 pb-6 last:pb-0">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStatusIndex ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                    }`}>
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

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {t('orderTracking.orderDetails')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Information */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    {t('orderTracking.shippingInfo')}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                    <p>{order.shippingInfo.address.street}</p>
                    {order.shippingInfo.address.apartment && (
                      <p>{order.shippingInfo.address.apartment}</p>
                    )}
                    <p>
                      {order.shippingInfo.address.city}, {order.shippingInfo.address.governorate}
                    </p>
                    {order.shippingInfo.address.postalCode && (
                      <p>{order.shippingInfo.address.postalCode}</p>
                    )}
                    <p>{order.shippingInfo.phone}</p>
                    <p>{order.shippingInfo.email}</p>
                    {order.shippingInfo.address.deliveryInstructions && (
                      <p className="mt-2">
                        <span className="font-medium">{t('orderTracking.deliveryInstructions')}:</span> {order.shippingInfo.address.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    {t('orderTracking.paymentInfo')}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">{t('orderTracking.paymentMethod')}:</span> {t(`orderTracking.paymentMethods.${order.paymentMethod}`)}
                    </p>
                    <p>
                      <span className="font-medium">{t('orderTracking.deliveryMethod')}:</span> {t(`orderTracking.deliveryMethods.${order.deliveryMethod}`)}
                    </p>
                    <p>
                      <span className="font-medium">{t('orderTracking.orderTotal')}:</span> ${order.total}
                    </p>
                    <p>
                      <span className="font-medium">{t('orderTracking.paymentStatus')}:</span> {t(`orderTracking.paymentStatuses.${order.paymentStatus || 'pending'}`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {t('orderTracking.orderSummary')}
              </h2>

              {/* Products List */}
              <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={item.productId?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.productId?.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('orderTracking.quantity')}: {item.quantity}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        ${item.price.toFixed(2)}
                        {item.promotion && (
                          <span className="text-xs text-gray-500 line-through ml-2">
                            ${item.promotion.oldPrice.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
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
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span>{t('orderTracking.total')}</span>
                  <span className="text-purple-600">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <Link
                  to="/"
                  className="btn btn-outline btn-primary w-full"
                >
                  {t('orderTracking.buttons.continueShopping')}
                </Link>
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