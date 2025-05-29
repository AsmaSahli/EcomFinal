import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  FiTruck, FiClock, FiCheck, FiX, FiSearch, 
  FiRefreshCw, FiChevronLeft, FiChevronRight, FiPackage,
  FiDollarSign, FiUser, FiMapPin, FiPhone, FiCalendar,
  FiMail, FiCreditCard, FiHome, FiNavigation, FiInfo
} from 'react-icons/fi';
import { FaBoxOpen, FaMapMarkerAlt, FaTimes, FaShippingFast } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: <FiClock className="mr-1" />,
  assigned: <FiTruck className="mr-1" />,
  in_progress: <FiRefreshCw className="mr-1" />,
  completed: <FiCheck className="mr-1" />,
  cancelled: <FiX className="mr-1" />
};

const deliveryMethodColors = {
  standard: 'bg-gray-100 text-gray-800',
  express: 'bg-purple-100 text-purple-800',
  same_day: 'bg-red-100 text-red-800'
};

const deliveryMethodIcons = {
  standard: <FiTruck className="mr-1" />,
  express: <FaShippingFast className="mr-1" />,
  same_day: <FiNavigation className="mr-1" />
};

const deliveryMethodDetails = {
  standard: {
    deliveryTime: '3-5 business days',
    shippingCost: 5.00
  },
  express: {
    deliveryTime: '1-2 business days',
    shippingCost: 9.99
  },
  same_day: {
    deliveryTime: 'Same day',
    shippingCost: 19.99
  }
};

