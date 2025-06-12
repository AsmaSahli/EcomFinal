import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  FaTruck, FaCheckCircle, FaClock, FaMapMarkerAlt, FaBoxOpen
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const DashOverview = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.user?.currentUser);
  const navigate = useNavigate();

  // Calculate metrics
  const currentDeliveries = deliveries.filter(d => 
    ['pending', 'assigned', 'in_progress'].includes(d.status)
  );
  const recentDeliveries = deliveries.filter(d => d.status === 'completed').slice(0, 3);
  const completedCount = deliveries.filter(d => d.status === 'completed').length;

  useEffect(() => {
    if (currentUser?.id) {
      fetchDeliveries();
    } else {
      setError('Please log in to view your dashboard.');
      setLoading(false);
    }
  }, [currentUser?.id]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/delivery`, {
        params: {
          deliveryPersonId: currentUser.id,
          page: 1,
          limit: 20 // Fetch enough to cover active and recent
        }
      });
      setDeliveries(response.data.deliveries || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (address) => {
    const encodedAddress = encodeURIComponent(address || '');
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm mb-6">
          <div className="flex items-center">
            <FaBoxOpen className="w-5 h-5 mr-3" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <FaBoxOpen className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#3F0AAD] to-[#5E1ED1] text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Delivery Dashboard</h2>
            <p className="text-purple-100">You have {currentDeliveries.length} active deliveries today</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/delivery-dashboard?tab=deliveries')} 
              className="bg-white text-[#3F0AAD] px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
            >
              View Pending
            </button>
            <button 
              onClick={() => navigate('//delivery-dashboard?tab=history')} 
              className="bg-white text-[#3F0AAD] px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Now only 2 cards since we removed the rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Deliveries</p>
              <h3 className="text-2xl font-bold mt-1">{currentDeliveries.length}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaTruck className="text-[#3F0AAD]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <span>{currentDeliveries.filter(d => d.status === 'pending').length} new assignments</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold mt-1">{completedCount}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>All time</span>
          </div>
        </div>
      </div>

      {/* Current and Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Deliveries */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Active Deliveries</h3>
            <button 
              onClick={() => navigate('/delivery-dashboard?tab=assigned')}
              className="text-sm text-[#3F0AAD] font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {currentDeliveries.length > 0 ? (
              currentDeliveries.slice(0, 3).map(delivery => (
                <div key={delivery._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {delivery.orderId?.userId?.firstName || 'Customer'} {delivery.orderId?.userId?.lastName || ''}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        {delivery.pickupAddress || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(delivery.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[delivery.status]}`}>
                      {delivery.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <button 
                      onClick={() => navigate('/delivery-dashboard?tab=assigned')} 
                      className="text-sm text-[#3F0AAD] font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <FaBoxOpen className="w-12 h-12" />
                </div>
                <p className="text-gray-500">No active deliveries</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Deliveries</h3>
            <button 
              onClick={() => navigate('//delivery-dashboard?tab=history')}
              className="text-sm text-[#3F0AAD] font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentDeliveries.length > 0 ? (
              recentDeliveries.map(delivery => (
                <div key={delivery._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {delivery.orderId?.userId?.firstName || 'Customer'} {delivery.orderId?.userId?.lastName || ''}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        {delivery.dropoffAddress || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="flex items-center text-green-600 text-sm">
                      <FaCheckCircle className="mr-1" />
                      Delivered
                    </span>
                    <button 
                      onClick={() => navigate('/delivery-dashboard?tab=history')} 
                      className="text-sm text-[#3F0AAD] font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <FaBoxOpen className="w-12 h-12" />
                </div>
                <p className="text-gray-500">No recent deliveries</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashOverview;