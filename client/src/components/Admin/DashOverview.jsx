import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaStore,
  FaTruck,
  FaDollarSign,
  FaUserEdit,
  FaSearch,
  FaUserCheck,
  FaUserClock,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCar
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
  const [recentBuyers, setRecentBuyers] = useState([]);
  const [recentSellers, setRecentSellers] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState("buyers");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all stats and users in parallel
        const [statsResponse, buyersResponse, sellersResponse, deliveriesResponse] = await Promise.all([
          axios.get("http://localhost:8000/dashboard/stats"),
          axios.get("http://localhost:8000/users?limit=5&sort=-createdAt&role=buyer"),
          axios.get("http://localhost:8000/users?limit=5&sort=-createdAt&role=seller"),
          axios.get("http://localhost:8000/users?limit=5&sort=-createdAt&role=delivery")
        ]);

        setStats(statsResponse.data);
        setRecentBuyers(buyersResponse.data.users);
        setRecentSellers(sellersResponse.data.users);
        setRecentDeliveries(deliveriesResponse.data.users);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderBuyersTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentBuyers.length > 0 ? (
              recentBuyers.map(user => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {user.phoneNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSellersTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentSellers.length > 0 ? (
              recentSellers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900">{user.shopName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {user.headquartersAddress || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No sellers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDeliveriesTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentDeliveries.length > 0 ? (
              recentDeliveries.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />

                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaCar className="text-gray-400" />
                      {user.vehicleType || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {user.contactNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No delivery persons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

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
          </div>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
      </div>

      {/* Recent Users Table with Tabs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("buyers")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "buyers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <FaUser className="text-sm" />
                Clients
              </div>
            </button>
            <button
              onClick={() => setActiveTab("sellers")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "sellers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <FaStore className="text-sm" />
                Sellers
              </div>
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "deliveries"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <FaTruck className="text-sm" />
                Delivery Persons
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "buyers" && renderBuyersTable()}
        {activeTab === "sellers" && renderSellersTable()}
        {activeTab === "deliveries" && renderDeliveriesTable()}
      </div>
    </div>
  );
};

export default DashOverview;