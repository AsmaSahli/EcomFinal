import React from "react";
import { Link } from "react-router-dom";
import { FaUserEdit, FaUserTimes, FaUserPlus, FaSearch } from "react-icons/fa";

const DashUsers = () => {
  // Mock user data
  const users = [
    { id: 1, name: "Alex Johnson", email: "alex@example.com", role: "admin", status: "active", lastActive: "2 hours ago" },
    { id: 2, name: "Sarah Williams", email: "sarah@example.com", role: "seller", status: "active", lastActive: "1 day ago" },
    { id: 3, name: "Mike Chen", email: "mike@example.com", role: "customer", status: "inactive", lastActive: "1 week ago" },
    { id: 4, name: "Emma Davis", email: "emma@example.com", role: "delivery", status: "pending", lastActive: "Just now" },
    { id: 5, name: "James Wilson", email: "james@example.com", role: "customer", status: "active", lastActive: "5 hours ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage all system users and permissions</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
            />
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.lastActive}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
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

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing 1 to 5 of 24 users
        </div>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">
            Previous
          </button>
          <button className="px-3 py-1 rounded bg-gray-800 text-white">
            1
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">
            2
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashUsers;