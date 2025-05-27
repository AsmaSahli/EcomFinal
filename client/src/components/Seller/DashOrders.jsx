import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FiPackage, FiCheckCircle, FiTruck, FiClock, FiFilter, FiSearch, FiRefreshCw 
} from 'react-icons/fi';
import { 
  FaBoxOpen, FaExchangeAlt, FaTimes, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import { BsBoxSeam } from 'react-icons/bs';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-purple-100 text-purple-800'
};

const statusIcons = {
  pending: <FiClock className="mr-1" />,
  processing: <FiRefreshCw className="mr-1" />,
  shipped: <FiTruck className="mr-1" />,
  delivered: <FiCheckCircle className="mr-1" />,
  cancelled: <FaTimes className="mr-1" />,
  returned: <FaExchangeAlt className="mr-1" />
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800'
};

// Dynamic stats configuration
const statsConfig = [
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: <FiPackage className="w-6 h-6" />,
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600'
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: <FiClock className="w-6 h-6" />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600'
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: <FiRefreshCw className="w-6 h-6" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: <FiTruck className="w-6 h-6" />,
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600'
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: <FiCheckCircle className="w-6 h-6" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600'
  }
];

const DashOrders = () => {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    if (currentUser?.id) {
      fetchOrders();
      fetchStats();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders/seller/${currentUser.id}/suborders`);
      setOrders(response.data.suborders);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/seller/${currentUser.id}/stats`);
      setStats(response.data.stats); // Correctly access the stats object from the response
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      dateRange: ''
    });
    setSearchTerm('');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status ? order.suborder.status === filters.status : true;
    const matchesPaymentStatus = filters.paymentStatus ? 
      order.paymentStatus === filters.paymentStatus : true;
    const matchesDate = true; // Implement date filtering logic if needed

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const updateOrderStatus = async (orderId, suborderId, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        orderId,
        suborderId,
        status: newStatus
      });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId && order.suborderId === suborderId
            ? { ...order, suborder: { ...order.suborder, status: newStatus } }
            : order
        )
      );
      await fetchStats(); // Refresh stats after status update
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
      throw err;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Management</h1>
        <p className="text-gray-500 mt-1">Manage and track your customer orders</p>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statsConfig.map(({ key, label, icon, bgColor, textColor }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats[key] || 0}</p>
              </div>
              <div className={`p-3 rounded-lg ${bgColor} ${textColor}`}>
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders by ID, customer name or email..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:bg-white transition-all"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={toggleFilters}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FiFilter className="mr-2" />
              Filters
              {showFilters ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg p-2"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg p-2"
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg p-2"
              >
                <option value="">All Dates</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
              <button
                onClick={resetFilters}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {filteredOrders.length > 0 ? (
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
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
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
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">#{order.orderId.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          {order.buyer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.buyer.name}</div>
                          <div className="text-sm text-gray-500">{order.buyer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {order.suborder.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden border border-gray-200 -ml-2 first:ml-0">
                            <img 
                              className="h-full w-full object-cover" 
                              src={item.productId.images?.[0]?.url || '/placeholder-product.jpg'} 
                              alt={item.productId.name} 
                            />
                            {index === 2 && order.suborder.items.length > 3 && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                                +{order.suborder.items.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${order.suborder.subtotal.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.suborder.status]}`}>
                        {statusIcons[order.suborder.status]}
                        {order.suborder.status.charAt(0).toUpperCase() + order.suborder.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.paymentStatus]}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => updateOrderStatus(order.orderId, order.suborderId, 'processing')}
                          disabled={order.suborder.status !== 'pending'}
                          className={`p-1.5 rounded-md ${order.suborder.status === 'pending' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          title="Mark as Processing"
                        >
                          <FiRefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, order.suborderId, 'shipped')}
                          disabled={order.suborder.status !== 'processing'}
                          className={`p-1.5 rounded-md ${order.suborder.status === 'processing' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          title="Mark as Shipped"
                        >
                          <FiTruck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, order.suborderId, 'delivered')}
                          disabled={order.suborder.status !== 'shipped'}
                          className={`p-1.5 rounded-md ${order.suborder.status === 'shipped' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          title="Mark as Delivered"
                        >
                          <FiCheckCircle className="h-4 w-4" />
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
                <BsBoxSeam className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || Object.values(filters).some(Boolean) 
                  ? "No orders match your current filters. Try adjusting your search or filters." 
                  : "You haven't received any orders yet. When you do, they'll appear here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashOrders;