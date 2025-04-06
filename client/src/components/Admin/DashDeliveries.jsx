import React from "react";
import { Link } from "react-router-dom";
import { FaTruck, FaSearch, FaMapMarkerAlt, FaCheck, FaTimes, FaInfo } from "react-icons/fa";

const DashDeliveries = () => {
  // Mock deliveries data
  const deliveries = [
    { id: "#DL-1001", customer: "John Smith", driver: "Mike Chen", pickup: "Warehouse A", status: "in-progress", eta: "30 mins" },
    { id: "#DL-1002", customer: "Emma Johnson", driver: "Sarah Williams", pickup: "Store Center", status: "pending", eta: "1 hour" },
    { id: "#DL-1003", customer: "David Wilson", driver: "Alex Brown", pickup: "Warehouse B", status: "delivered", eta: "Completed" },
    { id: "#DL-1004", customer: "Lisa Davis", driver: "James Miller", pickup: "Store Downtown", status: "failed", eta: "Returned" },
    { id: "#DL-1005", customer: "Robert Taylor", driver: "Emily Wilson", pickup: "Warehouse A", status: "in-progress", eta: "45 mins" },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deliveries Management</h2>
          <p className="text-gray-600">Track and manage all delivery orders</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700">
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Delivered</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Today's Deliveries</div>
          <div className="text-2xl font-bold mt-1">24</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">In Progress</div>
          <div className="text-2xl font-bold mt-1">8</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-2xl font-bold mt-1">5</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Completed</div>
          <div className="text-2xl font-bold mt-1">11</div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map(delivery => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{delivery.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{delivery.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-red-500" />
                      {delivery.pickup}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      delivery.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : delivery.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : delivery.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{delivery.eta}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50">
                        <FaCheck />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                        <FaTimes />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                        <FaInfo />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map View Button */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          <FaMapMarkerAlt />
          View Deliveries on Map
        </button>
      </div>
    </div>
  );
};

export default DashDeliveries;