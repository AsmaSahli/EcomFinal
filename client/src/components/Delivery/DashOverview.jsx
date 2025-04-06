import React from 'react';
import { 
  FaTruck,
  FaCheckCircle,
  FaDollarSign,
  FaStar,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';

const DashOverview = ({ deliveryData = {} }) => {

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#3F0AAD] to-[#5E1ED1] text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Delivery Dashboard</h2>
            <p className="text-purple-100">You have {deliveryData.currentDeliveries.length} active deliveries today</p>
          </div>
          <button className="bg-white text-[#3F0AAD] px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition">
            View All Deliveries
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Deliveries</p>
              <h3 className="text-2xl font-bold mt-1">{deliveryData.currentDeliveries.length}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaTruck className="text-[#3F0AAD]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <span>2 new assignments</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold mt-1">{deliveryData.stats.completed}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>This week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold mt-1">{deliveryData.stats.earnings}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaDollarSign className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <span>↑ 8.5%</span>
            <span className="ml-2 text-gray-500">vs last week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Your Rating</p>
              <h3 className="text-2xl font-bold mt-1">{deliveryData.stats.rating}/5</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaStar className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>From 42 customers</span>
          </div>
        </div>
      </div>

      {/* Current Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Deliveries */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Active Deliveries</h3>
            <span className="text-sm text-[#3F0AAD] font-medium">View All</span>
          </div>
          
          <div className="space-y-4">
            {deliveryData.currentDeliveries.map(delivery => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{delivery.customer}</h4>
                    <p className="text-sm text-gray-500 mt-1">{delivery.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-400" />
                    <span className="text-sm text-gray-500">{delivery.time}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    delivery.status === 'in_progress' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {delivery.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <button className="text-sm text-[#3F0AAD] font-medium hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Deliveries</h3>
            <span className="text-sm text-[#3F0AAD] font-medium">View All</span>
          </div>
          
          <div className="space-y-4">
            {deliveryData.recentDeliveries.map(delivery => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{delivery.customer}</h4>
                    <p className="text-sm text-gray-500 mt-1">{delivery.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{delivery.time}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="flex items-center text-green-600 text-sm">
                    <FaCheckCircle className="mr-1" />
                    Delivered
                  </span>
                  <button className="text-sm text-[#3F0AAD] font-medium hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Map Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Delivery Map</h3>
          <span className="text-sm text-[#3F0AAD] font-medium">Full Screen</span>
        </div>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FaMapMarkerAlt className="mx-auto text-3xl mb-2" />
            <p>Map view will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashOverview;