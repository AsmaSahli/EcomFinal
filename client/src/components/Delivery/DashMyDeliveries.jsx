import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiTruck, FiClock, FiCheck, FiX, FiFilter, FiSearch, 
  FiRefreshCw, FiChevronLeft, FiChevronRight, FiPackage,
  FiDollarSign, FiUser, FiMapPin, FiPhone, FiCalendar
} from 'react-icons/fi';
import { FaBoxOpen, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

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

const DashMyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [pagination.page, filters]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/delivery`, {
        params: {
          status: filters.status,
          search: filters.search,
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/deliveries/${deliveryId}/status`, { status: newStatus });
      setDeliveries(prev =>
        prev.map(delivery =>
          delivery._id === deliveryId ? { ...delivery, status: newStatus } : delivery
        )
      );
      setSuccessMessage(`Delivery status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery status');
    }
  };

  const acceptDelivery = (deliveryId) => {
    updateDeliveryStatus(deliveryId, 'assigned');
  };

  const refuseDelivery = (deliveryId) => {
    updateDeliveryStatus(deliveryId, 'cancelled');
  };

  const completeDelivery = (deliveryId) => {
    updateDeliveryStatus(deliveryId, 'completed');
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Deliveries</h1>
        <p className="text-gray-500 mt-1">Manage and track your delivery assignments</p>
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search deliveries by order ID or address..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:bg-white transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange(e)}
                name="search"
              />
            </div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={fetchDeliveries}
              className="flex items-center px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Deliveries Table */}
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
                          onClick={() => openDeliveryDetails(delivery)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                          title="View Details"
                        >
                          <FiSearch className="h-4 w-4" />
                        </button>
                        {delivery.status === 'pending' && (
                          <>
                            <button
                              onClick={() => acceptDelivery(delivery._id)}
                              className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                              title="Accept Delivery"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => refuseDelivery(delivery._id)}
                              className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                              title="Refuse Delivery"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {delivery.status === 'assigned' && (
                          <button
                            onClick={() => updateDeliveryStatus(delivery._id, 'in_progress')}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                            title="Start Delivery"
                          >
                            <FiTruck className="h-4 w-4" />
                          </button>
                        )}
                        {delivery.status === 'in_progress' && (
                          <button
                            onClick={() => completeDelivery(delivery._id)}
                            className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                            title="Complete Delivery"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        )}
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
              <h3 className="text-lg font-medium text-gray-900 mb-1">No deliveries found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {filters.status || filters.search 
                  ? "No deliveries match your current filters. Try adjusting your search or filters." 
                  : "You don't have any delivery assignments yet."}
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

      {/* Delivery Details Modal */}
      {isModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delivery Details
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <FiTruck className="mr-2 text-indigo-600" />
                      Delivery Information
                    </h4>
                    <div className="space-y-3">
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
                          <FiMapPin className="mr-2" /> Pickup:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.pickupAddress}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiMapPin className="mr-2" /> Dropoff:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.dropoffAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <FiPackage className="mr-2 text-indigo-600" />
                      Order Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiUser className="mr-2" /> Customer:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.orderId?.userId?.firstName || 'N/A'} {selectedDelivery.orderId?.userId?.lastName || ''}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiPhone className="mr-2" /> Contact:
                        </span>
                        <span className="text-gray-900">
                          {selectedDelivery.orderId?.shippingInfo?.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-32 flex-shrink-0 flex items-center">
                          <FiDollarSign className="mr-2" /> Total:
                        </span>
                        <span className="text-gray-900">
                          ${selectedDelivery.orderId?.total?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
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