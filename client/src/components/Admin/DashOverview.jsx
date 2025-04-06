import React from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaStore,
  FaTruck,
  FaDollarSign,
  FaUserEdit,
  FaUserTimes
} from "react-icons/fa";

const DashOverview = ({ stats, recentUsers }) => {
  return (
    <>
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
    </>
  );
};

export default DashOverview;