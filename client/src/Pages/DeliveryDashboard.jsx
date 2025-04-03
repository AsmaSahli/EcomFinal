import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaTruck, 
  FaClipboardList, 
  FaCog, 
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaDollarSign,
  FaStar
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';

const DeliveryDashboard = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mock delivery data - replace with your actual data from API
  const deliveryData = {
    stats: {
      completed: 24,
      pending: 3,
      earnings: "$1,245",
      rating: "4.8"
    },
    currentDeliveries: [
      { id: 1, customer: "Sarah Johnson", address: "123 Main St, Apt 4B", status: "in_progress", time: "15 min" },
      { id: 2, customer: "Mike Peterson", address: "456 Oak Ave", status: "pending", time: "25 min" }
    ],
    recentDeliveries: [
      { id: 3, customer: "Emily Chen", address: "789 Pine Rd", status: "completed", time: "Yesterday" },
      { id: 4, customer: "David Wilson", address: "321 Elm Blvd", status: "completed", time: "Yesterday" }
    ]
  };

  const username = currentUser?.email.split('@')[0] || 'Delivery Partner';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#3F0AAD] to-[#2D077A] text-white flex flex-col p-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-[#4A12C4]">
          <div className="flex items-center space-x-3">
            <FaTruck className="text-2xl text-purple-300" />
            <h1 className="text-xl font-bold">Delivery Hub</h1>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            Welcome back, <span className="font-medium text-white">{username}</span>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/delivery-dashboard" className="flex items-center px-4 py-3 rounded-lg bg-[#4A12C4] text-white font-medium">
                <FaHome className="mr-3 text-purple-200" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/deliveries" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaClipboardList className="mr-3 text-purple-200" />
                My Deliveries
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">
                  {deliveryData.currentDeliveries.length}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/map" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaMapMarkerAlt className="mr-3 text-purple-200" />
                Delivery Map
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaCheckCircle className="mr-3 text-purple-200" />
                Delivery History
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaCog className="mr-3 text-purple-200" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#4A12C4]">
          <button 
            onClick={signOut}
            className="flex items-center w-full px-4 py-2 text-sm text-purple-200 hover:text-white rounded-lg hover:bg-[#4A12C4] transition"
          >
            <FaSignOutAlt className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Search Bar */}
            <div className="relative w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deliveries..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3F0AAD] focus:border-transparent"
              />
            </div>
            
            {/* User Info and Notifications */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <div className="font-medium text-gray-800">{username}</div>
                  <div className="text-xs text-gray-500">Delivery Partner</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-[#3F0AAD]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
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

        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboard;