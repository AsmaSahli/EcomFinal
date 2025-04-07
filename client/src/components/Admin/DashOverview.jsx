import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaStore,
  FaTruck,
  FaDollarSign,
  FaUserEdit,
  FaUserTimes,
  FaSearch,
  FaUserCheck,
  FaUserClock
} from "react-icons/fa";

const DashOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSellers: 0,
    pendingDeliveries: 0,
    revenue: 0,
    newUsers: 0,
    completedDeliveries: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all stats in parallel
        const [statsResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:8000/dashboard/stats"),
          axios.get("http://localhost:8000/users?limit=5&sort=-createdAt")
        ]);

        setStats(statsResponse.data);
        setRecentUsers(usersResponse.data.users);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-gray-300">System overview and management tools</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition whitespace-nowrap">
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-600 font-medium">{error}</p>}

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
            <span>↑ {Math.round((stats.activeSellers / stats.totalUsers) * 100)}%</span>
            <span className="ml-2 text-gray-500">of total users</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Delivery Persons</p>
              <h3 className="text-2xl font-bold mt-1">{stats.pendingDeliveries}</h3>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <FaTruck className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <span>↑ {stats.completedDeliveries} approved</span>
            <span className="ml-2 text-gray-500">this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">${stats.revenue}</h3>
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
          <div className="flex gap-3">
            <Link
              to="/admin/users"
              className="text-sm text-gray-700 font-medium hover:underline whitespace-nowrap"
            >
              View All Users
            </Link>
            <Link
              to="/admin/users?role=seller"
              className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap"
            >
              View Sellers
            </Link>
            <Link
              to="/admin/users?role=delivery"
              className="text-sm text-orange-600 font-medium hover:underline whitespace-nowrap"
            >
              View Deliveries
            </Link>
          </div>
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
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900">{user.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'pending' || user.status === 'under_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {user.isActive ? 'active' : user.status || 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                        <FaUserEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Sellers Overview</h3>
            <Link
              to="/admin/sellers"
              className="text-sm text-gray-700 font-medium hover:underline whitespace-nowrap"
            >
              View All Sellers
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Sellers</span>
              <span className="font-medium">{stats.activeSellers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Approvals</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.pendingDeliveries}</span>
                <span className="text-yellow-500"><FaUserClock /></span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Accounts</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.completedDeliveries}</span>
                <span className="text-green-500"><FaUserCheck /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Deliveries Overview</h3>
            <Link
              to="/admin/deliveries"
              className="text-sm text-gray-700 font-medium hover:underline whitespace-nowrap"
            >
              View All Deliveries
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Delivery Persons</span>
              <span className="font-medium">{stats.pendingDeliveries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Approvals</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.newUsers}</span>
                <span className="text-yellow-500"><FaUserClock /></span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Accounts</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.completedDeliveries}</span>
                <span className="text-green-500"><FaUserCheck /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default DashOverview;