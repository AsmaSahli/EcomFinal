import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaUsers,
  FaTruck, 
  FaStore,
  FaClipboardList,
  FaCog, 
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaChartLine,
  FaUserShield,
  FaUserEdit,
  FaUserTimes,
  FaDollarSign
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';

const AdminDashboard = () => {
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

  // Mock data
  const stats = {
    totalUsers: 142,
    newUsers: 8,
    activeSellers: 24,
    pendingDeliveries: 15,
    completedDeliveries: 89,
    revenue: "$12,845"
  };

  const recentUsers = [
    { id: 1, name: "Alex Johnson", email: "alex@example.com", role: "seller", status: "active" },
    { id: 2, name: "Sarah Williams", email: "sarah@example.com", role: "customer", status: "active" },
    { id: 3, name: "Mike Chen", email: "mike@example.com", role: "delivery", status: "pending" }
  ];

  const username = currentUser?.email.split('@')[0] || 'Admin';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Black/Grey Gradient */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col p-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaUserShield className="text-2xl text-gray-300" />
            <h1 className="text-xl font-bold">Admin Portal</h1>
          </div>
          <div className="mt-4 text-sm text-gray-300">
            Welcome back, <span className="font-medium text-white">{username}</span>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/admin-dashboard" className="flex items-center px-4 py-3 rounded-lg bg-gray-700 text-white font-medium">
                <FaHome className="mr-3 text-gray-300" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition">
                <FaUsers className="mr-3 text-gray-300" />
                User Management
                <span className="ml-auto bg-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.totalUsers}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/admin/sellers" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition">
                <FaStore className="mr-3 text-gray-300" />
                Sellers
                <span className="ml-auto bg-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.activeSellers}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/admin/deliveries" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition">
                <FaTruck className="mr-3 text-gray-300" />
                Deliveries
                <span className="ml-auto bg-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.pendingDeliveries}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/admin/analytics" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition">
                <FaChartLine className="mr-3 text-gray-300" />
                Analytics
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition">
                <FaCog className="mr-3 text-gray-300" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={signOut}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition"
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
                placeholder="Search users, sellers..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
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
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-gray-300">System overview and management tools</p>
              </div>
              <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                Generate Reports
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FaUsers className="text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500">
                <span>↑ {stats.newUsers} new</span>
                <span className="ml-2 text-gray-500">this week</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Sellers</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.activeSellers}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FaStore className="text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500">
                <span>↑ 3.2%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Deliveries</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.pendingDeliveries}</h3>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <FaTruck className="text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-500">
                <span>↓ 2.1%</span>
                <span className="ml-2 text-gray-500">vs yesterday</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.revenue}</h3>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <FaDollarSign className="text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500">
                <span>↑ 12.5%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
              <Link to="/admin/users" className="text-sm text-gray-700 font-medium hover:underline">
                View All Users
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-gray-700 hover:text-gray-900">
                            <FaUserEdit />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <FaUserTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sellers Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sellers Overview</h3>
                <Link to="/admin/sellers" className="text-sm text-gray-700 font-medium hover:underline">
                  View All Sellers
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Sellers</span>
                  <span className="font-medium">{stats.activeSellers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Approvals</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Performing</span>
                  <span className="font-medium">Gadget World</span>
                </div>
              </div>
            </div>

            {/* Deliveries Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Deliveries Overview</h3>
                <Link to="/admin/deliveries" className="text-sm text-gray-700 font-medium hover:underline">
                  View All Deliveries
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Deliveries</span>
                  <span className="font-medium">{stats.pendingDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Today</span>
                  <span className="font-medium">{stats.completedDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Delivery Time</span>
                  <span className="font-medium">2.4 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;