const getGoogleMapsUrl = (address) => {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

const getGoogleMapsDirectionsUrl = (pickup, dropoff) => {
  const encodedPickup = encodeURIComponent(pickup);
  const encodedDropoff = encodeURIComponent(dropoff);
  return `https://www.google.com/maps/dir/?api=1&origin=${encodedPickup}&destination=${encodedDropoff}&travelmode=driving`;
};

const DashMyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.user?.currentUser);

  useEffect(() => {
    fetchDeliveries();
  }, [pagination.page]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/delivery`, {
        params: {
          status: 'pending',
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setDeliveries(response.data.deliveries);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/delivery/status`, {
        deliveryId,
        deliveryPersonId: currentUser.id,
        status: 'assigned'
      });
      setSuccessMessage('Delivery assigned successfully');
      setError(null);
      await fetchDeliveries(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept delivery');
      setSuccessMessage('');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const openDeliveryDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  if (loading && deliveries.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pending Deliveries</h1>
        <p className="text-gray-500 mt-1">Manage and track your pending delivery assignments</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md shadow-sm mb-6">
          <div className="flex items-center">
            <FiCheck className="w-5 h-5 mr-3" />
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage('')} 
              className="ml-auto text-green-700 hover:text-green-900"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm mb-6">
          <div className="flex items-center">
            <FiX className="w-5 h-5 mr-3" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={fetchDeliveries}
            className="flex items-center px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          {deliveries.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => openDeliveryDetails(delivery)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        #{delivery.orderId?._id?.toString().substring(0, 8) || 'N/A'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {delivery.orderId?.userId?.firstName || 'Customer'} {delivery.orderId?.userId?.lastName || ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {delivery.orderId?.userId?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {delivery.pickupAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[delivery.status]}`}>
                        {statusIcons[delivery.status]}
                        {delivery.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => window.open(getGoogleMapsUrl(delivery.pickupAddress), '_blank')}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          title="View on Map"
                        >
                          <FiMapPin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeliveryDetails(delivery)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                          title="View Details"
                        >
                          <FiSearch className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAcceptDelivery(delivery._id)}
                          className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                          title="Accept Delivery"
                        >
                          <FiCheck className="h-4 w-4" />
                        </button>
                        <button
                          // TODO: Implement refuse delivery logic
                          className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          title="Refuse Delivery"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <FaBoxOpen className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No pending deliveries found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are currently no pending delivery assignments.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {deliveries.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> deliveries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className={`px-3 py-1 rounded-md ${pagination.page * pagination.limit >= pagination.total ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" socializeModal></div>
            </div>

            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delivery Details
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Order ID: #{selectedDelivery.orderId?._id?.toString().substring(0, 8) || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Information */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <FiTruck className="mr-2 text-indigo-600" />
                      Delivery Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiCalendar className="mr-2" /> Created:
                        </span>
                        <span className="text-gray-900">
                          {new Date(selectedDelivery.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiClock className="mr-2" /> Status:
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedDelivery.status]}`}>
                          {statusIcons[selectedDelivery.status]}
                          {selectedDelivery.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FaShippingFast className="mr-2" /> Method:
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${deliveryMethodColors[selectedDelivery.orderId?.deliveryMethod] || 'bg-gray-100 text-gray-800'}`}>
                          {deliveryMethodIcons[selectedDelivery.orderId?.deliveryMethod] || <FiTruck className="mr-1" />}
                          {selectedDelivery.orderId?.deliveryMethod ? 
                            selectedDelivery.orderId.deliveryMethod.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
                            : 'Standard'}
                        </span>
                      </div>
                      {selectedDelivery.orderId?.deliveryMethod && (
                        <>
                          <div className="flex items-start">
                            <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                              <FiClock className="mr-2" /> Delivery Time:
                            </span>
                            <span className="text-gray-900">
                              {deliveryMethodDetails[selectedDelivery.orderId.deliveryMethod]?.deliveryTime || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                              <FiDollarSign className="mr-2" /> Shipping Cost:
                            </span>
                            <span className="text-gray-900">
                              ${deliveryMethodDetails[selectedDelivery.orderId.deliveryMethod]?.shippingCost.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <FiDollarSign className="mr-2 text-indigo-600" />
                      Order Summary
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="text-gray-900">
                          ${(selectedDelivery.orderId?.total - 
                            (deliveryMethodDetails[selectedDelivery.orderId?.deliveryMethod]?.shippingCost || 0)).toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping:</span>
                        <span className="text-gray-900">
                          ${(deliveryMethodDetails[selectedDelivery.orderId?.deliveryMethod]?.shippingCost || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-gray-700 font-medium">Total:</span>
                        <span className="text-gray-900 font-bold">${selectedDelivery.orderId?.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pickup Information */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <FiHome className="mr-2 text-indigo-600" />
                      Pickup Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiMapPin className="mr-2" /> Address:
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {selectedDelivery.pickupAddress}
                          </span>
                          <button
                            onClick={() => window.open(getGoogleMapsUrl(selectedDelivery.pickupAddress), '_blank')}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm mt-1"
                          >
                            <FiMapPin className="h-3 w-3 mr-1" />
                            View on Map
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiUser className="mr-2" /> Seller:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.sellerId?.email || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <FiUser className="mr-2 text-indigo-600" />
                      Customer Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiUser className="mr-2" /> Name:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.orderId?.shippingInfo?.firstName || 'N/A'} {selectedDelivery.orderId?.shippingInfo?.lastName || ''}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiMail className="mr-2" /> Email:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.orderId?.shippingInfo?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiMapPin className="mr-2" /> Dropoff:
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {selectedDelivery.dropoffAddress}
                          </span>
                          <button
                            onClick={() => window.open(getGoogleMapsUrl(selectedDelivery.dropoffAddress), '_blank')}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm mt-1"
                          >
                            <FiMapPin className="h-3 w-3 mr-1" />
                            View on Map
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
                  <button
                    onClick={() => window.open(
                      getGoogleMapsDirectionsUrl(
                        selectedDelivery.pickupAddress,
                        selectedDelivery.dropoffAddress
                      ), 
                      '_blank'
                    )}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiNavigation className="mr-2" />
                    Get Directions
                  </button>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        handleAcceptDelivery(selectedDelivery._id);
                        closeModal();
                      }}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                      title="Accept Delivery"
                    >
                      <FiCheck className="h-5 w-5" />
                    </button>
                    <button
                      // TODO: Implement refuse delivery logic
                      onClick={() => {
                        closeModal();
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      title="Refuse Delivery"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashMyDeliveries;